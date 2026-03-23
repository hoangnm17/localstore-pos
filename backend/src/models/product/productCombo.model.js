const { connectDB, sql } = require('../../config/database.js');

exports.getComboItems = async (productId) => {
    const pool = await connectDB();
    const rs = await pool.request()
        .input('productId', sql.BigInt, productId)
        .query(`
            SELECT
                pc.id,
                pc.parentProductId,
                pc.childProductId,
                pc.quantity,
                p.name AS childProductName,
                p.code AS childProductCode,
                p.baseUnit,
                ISNULL(puBase.salePrice, 0) AS childSalePrice
            FROM ProductCombos pc
            JOIN Products p ON pc.childProductId = p.id
            LEFT JOIN ProductUnits puBase
                ON puBase.productId = p.id
                AND puBase.conversionFactor = 1
            WHERE pc.parentProductId = @productId
            ORDER BY pc.id
        `);
    return rs.recordset;
};

exports.getComboCostPrice = async (productId) => {
    const pool = await connectDB();
    const rs = await pool.request()
        .input('productId', sql.BigInt, productId)
        .query(`
            SELECT
                ISNULL(SUM(pc.quantity * ISNULL(puBase.salePrice, 0)), 0) AS comboCostPrice
            FROM ProductCombos pc
            JOIN Products p ON pc.childProductId = p.id
            LEFT JOIN ProductUnits puBase
                ON puBase.productId = p.id
                AND puBase.conversionFactor = 1
            WHERE pc.parentProductId = @productId
        `);
    return Number(rs.recordset[0]?.comboCostPrice || 0);
};

exports.addComboItem = async (productId, { childProductId, quantity = 1 }) => {
    const pool = await connectDB();
    const rs = await pool.request()
        .input('parentProductId', sql.BigInt, productId)
        .input('childProductId', sql.BigInt, childProductId)
        .input('quantity', sql.Decimal(15, 3), quantity)
        .query(`
            INSERT INTO ProductCombos (parentProductId, childProductId, quantity)
            OUTPUT INSERTED.id, INSERTED.parentProductId, INSERTED.childProductId, INSERTED.quantity
            VALUES (@parentProductId, @childProductId, @quantity)
        `);
    return rs.recordset[0];
};

exports.removeComboItem = async (comboItemId, productId) => {
    const pool = await connectDB();
    const rs = await pool.request()
        .input('id', sql.Int, comboItemId)
        .input('parentProductId', sql.BigInt, productId)
        .query(`
            DELETE FROM ProductCombos
            WHERE id = @id AND parentProductId = @parentProductId
        `);

    return rs.rowsAffected[0] > 0;
};

exports.assembleCombo = async (productId, quantity) => {
    const pool = await connectDB();
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        // Lấy danh sách SP con và tồn kho hiện tại
        const childrenResult = await new sql.Request(transaction)
            .input('productId', sql.BigInt, productId)
            .query(`
                SELECT
                    pc.childProductId,
                    p.name AS childProductName,
                    pc.quantity AS requiredQtyPerCombo,
                    ISNULL(s.quantityOnHand, 0) AS currentStock
                FROM ProductCombos pc
                JOIN Products p ON p.id = pc.childProductId
                LEFT JOIN InventoryStocks s ON s.productId = pc.childProductId
                WHERE pc.parentProductId = @productId
            `);

        const children = childrenResult.recordset;
        if (children.length === 0) {
            throw new Error('Combo chưa có sản phẩm con.');
        }

        // Kiểm tra tồn kho từng SP con
        for (const child of children) {
            const needed = Number(child.requiredQtyPerCombo) * quantity;
            if (Number(child.currentStock) < needed) {
                throw new Error(`INSUFFICIENT_STOCK:${child.childProductId}:${child.childProductName}:${needed}:${child.currentStock}`);
            }
        }

        // Trừ tồn kho từng SP con
        for (const child of children) {
            const needed = Number(child.requiredQtyPerCombo) * quantity;
            await new sql.Request(transaction)
                .input('childProductId', sql.BigInt, child.childProductId)
                .input('needed', sql.Decimal(15, 3), needed)
                .query(`
                    UPDATE InventoryStocks
                    SET quantityOnHand = quantityOnHand - @needed
                    WHERE productId = @childProductId
                `);
        }

        // Cộng tồn kho combo (tạo row nếu chưa có)
        await new sql.Request(transaction)
            .input('productId', sql.BigInt, productId)
            .input('quantity', sql.Decimal(15, 3), quantity)
            .query(`
                MERGE InventoryStocks AS target
                USING (SELECT @productId AS productId) AS source
                ON target.productId = source.productId
                WHEN MATCHED THEN
                    UPDATE SET quantityOnHand = quantityOnHand + @quantity
                WHEN NOT MATCHED THEN
                    INSERT (productId, quantityOnHand) VALUES (@productId, @quantity);
            `);

        await transaction.commit();
        return true;
    } catch (err) {
        try { await transaction.rollback(); } catch (_) { }
        throw err;
    }
};

exports.updateComboStock = async (productId, newQuantity) => {
    const pool = await connectDB();
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        // Lấy tồn kho combo hiện tại
        const currentStockResult = await new sql.Request(transaction)
            .input('productId', sql.BigInt, productId)
            .query(`
                SELECT ISNULL(quantityOnHand, 0) AS quantityOnHand
                FROM InventoryStocks
                WHERE productId = @productId
            `);

        const currentStock = Number(currentStockResult.recordset[0]?.quantityOnHand || 0);
        const diff = newQuantity - currentStock;

        if (Math.abs(diff) < 0.001) {
            await transaction.rollback();
            return true;
        }

        // Lấy danh sách SP con
        const childrenResult = await new sql.Request(transaction)
            .input('productId', sql.BigInt, productId)
            .query(`
                SELECT
                    pc.childProductId,
                    p.name AS childProductName,
                    pc.quantity AS qtyPerCombo,
                    ISNULL(s.quantityOnHand, 0) AS currentStock
                FROM ProductCombos pc
                JOIN Products p ON p.id = pc.childProductId
                LEFT JOIN InventoryStocks s ON s.productId = pc.childProductId
                WHERE pc.parentProductId = @productId
            `);

        const children = childrenResult.recordset;

        if (children.length === 0) {
            throw new Error('Combo chưa có sản phẩm con.');
        }

        // Nếu tăng tồn kho combo → cần trừ SP con → kiểm tra đủ hàng
        if (diff > 0) {
            for (const child of children) {
                const needed = Number(child.qtyPerCombo) * diff;
                if (Number(child.currentStock) < needed) {
                    throw new Error(`INSUFFICIENT_STOCK:${child.childProductId}:${child.childProductName}:${needed}:${child.currentStock}`);
                }
            }
        }

        // Điều chỉnh tồn kho SP con theo chiều chênh lệch
        for (const child of children) {
            const adjustQty = Number(child.qtyPerCombo) * diff;
            await new sql.Request(transaction)
                .input('childProductId', sql.BigInt, child.childProductId)
                .input('adjustQty', sql.Decimal(15, 3), adjustQty)
                .query(`
                    UPDATE InventoryStocks
                    SET quantityOnHand = quantityOnHand - @adjustQty
                    WHERE productId = @childProductId
                `);
        }

        await new sql.Request(transaction)
            .input('productId', sql.BigInt, productId)
            .input('newQuantity', sql.Decimal(15, 3), newQuantity)
            .query(`
                MERGE InventoryStocks AS target
                USING (SELECT @productId AS productId) AS source
                ON target.productId = source.productId
                WHEN MATCHED THEN
                    UPDATE SET quantityOnHand = @newQuantity
                WHEN NOT MATCHED THEN
                    INSERT (productId, quantityOnHand) VALUES (@productId, @newQuantity);
            `);

        await transaction.commit();
        return true;
    } catch (err) {
        try { await transaction.rollback(); } catch (_) { }
        throw err;
    }
};
