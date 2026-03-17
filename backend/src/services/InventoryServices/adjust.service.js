const inventoryAdjustmentModel = require("../../models/adjust.model");
const staffModel = require("../../models/staff.model");

const createAdjustment = async (user, body) => {
    if (!user.permissions.includes("CREATE_ADJUST")) {
        throw new Error("Bạn không có quyền tạo phiếu");
    }

    const staff = await staffModel.getStaffByUserId(user.id);
    if (!staff) {
        throw new Error("Không tìm thấy nhân viên");
    }

    const { reason, items } = body;
    if (!reason || !items || items.length === 0) {
        throw new Error("Dữ liệu không hợp lệ");
    }

    // Validation mới cho format kiểm kê theo unit lớn nhất
    for (let item of items) {
        if (!item.productId || typeof item.actualLargest !== "number" || typeof item.actualRemainder !== "number") {
            throw new Error("Dữ liệu item không hợp lệ (cần productId, actualLargest, actualRemainder)");
        }
    }

    const adjustmentId = await inventoryAdjustmentModel.createAdjustmentWithItems(
        staff.id,
        reason,
        items
    );

    return { adjustmentId };
};

const updateStatus = async (user, adjustmentId, newStatus) => {
    // giữ nguyên
    if (!user.permissions.includes("PROCESS_ADJUST")) {
        throw new Error("Bạn không có quyền xử lý phiếu");
    }

    if (!["Approved", "Rejected"].includes(newStatus)) {
        throw new Error("Trạng thái không hợp lệ");
    }

    const staff = await staffModel.getStaffByUserId(user.id);
    if (!staff) {
        throw new Error("Không tìm thấy nhân viên");
    }

    return await inventoryAdjustmentModel.updateStatusTransaction(
        adjustmentId,
        staff.id,
        newStatus
    );
};

const getAdjustments = async (filters) => {
    return await inventoryAdjustmentModel.getAdjustments(filters);
};

const getAdjustmentDetail = async (adjustmentId) => {
    const data = await inventoryAdjustmentModel.getAdjustmentDetail(adjustmentId);
    if (!data) {
        throw new Error("Phiếu không tồn tại");
    }
    return data;
};

module.exports = {
    createAdjustment,
    updateStatus,
    getAdjustments,
    getAdjustmentDetail
};