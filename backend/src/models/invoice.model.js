const { connectDB, sql } = require("../config/database");

const MAX_PAGE_SIZE = 50;

/* =====================================================
   GET INVOICE LIST (Pagination - NO TRANSACTION)
===================================================== */
const getInvoiceList = async ({
  page = 1,
  pageSize = 10,
  status
}) => {

  const pool = await connectDB();

  const currentPage = page > 0 ? page : 1;
  const limit = pageSize > 0 ? pageSize : 10;
  const offset = (currentPage - 1) * limit;

  let whereClause = "WHERE 1=1";
  const request = pool.request();

  if (status) {
    whereClause += " AND i.status = @status";
    request.input("status", sql.VarChar(20), status);
  }

  request.input("offset", sql.Int, offset);
  request.input("limit", sql.Int, limit);

  /* ================= LIST QUERY ================= */

  const listResult = await request.query(`
    SELECT
      i.id,
      i.invoiceCode,
      i.createdAt,
      i.finalAmount,
      i.status,

      -- Staff
      s.id         AS staffId,
      s.fullName   AS staffName,

      -- Counter
      c.id         AS counterId,
      c.counterName AS counterName,

      -- Customer
      cu.id        AS customerId,
      cu.name  AS customerName

    FROM Invoices i
    LEFT JOIN Staff s     ON i.staffId = s.id
    LEFT JOIN Counters c  ON i.counterId = c.id
    LEFT JOIN Customers cu ON i.customerId = cu.id

    ${whereClause}

    ORDER BY i.createdAt DESC
    OFFSET @offset ROWS
    FETCH NEXT @limit ROWS ONLY
  `);

  /* ================= COUNT QUERY ================= */

  const countRequest = pool.request();

  if (status) {
    countRequest.input("status", sql.VarChar(20), status);
  }

  const countResult = await countRequest.query(`
    SELECT COUNT(*) AS total
    FROM Invoices i
    ${whereClause}
  `);

  const totalItems = countResult.recordset[0].total;

  return {
    data: listResult.recordset,
    pagination: {
      page: currentPage,
      pageSize: limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    }
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

const updateInvoiceCode = async (transaction, invoiceId, invoiceCode) => {
    await new sql.Request(transaction)
        .input("invoiceId", sql.Int, invoiceId)
        .input("invoiceCode", sql.VarChar, invoiceCode)
        .query(`
            UPDATE Invoices
            SET invoiceCode = @invoiceCode
            WHERE id = @invoiceId
        `);
};

const updateInvoiceDiscount = async (
    transaction,
    invoiceId,
    promotionId,
    promotionDiscount = 0,
    voucherId,
    voucherDiscount = 0,
    usedPoints = 0,
    pointDiscount = 0,
) => {

    await new sql.Request(transaction)
        .input("invoiceId", sql.Int, invoiceId)
        .input("promotionId", sql.Int, promotionId || null)
        .input("promotionDiscount", sql.Decimal(10, 2), promotionDiscount || 0)
        .input("voucherId", sql.Int, voucherId || null)
        .input("voucherDiscount", sql.Decimal(10, 2), voucherDiscount || 0)
        .input("usedPoints", sql.Int, usedPoints || 0)
        .input("pointDiscount", sql.Decimal(10, 2), pointDiscount || 0)
        .query(`
            UPDATE Invoices
            SET
                promotionId = @promotionId,
                promotionDiscount = @promotionDiscount,
                voucherId = @voucherId,
                voucherDiscount = @voucherDiscount,
                usedPoints = @usedPoints,
                pointDiscount = @pointDiscount
            WHERE id = @invoiceId
        `);
};

const getInvoiceById = async (transaction, id) => {
    const result = await new sql.Request(transaction)
        .input("id", sql.Int, id)
        .query(`
      SELECT id, customerId, status, totalAmount, finalAmount
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
          finalAmount = @finalAmount
      WHERE id = @invoiceId
    `);
};

const updateStatus = async (transaction, invoiceId, status) => {
    await new sql.Request(transaction)
        .input("invoiceId", sql.Int, invoiceId)
        .input("status", sql.VarChar, status)
        .query(`
      UPDATE Invoices
      SET status = @status
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
    { invoiceId, productId, productName, quantity, unitPrice, lineTotal }
) => {
    await new sql.Request(transaction)
        .input("invoiceId", sql.Int, invoiceId)
        .input("productId", sql.Int, productId)
        .input("productName", sql.NVarChar, productName)
        .input("quantity", sql.Int, quantity)
        .input("unitPrice", sql.Decimal(18, 2), unitPrice)
        .input("lineTotal", sql.Decimal(18, 2), lineTotal)
        .query(`
      INSERT INTO InvoiceItems
      (invoiceId, productId, productName, quantity, unitPrice, lineTotal)
      VALUES
      (@invoiceId, @productId, @productName, @quantity, @unitPrice, @lineTotal)
    `);
};

const getProductById = async (transaction, productId) => {
    const result = await new sql.Request(transaction)
        .input("id", sql.Int, productId)
        .query(`
      SELECT 
        id,
        name,
        salePrice
      FROM Products
      WHERE id = @id AND status = 'Selling'
    `);

    return result.recordset[0] || null;
};

const insertPayment = async (
    transaction,
    { invoiceId, paymentMethod, amount, status }
) => {
    await new sql.Request(transaction)
        .input("invoiceId", sql.BigInt, invoiceId)
        .input("paymentMethod", sql.VarChar, paymentMethod)
        .input("amount", sql.Decimal(15, 2), amount)
        .input("status", sql.VarChar, status)
        .query(`
      INSERT INTO Payments (invoiceId, paymentMethod, amount, status)
      VALUES (@invoiceId, @paymentMethod, @amount, @status)
    `);
};

/* =====================================================
   NON-TRANSACTION READ FUNCTIONS
===================================================== */

const getDraftInvoices = async (counterId) => {
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
      SELECT ii.id, ii.productId, ii.quantity, ii.unitPrice, ii.lineTotal, p.name, ist.quantityOnHand, ist.minThreshold
      FROM InvoiceItems ii
      JOIN Products p ON p.id = ii.productId
	    JOIN InventoryStocks ist ON p.id = ist.productId
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

const getPaymentByInvoiceId = async (transaction, invoiceId) => {
    const result = await new sql.Request(transaction)
        .input("invoiceId", sql.BigInt, invoiceId)
        .query(`
      SELECT TOP 1 *
      FROM Payments
      WHERE invoiceId = @invoiceId
    `);

    return result.recordset[0];
};

const getCustomerById = (transaction, customerId) => {
  return transaction.request()
    .input("customerId", customerId)
    .query(`
      SELECT id
      FROM Customers
      WHERE id = @customerId
    `)
    .then(res => res.recordset[0]);
};

const updateCustomer = (transaction, invoiceId, customerId) => {
  return transaction.request()
    .input("invoiceId", invoiceId)
    .input("customerId", customerId)
    .query(`
      UPDATE Invoices
      SET customerId = @customerId
      WHERE id = @invoiceId
    `);
};

/* =====================================================
   EXPORT
===================================================== */

module.exports = {
    getInvoiceList,
    insertInvoice,
    updateInvoiceCode,
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
    getPaymentByInvoiceId,
    getCustomerById,
    updateCustomer,
    updateInvoiceDiscount,
};