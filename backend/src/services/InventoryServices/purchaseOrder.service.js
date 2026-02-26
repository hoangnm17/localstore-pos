const purchaseOrderModel = require("../../models/purchaseOrder.model");

const CREATE_PO_ROLES = ["manager", "warehouse_staff"];
const MANAGER = "manager";
const WAREHOUSE = "warehouse_staff";

/* ==============================
   CREATE PURCHASE ORDER
============================== */
exports.createPurchaseOrder = async (data, user) => {

    if (!user.permissions.includes("CREATE_PURCHASE_ORDER")) {
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
        createdBy: user.id,
        items: data.items
    });
};

/* ==============================
   UPDATE STATUS
============================== */
exports.updateStatus = async (poId, newStatus, currentUser) => {

    const hasUpdatePermission = currentUser.permissions.includes("UPDATE_PURCHASE_ORDER");
    const hasReceivePermission = currentUser.permissions.includes("RECEIVE_PURCHASE_ORDER");

    const userId = currentUser.id;

    const validStatuses = [
        "Approved",
        "Rejected",
        "WaitingForDelivery",
        "CannotDeliver",
        "Received"
    ];

    if (!validStatuses.includes(newStatus)) {
        throw new Error("INVALID_TRANSITION");
    }

    if (hasUpdatePermission) {

        // Nếu là Received thì gọi hàm receive riêng
        if (newStatus === "Received") {
            return await purchaseOrderModel.receivePurchaseOrder(poId, userId);
        }

        return await purchaseOrderModel.updateStatus(poId, newStatus, userId);
    }

    if (hasReceivePermission) {

        if (newStatus !== "Received") {
            throw new Error("PERMISSION_DENIED");
        }

        return await purchaseOrderModel.receivePurchaseOrder(poId, userId);
    }

    throw new Error("PERMISSION_DENIED");
};

exports.getDetail = async (poId) => {

    const po = await purchaseOrderModel.getDetailById(poId);

    if (!po) {
        throw new Error("PO_NOT_FOUND");
    }

    return po;
};

exports.getList = async (query) => {

    const page = parseInt(query.page) || 1;
    const pageSize = 15;

    return await purchaseOrderModel.getList({
        page,
        pageSize,
        from: query.from,
        to: query.to,
        status: query.status
    });
};

/* ==============================
   PO MONTHLY REPORT
============================== */
exports.getMonthlyReport = async ({
    month,
    year,
    supplierId
}) => {

    if (month < 1 || month > 12) {
        throw new Error("INVALID_MONTH");
    }

    return await purchaseOrderModel.getMonthlyReport({
        month,
        year,
        supplierId
    });
};