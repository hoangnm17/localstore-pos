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

    const handleUpdateStatus = async (newStatus, actionName) => {
        const confirmMsg = `Bạn có chắc muốn ${actionName.toLowerCase()} đơn này?`;
        if (!window.confirm(confirmMsg)) return;

        try {
            setActionLoading(true);
            await purchaseOrderService.updatePurchaseOrderStatus(po.id, newStatus);
            await onReload();
        } catch (err) {
            alert(`Cập nhật trạng thái thất bại: ${err?.response?.data?.message || err.message || "Lỗi không xác định"}`);
        } finally {
            setActionLoading(false);
        }
    };

    const renderButtons = () => {

        // ===== PENDING → Manager duyệt =====
        if (po.status === "Pending" && canUpdatePO) {
            return (
                <div className="btn-group" role="group">
                    <button
                        type="button"
                        className="btn btn-success rounded-start-pill px-4 py-2 fw-semibold"
                        onClick={() => handleUpdateStatus("Approved", "duyệt")}
                        disabled={actionLoading}
                    >
                        <i className="bi bi-check-circle me-2"></i>
                        Duyệt
                    </button>

                    <button
                        type="button"
                        className="btn btn-outline-danger rounded-end-pill px-4 py-2 fw-semibold"
                        onClick={() => handleUpdateStatus("Rejected", "từ chối")}
                        disabled={actionLoading}
                    >
                        <i className="bi bi-x-circle me-2"></i>
                        Từ chối
                    </button>
                </div>
            );
        }

        // ===== APPROVED → Manager chuyển sang chờ giao =====
        if (po.status?.toLowerCase() === "approved" && canUpdatePO) {
    return (
        <div className="btn-group">
            <button
                className="btn btn-primary rounded-start-pill px-4"
                onClick={() =>
                    handleUpdateStatus("WaitingForDelivery", "chuyển sang chờ giao hàng")
                }
                disabled={actionLoading}
            >
                <i className="bi bi-truck me-2"></i>
                Chờ giao hàng
            </button>

            <button
                className="btn btn-warning rounded-end-pill px-4"
                onClick={() =>
                    handleUpdateStatus("CannotDeliver", "đánh dấu không thể giao")
                }
                disabled={actionLoading}
            >
                <i className="bi bi-exclamation-triangle me-2"></i>
                Không thể giao
            </button>
        </div>
    );
}

        // ===== WAITING FOR DELIVERY → Warehouse nhận hàng =====
        if (po.status === "WaitingForDelivery" && canReceivePO) {
            return (
                <button
                    type="button"
                    className="btn btn-info rounded-pill px-5 py-2 fw-bold shadow-sm"
                    onClick={() =>
                        handleUpdateStatus("Received", "xác nhận nhận hàng")
                    }
                    disabled={actionLoading}
                >
                    {actionLoading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Đang xử lý...
                        </>
                    ) : (
                        <>
                            <i className="bi bi-check2-all me-2"></i>
                            Nhận hàng
                        </>
                    )}
                </button>
            );
        }

        // ===== Các trạng thái khác =====
        return (
            <div className="text-muted fst-italic">
                Không có hành động nào khả dụng
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