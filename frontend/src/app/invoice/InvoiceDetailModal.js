import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseModal from "components/common/BaseModal";
import { invoiceGetDetail } from "services/Invoices/invoice.service";
import { formatCurrency } from "utils/formatters";
import api from "services/axiosInstance";

const getStatusMeta = (status) => {
  switch (status) {
    case "PAID":
      return { text: "Đã thanh toán", className: "bg-success", icon: "bi-check-circle" };
    case "UNPAID":
      return { text: "Chưa thanh toán", className: "bg-warning text-dark", icon: "bi-hourglass-split" };
    case "CANCELLED":
      return { text: "Đã hủy", className: "bg-secondary", icon: "bi-x-circle" };
    default:
      return { text: status || "-", className: "bg-light text-dark", icon: "bi-info-circle" };
  }
};

export default function InvoiceDetailModal({ invoiceId, onClose }) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [inv, setInv] = useState(null);

  // ===== RETURN STATE =====
  const [showReturnSection, setShowReturnSection] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [returnError, setReturnError] = useState("");
  const [returnQtyMap, setReturnQtyMap] = useState({});

  useEffect(() => {
    if (!invoiceId) return;

    const fetchDetail = async () => {
      setLoading(true);
      setErrMsg("");
      setInv(null);

      try {
        const res = await invoiceGetDetail(invoiceId);
        setInv(res?.data || null);
      } catch (err) {
        setErrMsg(err?.response?.data?.message || "Không tải được chi tiết hóa đơn.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [invoiceId]);

  // Init return quantity map
  useEffect(() => {
    if (!inv?.items) return;

    const map = {};
    inv.items.forEach((it) => {
      map[it.id] = 0;
    });
    setReturnQtyMap(map);
  }, [inv]);

  const totalRefund = (inv?.items || []).reduce((sum, it) => {
    const qty = Number(returnQtyMap[it.id] || 0);
    return sum + qty * Number(it.unitPrice || 0);
  }, 0);

  const handleGoSales = () => {
    onClose?.();
    navigate(`/sales?invoiceId=${invoiceId}`);
  };

  const handleCreateReturn = async () => {
    setReturnError("");

    const items = (inv?.items || [])
      .map((it) => {
        const qty = Number(returnQtyMap[it.id] || 0);
        if (qty <= 0) return null;
        return {
          invoiceItemId: it.id,
          productId: it.productId,
          quantity: qty,
          unitPrice: it.unitPrice,
        };
      })
      .filter(Boolean);

    if (!items.length) {
      setReturnError("Vui lòng chọn ít nhất 1 sản phẩm để hoàn.");
      return;
    }

    if (!returnReason.trim()) {
      setReturnError("Vui lòng nhập lý do hoàn.");
      return;
    }

    setReturnSubmitting(true);

    try {
      await api.post("/returns", {
        invoiceId: inv.id,
        reason: returnReason.trim(),
        items,
      });

      setShowReturnSection(false);
      setReturnReason("");
    } catch (err) {
      setReturnError(err?.response?.data?.message || "Tạo đơn hoàn thất bại.");
    } finally {
      setReturnSubmitting(false);
    }
  };

  const meta = getStatusMeta(inv?.status);

  return (
    <BaseModal onClose={onClose} maxWidth="920px">
      <div className="invoice-modal">

        {/* HEADER */}
        <div className="invoice-header">

          <div>
            <h5 className="mb-1 fw-bold">Chi tiết hóa đơn</h5>

            {inv && (
              <div className="invoice-meta">

                <span className="invoice-code">{inv.invoiceCode}</span>

                {inv.createdAt && (
                  <span className="invoice-time">
                    {new Date(inv.createdAt).toLocaleString()}
                  </span>
                )}

              </div>
            )}
          </div>

          {inv?.status && (
            <span className={`badge status-badge ${meta.className}`}>
              <i className={`bi ${meta.icon} me-1`} />
              {meta.text}
            </span>
          )}

        </div>

        {/* BODY */}

        <div className="invoice-body">

          {loading && (
            <div className="loading-box">
              <div className="spinner-border text-primary" />
            </div>
          )}

          {!loading && errMsg && (
            <div className="alert alert-danger">{errMsg}</div>
          )}

          {!loading && inv && (
            <>
              {/* PRODUCT TABLE */}

              <div className="invoice-table">

                <table className="table align-middle mb-0">

                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th className="text-end">Đơn giá</th>
                      <th className="text-center">SL</th>
                      <th className="text-end">Thành tiền</th>
                    </tr>
                  </thead>

                  <tbody>

                    {inv.items.map((it) => (
                      <tr key={it.id}>

                        <td className="fw-semibold">{it.name}</td>

                        <td className="text-end">
                          {formatCurrency(it.unitPrice)}
                        </td>

                        <td className="text-center">
                          <span className="qty-badge">
                            {it.quantity}
                          </span>
                        </td>

                        <td className="text-end fw-semibold">
                          {formatCurrency(it.lineTotal)}
                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>

              {/* TOTAL */}

              <div className="invoice-total">

                <span>Tổng thanh toán</span>

                <strong>{formatCurrency(inv.finalAmount)}</strong>

              </div>

              {/* RETURN SECTION */}

              {showReturnSection && inv.status === "PAID" && (

                <div className="return-section">

                  <h6 className="return-title">
                    <i className="bi bi-arrow-counterclockwise me-2" />
                    Tạo đơn hoàn
                  </h6>

                  {returnError && (
                    <div className="alert alert-danger">{returnError}</div>
                  )}

                  <div className="invoice-table">

                    <table className="table align-middle mb-0">

                      <thead>
                        <tr>
                          <th>Sản phẩm</th>
                          <th className="text-end">Đơn giá</th>
                          <th className="text-center">SL hoàn</th>
                          <th className="text-end">Tiền hoàn</th>
                        </tr>
                      </thead>

                      <tbody>

                        {inv.items.map((it) => {

                          const max = it.quantity;
                          const qty = returnQtyMap[it.id] || 0;
                          const refund = qty * it.unitPrice;

                          return (
                            <tr key={it.id}>

                              <td>{it.name}</td>

                              <td className="text-end">
                                {formatCurrency(it.unitPrice)}
                              </td>

                              <td className="text-center">

                                <input
                                  type="number"
                                  min={0}
                                  max={max}
                                  value={qty}
                                  className="form-control return-input"
                                  onChange={(e) =>
                                    setReturnQtyMap((prev) => ({
                                      ...prev,
                                      [it.id]: Math.max(
                                        0,
                                        Math.min(max, Number(e.target.value))
                                      ),
                                    }))
                                  }
                                />

                              </td>

                              <td className="text-end text-danger fw-semibold">
                                {formatCurrency(refund)}
                              </td>

                            </tr>
                          );
                        })}

                      </tbody>

                    </table>

                  </div>

                  <div className="mt-3">

                    <label className="form-label fw-semibold">
                      Lý do hoàn
                    </label>

                    <textarea
                      className="form-control"
                      rows={3}
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                    />

                  </div>

                  <div className="refund-total">

                    Tổng tiền hoàn: {formatCurrency(totalRefund)}

                  </div>

                  <div className="text-end">

                    <button
                      className="btn btn-danger"
                      disabled={returnSubmitting}
                      onClick={handleCreateReturn}
                    >
                      {returnSubmitting
                        ? "Đang tạo..."
                        : "Xác nhận tạo đơn hoàn"}
                    </button>

                  </div>

                </div>
              )}

            </>
          )}

        </div>

        {/* FOOTER */}

        <div className="invoice-footer">

          {inv?.status === "PAID" && (
            <button
              className="btn btn-outline-danger"
              onClick={() => setShowReturnSection((prev) => !prev)}
            >
              <i className="bi bi-arrow-counterclockwise me-1" />
              {showReturnSection ? "Hủy tạo hoàn" : "Tạo đơn hoàn"}
            </button>
          )}

          {inv?.status === "UNPAID" && (
            <button className="btn btn-primary" onClick={handleGoSales}>
              <i className="bi bi-cash-coin me-1" />
              Tiếp tục thanh toán
            </button>
          )}

          <button className="btn btn-outline-secondary" onClick={onClose}>
            Đóng
          </button>

        </div>

        <style>{`

.invoice-modal{
 background:white;
 border-radius:14px;
 overflow:hidden;
 box-shadow:0 10px 30px rgba(0,0,0,0.08);
}

.invoice-header{
 padding:18px 22px;
 border-bottom:1px solid #eee;
 display:flex;
 justify-content:space-between;
 align-items:flex-start;
 background:#fafafa;
}

.invoice-meta{
 font-size:13px;
 color:#777;
 display:flex;
 gap:10px;
}

.invoice-code{
 font-weight:600;
}

.status-badge{
 font-size:13px;
 padding:6px 10px;
}

.invoice-body{
 padding:22px;
}

.invoice-table{
 border:1px solid #eee;
 border-radius:10px;
 overflow:hidden;
 margin-bottom:18px;
}

.invoice-table thead{
 background:#f8f9fa;
 font-size:14px;
}

.qty-badge{
 background:#f1f3f5;
 padding:3px 8px;
 border-radius:6px;
 font-weight:600;
}

.invoice-total{
 display:flex;
 justify-content:flex-end;
 gap:20px;
 font-size:16px;
 font-weight:600;
 margin-bottom:12px;
}

.return-section{
 border-top:1px solid #eee;
 margin-top:20px;
 padding-top:18px;
}

.return-title{
 color:#dc3545;
 font-weight:600;
 margin-bottom:12px;
}

.return-input{
 width:80px;
 text-align:center;
}

.refund-total{
 text-align:right;
 font-weight:700;
 color:#dc3545;
 margin:12px 0;
}

.invoice-footer{
 padding:16px 22px;
 border-top:1px solid #eee;
 display:flex;
 justify-content:flex-end;
 gap:10px;
}

.loading-box{
 text-align:center;
 padding:40px;
}

`}</style>

      </div>
    </BaseModal>
  );
}