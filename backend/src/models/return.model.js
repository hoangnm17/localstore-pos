const { connectDB, sql } = require("../config/database");


exports.getReturns = async (pool, { status, pageSize, offset, staffId }) => {

  const request = new sql.Request(pool);

  let where = `WHERE 1=1`;

  if (status) {
    where += ` AND r.status = @status`;
    request.input("status", sql.VarChar, status);
  }

  if (staffId) {
    where += ` AND r.staffId = @staffId`;
    request.input("staffId", sql.Int, staffId);
  }

  request.input("pageSize", sql.Int, pageSize);
  request.input("offset", sql.Int, offset);

  const query = `
    -- total
    SELECT COUNT(*) AS total
    FROM Returns r
    ${where};

    -- data
    SELECT
      r.id,
      r.invoiceId,
      r.totalRefundAmount,
      r.status,
      r.createdAt,
      i.invoiceCode,
      c.name AS customerName,
      s.fullName AS staffName
    FROM Returns r
    LEFT JOIN Invoices i ON r.invoiceId = i.id
    LEFT JOIN Customers c ON i.customerId = c.id
    LEFT JOIN Staff s ON r.staffId = s.id
    ${where}
    ORDER BY r.createdAt DESC
    OFFSET @offset ROWS
    FETCH NEXT @pageSize ROWS ONLY;
  `;

  const result = await request.query(query);

  return {
    total: result.recordsets[0][0]?.total || 0,
    rows: result.recordsets[1] || []
  };
};

exports.getReturnDetail = async (returnId) => {
  const pool = await connectDB();
  const request = new sql.Request(pool);

  request.input("returnId", sql.BigInt, returnId);

  const result = await request.query(`
    
    SELECT
      r.id,
      r.reason,
      r.status,
      r.totalRefundAmount,
      r.createdAt,
      r.note,

      i.invoiceCode,
      c.name AS customerName,
      c.phone

    FROM Returns r

    LEFT JOIN Invoices i ON r.invoiceId = i.id
    LEFT JOIN Customers c ON i.customerId = c.id

    WHERE r.id = @returnId

    SELECT
      ri.id,
      ri.quantity,
      ri.refundAmount,

      p.id AS productId,
      p.name AS productName,
      p.imageUrl,
      ri.unitName

    FROM ReturnItems ri

    LEFT JOIN Products p ON ri.productId = p.id

    WHERE ri.returnId = @returnId

  `);

  const returnInfo = result.recordsets[0][0];

  if (!returnInfo) return null;

  const items = result.recordsets[1];

  return {
    ...returnInfo,
    returnItems: items.map(i => ({
      id: i.id,
      quantity: i.quantity,
      refundAmount: i.refundAmount,
      id: i.productId,
      name: i.productName,
      imageUrl: i.imageUrl,
      unitName: i.unitName
    }))
  };

};


exports.getReturnsByInvoiceId = async (invoiceId) => {
  const pool = await connectDB();

  const result = await pool.request()
    .input("invoiceId", sql.BigInt, invoiceId)
    .query(`
      SELECT 
        r.id,
        r.invoiceId,
        r.returnType,
        r.refundMethod,
        r.totalRefundAmount,
        r.status,
        r.createdAt,

        ri.id AS returnItemId,
        ri.invoiceItemId,
        ri.productId,
        ri.productName,
        ri.quantity,
        ri.refundAmount,
        ri.unitName,
        ri.productUnitId,
        ri.baseQuantity,
        ri.restockApproved

      FROM Returns r
      LEFT JOIN ReturnItems ri 
        ON r.id = ri.returnId

      WHERE r.invoiceId = @invoiceId
      ORDER BY r.createdAt DESC
    `);

  return result.recordset;
};

exports.createReturn = async (transaction, data) => {
  const request = new sql.Request(transaction);

  const result = await request
    .input("invoiceId", sql.Int, Number(data.invoiceId))
    .input("counterId", sql.Int, Number(data.counterId))
    .input("staffId", sql.Int, Number(data.staffId))
    .input("returnType", sql.VarChar(20), data.returnType)
    .input("refundMethod", sql.VarChar(20), data.refundMethod)
    .input("totalRefundAmount", sql.Decimal(18, 2), Number(data.totalRefundAmount || 0))
    .input("reason", sql.NVarChar(sql.MAX), data.reason || null)
    .query(`
      INSERT INTO Returns (
        invoiceId,
        counterId,
        staffId,
        returnType,
        refundMethod,
        totalRefundAmount,
        reason
      )
      OUTPUT INSERTED.id
      VALUES (
        @invoiceId,
        @counterId,
        @staffId,
        @returnType,
        @refundMethod,
        @totalRefundAmount,
        @reason
      )
    `);

  return result.recordset[0].id;
};

exports.getReturnById = async (transaction, id) => {
  const result = await new sql.Request(transaction)
    .input("id", sql.BigInt, id)
    .query(`
      SELECT *
      FROM Returns WITH (UPDLOCK, ROWLOCK)
      WHERE id = @id
    `);

  return result.recordset[0] || null;
};

exports.updateReturnStatus = async (transaction, id, data) => {
  await new sql.Request(transaction)
    .input("id", sql.BigInt, id)
    .input("status", sql.VarChar(20), data.status)
    .input("approveBy", sql.BigInt, data.approveBy)
    .input("approvedAt", sql.DateTime2, data.approvedAt)
    // Thêm input cho note (lý do từ chối hoặc ghi chú duyệt)
    .input("note", sql.NVarChar(sql.MAX), data.note || null) 
    .query(`
      UPDATE Returns 
      SET status = @status, 
          approveBy = @approveBy, 
          approvedAt = @approvedAt,
          note = @note
      WHERE id = @id
    `);
};
