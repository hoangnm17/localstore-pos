const { connectDB, sql } = require("../config/database");

const getInvoiceList = async ({
  page = 1,
  pageSize = 10,
  status,
  invoiceCode
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

  if (invoiceCode) {
    whereClause += " AND i.invoiceCode LIKE @invoiceCode";
    request.input("invoiceCode", sql.VarChar(50), `%${invoiceCode}%`);
  }

  request.input("offset", sql.Int, offset);
  request.input("limit", sql.Int, limit);

  const listQuery = `
    SELECT
      i.id,
      i.invoiceCode,
      i.createdAt,
      i.finalAmount,
      i.status,
      s.id         AS staffId,
      s.fullName   AS staffName,
      c.id         AS counterId,
      c.counterName AS counterName,
      cu.id        AS customerId,
      cu.name      AS customerName
    FROM Invoices i
    LEFT JOIN Staff s     ON i.staffId = s.id
    LEFT JOIN Counters c  ON i.counterId = c.id
    LEFT JOIN Customers cu ON i.customerId = cu.id
    ${whereClause}
    ORDER BY i.createdAt DESC
    OFFSET @offset ROWS
    FETCH NEXT @limit ROWS ONLY
  `;

  const listResult = await request.query(listQuery);

  const countResult = await request.query(`
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

const insertInvoice = async (
  transaction,
  { staffId, invoiceCode, counterId, customerId = null }
) => {
  const result = await new sql.Request(transaction)
    .input("invoiceCode", sql.VarChar(50), invoiceCode)
    .input("staffId", sql.BigInt, staffId)
    .input("counterId", sql.BigInt, counterId)
    .input("customerId", sql.BigInt, customerId)
    .input("status", sql.VarChar(20), "UNPAID")
    .input("totalAmount", sql.Decimal(15, 2), 0)
    .input("finalAmount", sql.Decimal(15, 2), 0)
    .query(`
      INSERT INTO Invoices (
        invoiceCode,
        staffId,
        counterId,
        customerId,
        totalAmount,
        finalAmount,
        status,
        createdAt
      )
      OUTPUT INSERTED.id
      VALUES (
        @invoiceCode,
        @staffId,
        @counterId,
        @customerId,
        @totalAmount,
        @finalAmount,
        @status,
        GETDATE()
      )
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
  voucherId,
  voucherDiscount = 0,
  usedPoints = 0,
  pointDiscount = 0,
) => {

  await new sql.Request(transaction)
    .input("invoiceId", sql.Int, invoiceId)
    .input("voucherId", sql.Int, voucherId || null)
    .input("voucherDiscount", sql.Decimal(10, 2), voucherDiscount || 0)
    .input("usedPoints", sql.Int, usedPoints || 0)
    .input("pointDiscount", sql.Decimal(10, 2), pointDiscount || 0)
    .query(`
      UPDATE Invoices
      SET
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


const getInvoice = async (transaction, id) => {
  const result = await new sql.Request(transaction)
    .input("id", sql.Int, id)
    .query(`
      SELECT id, customerId, status, totalAmount, finalAmount, usedPoints
      FROM Invoices WITH (UPDLOCK, ROWLOCK)
      WHERE id = @id
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
  {
    invoiceId,
    productId,
    productUnitId,
    productName,
    unitName,
    quantity,
    baseQuantity,
    unitPrice,
    lineTotal
  }
) => {
  await new sql.Request(transaction)
    .input("invoiceId", sql.BigInt, invoiceId)
    .input("productId", sql.BigInt, productId)
    .input("productUnitId", sql.Int, productUnitId)
    .input("productName", sql.NVarChar(255), productName)
    .input("unitName", sql.NVarChar(20), unitName)
    .input("quantity", sql.Decimal(15, 3), quantity)
    .input("baseQuantity", sql.Decimal(15, 3), baseQuantity)
    .input("unitPrice", sql.Decimal(15, 2), unitPrice)
    .input("lineTotal", sql.Decimal(15, 2), lineTotal)
    .query(`
      INSERT INTO InvoiceItems
      (
        invoiceId,
        productId,
        productUnitId,
        productName,
        unitName,
        quantity,
        baseQuantity,
        unitPrice,
        lineTotal
      )
      VALUES
      (
        @invoiceId,
        @productId,
        @productUnitId,
        @productName,
        @unitName,
        @quantity,
        @baseQuantity,
        @unitPrice,
        @lineTotal
      )
    `);
};

const getProductById = async (transaction, productId, productUnitId) => {
  const result = await new sql.Request(transaction)
    .input("productId", sql.BigInt, productId)
    .input("productUnitId", sql.Int, productUnitId)
    .query(`
      SELECT 
        p.id,
        p.name,
        pu.id AS productUnitId,
        pu.unitName,
        pu.salePrice,
        pu.conversionFactor
      FROM Products p
      JOIN ProductUnits pu 
        ON p.id = pu.productId
      WHERE 
        p.id = @productId
        AND pu.id = @productUnitId
        AND p.status = 'Selling'
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

const getDraftInvoices = async (counterId) => {
  const pool = await connectDB();

  const result = await pool.request().query(`
    SELECT id, invoiceCode, createdAt, finalAmount, status
    FROM Invoices
    WHERE status = 'UNPAID' OR status = 'PENDING'
    ORDER BY createdAt ASC
  `);

  return result.recordset;
};

const getInvoiceDetail = async (id) => {
  const pool = await connectDB();
  const invoiceResult = await pool.request()
    .input("id", sql.Int, id)
    .query(`
      SELECT 
        i.id,
        i.invoiceCode,
        i.createdAt,
        i.finalAmount,
        i.status,
        i.customerId,

        cu.name AS customerName,
        s.fullName AS staffName,
        c.counterName

      FROM Invoices i
      LEFT JOIN Customers cu ON i.customerId = cu.id
      LEFT JOIN Staff s ON i.staffId = s.id
      LEFT JOIN Counters c ON i.counterId = c.id

      WHERE i.id = @id
    `);

  const invoice = invoiceResult.recordset[0];
  if (!invoice) return null;

  const itemsResult = await pool.request()
    .input("invoiceId", sql.Int, id)
    .query(`
    SELECT 
      ii.id,
      ii.productId,
      ii.productUnitId,
      ii.quantity,
      ii.unitPrice,
      ii.lineTotal,

      pu.unitName,
      pu.conversionFactor AS factor,
      pu.unitType,

      p.name AS productName,
      p.code,

      inv.quantityOnHand

    FROM InvoiceItems ii

    JOIN Products p
      ON p.id = ii.productId

    LEFT JOIN ProductUnits pu
      ON pu.id = ii.productUnitId

    LEFT JOIN InventoryStocks inv
      ON inv.productId = ii.productId

    WHERE ii.invoiceId = @invoiceId
  `);

  return {
    ...invoice,
    items: itemsResult.recordset
  };
};

const getInvoiceItems = async (transaction, invoiceId) => {
  const result = await new sql.Request(transaction)
    .input("invoiceId", sql.Int, invoiceId)
    .query(`
      SELECT 
        id,
        productId,
        productUnitId,
        productName,
        unitName,
        quantity,
        unitPrice,
        baseQuantity
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

const getInvoiceId = async (transaction, id) => {
  const result = await new sql.Request(transaction)
    .input("id", sql.Int, id)
    .query(`
      SELECT id, customerId, status, totalAmount, finalAmount
      FROM Invoices WITH (UPDLOCK, ROWLOCK)
      WHERE id = @id
    `);

  return result.recordset[0] || null;
};

const getStaffAndSchedule = async (userId) => {
  const pool = await connectDB();
  const staffRes = await pool.request()
    .input('uid', sql.Int, userId)
    .query(`
      SELECT s.id, r.name as roleName 
        FROM Staff s
        JOIN Users u ON s.userId = u.id
        JOIN Roles r ON u.roleId = r.id
        WHERE s.userId = @uid
      `);
  if (!staffRes.recordset.length) return null;

  const staffId = staffRes.recordset[0].id;
  const roleName = staffRes.recordset[0].roleName;
  const schedRes = await pool.request()
    .input('sid', sql.BigInt, staffId)
    .query(`
        SELECT TOP 1 ws.id, ws.status 
        FROM WorkSchedules ws 
        WHERE ws.staffId = @sid 
          AND ws.workDate = CAST(DATEADD(hour, 7, GETUTCDATE()) AS DATE) 
          AND ws.status = 'working'
    `);

  return { staffId, roleName, schedule: schedRes.recordset[0] || null };
};

const getCounterName = async (counterId) => {
  const pool = await connectDB();
  const res = await pool.request()
    .input('cid', sql.BigInt, counterId)
    .query(`SELECT counterName FROM Counters WHERE id = @cid`);
  return res.recordset[0]?.counterName || 'Quầy';
};

const checkInSchedule = async (scheduleId) => {
  const pool = await connectDB();
  await pool.request()
    .input('id', sql.Int, scheduleId)
    .query(`UPDATE WorkSchedules SET status = 'working' WHERE id = @id`);
};

const updateInvoiceExpire = async (transaction, invoiceId, expiresAt) => {
  const request = new sql.Request(transaction);

  const result = await request
    .input("invoiceId", sql.BigInt, invoiceId)
    .input("expiresAt", sql.DateTime2, expiresAt)
    .query(`
      UPDATE Invoices
      SET expiresAt = @expiresAt
      WHERE id = @invoiceId
    `);

  return result.rowsAffected[0];
};

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
  getInvoiceId,
  getStaffAndSchedule,
  getCounterName,
  checkInSchedule,
  updateInvoiceExpire,
  getInvoice
};