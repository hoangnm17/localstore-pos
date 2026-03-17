const returnItemModel = require("../models/returnItem.model")
const { connectDB, sql } = require("../config/database");
const inventoryService = require("./InventoryServices/inventory.service")

const getReturnItems = async (filters = {}) => {

    const page = Number(filters.page || 1);
    const pageSize = Number(filters.pageSize || 20);
    const offset = (page - 1) * pageSize;

    const pool = await connectDB();

    const data = await returnItemModel.getReturnItems(pool, {
        status: filters.status,
        pageSize,
        offset
    });

    return {
        page,
        pageSize,
        total: data.total,
        data: data.rows
    };

};

const approveRestock = async (returnItemId, staffId) => {
  const pool = await connectDB();
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    const item = await returnItemModel.getReturnItemById(transaction, returnItemId);

    if (!item) {
      throw new Error("Return item not found");
    }

    if (item.restockApproved !== "Pending") {
      throw new Error("Item already processed");
    }

    await returnItemModel.updateRestockStatus(
      transaction,
      returnItemId,
      staffId,
      "Approved"
    );

    await inventoryService.addStock(
      transaction,
      item.productId,
      item.baseQuantity
    );

    await transaction.commit();

    return { success: true };

  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

const rejectRestock = async (returnItemId, staffId) => {
    const pool = await connectDB();
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        const item = await returnItemModel.getReturnItemById(transaction, returnItemId);

        if (!item) {
            throw new Error("Return item not found");
        }

        if (item.restockApproved !== "Pending") {
            throw new Error("Item already processed");
        }

        await returnItemModel.updateRestockStatus(
            transaction,
            returnItemId,
            staffId,
            "Rejected"
        );

        await transaction.commit();

        return { success: true };

    } catch (err) {
        await transaction.rollback();
        throw err;
    }
};

module.exports = {
    getReturnItems,
    approveRestock,
    rejectRestock,
}