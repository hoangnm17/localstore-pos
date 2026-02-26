import { useState } from "react";
import purchaseOrderService from "../../../services/Inventory/purchaseOrderService";

const PurchaseOrderActions = ({
    po,
    onReload,
    canUpdatePO,
    canReceivePO
}) => {

    const [actionLoading, setActionLoading] = useState(false);

    if (!po) return null;

    // ==============================
    // MANAGER UPDATE STATUS
    // ==============================
    const handleUpdateStatus = async (newStatus, actionName) => {
        const confirmMsg = `Bạn có chắc muốn ${actionName.toLowerCase()} đơn này?`;
        if (!window.confirm(confirmMsg)) return;

        try {
            setActionLoading(true);

            await purchaseOrderService.updatePurchaseOrderStatus(
                po.id,
                newStatus
            );

            await onReload();
        } catch (err) {
            alert(
                `Cập nhật trạng thái thất bại: ${err?.response?.data?.message ||
                err.message ||
                "Lỗi không xác định"
                }`
            );
        } finally {
            setActionLoading(false);
        }
    };

    // ==============================
    // WAREHOUSE RECEIVE
    // ==============================
    const handleReceive = async () => {
        const confirmMsg = "Bạn có chắc muốn xác nhận nhận hàng?";
        if (!window.confirm(confirmMsg)) return;

        try {
            setActionLoading(true);

            await purchaseOrderService.receivePurchaseOrder(po.id);

            await onReload();
        } catch (err) {
            alert(
                `Nhận hàng thất bại: ${err?.response?.data?.message ||
                err.message ||
                "Lỗi không xác định"
                }`
            );
        } finally {
            setActionLoading(false);
        }
    };

    const renderButtons = () => {

        // ===== PENDING → Manager duyệt =====
        if (po.status === "Pending" && canUpdatePO) {
            return (
                <div className="btn-group">
                    <button
                        className="btn btn-success rounded-start-pill px-4"
                        onClick={() => handleUpdateStatus("Approved", "duyệt")}
                        disabled={actionLoading}
                    >
                        Duyệt
                    </button>

                    <button
                        className="btn btn-outline-danger rounded-end-pill px-4"
                        onClick={() => handleUpdateStatus("Rejected", "từ chối")}
                        disabled={actionLoading}
                    >
                        Từ chối
                    </button>
                </div>
            );
        }

        // ===== APPROVED → Manager xử lý tiếp =====
        if (po.status?.toLowerCase() === "approved" && canUpdatePO) {
            return (
                <div className="btn-group">
                    <button
                        className="btn btn-primary rounded-start-pill px-4"
                        onClick={() =>
                            handleUpdateStatus(
                                "WaitingForDelivery",
                                "chuyển sang chờ giao hàng"
                            )
                        }
                        disabled={actionLoading}
                    >
                        Chờ giao hàng
                    </button>

                    <button
                        className="btn btn-warning rounded-end-pill px-4"
                        onClick={() =>
                            handleUpdateStatus(
                                "CannotDeliver",
                                "đánh dấu không thể giao"
                            )
                        }
                        disabled={actionLoading}
                    >
                        Không thể giao
                    </button>
                </div>
            );
        }

        // ===== WAITING FOR DELIVERY → Warehouse nhận hàng =====
        // ===== WAITING FOR DELIVERY → Receive (Manager + Warehouse) =====
        if (
            po.status === "WaitingForDelivery" &&
            (canReceivePO || canUpdatePO)
        ) {
            return (
                <button
                    className="btn btn-info rounded-pill px-5 fw-bold"
                    onClick={handleReceive}
                    disabled={actionLoading}
                >
                    {actionLoading ? "Đang xử lý..." : "Nhận hàng"}
                </button>
            );
        }

        return (
            <div className="text-muted fst-italic">
                Không có hành động khả dụng
            </div>
        );
    };

    return (
        <div className="d-flex justify-content-center align-items-center gap-3 flex-wrap">
            {renderButtons()}
        </div>
    );
};

export default PurchaseOrderActions;