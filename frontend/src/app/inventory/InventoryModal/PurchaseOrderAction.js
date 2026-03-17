import { useState } from "react";
import purchaseOrderService from "../../../services/Inventory/purchaseOrderService";

const PurchaseOrderActions = ({
  po,
  onReload,
  canUpdatePO,
  canReceivePO,
}) => {
  const [actionLoading, setActionLoading] = useState(false);

  if (!po) return null;

  const handleUpdateStatus = async (status, actionName) => {
    const confirmMsg = `Bạn có chắc muốn ${actionName.toLowerCase()} đơn này?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setActionLoading(true);
      await purchaseOrderService.updatePurchaseOrderStatus(po.id, status);
      await onReload();
    } catch (err) {
      alert(
        `Cập nhật trạng thái thất bại: ${err?.response?.data?.message || err.message || "Lỗi không xác định"
        }`
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleReceiveFull = async () => {
    const confirmMsg = "Bạn có chắc muốn **nhận đủ** tất cả số lượng còn lại?";
    if (!window.confirm(confirmMsg)) return;

    try {
      setActionLoading(true);

      const items = po.items.map(item => {
        const remaining = (item.quantity || 0) - (item.receivedQuantity || 0);
        return {
          poiId: item.id,
          receivedQuantity: remaining > 0 ? remaining : 0
        };
      }).filter(i => i.receivedQuantity > 0);

      if (items.length === 0) {
        alert("Đơn hàng đã nhận đủ, không cần nhận thêm.");
        return;
      }

      await purchaseOrderService.receivePurchaseOrder(po.id, { items });
      await onReload();
      alert("Nhận đủ hàng thành công!");
    } catch (err) {
      alert(
        `Nhận hàng thất bại: ${err?.response?.data?.message || err.message || "Lỗi không xác định"}`
      );
    } finally {
      setActionLoading(false);
    }
  };

  const renderButtons = () => {
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

    if (po.status?.toLowerCase() === "approved" && canUpdatePO) {
      return (
        <div className="btn-group">
          <button
            className="btn btn-primary rounded-start-pill px-4"
            onClick={() => handleUpdateStatus("WaitingForDelivery", "chuyển sang chờ giao hàng")}
            disabled={actionLoading}
          >
            Chờ giao hàng
          </button>
          <button
            className="btn btn-warning rounded-end-pill px-4"
            onClick={() => handleUpdateStatus("CannotDeliver", "đánh dấu không thể giao")}
            disabled={actionLoading}
          >
            Không thể giao
          </button>
        </div>
      );
    }

    if (po.status === "WaitingForDelivery" && (canReceivePO || canUpdatePO)) {
      return (
        <button
          className="btn btn-success rounded-pill px-5 fw-bold"
          onClick={handleReceiveFull}
          disabled={actionLoading}
        >
          {actionLoading ? "Đang xử lý..." : "Nhận đủ hàng"}
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