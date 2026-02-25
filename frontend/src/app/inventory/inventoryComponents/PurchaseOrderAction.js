import { useState } from "react";
import purchaseOrderService from "../../../services/purchaseOrderService";

const PurchaseOrderActions = ({ po, onReload }) => {
  const [actionLoading, setActionLoading] = useState(false);

  if (!po) return null;

  const handleUpdateStatus = async (newStatus, actionName) => {
    const confirmMsg = `Bạn có chắc muốn ${actionName.toLowerCase()} đơn này?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setActionLoading(true);
      await purchaseOrderService.updatePurchaseOrderStatus(po.id, newStatus);
      await onReload(); // reload detail từ component cha
    } catch (err) {
      alert(`Cập nhật trạng thái thất bại: ${err.message || "Lỗi không xác định"}`);
    } finally {
      setActionLoading(false);
    }
  };

  const renderButtons = () => {
    switch (po.status) {
      case "Pending":
        return (
          <div className="btn-group" role="group">
            <button
              type="button"
              className="btn btn-success rounded-start-pill px-4 py-2 fw-semibold"
              onClick={() => handleUpdateStatus("Approved", "duyệt")}
              disabled={actionLoading}
              title="Duyệt đơn hàng này"
            >
              <i className="bi bi-check-circle me-2"></i>
              Duyệt
            </button>
            <button
              type="button"
              className="btn btn-outline-danger rounded-end-pill px-4 py-2 fw-semibold"
              onClick={() => handleUpdateStatus("Rejected", "từ chối")}
              disabled={actionLoading}
              title="Từ chối đơn hàng"
            >
              <i className="bi bi-x-circle me-2"></i>
              Từ chối
            </button>
          </div>
        );

      case "Approved":
        return (
          <div className="btn-group" role="group">
            <button
              type="button"
              className="btn btn-warning rounded-start-pill px-4 py-2 fw-semibold"
              onClick={() => handleUpdateStatus("CannotDeliver", "đánh dấu không thể giao")}
              disabled={actionLoading}
              title="Không thể giao hàng"
            >
              <i className="bi bi-exclamation-triangle me-2"></i>
              Không thể giao
            </button>
            <button
              type="button"
              className="btn btn-primary rounded-end-pill px-4 py-2 fw-semibold"
              onClick={() => handleUpdateStatus("WaitingForDelivery", "chuyển sang chờ giao")}
              disabled={actionLoading}
              title="Chuyển sang trạng thái chờ giao hàng"
            >
              <i className="bi bi-truck me-2"></i>
              Chờ giao hàng
            </button>
          </div>
        );

      case "WaitingForDelivery":
        return (
          <button
            type="button"
            className="btn btn-info rounded-pill px-5 py-2 fw-bold shadow-sm"
            onClick={() => handleUpdateStatus("Received", "xác nhận nhận hàng")}
            disabled={actionLoading}
            title="Xác nhận đã nhận hàng thành công"
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

      default:
        return (
          <div className="text-muted fst-italic">
            Không có hành động nào khả dụng cho trạng thái hiện tại
          </div>
        );
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center gap-3 flex-wrap">
      {actionLoading && (
        <div className="text-primary small">
          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
          Đang cập nhật...
        </div>
      )}
      {renderButtons()}
    </div>
  );
};

export default PurchaseOrderActions;