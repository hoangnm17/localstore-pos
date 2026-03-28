import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseModal from "components/common/BaseModal";
import { invoiceGetDetail } from "services/Invoices/invoice.service";
import { formatCurrency } from "utils/formatters";
import ReturnCreateModal from "./ReturnCreateModal";
import 'style/Return/Return.css'
import { useNotification } from "components/global/Notification/NotificationContext";

const STATUS_THEME = {
  PAID: { text: "Đã thanh toán", bg: "#ecfdf5", color: "#059669", border: "#10b98133", icon: "bi-check-circle-fill" },
  UNPAID: { text: "Chờ thanh toán", bg: "#fffbeb", color: "#d97706", border: "#f59e0b33", icon: "bi-hourglass-split" },
  CANCELLED: { text: "Đã hủy", bg: "#fef2f2", color: "#dc2626", border: "#ef444433", icon: "bi-x-circle-fill" },
  DEFAULT: { text: "N/A", bg: "#f9fafb", color: "#6b7280", border: "#e5e7eb", icon: "bi-info-circle" }
};

const RETURN_STATUS_THEME = {
  APPROVE: { text: "Thành công", bg: "#ecfdf5", color: "#059669", icon: "bi-check-circle" },
  REJECT: { text: "Đã từ chối", bg: "#fef2f2", color: "#dc2626", icon: "bi-x-circle" },
  PENDING: { text: "Chờ duyệt", bg: "#fffbeb", color: "#d97706", icon: "bi-clock-history" },
  DEFAULT: { text: "N/A", bg: "#f9fafb", color: "#6b7280", icon: "bi-info-circle" }
};

export default function InvoiceDetailModal({ invoiceId, onClose, onRefresh }) {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [inv, setInv] = useState(null);
  const [showReturnModal, setShowReturnModal] = useState(false);

  const canReturn = inv?.status === "PAID" && inv?.items?.some(item => item.remainingQuantity > 0);

  useEffect(() => {
    if (!invoiceId) return;

    let isMounted = true;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await invoiceGetDetail(invoiceId);
        if (isMounted) {
          if (res?.success) {
            setInv(res.data);
          } else {
            const errorText = res?.message || "Không thể tải thông tin hóa đơn.";
            setErrMsg(errorText);
            showNotification(errorText, "error");
          }
        }
      } catch (err) {
        if (isMounted) {
          setErrMsg("Lỗi kết nối máy chủ.");
          showNotification("Đã có lỗi xảy ra khi tải chi tiết hóa đơn", "error");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetail();
    return () => { isMounted = false; };
  }, [invoiceId, showNotification]);

  const meta = STATUS_THEME[inv?.status] || STATUS_THEME.DEFAULT;

  const handleGoToPayment = () => {
    showNotification("Đang chuyển đến trang thanh toán...", "info");
    onClose();
    navigate(`/sales?invoiceId=${invoiceId}`);
  };

  return (
    <BaseModal onClose={onClose} maxWidth="850px">
      <div className="modern-invoice-modal">
        {/* HEADER */}
        <div className="modal-header-custom">
          <div className="d-flex align-items-center gap-3">
            <div className="icon-box"><i className="bi bi-receipt"></i></div>
            <div>
              <h4 className="fw-bold m-0">Chi tiết hóa đơn</h4>
              <p className="text-muted small m-0">
                Mã: <span className="text-dark fw-medium">{inv?.invoiceCode}</span> • {inv?.createdAt && new Date(inv.createdAt).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
          <span className="soft-badge" style={{ backgroundColor: meta.bg, color: meta.color, borderColor: meta.border }}>
            <i className={`bi ${meta.icon} me-1`}></i> {meta.text}
          </span>
        </div>

        <div className="modal-body-custom">
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
          ) : inv ? (
            <>
              {/* INFO CARDS */}
              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <div className="info-item-card">
                    <label>Khách hàng</label>
                    <p className="fw-bold m-0">{inv.customerName || "Khách lẻ"}</p>
                    <small className="text-muted">{inv.customerPhone || "N/A"}</small>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="info-item-card">
                    <label>Nhân viên</label>
                    <p className="m-0">{inv.staffName || "Hệ thống"}</p>
                  </div>
                </div>
              </div>

              {/* PRODUCT TABLE */}
              <div className="table-container-custom mb-4">
                <table className="table table-borderless align-middle mb-0">
                  <thead>
                    <tr className="border-bottom">
                      <th className="ps-0">SẢN PHẨM</th>
                      <th className="text-center">SL MUA</th>
                      <th className="text-end">ĐƠN GIÁ</th>
                      <th className="text-end pe-0">THÀNH TIỀN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inv.items?.map((it) => (
                      <tr key={it.id} className="border-bottom-f1f5f9">
                        <td className="ps-0 py-3">
                          <div className="fw-bold text-dark">{it.productName}</div>
                          <div className="text-muted small">Mã: {it.code} • Đơn vị: {it.unitName}</div>
                        </td>
                        <td className="text-center">
                          <span className="qty-circle">{it.quantity}</span>
                          {it.returnedQuantity > 0 && (
                            <div className="text-danger small mt-1 fw-medium">-{it.returnedQuantity} đã trả</div>
                          )}
                        </td>
                        <td className="text-end text-muted">
                          {it.discountedUnitPrice < it.unitPrice ? (
                            <>
                              <del className="small d-block opacity-50">{formatCurrency(it.unitPrice)}</del>
                              <span className="text-dark">{formatCurrency(it.discountedUnitPrice)}</span>
                            </>
                          ) : formatCurrency(it.unitPrice)}
                        </td>
                        <td className="text-end fw-bold pe-0">{formatCurrency(it.discountedLineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* RETURN HISTORY SECTION */}
              {inv.returns && inv.returns.length > 0 && (
                <div className="return-history-section mb-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <div className="return-icon-sm"><i className="bi bi-arrow-counterclockwise"></i></div>
                    <h6 className="fw-bold text-danger m-0">Lịch sử hoàn trả hàng</h6>
                  </div>
                  <div className="table-responsive border border-danger-subtle rounded-3 overflow-hidden">
                    <table className="table table-sm table-hover align-middle mb-0 bg-white">
                      <thead className="bg-danger-subtle">
                        <tr className="small text-danger text-uppercase" style={{ fontSize: '11px' }}>
                          <th className="ps-3 py-2">Thời gian</th>
                          <th className="py-2">Sản phẩm</th>
                          <th className="text-center py-2">Trạng thái</th>
                          <th className="text-end pe-3 py-2">Tổng hoàn</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inv.returns.map((ret) => {
                          const statusMeta = RETURN_STATUS_THEME[ret.status] || RETURN_STATUS_THEME.DEFAULT;
                          return (
                            <tr key={ret.id} className="small border-bottom">
                              <td className="ps-3 py-2 text-muted">
                                {new Date(ret.createdAt).toLocaleString('vi-VN')}
                              </td>
                              <td className="py-2 fw-medium">
                                {ret.items?.map(item => item.productName).join(", ")}
                              </td>
                              <td className="text-center py-2">
                                <span className="badge" style={{ backgroundColor: statusMeta.bg, color: statusMeta.color }}>
                                  {statusMeta.text}
                                </span>
                              </td>
                              <td className="text-end pe-3 py-2 fw-bold text-danger">
                                -{formatCurrency(Math.round(ret.totalRefundAmount))}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SUMMARY SECTION */}
              <div className="summary-section">
                <div className="row justify-content-end">
                  <div className="col-md-5">
                    <div className="summary-card p-3 rounded-3 bg-light border">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted small">Tạm tính:</span>
                        <span className="fw-bold">{formatCurrency(inv.totalAmount)}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted small">Chiết khấu:</span>
                        <span className="text-danger">-{formatCurrency(inv.totalDiscount)}</span>
                      </div>
                      {inv.totalRefund > 0 && (
                        <div className="d-flex justify-content-between mb-2 pb-2 border-bottom">
                          <span className="text-danger small">Đã hoàn trả:</span>
                          <span className="text-danger">-{formatCurrency(inv.totalRefund)}</span>
                        </div>
                      )}
                      <div className="d-flex justify-content-between align-items-center mt-2">
                        <span className="fw-bold h6 m-0">Tổng cộng:</span>
                        <span className="text-primary fw-bold h5 m-0">{formatCurrency(inv.finalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="alert alert-warning border-0">{errMsg}</div>
          )}
        </div>

        {/* FOOTER */}
        <div className="modal-footer-custom bg-light p-3 border-top d-flex justify-content-end gap-2">
          {canReturn && (
            <button className="btn btn-outline-danger shadow-sm px-3" onClick={() => setShowReturnModal(true)}>
              <i className="bi bi-arrow-counterclockwise me-1"></i> Tạo đơn hoàn trả
            </button>
          )}
          {inv?.status === "UNPAID" && (
            <button className="btn btn-primary px-4 shadow-sm" onClick={handleGoToPayment}>
              Thanh toán ngay
            </button>
          )}
          <button className="btn btn-dark px-4" onClick={onClose}>Đóng</button>
        </div>

        {/* RETURN CREATE MODAL */}
        {showReturnModal && inv && (
          <ReturnCreateModal
            invoice={inv}
            onClose={() => setShowReturnModal(false)}
            onCreated={() => {
              setShowReturnModal(false);
              onRefresh?.();
            }}
          />
        )}
      </div>
    </BaseModal>
  );
}