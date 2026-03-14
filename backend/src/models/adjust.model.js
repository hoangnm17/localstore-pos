const { connectDB, sql } = require("../config/database");
const productModel = require("./productStock.model");

const convertToUnit = (quantity, conversionFactor) => {
    const largestUnit = Math.floor(quantity / conversionFactor);
    const remainder = quantity - largestUnit * conversionFactor;
    return { largestUnit, remainder };
};

const getLargestUnitInfo = async (conn, productId) => {
    const request = new sql.Request(conn);
    const result = await request
        .input("productId", sql.BigInt, productId)
        .query(`
            SELECT TOP 1 unitName, conversionFactor
            FROM ProductUnits
            WHERE productId = @productId
            ORDER BY conversionFactor DESC
        `);
    return result.recordset[0];
};

const createAdjustmentWithItems = async (staffId, reason, items) => {
    const pool = await connectDB();
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        const adjustmentResult = await new sql.Request(transaction)
            .input("createdBy", sql.BigInt, staffId)
            .input("reason", sql.NVarChar(50), reason)
            .query(`
                INSERT INTO InventoryAdjustments (createdBy, reason)
                OUTPUT INSERTED.id
                VALUES (@createdBy, @reason)
            `);

        const adjustmentId = adjustmentResult.recordset[0].id;

        for (let item of items) {
            // 1. Lấy systemQuantity hiện tại (snapshot)
            const stockResult = await new sql.Request(transaction)
                .input("productId", sql.BigInt, item.productId)
                .query(`
                    SELECT quantityOnHand 
                    FROM InventoryStocks 
                    WHERE productId = @productId
                `);

            if (stockResult.recordset.length === 0) {
                throw new Error(`Không tìm thấy tồn kho của productId ${item.productId}`);
            }

            const systemQuantity = stockResult.recordset[0].quantityOnHand;

            // 2. Lấy unit lớn nhất
            const largestInfo = await getLargestUnitInfo(transaction, item.productId);
            if (!largestInfo) {
                throw new Error(`Không tìm thấy đơn vị sản phẩm cho productId ${item.productId}`);
            }

            const conversionFactor = largestInfo.conversionFactor;
            const actualQuantity = (item.actualLargest || 0) * conversionFactor + (item.actualRemainder || 0);

            // 3. Insert (lưu base unit)
            await new sql.Request(transaction)
                .input("adjustmentId", sql.Int, adjustmentId)
                .input("productId", sql.BigInt, item.productId)
                .input("systemQuantity", sql.Decimal(15, 3), systemQuantity)
                .input("actualQuantity", sql.Decimal(15, 3), actualQuantity)
                .query(`
                    INSERT INTO InventoryAdjustmentItems
                    (adjustmentId, productId, systemQuantity, actualQuantity)
                    VALUES (@adjustmentId, @productId, @systemQuantity, @actualQuantity)
                `);
        }

        await transaction.commit();
        return adjustmentId;

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
};

const updateStatusTransaction = async (
    adjustmentId,
    managerStaffId,
    newStatus
) => {

    const pool = await connectDB();
    const transaction = new sql.Transaction(pool);

    try {

        await transaction.begin();

        const adjResult = await new sql.Request(transaction)
            .input("id", sql.Int, adjustmentId)
            .query(`
                SELECT *
                FROM InventoryAdjustments
                WHERE id = @id
            `);

        if (adjResult.recordset.length === 0) {
            throw new Error("Phiếu không tồn tại");
        }

        const adjustment = adjResult.recordset[0];

        if (adjustment.status !== "Pending") {
            throw new Error("Phiếu đã được xử lý");
        }

        await new sql.Request(transaction)
            .input("id", sql.Int, adjustmentId)
            .input("processedBy", sql.BigInt, managerStaffId)
            .input("status", sql.VarChar(20), newStatus)
            .query(`
                UPDATE InventoryAdjustments
                SET status = @status,
                    processedBy = @processedBy,
                    processedAt = GETDATE()
                WHERE id = @id
            `);

        if (newStatus === "Approved") {

            const itemsResult = await new sql.Request(transaction)
                .input("adjustmentId", sql.Int, adjustmentId)
                .query(`
                    SELECT productId, actualQuantity, systemQuantity
                    FROM InventoryAdjustmentItems
                    WHERE adjustmentId = @adjustmentId
                `);

            for (let item of itemsResult.recordset) {

                const difference = item.actualQuantity - item.systemQuantity;

                const affected = await productModel.updateStock(
                    transaction,
                    item.productId,
                    difference
                );

                if (affected === 0) {
                    throw new Error(`Không tìm thấy tồn kho của productId ${item.productId}`);
                }
            }
        }

        await transaction.commit();

        return { adjustmentId, status: newStatus };

    } catch (error) {

        await transaction.rollback();
        throw error;
    }
};

const getAdjustments = async (filters) => {

    const pool = await connectDB();
    const request = pool.request();

    let query = `
        SELECT 
            ia.id,
            ia.reason,
            ia.status,
            ia.createdAt,
            ia.processedAt,
            s1.fullName AS createdByName,
            s2.fullName AS processedByName
        FROM InventoryAdjustments ia
        LEFT JOIN Staff s1 ON ia.createdBy = s1.id
        LEFT JOIN Staff s2 ON ia.processedBy = s2.id
        WHERE 1=1
    `;

    if (filters.fromDate) {
        query += ` AND ia.createdAt >= @fromDate`;
        request.input("fromDate", sql.Date, filters.fromDate);
    }

    if (filters.toDate) {
        query += ` AND ia.createdAt <= @toDate`;
        request.input("toDate", sql.Date, filters.toDate);
    }

    if (filters.status) {
        query += ` AND ia.status = @status`;
        request.input("status", sql.VarChar(20), filters.status);
    }

    query += ` ORDER BY ia.createdAt DESC`;

    const result = await request.query(query);

    return result.recordset;
};

const getAdjustmentDetail = async (adjustmentId) => {
    const pool = await connectDB();

    const headerResult = await pool.request()
        .input("id", sql.Int, adjustmentId)
        .query(` SELECT 
                ia.id,
                ia.reason,
                ia.status,
                ia.createdAt,
                ia.processedAt,
                s1.fullName AS createdByName,
                s2.fullName AS processedByName
                FROM InventoryAdjustments ia
                LEFT JOIN Staff s1 ON ia.createdBy = s1.id
                LEFT JOIN Staff s2 ON ia.processedBy = s2.id
                WHERE ia.id = @id`
            );

    if (headerResult.recordset.length === 0) return null;

    const itemsResult = await pool.request()
        .input("adjustmentId", sql.Int, adjustmentId)
        .query(`SELECT 
                iai.productId,
                p.name,
                p.code,
                p.baseUnit,
                iai.systemQuantity,
                iai.actualQuantity,
                (iai.actualQuantity - iai.systemQuantity) AS difference
                FROM InventoryAdjustmentItems iai
                JOIN Products p ON iai.productId = p.id
                WHERE iai.adjustmentId = @adjustmentId`
            );

    // ====================== ENRICH CONVERTED ======================
    const items = await Promise.all(itemsResult.recordset.map(async (item) => {
        const largestInfo = await getLargestUnitInfo(pool, item.productId);

        if (!largestInfo) {
            return {
                ...item,
                unitName: null,
                systemLargest: parseFloat(item.systemQuantity) || 0,
                systemRemainder: 0,
                actualLargest: parseFloat(item.actualQuantity) || 0,
                actualRemainder: 0,
                differenceLargest: parseFloat(item.difference) || 0,
                differenceRemainder: 0
            };
        }

        const conv = parseFloat(largestInfo.conversionFactor);
        const unitName = largestInfo.unitName;

        const systemQ = parseFloat(item.systemQuantity) || 0;
        const actualQ = parseFloat(item.actualQuantity) || 0;
        const diffQ = parseFloat(item.difference) || 0;

        const systemConverted = convertToUnit(systemQ, conv);
        const actualConverted = convertToUnit(actualQ, conv);
        const diffConverted = convertToUnit(diffQ, conv);

        return {
            ...item,
            unitName,
            systemLargest: systemConverted.largestUnit,
            systemRemainder: systemConverted.remainder,
            actualLargest: actualConverted.largestUnit,
            actualRemainder: actualConverted.remainder,
            differenceLargest: diffConverted.largestUnit,
            differenceRemainder: diffConverted.remainder
        };
    }));

    return {
        ...headerResult.recordset[0],
        items
    };
};

module.exports = {
    createAdjustmentWithItems,
    updateStatusTransaction,
    getAdjustments,
    getAdjustmentDetail
};