const { connectDB, sql } = require("../config/database");

const MAX_PAGE_SIZE = 50;

/* =====================================================
   GET INVOICE LIST (Pagination - NO TRANSACTION)
===================================================== */
const getInvoiceList = async ({ page = 1, pageSize = 10 }) => {
    const pool = await connectDB();

    const currentPage = page > 0 ? page : 1;
    let limit = pageSize > 0 ? pageSize : 10;
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
        s.fullName AS staffName,
        c.counterName AS counterName,
        cu.name AS customerName
      FROM Invoices i
      JOIN Staff s ON i.staffId = s.id
      JOIN Counters c ON i.counterId = c.id
      LEFT JOIN Customers cu ON i.customerId = cu.id
      ORDER BY i.createdAt DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `);

    const countResult = await pool.request().query(`
      SELECT COUNT(*) AS total FROM Invoices
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
};

/* =====================================================
   TRANSACTION FUNCTIONS
===================================================== */

const insertInvoice = async (transaction, { staffId, invoiceCode, counterId }) => {
    const result = await new sql.Request(transaction)
        .input("status", sql.VarChar, "UNPAID")
        .input("counterId", sql.Int, counterId)
        .input("staffId", sql.Int, staffId)
        .input("invoiceCode", sql.VarChar, invoiceCode)
        .query(`
      INSERT INTO Invoices (invoiceCode, staffId, counterId, status, createdAt)
      OUTPUT INSERTED.id
      VALUES (@invoiceCode, @staffId, @counterId, @status, GETDATE())
    `);

    return result.recordset[0].id;
};

const getInvoiceById = async (transaction, id) => {
  const result = await new sql.Request(transaction)
    .input("id", sql.Int, id)
    .query(`
      SELECT id, status, totalAmount, finalAmount
      FROM Invoices WITH (UPDLOCK, ROWLOCK)
      WHERE id = @id
      AND status NOT IN ('PAID', 'CANCELLED')
    `);

  return result.recordset[0] || null;
};

const updateAmounts = async (transaction, invoiceId, { totalAmount, finalAmount }) => {
    await new sql.Request(transaction)
        .input("invoiceId", sql.Int, invoiceId)
        .input("totalAmount", sql.Decimal(18, 2), totalAmount)
        .input("finalAmount", sql.Decimal(18, 2), finalAmount)
        .query(`
      UPDATE Invoices
      SET totalAmount = @totalAmount,
          finalAmount = @finalAmount,
          updatedAt = GETDATE()
      WHERE id = @invoiceId
    `);
};

const updateStatus = async (transaction, invoiceId, status) => {
    await new sql.Request(transaction)
        .input("invoiceId", sql.Int, invoiceId)
        .input("status", sql.VarChar, status)
        .query(`
      UPDATE Invoices
      SET status = @status,
          updatedAt = GETDATE()
      WHERE id = @invoiceId
    `);
};

const deleteInvoiceItems = async (transaction, invoiceId) => {
    await new sql.Request(transaction)
        .input("invoiceId", sql.Int, invoiceId)
        .query(`
      DELETE FROM InvoiceItems
      WHERE invoiceId = @invoiceId
    `);
};

const insertInvoiceItem = async (
    transaction,
    { invoiceId, productId, quantity, unitPrice, lineTotal }
) => {
    await new sql.Request(transaction)
        .input("invoiceId", sql.Int, invoiceId)
        .input("productId", sql.Int, productId)
        .input("quantity", sql.Int, quantity)
        .input("unitPrice", sql.Decimal(18, 2), unitPrice)
        .input("lineTotal", sql.Decimal(18, 2), lineTotal)
        .query(`
      INSERT INTO InvoiceItems
      (invoiceId, productId, quantity, unitPrice, lineTotal)
      VALUES
      (@invoiceId, @productId, @quantity, @unitPrice, @lineTotal)
    `);
};

const getProductById = async (transaction, productId) => {
    const result = await new sql.Request(transaction)
        .input("id", sql.Int, productId)
        .query(`
      SELECT salePrice
      FROM Products
      WHERE id = @id AND status = 'Selling'
    `);

    return result.recordset[0] || null;
};

const insertPayment = async (
    transaction,
    { invoiceId, method, amount }
) => {
    await new sql.Request(transaction)
        .input("invoiceId", sql.Int, invoiceId)
        .input("method", sql.VarChar, method)
        .input("amount", sql.Decimal(18, 2), amount)
        .query(`
      INSERT INTO Payments (invoiceId, method, amount, createdAt)
      VALUES (@invoiceId, @method, @amount, GETDATE())
    `);
};

/* =====================================================
   NON-TRANSACTION READ FUNCTIONS
===================================================== */

const getDraftInvoices = async () => {
    const pool = await connectDB();

    const result = await pool.request().query(`
    SELECT id, invoiceCode, createdAt, finalAmount, status
    FROM Invoices
    WHERE status = 'UNPAID'
    ORDER BY createdAt ASC
  `);

    return result.recordset;
};

const getInvoiceDetail = async (id) => {
    const pool = await connectDB();

    const invoice = await pool.request()
        .input("id", sql.Int, id)
        .query(`
      SELECT id, invoiceCode, createdAt, finalAmount, status
      FROM Invoices
      WHERE id = @id
    `);

    if (!invoice.recordset[0]) return null;

    const items = await pool.request()
        .input("invoiceId", sql.Int, id)
        .query(`
      SELECT ii.id, ii.productId, ii.quantity, ii.unitPrice, ii.lineTotal, p.name
      FROM InvoiceItems ii
      JOIN Products p ON p.id = ii.productId
      WHERE ii.invoiceId = @invoiceId
    `);

    return {
        ...invoice.recordset[0],
        items: items.recordset,
    };
};

// invoice.model.js

const getInvoiceItems = async (transaction, invoiceId) => {
    const result = await new sql.Request(transaction)
        .input("invoiceId", sql.Int, invoiceId)
        .query(`
      SELECT productId, quantity
      FROM InvoiceItems
      WHERE invoiceId = @invoiceId
    `);

    return result.recordset;
};

/* =====================================================
   EXPORT
===================================================== */

module.exports = {
    getInvoiceList,
    insertInvoice,
    getInvoiceById,
    updateAmounts,
    updateStatus,
    deleteInvoiceItems,
    insertInvoiceItem,
    getProductById,
    insertPayment,
    getInvoiceItems,
    getDraftInvoices,
    getInvoiceDetail,
};