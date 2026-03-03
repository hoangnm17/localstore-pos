const { connectDB, sql } = require("../config/database");
const productModel = require("./productStock.model");

const createAdjustmentWithItems = async (
    staffId,
    reason,
    items
) => {

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

            await new sql.Request(transaction)
                .input("adjustmentId", sql.Int, adjustmentId)
                .input("productId", sql.BigInt, item.productId)
                .input("systemQuantity", sql.Decimal(15,3), item.systemQuantity)
                .input("actualQuantity", sql.Decimal(15,3), item.actualQuantity)
                .query(`
                    INSERT INTO InventoryAdjustmentItems
                    (adjustmentId, productId, systemQuantity, actualQuantity)
                    VALUES
                    (@adjustmentId, @productId, @systemQuantity, @actualQuantity)
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
                    SELECT productId, actualQuantity
                    FROM InventoryAdjustmentItems
                    WHERE adjustmentId = @adjustmentId
                `);

            for (let item of itemsResult.recordset) {

                const affected = await productModel.updateStock(
                    transaction,
                    item.productId,
                    item.actualQuantity
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

    // 1️⃣ Lấy thông tin phiếu
    const headerResult = await pool.request()
        .input("id", sql.Int, adjustmentId)
        .query(`
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
            WHERE ia.id = @id
        `);

    if (headerResult.recordset.length === 0) {
        return null;
    }

    // 2️⃣ Lấy danh sách sản phẩm trong phiếu
    const itemsResult = await pool.request()
        .input("adjustmentId", sql.Int, adjustmentId)
        .query(`
            SELECT 
                iai.productId,
                p.name,
                iai.systemQuantity,
                iai.actualQuantity,
                (iai.actualQuantity - iai.systemQuantity) AS difference
            FROM InventoryAdjustmentItems iai
            JOIN Products p ON iai.productId = p.id
            WHERE iai.adjustmentId = @adjustmentId
        `);

    return {
        ...headerResult.recordset[0],
        items: itemsResult.recordset
    };
};

module.exports = {
    createAdjustmentWithItems,
    updateStatusTransaction,
    getAdjustments,
    getAdjustmentDetail
};