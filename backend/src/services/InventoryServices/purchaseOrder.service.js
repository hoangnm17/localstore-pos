const purchaseOrderModel = require("../../models/purchaseOrder.model");

const CREATE_PO_ROLES = ["manager", "warehouse_staff"];
const MANAGER = "manager";
const WAREHOUSE = "warehouse_staff";

/* ==============================
   CREATE PURCHASE ORDER
============================== */
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

    return await purchaseOrderModel.createPurchaseOrderWithItems({
        supplierId: data.supplierId,
        note: data.note || null,
        createdBy: user.staffId,
        items: data.items
    });
};


/* ==============================
   UPDATE STATUS
============================== */
exports.updateStatus = async (poId, newStatus, user) => {

    const po = await purchaseOrderModel.getById(poId);
    if (!po) throw new Error("PO_NOT_FOUND");

    const currentStatus = po.status;

    // -------------------------
    // ROLE CHECK
    // -------------------------

    if (user.role === MANAGER) {

        if (
            (currentStatus === "Pending" &&
                ["Approved", "Rejected"].includes(newStatus)) ||

            (currentStatus === "Approved" &&
                ["WaitingForDelivery", "CannotDeliver"].includes(newStatus)) ||

            (currentStatus === "WaitingForDelivery" &&
                newStatus === "Received")
        ) {
            // hợp lệ
        } else {
            throw new Error("INVALID_TRANSITION");
        }

    } else if (user.role === WAREHOUSE) {

        if (
            currentStatus === "WaitingForDelivery" &&
            newStatus === "Received"
        ) {
            // hợp lệ
        } else {
            throw new Error("PERMISSION_DENIED");
        }

    } else {
        throw new Error("PERMISSION_DENIED");
    }

    // -------------------------
    // RECEIVE → transaction + receivedBy
    // -------------------------

    if (newStatus === "Received") {
        return await purchaseOrderModel.receivePurchaseOrder(
            poId,
            user.staffId
        );
    }

    // -------------------------
    // Other status → processBy nếu cần
    // -------------------------

    return await purchaseOrderModel.updateStatus(
        poId,
        newStatus,
        user.staffId
    );
};

exports.getDetail = async (poId) => {

    const po = await purchaseOrderModel.getDetailById(poId);

    if (!po) {
        throw new Error("PO_NOT_FOUND");
    }

    return po;
};