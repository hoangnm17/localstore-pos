import { useMemo, useState } from "react";
import BaseModal from "components/common/BaseModal";
import { formatCurrency } from "utils/formatters";
import api from "services/axiosInstance";

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
      return sum + q * Number(it.unitPrice || 0);
    }, 0);
  }, [invoice, qtyMap]);

  const setQty = (id, value) => {
    const max = maxMap[id] || 0;
    const n = parseInt(value);
    const safe = Number.isFinite(n) ? Math.max(0, Math.min(max, n)) : 0;
    setQtyMap((prev) => ({ ...prev, [id]: safe }));
  };

  const handleSubmit = async () => {
    setErrMsg("");
    const items = (invoice?.items || [])
      .map((it) => ({
        invoiceItemId: it.id,
        productId: it.productId,
        quantity: Number(qtyMap[it.id] || 0),
        unitPrice: it.unitPrice,
      }))
      .filter((it) => it.quantity > 0);

    if (!items.length) return setErrMsg("Vui lòng chọn ít nhất một sản phẩm để hoàn");
    if (!reason.trim()) return setErrMsg("Vui lòng nhập lý do hoàn trả");

    const payload = { invoiceId: invoice.id, reason: reason.trim(), items };
    setSubmitting(true);
    try {
      const res = await api.post("/returns", payload).then(r => r.data);
      onCreated?.(res);
      onClose?.();
    } catch (err) {
      setErrMsg(err?.response?.data?.message || "Lỗi hệ thống khi tạo đơn hoàn");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BaseModal onClose={onClose} maxWidth="900px">
      <div className="bg-white rounded-4 overflow-hidden shadow-lg">
        {/* Header Section */}
        <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-white">
          <div className="d-flex align-items-center">
            <div className="bg-primary bg-opacity-10 p-3 rounded-3 me-3">
              <i className="bi bi-arrow-return-left text-primary fs-4"></i>
            </div>
            <div>
              <h5 className="mb-0 fw-bold text-dark">Tạo Đơn Hoàn Tiền</h5>
              <small className="text-muted">
                Hóa đơn: <span className="fw-bold text-primary">#{invoice?.invoiceCode}</span> • {new Date().toLocaleDateString('vi-VN')}
              </small>
            </div>
          </div>
          <button className="btn btn-light rounded-circle p-2 lh-1" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Content Section */}
        <div className="p-4 bg-light">
          {errMsg && (
            <div className="alert alert-danger border-0 shadow-sm rounded-3 mb-4 d-flex align-items-center">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {errMsg}
            </div>
          )}

          {/* Table Card */}
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4 border-0 text-secondary small text-uppercase fw-bold py-3">Sản phẩm</th>
                    <th className="text-center border-0 text-secondary small text-uppercase fw-bold py-3">Đơn giá</th>
                    <th className="text-center border-0 text-secondary small text-uppercase fw-bold py-3" style={{ width: '180px' }}>Số lượng trả</th>
                    <th className="text-end pe-4 border-0 text-secondary small text-uppercase fw-bold py-3">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {(invoice?.items || []).map((it) => {
                    const qty = qtyMap[it.id] || 0;
                    return (
                      <tr key={it.id} className={qty > 0 ? "table-primary table-opacity-10" : ""}>
                        <td className="ps-4 py-3">
                          <div className="fw-bold text-dark">{it.name}</div>
                          <small className="text-muted">Tối đa cho phép: {maxMap[it.id]}</small>
                        </td>
                        <td className="text-center text-secondary">{formatCurrency(it.unitPrice)}</td>
                        <td>
                          {/* Custom Quantity Spinner using BS5 classes */}
                          <div className="input-group input-group-sm justify-content-center">
                            <button 
                              className="btn btn-outline-secondary border-secondary-subtle px-3" 
                              onClick={() => setQty(it.id, qty - 1)}
                              disabled={qty <= 0}
                            >−</button>
                            <span className="input-group-text bg-white border-secondary-subtle px-3 fw-bold" style={{ minWidth: '45px', justifyContent: 'center' }}>
                              {qty}
                            </span>
                            <button 
                              className="btn btn-outline-secondary border-secondary-subtle px-3" 
                              onClick={() => setQty(it.id, qty + 1)}
                              disabled={qty >= maxMap[it.id]}
                            >+</button>
                          </div>
                        </td>
                        <td className="text-end pe-4 fw-bold text-dark">
                          {formatCurrency(qty * it.unitPrice)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="row g-4">
            {/* Reason Section */}
            <div className="col-lg-7">
              <div className="bg-white p-4 rounded-4 shadow-sm h-100">
                <label className="form-label fw-bold text-dark small text-uppercase mb-3">Lý do hoàn trả sản phẩm</label>
                <textarea
                  className="form-control border-light-subtle bg-light shadow-none rounded-3"
                  rows={4}
                  placeholder="Mô tả chi tiết lý do (hàng lỗi, sai mẫu...)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            </div>

            {/* Summary Section */}
            <div className="col-lg-5">
              <div className="card border-0 bg-primary text-white p-4 rounded-4 shadow-sm h-100">
                <div className="d-flex justify-content-between mb-2 opacity-75">
                  <span>Tổng sản phẩm hoàn:</span>
                  <span className="fw-bold">{Object.values(qtyMap).reduce((a, b) => a + b, 0)}</span>
                </div>
                <hr className="my-3 opacity-25" />
                <div className="mt-auto">
                  <div className="small opacity-75 mb-1 text-uppercase fw-bold">Tổng tiền hoàn trả</div>
                  <div className="h2 fw-bold mb-0">{formatCurrency(totalRefund)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="p-4 bg-white border-top d-flex justify-content-end gap-2">
          <button className="btn btn-link text-decoration-none text-muted fw-bold px-4" onClick={onClose}>
            Hủy bỏ
          </button>
          <button 
            className="btn btn-primary rounded-3 px-5 fw-bold shadow-sm"
            onClick={handleSubmit}
            disabled={submitting || totalRefund === 0}
          >
            {submitting ? (
              <span className="spinner-border spinner-border-sm me-2"></span>
            ) : (
              <i className="bi bi-check2-circle me-2"></i>
            )}
            Xác nhận tạo đơn
          </button>
        </div>
      </div>
    </BaseModal>
  );
}