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
      <div className="card shadow border-0 overflow-hidden">

        {/* HEADER */}
        <div className="card-header bg-light d-flex justify-content-between align-items-start">
          <div>
            <h5 className="mb-1">Chi tiết hóa đơn</h5>
            {inv && (
              <div className="small text-muted">
                <strong>{inv.invoiceCode}</strong>
                {inv.createdAt && (
                  <> • {new Date(inv.createdAt).toLocaleString()}</>
                )}
              </div>
            )}
          </div>

          {inv?.status && (
            <span className={`badge ${meta.className}`}>
              <i className={`bi ${meta.icon} me-1`} />
              {meta.text}
            </span>
          )}
        </div>

        {/* BODY */}
        <div className="card-body">

          {loading && <div>Đang tải...</div>}

          {!loading && errMsg && (
            <div className="alert alert-danger">{errMsg}</div>
          )}

          {!loading && inv && (
            <>
              {/* ITEMS */}
              <div className="table-responsive border rounded mb-3">
                <table className="table table-sm mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Tên</th>
                      <th className="text-end">Đơn giá</th>
                      <th className="text-center">SL</th>
                      <th className="text-end">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inv.items.map((it) => (
                      <tr key={it.id}>
                        <td>{it.name}</td>
                        <td className="text-end">{formatCurrency(it.unitPrice)}</td>
                        <td className="text-center">{it.quantity}</td>
                        <td className="text-end">
                          {formatCurrency(it.lineTotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="text-end fw-bold mb-3">
                Tổng thanh toán: {formatCurrency(inv.finalAmount)}
              </div>

              {/* RETURN SECTION */}
              {showReturnSection && inv.status === "PAID" && (
                <div className="border-top pt-3 mt-3">

                  <h6 className="text-danger mb-3">
                    <i className="bi bi-arrow-counterclockwise me-2" />
                    Tạo đơn hoàn
                  </h6>

                  {returnError && (
                    <div className="alert alert-danger">{returnError}</div>
                  )}

                  <div className="table-responsive border rounded mb-3">
                    <table className="table table-sm mb-0 align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Tên</th>
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
                              <td className="text-center" style={{ width: 100 }}>
                                <input
                                  type="number"
                                  min={0}
                                  max={max}
                                  className="form-control form-control-sm text-center"
                                  value={qty}
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
                              <td className="text-end text-danger">
                                {formatCurrency(refund)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Lý do hoàn</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                    />
                  </div>

                  <div className="text-end mb-3">
                    <strong className="text-danger">
                      Tổng tiền hoàn: {formatCurrency(totalRefund)}
                    </strong>
                  </div>

                  <div className="text-end">
                    <button
                      className="btn btn-danger"
                      disabled={returnSubmitting}
                      onClick={handleCreateReturn}
                    >
                      {returnSubmitting ? "Đang tạo..." : "Xác nhận tạo đơn hoàn"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* FOOTER */}
        <div className="card-footer bg-white d-flex justify-content-end gap-2">

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
      </div>
    </BaseModal>
  );
}