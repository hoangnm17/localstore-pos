import { useMemo, useState } from "react";
import BaseModal from "components/common/BaseModal";
import { formatCurrency } from "utils/formatters";
import api from "services/axiosInstance";

export default function ReturnCreateModal({ invoice, onClose, onCreated }) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  // Khởi tạo map số lượng dựa trên id của item trong hóa đơn
  const [qtyMap, setQtyMap] = useState(() => {
    const m = {};
    (invoice?.items || []).forEach((it) => (m[it.id] = 0));
    return m;
  });

  // Số lượng tối đa có thể trả dựa trên remainingQuantity từ API
  const maxMap = useMemo(() => {
    const m = {};
    (invoice?.items || []).forEach((it) => (m[it.id] = it.remainingQuantity || 0));
    return m;
  }, [invoice]);

  // TÍNH TOÁN: Lấy discountedUnitPrice để hoàn tiền đúng số khách đã trả
  const totalRefund = useMemo(() => {
    return (invoice?.items || []).reduce((sum, it) => {
      const q = Number(qtyMap[it.id] || 0);
      // Sử dụng discountedUnitPrice nếu có, nếu không thì dùng unitPrice
      const priceToRefund = it.discountedUnitPrice ?? it.unitPrice ?? 0;
      return sum + q * priceToRefund;
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
        // Gửi đơn giá thực tế đã giảm lên server
        refundAmountPerItem: it.discountedUnitPrice ?? it.unitPrice, 
      }))
      .filter((it) => it.quantity > 0);

    if (!items.length) return setErrMsg("Vui lòng chọn ít nhất một sản phẩm để hoàn");
    if (!reason.trim()) return setErrMsg("Vui lòng nhập lý do hoàn trả");

    const payload = { 
      invoiceId: invoice.id, 
      reason: reason.trim(), 
      items,
      totalRefundAmount: totalRefund // Tổng tiền gửi lên để đối soát
    };

    setSubmitting(true);
    try {
      await api.post("/returns", payload);
      onCreated?.();
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
        {/* Header */}
        <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <div className="bg-danger bg-opacity-10 p-3 rounded-3 me-3">
              <i className="bi bi-arrow-counterclockwise text-danger fs-4"></i>
            </div>
            <div>
              <h5 className="mb-0 fw-bold">Tạo Đơn Hoàn Trả</h5>
              <small className="text-muted">Hóa đơn: <strong>{invoice?.invoiceCode}</strong></small>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 bg-light">
          {errMsg && <div className="alert alert-danger mb-4">{errMsg}</div>}

          <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4 py-3">Sản phẩm</th>
                    <th className="text-center">Giá mua (đã giảm)</th>
                    <th className="text-center" style={{ width: '160px' }}>Số lượng trả</th>
                    <th className="text-end pe-4">Hoàn trả</th>
                  </tr>
                </thead>
                <tbody>
                  {(invoice?.items || []).map((it) => {
                    const qty = qtyMap[it.id] || 0;
                    const price = it.discountedUnitPrice ?? it.unitPrice;
                    return (
                      <tr key={it.id}>
                        <td className="ps-4">
                          <div className="fw-bold">{it.productName}</div>
                          <small className="text-muted">Còn lại: {maxMap[it.id]} {it.unitName}</small>
                        </td>
                        <td className="text-center">
                          {formatCurrency(price)}
                        </td>
                        <td>
                          <div className="input-group input-group-sm">
                            <button className="btn btn-outline-secondary" onClick={() => setQty(it.id, qty - 1)}>−</button>
                            <input 
                              type="text" 
                              className="form-control text-center bg-white" 
                              value={qty} 
                              readOnly 
                            />
                            <button className="btn btn-outline-secondary" onClick={() => setQty(it.id, qty + 1)}>+</button>
                          </div>
                        </td>
                        <td className="text-end pe-4 fw-bold text-danger">
                          {formatCurrency(qty * price)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-lg-7">
              <div className="bg-white p-4 rounded-4 shadow-sm h-100">
                <label className="form-label fw-bold small text-uppercase">Lý do hoàn trả</label>
                <textarea
                  className="form-control border-light-subtle bg-light"
                  rows={3}
                  placeholder="Ví dụ: Sản phẩm bị móp méo, khách đổi ý..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            </div>
            <div className="col-lg-5">
              <div className="card border-0 bg-success text-white p-4 rounded-4 shadow-sm h-100">
                <div className="small opacity-75 mb-1 text-uppercase fw-bold">Tổng tiền hoàn trả</div>
                <div className="h2 fw-bold mb-0">{formatCurrency(totalRefund)}</div>
                <hr className="opacity-25" />
                <div className="small opacity-75">Dựa trên đơn giá sau chiết khấu của hóa đơn.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-top d-flex justify-content-end gap-2">
          <button className="btn btn-light px-4" onClick={onClose}>Đóng</button>
          <button 
            className="btn btn-primary px-5 fw-bold"
            onClick={handleSubmit}
            disabled={submitting || totalRefund === 0}
          >
            {submitting ? "Đang xử lý..." : "Xác nhận hoàn tiền"}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}