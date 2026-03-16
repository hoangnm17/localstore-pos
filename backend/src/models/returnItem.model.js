const { connectDB, sql } = require("../config/database");

exports.createReturnItem = async (
    transaction,
    returnId,
    item
) => {

    const request = new sql.Request(transaction);

    await request
        .input("returnId", returnId)
        .input("invoiceItemId", item.invoiceItemId)
        .input("productId", item.productId)
        .input("productUnitId", item.productUnitId)
        .input("productName", item.productName)
        .input("unitName", item.unitName)
        .input("quantity", item.quantity)
        .input("baseQuantity", item.baseQuantity)
        .input("refundAmount", item.refundAmount)
        .query(`
      INSERT INTO ReturnItems
      (
        returnId,
        invoiceItemId,
        productId,
        productUnitId,
        productName,
        unitName,
        quantity,
        baseQuantity,
        refundAmount
      )
      VALUES
      (
        @returnId,
        @invoiceItemId,
        @productId,
        @productUnitId,
        @productName,
        @unitName,
        @quantity,
        @baseQuantity,
        @refundAmount
      )
    `);

};