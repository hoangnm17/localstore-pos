const purchaseOrderModel = require("../../models/purchaseOrder.model");

const CREATE_PO_ROLES = ["manager", "warehouse_staff"];

exports.createPurchaseOrder = async (data, user) => {

    if (!CREATE_PO_ROLES.includes(user.role)) {
        throw new Error("PERMISSION_DENIED");
    }

    if (!data.supplierId) {
        throw new Error("SUPPLIER_REQUIRED");
    }

    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
        throw new Error("ITEMS_REQUIRED");
    }

    for (const item of data.items) {
        if (!item.productId || !item.quantityOrdered || item.quantityOrdered <= 0) {
            throw new Error("INVALID_ITEM_DATA");
        }
    }

    return purchaseOrderModel.createPurchaseOrderWithItems({
        supplierId: data.supplierId,
        note: data.note || null,
        createdBy: user.staffId,
        items: data.items
    });
};