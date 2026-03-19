const purchaseOrderModel = require("../../models/purchaseOrder.model");
const staffModel = require("../../models/staff.model");

const createPurchaseOrder = async (user, note, items) => {
    if (!user.permissions.includes("CREATE_PURCHASE_ORDER")) {
        throw new Error("PERMISSION_DENIED");
    }

    const staff = await staffModel.getStaffByUserId(user.id);

    if (!staff) {
        throw new Error("Staff khong ton tai");
    }

    const supplierGroups = {};

    for (const item of items) {

        if (!supplierGroups[item.supplierId]) {
            supplierGroups[item.supplierId] = [];
        }

        supplierGroups[item.supplierId].push(item);
    }

    const createdOrders = [];

    for (const supplierId in supplierGroups) {

        const orderItems = supplierGroups[supplierId];

        const po = await purchaseOrderModel.createPurchaseOrder(
            staff.id,
            supplierId,
            note
        );

        const poId = po.id;

        let totalAmount = 0;

        for (const item of orderItems) {

            const priceData = await purchaseOrderModel.getSupplierPrice(
                supplierId,
                item.productUnitId
            );

            if (!priceData) {
                throw new Error("Khong tim thay gia nha cung cap");
            }

            const costPrice = priceData.price;

            const itemTotal = item.quantity * costPrice;

            totalAmount += itemTotal;

            await purchaseOrderModel.createPurchaseOrderItem(
                poId,
                item.productUnitId,
                item.quantity,
                costPrice
            );
        }

        await purchaseOrderModel.updatePurchaseOrderTotal(
            poId,
            totalAmount
        );

        createdOrders.push(poId);
    }

    return createdOrders;
};

const updateStatus = async (poId, newStatus, currentUser) => {

    const { permissions, id: userId } = currentUser;

    const staff = await staffModel.getStaffByUserId(currentUser.id);

    const hasUpdatePermission = permissions.includes("UPDATE_PURCHASE_ORDER");
    const po = await purchaseOrderModel.getPurchaseOrderById(poId);

    if (!po) {
        throw new Error("PO_NOT_FOUND");
    }
    const validStatuses = [
        "Approved",
        "Rejected",
        "WaitingForDelivery",
        "CannotDeliver"
    ];

    if (!validStatuses.includes(newStatus)) {
        throw new Error("INVALID_TRANSITION");
    }

    if (!hasUpdatePermission) {
        throw new Error("PERMISSION_DENIED");
    }

    return await purchaseOrderModel.updateStatus(
        poId,
        newStatus,
        staff.id
    );
};



const receiveOrder = async (poId, items, currentUser) => {

    const { permissions, id: userId } = currentUser;

    const staff = await staffModel.getStaffByUserId(userId);

    const hasReceivePermission =
        permissions.includes("RECEIVE_PURCHASE_ORDER");

    if (!hasReceivePermission) {
        throw new Error("PERMISSION_DENIED");
    }

    const poItems = await purchaseOrderModel.getPurchaseOrderItems(poId);

    if (!poItems.length) {
        throw new Error("PO_ITEMS_NOT_FOUND");
    }

    let allReceived = true;

    for (const item of items) {

        const poItem = poItems.find(
            i => i.id === item.poiId
        );

        if (!poItem) {
            throw new Error("INVALID_PO_ITEM");
        }

        const totalReceived =
            poItem.receivedQuantity + item.receivedQuantity;

        if (totalReceived > poItem.quantity) {
            throw new Error("RECEIVED_EXCEEDS_ORDER");
        }

        if (totalReceived < poItem.quantity) {
            allReceived = false;
        }

    }

    const status = allReceived
        ? "Received"
        : "PartiallyReceived";

    return await purchaseOrderModel.receiveOrder(
        poId,
        items,
        status,
        staff.id
    );

};
const getPurchaseOrders = async (page, limit, filters) => {

    const offset = (page - 1) * limit;

    const data = await purchaseOrderModel.getPurchaseOrders(
        offset,
        limit,
        filters
    );

    const total = await purchaseOrderModel.countPurchaseOrders(filters);

    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };

};

const getPurchaseOrderDetail = async (poId) => {

    const order = await purchaseOrderModel.getPurchaseOrderById(poId);

    if (!order) {
        throw new Error("PO_NOT_FOUND");
    }

    const items = await purchaseOrderModel.getPurchaseOrderItems(poId);

    order.items = items;

    return order;

};

const getSuppliersByProductUnit = async (productUnitId, currentUser) => {

    if (!currentUser.permissions.includes("CREATE_PURCHASE_ORDER")) {
        throw new Error("PERMISSION_DENIED");
    }

    if (!productUnitId) {
        throw new Error("PRODUCT_UNIT_ID_REQUIRED");
    }

    const suppliers = await purchaseOrderModel.getSuppliersByProductUnit(productUnitId);

    return suppliers;
};



module.exports = {
    createPurchaseOrder,
    updateStatus,
    receiveOrder,
    getPurchaseOrders,
    getPurchaseOrderDetail,
    getSuppliersByProductUnit
};