import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseModal from "components/common/BaseModal";
import { invoiceGetDetail } from "services/Invoices/invoice.service";
import { formatCurrency } from "utils/formatters";
import api from "services/axiosInstance";

const STATUS_THEME = {
  PAID: { text: "Đã thanh toán", bg: "#ecfdf5", color: "#059669", border: "#10b98133", icon: "bi-check-circle-fill" },
  UNPAID: { text: "Chờ thanh toán", bg: "#fffbeb", color: "#d97706", border: "#f59e0b33", icon: "bi-hourglass-split" },
  CANCELLED: { text: "Đã hủy", bg: "#fef2f2", color: "#dc2626", border: "#ef444433", icon: "bi-x-circle-fill" },
  DEFAULT: { text: "N/A", bg: "#f9fafb", color: "#6b7280", border: "#e5e7eb", icon: "bi-info-circle" }
};

export default function InvoiceDetailModal({ invoiceId, onClose }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [inv, setInv] = useState(null);
  const [showReturnSection, setShowReturnSection] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [returnError, setReturnError] = useState("");
  const [returnQtyMap, setReturnQtyMap] = useState({});

  useEffect(() => {
    if (!invoiceId) return;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await invoiceGetDetail(invoiceId);
        console.log(res);
        
        setInv(res?.data || null);
      } catch (err) {
        setErrMsg("Không thể tải thông tin hóa đơn.");
      } finally { setLoading(false); }
    };
    fetchDetail();
  }, [invoiceId]);

  useEffect(() => {
    if (inv?.items) {
      const map = {};
      inv.items.forEach(it => map[it.id] = 0);
      setReturnQtyMap(map);
    }
  }, [inv]);

  const totalRefund = (inv?.items || []).reduce((sum, it) => {
    return sum + (Number(returnQtyMap[it.id] || 0) * Number(it.unitPrice || 0));
  }, 0);

  const handleCreateReturn = async () => {
    const items = (inv?.items || []).map(it => {
      const qty = Number(returnQtyMap[it.id] || 0);
      return qty > 0 ? { invoiceItemId: it.id, productId: it.productId, quantity: qty, unitPrice: it.unitPrice } : null;
    }).filter(Boolean);

    if (!items.length || !returnReason.trim()) {
      setReturnError("Vui lòng chọn sản phẩm và nhập lý do.");
      return;
    }

    setReturnSubmitting(true);
    try {
      await api.post("/returns", { invoiceId: inv.id, reason: returnReason.trim(), items });
      setShowReturnSection(false);
      onClose?.(); // Thường sau khi hoàn sẽ đóng modal hoặc refresh
    } catch (err) {
      setReturnError(err?.response?.data?.message || "Lỗi tạo đơn hoàn.");
    } finally { setReturnSubmitting(false); }
  };

  const meta = STATUS_THEME[inv?.status] || STATUS_THEME.DEFAULT;

  return (
    <BaseModal onClose={onClose} maxWidth="850px">
      <div className="modern-invoice-modal">
        {/* HEADER */}
        <div className="modal-header-custom">
          <div className="d-flex align-items-center gap-3">
            <div className="icon-box"><i className="bi bi-receipt"></i></div>
            <div>
              <h4 className="fw-bold m-0">Chi tiết hóa đơn</h4>
              <p className="text-muted small m-0">Mã: <span className="text-dark fw-medium">{inv?.invoiceCode}</span> • {inv?.createdAt && new Date(inv.createdAt.replace('Z', '')).toLocaleString('vi-VN')}</p>
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
                    <p className="fw-bold">{inv.customerName || "Khách lẻ"}</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="info-item-card">
                    <label>Nhân viên bán hàng</label>
                    <p>{inv.staffName || "Hệ thống"}</p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="info-item-card">
                    <label>Kênh bán</label>
                    <p>{inv.counterName || "Trực tiếp"}</p>
                  </div>
                </div>
              </div>

              {/* PRODUCT TABLE */}
              <div className="table-container-custom">
                <table className="table table-borderless align-middle mb-0">
                  <thead>
                    <tr>
                      <th className="ps-0">SẢN PHẨM</th>
                      <th className="text-center">SL</th>
                      <th className="text-end">ĐƠN GIÁ</th>
                      <th className="text-center">ĐƠN VỊ</th>
                      <th className="text-end pe-0">THÀNH TIỀN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inv.items.map((it) => (
                      <tr key={it.id}>
                        <td className="ps-0 py-3">
                          <div className="fw-bold text-dark">{it.name}</div>
                          <div className="text-muted small">Mã: {it.productCode || 'SKU-N/A'}</div>
                        </td>
                        <td className="text-center"><span className="qty-circle">{it.quantity}</span></td>
                        <td className="text-end text-muted">{formatCurrency(it.unitPrice)}</td>
                        <td className="text-center">{it.unitName}</td>
                        <td className="text-end fw-bold pe-0">{formatCurrency(it.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="summary-section">
                <div className="summary-row total">
                  <span>Tổng tiền thanh toán</span>
                  <span>{formatCurrency(inv.finalAmount)}</span>
                </div>
              </div>

              {/* RETURN SECTION - UPGRADED UI */}
              {showReturnSection && inv.status === "PAID" && (
                <div className="return-card-modern mt-4">
                  <div className="return-header">
                    <h6 className="m-0 fw-bold text-danger"><i className="bi bi-arrow-counterclockwise"></i> Thiết lập hoàn trả</h6>
                  </div>
                  <div className="p-3">
                    {returnError && <div className="alert alert-danger py-2 small">{returnError}</div>}
                    <div className="table-responsive">
                      <table className="table table-sm align-middle">
                        <thead>
                          <tr className="small text-muted">
                            <th>Sản phẩm</th>
                            <th className="text-center">Mua</th>
                            <th className="text-center" style={{width: '120px'}}>SL Hoàn</th>
                            <th className="text-center">Đơn vị</th>
                            <th className="text-end">Tiền hoàn</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inv.items.map((it) => (
                            <tr key={`ret-${it.id}`}>
                              <td className="small">{it.name}</td>
                              <td className="text-center small">{it.quantity}</td>
                              <td className="text-center">{it.unitName}</td>
                              <td className="text-center">
                                <input 
                                  type="number" className="form-control form-control-sm text-center border-danger"
                                  min={0} max={it.quantity} value={returnQtyMap[it.id] || 0}
                                  onChange={(e) => setReturnQtyMap(prev => ({ ...prev, [it.id]: Math.min(it.quantity, Math.max(0, Number(e.target.value))) }))}
                                />
                              </td>
                              <td className="text-end small fw-bold text-danger">{formatCurrency((returnQtyMap[it.id] || 0) * it.unitPrice)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-3">
                      <textarea 
                        placeholder="Nhập lý do hoàn trả hàng..." className="form-control border-0 bg-light" 
                        rows={2} value={returnReason} onChange={(e) => setReturnReason(e.target.value)}
                      />
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                      <div className="text-danger fw-bold">Tổng hoàn: {formatCurrency(totalRefund)}</div>
                      <button className="btn btn-danger btn-sm px-4" disabled={returnSubmitting} onClick={handleCreateReturn}>
                        {returnSubmitting ? "Đang xử lý..." : "Xác nhận hoàn"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="alert alert-warning">{errMsg}</div>
          )}
        </div>

        {/* FOOTER */}
        <div className="modal-footer-custom">
          <div className="d-flex gap-2">
            {inv?.status === "PAID" && (
              <button className={`btn ${showReturnSection ? 'btn-light border' : 'btn-outline-danger'}`} onClick={() => setShowReturnSection(!showReturnSection)}>
                {showReturnSection ? "Đóng Tab Hoàn" : "Tạo đơn hoàn"}
              </button>
            )}
            {inv?.status === "UNPAID" && (
              <button className="btn btn-primary px-4" onClick={() => { onClose(); navigate(`/sales?invoiceId=${invoiceId}`); }}>
                Tiếp tục thanh toán
              </button>
            )}
            <button className="btn btn-dark px-4" onClick={onClose}>Đóng</button>
          </div>
        </div>

        <style>{`
          .modern-invoice-modal { font-family: 'Inter', sans-serif; background: #fff; border-radius: 16px; overflow: hidden; }
          .modal-header-custom { padding: 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; background: #fff; }
          .icon-box { width: 48px; height: 48px; background: #f1f5f9; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #6366f1; font-size: 20px; }
          
          .soft-badge { padding: 6px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; border: 1px solid; display: inline-flex; align-items: center; }
          
          .modal-body-custom { padding: 24px; max-height: 75vh; overflow-y: auto; }
          
          .info-item-card { background: #f8fafc; padding: 12px 16px; border-radius: 12px; border: 1px solid #f1f5f9; }
          .info-item-card label { display: block; font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 700; margin-bottom: 4px; }
          .info-item-card p { margin: 0; color: #1e293b; font-size: 14px; }

          .table-container-custom { margin-top: 10px; }
          .table-container-custom thead th { font-size: 11px; color: #94a3b8; letter-spacing: 0.05em; border: none; }
          .qty-circle { background: #f1f5f9; color: #475569; width: 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 12px; font-weight: 600; }

          .summary-section { border-top: 2px solid #f1f5f9; margin-top: 16px; padding-top: 16px; }
          .summary-row { display: flex; justify-content: flex-end; gap: 40px; align-items: center; }
          .summary-row.total { font-size: 18px; font-weight: 800; color: #1e293b; }

          .return-card-modern { border: 1px solid #fee2e2; border-radius: 12px; overflow: hidden; background: #fff; box-shadow: 0 4px 12px rgba(220, 53, 69, 0.08); }
          .return-header { background: #fef2f2; padding: 12px 16px; border-bottom: 1px solid #fee2e2; }
          
          .modal-footer-custom { padding: 16px 24px; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; background: #f8fafc; }
          
          /* Custom scrollbar */
          .modal-body-custom::-webkit-scrollbar { width: 6px; }
          .modal-body-custom::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        `}</style>
      </div>
    </BaseModal>
  );
}