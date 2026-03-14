import { useMemo, useState } from "react";
import BaseModal from "components/common/BaseModal";
import { formatCurrency } from "utils/formatters";

export default function ReturnCreateModal({ invoice, onClose, onCreated }) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const [qtyMap, setQtyMap] = useState(() => {
    const m = {};
    (invoice?.items || []).forEach((it) => (m[it.id] = 0));
    return m;
  });

  const maxMap = useMemo(() => {
    const m = {};
    (invoice?.items || []).forEach((it) => (m[it.id] = it.quantity || 0));
    return m;
  }, [invoice]);

  const totalRefund = useMemo(() => {
    return (invoice?.items || []).reduce((sum, it) => {
      const q = Number(qtyMap[it.id] || 0);
      const unit = Number(it.unitPrice || 0);
      return sum + q * unit;
    }, 0);
  }, [invoice, qtyMap]);

  const setQty = (itemId, value) => {
    // clamp 0..max
    const max = maxMap[itemId] ?? 0;
    const n = Number(value);
    const safe = Number.isFinite(n) ? Math.max(0, Math.min(max, n)) : 0;

    setQtyMap((prev) => ({ ...prev, [itemId]: safe }));
  };

  const handleSubmit = async () => {
    setErrMsg("");

    const items = (invoice?.items || [])
      .map((it) => {
        const qty = Number(qtyMap[it.id] || 0);
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
      setErrMsg("Vui lòng chọn ít nhất 1 sản phẩm để hoàn.");
      return;
    }

    if (!reason.trim()) {
      setErrMsg("Vui lòng nhập lý do hoàn.");
      return;
    }

    const payload = {
      invoiceId: invoice.id,
      reason: reason.trim(),
      items,
    };

    setSubmitting(true);
    try {
      //   const res = await api.post("/returns", payload).then((r) => r.data);

      onCreated?.(res);
      onClose?.();
    } catch (err) {
      console.error(err);
      setErrMsg(err?.response?.data?.message || "Tạo đơn hoàn thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BaseModal onClose={onClose} maxWidth="900px" disableClose={submitting}>
      <div className="return-modal">

        {/* HEADER */}
        <div className="return-header">

          <div>
            <h5 className="fw-bold mb-1">Tạo đơn hoàn</h5>

            <div className="text-muted small">
              Hóa đơn:
              <span className="invoice-code ms-1">
                {invoice?.invoiceCode}
              </span>
            </div>
          </div>

          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={onClose}
            disabled={submitting}
          >
            <i className="bi bi-x-lg me-1" />
            Đóng
          </button>

        </div>

        {/* BODY */}
        <div className="return-body">

          {errMsg && (
            <div className="alert alert-danger">{errMsg}</div>
          )}

          {/* TABLE */}
          <div className="return-table">

            <table className="table align-middle mb-0">

              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th className="text-end">Đơn giá</th>
                  <th className="text-center" style={{ width: 150 }}>
                    SL hoàn
                  </th>
                  <th className="text-end">Tiền hoàn</th>
                </tr>
              </thead>

              <tbody>

                {(invoice?.items || []).map((it) => {

                  const max = maxMap[it.id] ?? 0;
                  const qty = qtyMap[it.id] ?? 0;

                  const refund =
                    (Number(it.unitPrice || 0) * Number(qty || 0)) || 0;

                  return (
                    <tr key={it.id}>

                      <td>

                        <div className="fw-semibold">
                          {it.name}
                        </div>

                        <small className="text-muted">
                          Đã mua: {max}
                        </small>

                      </td>

                      <td className="text-end">
                        {formatCurrency(it.unitPrice || 0)}
                      </td>

                      <td className="text-center">

                        <input
                          type="number"
                          min={0}
                          max={max}
                          className="form-control qty-input"
                          value={qty}
                          disabled={submitting || max === 0}
                          onChange={(e) => setQty(it.id, e.target.value)}
                        />

                        <div className="text-muted small">
                          max {max}
                        </div>

                      </td>

                      <td className="text-end fw-semibold text-danger">
                        {formatCurrency(refund)}
                      </td>

                    </tr>
                  );

                })}

                {(invoice?.items || []).length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-muted py-4">
                      Không có sản phẩm
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>

          {/* FOOT INFO */}

          <div className="row g-3 mt-2">

            <div className="col-12 col-md-8">

              <label className="form-label fw-semibold">
                Lý do hoàn
              </label>

              <textarea
                className="form-control"
                rows={3}
                placeholder="Ví dụ: Khách đổi ý / Sản phẩm lỗi..."
                value={reason}
                disabled={submitting}
                onChange={(e) => setReason(e.target.value)}
              />

            </div>

            <div className="col-12 col-md-4">

              <div className="refund-summary">

                <div className="text-muted small">
                  Tổng tiền hoàn
                </div>

                <div className="refund-amount">
                  {formatCurrency(totalRefund)}
                </div>

                <div className="text-muted small mt-1">
                  Số tiền có thể thay đổi theo quy tắc hoàn
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* FOOTER */}

        <div className="return-footer">

          <button
            className="btn btn-outline-secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Hủy
          </button>

          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Đang tạo..." : "Tạo đơn hoàn"}
          </button>

        </div>

        <style>{`

.return-modal{
background:white;
border-radius:14px;
overflow:hidden;
box-shadow:0 10px 28px rgba(0,0,0,0.08);
}

.return-header{
padding:18px 22px;
border-bottom:1px solid #eee;
display:flex;
justify-content:space-between;
align-items:center;
background:#fafafa;
}

.invoice-code{
font-weight:600;
color:#0d6efd;
}

.return-body{
padding:22px;
}

.return-table{
border:1px solid #eee;
border-radius:10px;
overflow:hidden;
margin-bottom:18px;
}

.return-table thead{
background:#f8f9fa;
}

.return-table tbody tr:hover{
background:#fafafa;
}

.qty-input{
width:80px;
text-align:center;
margin:auto;
}

.refund-summary{
border:1px solid #eee;
border-radius:12px;
padding:16px;
background:#fafafa;
}

.refund-amount{
font-size:26px;
font-weight:700;
color:#dc3545;
}

.return-footer{
padding:16px 22px;
border-top:1px solid #eee;
display:flex;
justify-content:flex-end;
gap:10px;
}

`}</style>

      </div>
    </BaseModal>
  );
}