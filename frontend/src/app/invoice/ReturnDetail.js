import React, { useState, useEffect, useCallback } from "react";
import ProductCard from "components/pos/Product/ProductCard";
import { formatCurrency } from "utils/formatters";
import { approveReturn, getReturnDetail, rejectReturn } from "services/Return/return.service";
import { useNotification } from "components/global/Notification/NotificationContext";

const RETURN_STATUS_THEME = {
  Pending: { text: "Đang chờ duyệt", bg: "#fffbeb", color: "#d97706", icon: "bi-clock-history" },
  Approve: { text: "Đã duyệt", bg: "#ecfdf5", color: "#059669", icon: "bi-check-circle-fill" },
  Reject: { text: "Đã từ chối", bg: "#fef2f2", color: "#dc2626", icon: "bi-x-circle-fill" },
};

export default function ReturnDetail({ returnId, roleName, onActionSuccess }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmType, setConfirmType] = useState(null); // 'APPROVE' | 'REJECT' | null
  
  const { showNotification } = useNotification();
  const isManager = roleName === "Manager";

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getReturnDetail(returnId);
      setData(res.data);
    } catch (err) {
      showNotification("Không thể tải chi tiết đơn hoàn trả.", "error");
    } finally {
      setLoading(false);
    }
  }, [returnId, showNotification]);

  useEffect(() => {
    if (returnId) fetchDetail();
  }, [fetchDetail]);

  const handleAction = async (actionType) => {
    const isApprove = actionType === "APPROVE";
    const actionFn = isApprove ? approveReturn : rejectReturn;
    const successMsg = isApprove ? "Đã duyệt đơn hoàn trả thành công" : "Đã từ chối đơn hoàn trả";

    try {
      setSubmitting(true);
      await actionFn(returnId);
      showNotification(successMsg, isApprove ? "success" : "warning");
      onActionSuccess();
    } catch (err) {
      showNotification(err.response?.data?.message || "Thao tác thất bại.", "error");
    } finally {
      setSubmitting(false);
      setConfirmType(null);
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border spinner-border-sm me-2"></div> Đang tải...</div>;
  if (!data) return <div className="text-center py-5">Không tìm thấy dữ liệu.</div>;

  const statusMeta = RETURN_STATUS_THEME[data.status] || { text: data.status, bg: "#f8f9fa", color: "#333" };

  return (
    <div className="return-detail-wrapper">
      {/* Header Info (Giữ nguyên cấu trúc cũ của bạn) */}
      <div className="row g-3 mb-4 p-3 bg-light rounded-4 mx-0 border align-items-center">
        <div className="col-md-5 border-end">
          <label className="text-muted small d-block mb-1">Khách hàng</label>
          <span className="fw-bold">{data.customerName || "Khách lẻ"}</span>
          <div className="small text-muted">{data.phone || "N/A"}</div>
        </div>
        <div className="col-md-4 border-end ps-md-4">
          <label className="text-muted small d-block mb-1">Hóa đơn gốc</label>
          <span className="text-primary fw-bold">#{data.invoiceCode}</span>
          <div className="small text-muted">{new Date(data.createdAt).toLocaleDateString('vi-VN')}</div>
        </div>
        <div className="col-md-3 text-center">
          <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: statusMeta.bg, color: statusMeta.color }}>
            {statusMeta.text}
          </span>
        </div>
      </div>

      <h6 className="fw-bold mb-3"><i className="bi bi-box-seam me-2"></i>Sản phẩm hoàn trả</h6>
      <div className="d-flex flex-wrap gap-3 mb-4 overflow-auto p-1" style={{ maxHeight: "350px" }}>
        {data.returnItems?.map((item) => (
          <div key={item.id} className="border rounded-4 p-2 bg-white shadow-sm" style={{ width: "165px" }}>
            <ProductCard product={{ ...item, units: [{ unitName: item.unitName, factor: 1 }] }} showStock={false} showUnits={false} selectable={false} showPrice={false} />
            <div className="mt-2 text-center border-top pt-2">
              <div className="small text-muted">SL hoàn: <b className="text-danger">{item.quantity}</b></div>
              <div className="fw-bold text-dark small">{formatCurrency(item.refundAmount)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER NÂNG CẤP VỚI CONFIRMATION STATE */}
      <div className="footer-action-bar bg-primary p-3 rounded-4 d-flex justify-content-between align-items-center shadow-lg">
        <div className="price-info">
          <div className="text-white-50 small">Tổng tiền hoàn thực trả</div>
          <h4 className="fw-bold text-warning mb-0">{formatCurrency(data.totalRefundAmount)}</h4>
        </div>

        <div className="btn-group-custom">
          {data.status === 'Pending' ? (
            !isManager ? (
              <div className="text-white-50 small fst-italic border-start ps-3 border-secondary">Chờ Manager phê duyệt.</div>
            ) : !confirmType ? (
              /* TRẠNG THÁI 1: CHƯA NHẤN NÚT */
              <div className="d-flex gap-2">
                <button className="btn btn-outline-light rounded-pill px-4 border-0" onClick={() => setConfirmType("REJECT")}>Từ chối</button>
                <button className="btn btn-success rounded-pill px-4 shadow-sm fw-bold" onClick={() => setConfirmType("APPROVE")}>Duyệt hoàn tiền</button>
              </div>
            ) : (
              /* TRẠNG THÁI 2: ĐANG XÁC NHẬN (CONFIRMING) */
              <div className="confirm-zone d-flex align-items-center gap-3 animate__animated animate__fadeIn">
                <span className="text-white small fw-medium">
                  {confirmType === "APPROVE" ? "Xác nhận duyệt & hoàn tiền?" : "Xác nhận từ chối đơn này?"}
                </span>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-light rounded-pill px-3" onClick={() => setConfirmType(null)} disabled={submitting}>Hủy</button>
                  <button 
                    className={`btn btn-sm rounded-pill px-3 fw-bold ${confirmType === "APPROVE" ? "btn-success" : "btn-danger"}`} 
                    onClick={() => handleAction(confirmType)}
                    disabled={submitting}
                  >
                    {submitting ? <span className="spinner-border spinner-border-sm"></span> : "Đồng ý"}
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="text-white-50 small">Đã xử lý bởi {data.approveBy || "Quản trị viên"}</div>
          )}
        </div>
      </div>
    </div>
  );
}