const { connectDB, sql } = require("../config/database");

exports.createReturnItem = async (transaction, returnId, item) => {
  const request = new sql.Request(transaction);

  await request
    .input("returnId", sql.BigInt, returnId)
    .input("invoiceItemId", sql.BigInt, item.invoiceItemId)
    .input("productId", sql.BigInt, item.productId)
    .input("productUnitId", sql.BigInt, item.productUnitId)
    .input("productName", sql.NVarChar(255), item.productName)
    .input("unitName", sql.NVarChar(50), item.unitName)
    .input("quantity", sql.Decimal(18, 2), item.quantity)
    .input("baseQuantity", sql.Decimal(18, 2), item.baseQuantity)
    .input("refundAmount", sql.Decimal(18, 2), item.refundAmount)
    .query(`
      INSERT INTO ReturnItems (
        returnId, invoiceItemId, productId, productUnitId, 
        productName, unitName, quantity, baseQuantity, refundAmount
      )
      VALUES (
        @returnId, @invoiceItemId, @productId, @productUnitId, 
        @productName, @unitName, @quantity, @baseQuantity, @refundAmount
      )
    `);
};

exports.updateItemRefundAmount = async (transaction, returnItemId, refundAmount) => {
  const request = new sql.Request(transaction);

  request.input("id", sql.Int, returnItemId);
  request.input("refundAmount", sql.Decimal(18, 3), refundAmount);

  await request.query(`
    UPDATE ReturnItems
    SET refundAmount = @refundAmount
    WHERE id = @id
  `);
};


exports.getItemsByReturnId = async (transaction, returnId) => {
  const request = new sql.Request(transaction);

  request.input("returnId", sql.Int, returnId);

  const result = await request.query(`
    SELECT
      id,
      returnId,
      invoiceItemId,
      productId,
      productName,
      quantity,
      refundAmount,
      unitName,
      productUnitId,
      baseQuantity,
      restockApproved
    FROM ReturnItems
    WHERE returnId = @returnId
  `);

  return result.recordset;
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

// Thêm hàm này vào backend/models/returnItem.model.js
exports.getReturnItemById = async (transaction, id) => {
  const request = new sql.Request(transaction);
  const result = await request
    .input("id", sql.BigInt, id)
    .query(`
      SELECT *
      FROM ReturnItems WITH (UPDLOCK, ROWLOCK)
      WHERE id = @id
    `);

  return result.recordset[0] || null;
};

exports.updateRestockApprovedByReturnId = async (transaction, returnId, restockApproved) => {
  const request = new sql.Request(transaction);
  await request
    .input("returnId", sql.Int, returnId)
    .input("restockApproved", sql.VarChar(20), restockApproved)
    .query(`
      UPDATE ReturnItems 
      SET restockApproved = @restockApproved 
      WHERE returnId = @returnId
    `);
};

exports.getReturnItems = async (pool, { status, pageSize, offset }) => {
  const request = new sql.Request(pool);

  const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  const result = await request
    .input("status", sql.VarChar(20), formattedStatus)
    .input("pageSize", sql.Int, pageSize)
    .input("offset", sql.Int, offset)
    .query(`
      SELECT ri.id, ri.returnId, ri.productName, ri.quantity, ri.restockApproved, r.createdAt, ri.unitName, ri.baseQuantity
      FROM ReturnItems ri
      JOIN Returns r ON r.id = ri.returnId
      WHERE ri.restockApproved = @status
      ORDER BY r.createdAt DESC
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
    `);

  const totalResult = await new sql.Request(pool)
    .input("status", sql.VarChar(20), formattedStatus)
    .query(`
      SELECT COUNT(*) as total FROM ReturnItems 
      WHERE restockApproved = @status
    `);

  return {
    rows: result.recordset,
    total: totalResult.recordset[0].total
  };
};

exports.updateRestockStatus = async (transaction, id, checkedBy, restockApproved) => {
  const request = new sql.Request(transaction);

  await request
    .input("id", sql.BigInt, id)
    .input("checkedBy", sql.BigInt, checkedBy)
    .input("restockApproved", sql.VarChar(20), restockApproved)
    .query(`
      UPDATE ReturnItems 
      SET 
        restockApproved = @restockApproved,
        checkedBy = @checkedBy,
        checkedAt = GETDATE()
      WHERE id = @id
    `);
};