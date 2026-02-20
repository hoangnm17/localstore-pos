const purchaseOrderModel = require("../../models/purchaseOrder.model");

const CREATE_PO_ROLES = ["manager", "warehouse_staff"];

exports.createPurchaseOrder = async (data, user) => {

    if (!CREATE_PO_ROLES.includes(user.role)) {
        throw new Error("PERMISSION_DENIED");
    }

    if (!data.supplierId) {
        throw new Error("SUPPLIER_REQUIRED");
    }

    return purchaseOrderModel.createPurchaseOrder({
        supplierId: data.supplierId,
        note: data.note || null,
        createdBy: user.staffId
    });
};