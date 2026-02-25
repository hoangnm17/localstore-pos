const { connectDB, sql } = require("../config/database")

const MAX_PAGE_SIZE = 50;

const getInvoiceList = async ({
    page,
    pageSize,
}) => {
    try {
        const pool = await connectDB();

        const currentPage = page && page > 0 ? page : 1;

        let limit = pageSize && pageSize > 0 ? pageSize : 10;
        if (limit > MAX_PAGE_SIZE) limit = MAX_PAGE_SIZE;

        const offset = (currentPage - 1) * limit;

        const listResult = await pool
            .request()
            .input("offset", sql.Int, offset)
            .input("limit", sql.Int, limit)
            .query(`
        SELECT
          i.id,
          i.invoiceCode,
          i.createdAt,
          i.finalAmount,
          i.status,

          s.name AS staffName,
          c.name AS counterName,
          cu.name AS customerName

        FROM Invoices i
        JOIN Staffs s ON i.staffId = s.id
        JOIN Counters c ON i.counterId = c.id
        LEFT JOIN Customers cu ON i.customerId = cu.id

        ORDER BY i.createdAt DESC
        OFFSET @offset ROWS
        FETCH NEXT @limit ROWS ONLY
      `);

        const countResult = await pool.request().query(`
      SELECT COUNT(*) AS total
      FROM Invoices
    `);

        const totalItems = countResult.recordset[0].total;

        return {
            data: listResult.recordset,
            pagination: {
                page: currentPage,
                pageSize: limit,
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
            },
        };
    } catch (err) {
        console.error("getInvoiceList error:", err);
        throw err;
    }
};

const createInvoice = async (data) => {
//   try {
//     const pool = await connectDB();

//     const result = await pool.request()
//       .input("invoiceCode", sql.VarChar, data.invoiceCode)
//       .input("staffId", sql.BigInt, data.staffId)
//       .input("counterId", sql.BigInt, data.counterId)
//       .input("customerId", sql.BigInt, data.customerId)
//       .input("totalAmount", sql.Decimal(15,2), data.total)  
//       .input("finalAmount", sql.Decimal(15,2), data.total)   
//       .query(`
//         INSERT INTO Invoices
//         (invoiceCode, staffId, counterId, customerId, totalAmount, finalAmount)
//         OUTPUT INSERTED.id
//         VALUES
//         (@invoiceCode, @staffId, @counterId, @customerId, @totalAmount, @finalAmount)
//       `);

//     return result.recordset[0].id;

//   } catch (err) {
//     console.error("createInvoice error:", err);
//     throw err;
//   }
};


const updateInvoiceStatus = async (invoiceId, status) => {
    try {
        const pool = await connectDB();

        await pool
            .request()
            .input("invoiceId", sql.BigInt, invoiceId)
            .input("status", sql.VarChar, status)
            .query(`
        UPDATE Invoices
        SET status = @status
        WHERE id = @invoiceId
      `);
    } catch (err) {
        console.error("updateInvoiceStatus error:", err);
        throw err;
    }
};

module.exports = {
    getInvoiceList,
    createInvoice,
    updateInvoiceStatus,
};