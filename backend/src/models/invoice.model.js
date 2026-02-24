const sql = require("mssql")
const { connectDB } = require("../config/database")

const MAX_PAGE_SIZE = 50;

const getInvoiceList = async ({
    page,
    pageSize,
}) => {
    try {
        const pool = await connectDB;

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