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
      <div className="card shadow border-0">
        <div className="card-header bg-white d-flex align-items-start justify-content-between">
          <div>
            <h5 className="mb-0">Tạo đơn hoàn</h5>
            <div className="text-muted small mt-1">
              Hóa đơn: <b className="text-dark">{invoice?.invoiceCode}</b>
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

        <div className="card-body">
          {errMsg && <div className="alert alert-danger">{errMsg}</div>}

          <div className="table-responsive border rounded-4 overflow-hidden mb-3">
            <table className="table table-sm mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th className="ps-3">Sản phẩm</th>
                  <th className="text-end">Đơn giá</th>
                  <th className="text-center" style={{ width: 140 }}>
                    SL hoàn
                  </th>
                  <th className="text-end pe-3">Tiền hoàn</th>
                </tr>
              </thead>
              <tbody>
                {(invoice?.items || []).map((it) => {
                  const max = maxMap[it.id] ?? 0;
                  const qty = qtyMap[it.id] ?? 0;
                  const refund = (Number(it.unitPrice || 0) * Number(qty || 0)) || 0;

                  return (
                    <tr key={it.id}>
                      <td className="ps-3">
                        <div className="fw-semibold">{it.name}</div>
                        <div className="text-muted small">
                          Đã mua: {max} • ProductID: {it.productId}
                        </div>
                      </td>

                      <td className="text-end">{formatCurrency(it.unitPrice || 0)}</td>

                      <td className="text-center">
                        <input
                          type="number"
                          min={0}
                          max={max}
                          className="form-control form-control-sm text-center"
                          value={qty}
                          disabled={submitting || max === 0}
                          onChange={(e) => setQty(it.id, e.target.value)}
                        />
                        <div className="text-muted small mt-1">Tối đa: {max}</div>
                      </td>

                      <td className="text-end pe-3 fw-semibold">
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

          <div className="row g-3">
            <div className="col-12 col-md-8">
              <label className="form-label fw-semibold">Lý do hoàn</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Ví dụ: Khách đổi ý / Sản phẩm lỗi / Giao nhầm..."
                value={reason}
                disabled={submitting}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-4">
              <div className="p-3 border rounded-4 h-100">
                <div className="text-muted small">Tổng tiền hoàn</div>
                <div className="fs-3 fw-bold">{formatCurrency(totalRefund)}</div>
                <div className="text-muted small mt-2">
                  Lưu ý: số tiền hoàn thực tế phụ thuộc quy tắc của bạn (phí, voucher, ...).
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card-footer bg-white d-flex justify-content-end gap-2">
          <button className="btn btn-outline-secondary" onClick={onClose} disabled={submitting}>
            Hủy
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Đang tạo..." : "Tạo đơn hoàn"}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}