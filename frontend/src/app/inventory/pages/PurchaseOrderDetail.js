import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import purchaseOrderService from "../../../services/Inventory/purchaseOrderService";
import supplierService from "../../../services/Inventory/supplierService";
import PurchaseOrderActions from "../InventoryModal/PurchaseOrderAction";
import SupplierDetailModal from "../InventoryModal/SupplierDetailModal";

const PurchaseOrderDetail = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const canUpdatePO = user?.features?.includes("UPDATE_PURCHASE_ORDER");
  const canReceivePO = user?.features?.includes("RECEIVE_PURCHASE_ORDER");

  const { id } = useParams();
  const navigate = useNavigate();

  const [po, setPo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State cho modal chi tiết nhà cung cấp
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [supplierDetail, setSupplierDetail] = useState(null);
  const [supplierLoading, setSupplierLoading] = useState(false);

  // State cho số lượng nhận lần này (chỉ dùng khi WaitingForDelivery)
  const [receiveQuantities, setReceiveQuantities] = useState({});

  const fetchDetail = async () => {
    try {
      const res = await purchaseOrderService.getPurchaseOrderDetail(id);
      setPo(res?.data?.data || null);
    } catch (err) {
      setError("Không thể tải thông tin đơn đặt hàng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSupplierDetail = async (supplierId) => {
    if (!supplierId) return;
    setSupplierLoading(true);
    try {
      const res = await supplierService.getSupplierById(supplierId);
      setSupplierDetail(res?.data?.data || null);
    } catch (err) {
      console.error("Lỗi khi tải thông tin nhà cung cấp:", err);
      setSupplierDetail(null);
    } finally {
      setSupplierLoading(false);
    }
  };

  const handleSupplierClick = () => {
    if (po?.supplierId) {
      fetchSupplierDetail(po.supplierId);
      setShowSupplierModal(true);
    }
  };

  // Khởi tạo receiveQuantities chỉ khi cần (WaitingForDelivery)
  useEffect(() => {
    if (po?.status === "WaitingForDelivery" && po?.items && Array.isArray(po.items)) {
      const initial = {};
      po.items.forEach(item => {
        const remaining = (item.quantity || 0) - (item.receivedQuantity || 0);
        initial[item.id] = remaining > 0 ? remaining : 0;
      });
      setReceiveQuantities(initial);
    }
  }, [po]);

  // Xử lý thay đổi SL nhận lần này
  const handleReceiveQtyChange = (itemId, value) => {
    const num = value === "" ? 0 : Number(value);
    const item = po?.items?.find(i => i.id === itemId);
    if (!item) return;

    const max = item.quantity - (item.receivedQuantity || 0);
    const valid = Math.max(0, Math.min(num, max));

    setReceiveQuantities(prev => ({ ...prev, [itemId]: valid }));
  };

  // Gửi nhận hàng từ trang chi tiết
  const handleReceiveFromDetail = async () => {
    if (!po?.items || !Array.isArray(po.items)) {
      alert("Lỗi dữ liệu: Không có sản phẩm trong đơn hàng.");
      return;
    }

    const itemsToSend = po.items.map(item => ({
      productUnitId: item.productUnitId,
      receivedQuantity: receiveQuantities[item.id] || 0
    }));

    const total = itemsToSend.reduce((sum, i) => sum + i.receivedQuantity, 0);
    if (total === 0) {
      alert("Vui lòng nhập số lượng nhận cho ít nhất một sản phẩm.");
      return;
    }

    if (!window.confirm(`Xác nhận nhận ${total} đơn vị?`)) return;

    try {
      await purchaseOrderService.receivePurchaseOrder(po.id, { items: itemsToSend });
      fetchDetail();
      alert("Nhận hàng thành công!");
    } catch (err) {
      alert(`Nhận hàng thất bại: ${err?.response?.data?.message || err.message || "Lỗi không xác định"}`);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="container-fluid py-5 bg-light min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" style={{ width: "4rem", height: "4rem" }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="mt-4 text-muted">Đang tải chi tiết đơn nhập hàng...</h5>
        </div>
      </div>
    );
  }

  if (error || !po) {
    return (
      <div className="container-fluid py-5 bg-light min-vh-100">
        <div className="alert alert-danger alert-dismissible fade show shadow-lg rounded-3 text-center" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2 fs-4"></i>
          {error || `Không tìm thấy đơn nhập hàng #${id}`}
          <button
            type="button"
            className="btn-close"
            onClick={() => {
              setError("");
              navigate("/inventory/purchase-orders");
            }}
          ></button>
        </div>
      </div>
    );
  }

  const formatCurrency = (value) =>
    value?.toLocaleString("vi-VN", { minimumFractionDigits: 0 }) + " ₫" || "0 ₫";

  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "—";

  const getQuantitySummary = (items) => {
    if (!items?.length) return "0";
    const unitMap = items.reduce((acc, item) => {
      const unit = item.unitName || "khác";
      acc[unit] = (acc[unit] || 0) + (item.quantity || 0);
      return acc;
    }, {});
    return Object.entries(unitMap)
      .map(([unit, qty]) => `${qty} ${unit}`)
      .join(" + ");
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      Received: { color: "info", text: "Đã nhận hàng" },
      PartiallyReceived: { color: "primary", text: "Nhận một phần" },
      Approved: { color: "success", text: "Đã duyệt" },
      Pending: { color: "warning", text: "Chờ duyệt" },
      Cancelled: { color: "danger", text: "Đã hủy" },
      WaitingForDelivery: { color: "primary", text: "Chờ giao hàng" },
      Rejected: { color: "danger", text: "Đã từ chối" },
      CannotDeliver: { color: "dark", text: "Không thể giao" },
    };

    const info = statusMap[status] || { color: "secondary", text: status || "Không xác định" };

    return (
      <span
        className={`badge bg-${info.color} fs-5 px-4 py-2 rounded-pill shadow fw-semibold`}
        style={{ minWidth: "140px", textAlign: "center" }}
      >
        {info.text}
      </span>
    );
  };

  // Quyết định có hiển thị cột "SL nhận lần này" hay không
  const canReceive = po.status === "WaitingForDelivery" && (canReceivePO || canUpdatePO);

  return (
    <div className="container-fluid py-4 px-3 px-md-5 bg-light min-vh-100">
      <div className="card shadow-xl border-0 rounded-4 overflow-hidden">
        {/* Header */}
        <div
          className="card-header text-white d-flex align-items-center justify-content-between py-4 px-4 px-md-5 shadow"
          style={{
            background: "linear-gradient(135deg, #0d47a1 0%, #1976d2 100%)",
          }}
        >
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-outline-light rounded-pill px-4 py-2 fw-semibold shadow-sm"
              onClick={() => navigate(-1)}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Quay lại
            </button>
            <div>
              <h3 className="mb-0 fw-bold text-shadow">Đơn nhập hàng #{po.id}</h3>
              <small className="opacity-85">Ngày tạo: {formatDate(po.createdAt)}</small>
            </div>
          </div>
          <div>{getStatusBadge(po.status)}</div>
        </div>

        {/* Body */}
        <div className="card-body p-4 p-md-5">
          {/* Summary Cards */}
          <div className="row g-4 mb-5">
            <div className="col-md-3 col-sm-6">
              <div className="card bg-primary text-white shadow border-0 rounded-4 h-100">
                <div className="card-body text-center">
                  <i className="bi bi-receipt-cutoff fs-2 mb-2"></i>
                  <h6 className="mb-1 opacity-90">Tổng giá trị</h6>
                  <h4 className="fw-bold mb-0">{formatCurrency(po.totalAmount)}</h4>
                </div>
              </div>
            </div>

            <div className="col-md-3 col-sm-6">
              <div className="card bg-success text-white shadow border-0 rounded-4 h-100">
                <div className="card-body text-center">
                  <i className="bi bi-box-seam fs-2 mb-2"></i>
                  <h6 className="mb-1 opacity-90">Tổng số lượng</h6>
                  <h5 className="fw-bold mb-0" style={{ whiteSpace: "pre-wrap" }}>
                    {getQuantitySummary(po.items)}
                  </h5>
                </div>
              </div>
            </div>

            <div className="col-md-3 col-sm-6">
              <div
                className="card bg-info text-white shadow border-0 rounded-4 h-100 position-relative overflow-hidden"
                onClick={handleSupplierClick}
                style={{
                  cursor: po?.supplierId ? "pointer" : "default",
                  transition: "all 0.25s ease",
                }}
              >
                {po?.supplierId && (
                  <div
                    className="position-absolute top-0 end-0 p-2 opacity-0 transition-opacity"
                    style={{ transition: "opacity 0.3s ease" }}
                  >
                    <i className="bi bi-arrow-right-circle-fill fs-4"></i>
                  </div>
                )}

                <div className="card-body text-center d-flex flex-column justify-content-center">
                  <i className="bi bi-building fs-1 mb-3"></i>
                  <h6 className="mb-2 opacity-90 fw-semibold">Nhà cung cấp</h6>
                  <h5 className="fw-bold mb-1 text-truncate">
                    {po.supplierName || "—"}
                  </h5>

                  {po?.supplierId ? (
                    <small className="opacity-85 mt-2">
                      <i className="bi bi-info-circle me-1"></i>
                      Nhấn để xem chi tiết
                    </small>
                  ) : (
                    <small className="opacity-75 mt-2 fst-italic">Chưa có nhà cung cấp</small>
                  )}
                </div>
              </div>
            </div>

            <div className="col-md-3 col-sm-6">
              <div className="card bg-dark text-white shadow border-0 rounded-4 h-100">
                <div className="card-body text-center">
                  <i className="bi bi-calendar-event fs-2 mb-2"></i>
                  <h6 className="mb-1 opacity-90">Ngày tạo</h6>
                  <h5 className="fw-bold mb-0">{formatDate(po.createdAt).split(",")[0]}</h5>
                </div>
              </div>
            </div>
          </div>

          {/* Thông tin chi tiết */}
          <div className="row g-4 mb-5">
            {/* Thông tin đơn hàng */}
            <div className="col-lg-6">
              <div className="card shadow-sm border-0 rounded-4 h-100">
                <div className="card-body p-4">
                  <h5 className="fw-bold text-primary mb-4">
                    <i className="bi bi-info-circle-fill me-2"></i>
                    Thông tin đơn hàng
                  </h5>
                  <dl className="row g-3 mb-0">
                    <dt className="col-sm-5 fw-semibold text-muted">Trạng thái:</dt>
                    <dd className="col-sm-7">{getStatusBadge(po.status)}</dd>

                    <dt className="col-sm-5 fw-semibold text-muted">Ngày tạo:</dt>
                    <dd className="col-sm-7">{formatDate(po.createdAt)}</dd>

                    <dt className="col-sm-5 fw-semibold text-muted">Tổng tiền:</dt>
                    <dd className="col-sm-7 fw-bold text-success fs-5">
                      {formatCurrency(po.totalAmount)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            {/* Quy trình xử lý */}
            <div className="col-lg-6">
              <div className="card shadow-sm border-0 rounded-4 h-100">
                <div className="card-body p-4">
                  <h5 className="fw-bold text-primary mb-4">
                    <i className="bi bi-people-fill me-2"></i>
                    Quy trình xử lý
                  </h5>
                  <dl className="row g-3 mb-0">
                    <dt className="col-sm-5 fw-semibold text-muted">Người tạo:</dt>
                    <dd className="col-sm-7">{po.createdByName || "—"}</dd>

                    <dt className="col-sm-5 fw-semibold text-muted">Người xử lý:</dt>
                    <dd className="col-sm-7">
                      {po.processByName || "Chưa xử lý"}
                    </dd>

                    <dt className="col-sm-5 fw-semibold text-muted">Người nhận:</dt>
                    <dd className="col-sm-7">
                      {po.receivedByName || "Chưa nhận hàng"}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            {/* Ghi chú */}
            <div className="col-lg-12">
              <div className="card shadow-sm border-0 rounded-4">
                <div className="card-body p-4">
                  <h5 className="fw-bold text-primary mb-3">
                    <i className="bi bi-journal-text me-2"></i>
                    Ghi chú
                  </h5>
                  <div
                    className="p-3 bg-white border rounded-3"
                    style={{
                      minHeight: "100px",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                      backgroundColor: po.note ? "#f8f9fa" : "transparent",
                    }}
                  >
                    {po.note ? (
                      <p className="mb-0 text-dark fs-5">{po.note}</p>
                    ) : (
                      <p className="mb-0 text-muted fst-italic">
                        Không có ghi chú
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Danh sách sản phẩm */}
          <div className="card shadow-sm border-0 rounded-4 mb-5">
            <div className="card-body p-4 p-md-5">
              <h5 className="fw-bold text-primary mb-4">
                <i className="bi bi-box-seam-fill me-2"></i>
                Chi tiết sản phẩm ({po.items?.length || 0} mặt hàng)
              </h5>

              <div className="table-responsive rounded-3 border shadow-sm">
                <table className="table table-hover table-striped align-middle mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th scope="col" className="ps-4">Mã - Tên sản phẩm</th>
                      <th scope="col" className="text-center">Đơn vị</th>
                      <th scope="col" className="text-center">Đơn giá</th>
                      <th scope="col" className="text-center">SL đặt</th>
                      <th scope="col" className="text-center">Thành tiền</th>
                      <th scope="col" className="text-center">Đã nhận</th>
                      {canReceive && (
                        <th scope="col" className="text-center">SL nhận lần này</th>
                      )}
                      <th scope="col" className="text-center">Giá phải trả</th>
                    </tr>
                  </thead>
                  <tbody>
                    {po.items?.length > 0 ? (
                      po.items.map((item) => {
                        const remaining = (item.quantity || 0) - (item.receivedQuantity || 0);
                        const thisReceive = receiveQuantities[item.id] ?? remaining;

                        return (
                          <tr key={item.id}>
                            <td className="ps-4 fw-medium">
                              <div className="text-truncate" style={{ maxWidth: "220px" }}>
                                {item.productId || "—"}
                              </div>
                              <small className="text-muted text-truncate" style={{ maxWidth: "220px", display: "block" }}>
                                {item.productName || "—"}
                              </small>
                            </td>
                            <td className="text-center">{item.unitName || "—"}</td>
                            <td className="text-center">{formatCurrency(item.costPrice)}</td>
                            <td className="text-center fw-bold text-primary">
                              {item.quantity || 0} {item.unitName || ""}
                            </td>
                            <td className="text-center fw-bold text-success">
                              {formatCurrency((item.quantity || 0) * (item.costPrice || 0))}
                            </td>
                            <td className="text-center fw-bold">
                              {item.receivedQuantity ?? "—"} / {item.quantity || 0}
                            </td>
                            {canReceive && (
                              <td className="text-center">
                                <input
                                  type="number"
                                  className="form-control form-control-sm text-center mx-auto"
                                  style={{ width: "100px" }}
                                  min={0}
                                  max={remaining}
                                  value={thisReceive}
                                  onChange={(e) => handleReceiveQtyChange(item.id, e.target.value)}
                                  disabled={remaining <= 0}
                                />
                              </td>
                            )}
                            <td className="text-center fw-bold text-success">
                              {formatCurrency((item.receivedQuantity || 0) * (item.costPrice || 0))}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={canReceive ? 7 : 6} className="text-center py-5 text-muted fst-italic">
                          Không có sản phẩm trong đơn hàng
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="table-light fw-bold">
                    <tr>
                      <td colSpan={canReceive ? 7 : 6} className="text-end pe-4">Tổng cộng:</td>
                      <td className="text-center text-success fs-5">
                        {formatCurrency(po.totalAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="card-footer bg-light py-4 px-4 px-md-5 border-top">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="text-muted">
              Đơn #{po.id} • Tạo lúc {formatDate(po.createdAt)}
            </div>
            <div className="d-flex gap-3 align-items-center">
              <PurchaseOrderActions
                po={po}
                onReload={fetchDetail}
                canUpdatePO={canUpdatePO}
                canReceivePO={canReceivePO}
              />
              {canReceive && (
                <button
                  className="btn btn-warning rounded-pill px-5 fw-bold"
                  onClick={handleReceiveFromDetail}
                >
                  Nhận hàng
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal chi tiết nhà cung cấp */}
      <SupplierDetailModal
        show={showSupplierModal}
        onHide={() => setShowSupplierModal(false)}
        supplier={supplierDetail}
        loading={supplierLoading}
      />
    </div>
  );
};

export default PurchaseOrderDetail;