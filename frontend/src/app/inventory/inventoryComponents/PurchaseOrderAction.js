import purchaseOrderService from "../../../services/purchaseOrderService";

const PurchaseOrderActions = ({ po, onReload }) => {
  if (!po) return null;

  const handleUpdateStatus = async (newStatus) => {
    const confirm = window.confirm("Bạn có chắc muốn cập nhật trạng thái?");
    if (!confirm) return;

    try {
      await purchaseOrderService.updatePurchaseOrderStatus(po.id, newStatus);
      await onReload(); // reload lại detail từ component cha
    } catch (err) {
      alert("Cập nhật trạng thái thất bại!");
    }
  };

  switch (po.status) {
    case "Pending":
      return (
        <>
          <button
            className="btn btn-success rounded-pill px-4 me-3"
            onClick={() => handleUpdateStatus("Approved")}
          >
            Đồng ý
          </button>
          <button
            className="btn btn-danger rounded-pill px-4"
            onClick={() => handleUpdateStatus("Rejected")}
          >
            Từ chối
          </button>
        </>
      );

    case "Approved":
      return (
        <>
          <button
            className="btn btn-warning rounded-pill px-4 me-3"
            onClick={() => handleUpdateStatus("CannotDeliver")}
          >
            Không thể giao
          </button>
          <button
            className="btn btn-primary rounded-pill px-4"
            onClick={() => handleUpdateStatus("WaitingForDelivery")}
          >
            Chờ giao hàng
          </button>
        </>
      );

    case "WaitingForDelivery":
      return (
        <button
          className="btn btn-info rounded-pill px-4"
          onClick={() => handleUpdateStatus("Received")}
        >
          Nhận hàng
        </button>
      );

    default:
      return null;
  }
};

export default PurchaseOrderActions;