import { useMemo, useState } from "react";
import BaseModal from "components/common/BaseModal";
import { formatCurrency } from "utils/formatters";
import api from "services/axiosInstance";
import { createReturn } from "services/Return/return.service";
import { useNotification } from "components/global/Notification/NotificationContext"; // Import context

export default function ReturnCreateModal({ invoice, onClose, onCreated }) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Sử dụng hook notification
  const { showNotification } = useNotification();

  const [qtyMap, setQtyMap] = useState(() => {
    const m = {};
    (invoice?.items || []).forEach((it) => (m[it.id] = 0));
    return m;
  });

  const maxMap = useMemo(() => {
    const m = {};
    (invoice?.items || []).forEach((it) => (m[it.id] = it.remainingQuantity || 0));
    return m;
  }, [invoice]);

  const totalRefund = useMemo(() => {
    return (invoice?.items || []).reduce((sum, it) => {
      const q = Number(qtyMap[it.id] || 0);
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
    const items = (invoice?.items || [])
      .map((it) => ({
        invoiceItemId: it.id,
        productId: it.productId,
        quantity: Number(qtyMap[it.id] || 0),
        refundAmountPerItem: it.discountedUnitPrice ?? it.unitPrice, 
      }))
      .filter((it) => it.quantity > 0);

    // Thay thế setErrMsg bằng showNotification
    if (!items.length) {
      return showNotification("Vui lòng chọn ít nhất một sản phẩm để hoàn", "warning");
    }
    if (!reason.trim()) {
      return showNotification("Vui lòng nhập lý do hoàn trả", "warning");
    }

    const payload = { 
      invoiceId: invoice.id, 
      reason: reason.trim(), 
      items,
      totalRefundAmount: totalRefund 
    };

    setSubmitting(true);
    try {
      await createReturn(payload);
      showNotification("Tạo đơn hoàn trả thành công, vui lòng chờ duyệt", "success");
      onCreated?.();
      onClose?.();
    } catch (err) {
      const errorMsg = err?.response?.data?.message || "Lỗi hệ thống khi tạo đơn hoàn";
      showNotification(errorMsg, "error");
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
          <button className="btn-close shadow-none" onClick={onClose}></button>
        </div>

        {/* Body */}
        <div className="p-4 bg-light">
          {/* Đã bỏ phần hiển thị alert errMsg tại đây */}

          <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4 py-3 border-0">Sản phẩm</th>
                    <th className="text-center border-0">Giá mua (đã giảm)</th>
                    <th className="text-center border-0" style={{ width: '160px' }}>Số lượng trả</th>
                    <th className="text-end pe-4 border-0">Hoàn trả</th>
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
                          <div className="input-group input-group-sm justify-content-center">
                            <button className="btn btn-outline-secondary px-2" onClick={() => setQty(it.id, qty - 1)}>−</button>
                            <input 
                              type="text" 
                              className="form-control text-center bg-white border-secondary-subtle" 
                              style={{ maxWidth: '50px' }}
                              value={qty} 
                              readOnly 
                            />
                            <button className="btn btn-outline-secondary px-2" onClick={() => setQty(it.id, qty + 1)}>+</button>
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
                <label className="form-label fw-bold small text-uppercase text-muted">Lý do hoàn trả <span className="text-danger">*</span></label>
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
              <div className="card border-0 bg-success text-white p-4 rounded-4 shadow-sm h-100 d-flex flex-column justify-content-center">
                <div className="small opacity-75 mb-1 text-uppercase fw-bold">Tổng tiền hoàn trả</div>
                <div className="h2 fw-bold mb-0">{formatCurrency(totalRefund)}</div>
                <hr className="opacity-25 my-3" />
                <div className="small opacity-75 italic">Giá trị này được tính dựa trên đơn giá thực tế khách đã thanh toán.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-top d-flex justify-content-end gap-2">
          <button className="btn btn-light rounded-pill px-4" onClick={onClose} disabled={submitting}>Hủy bỏ</button>
          <button 
            className="btn btn-primary rounded-pill px-5 fw-bold"
            onClick={handleSubmit}
            disabled={submitting || totalRefund === 0}
          >
            {submitting ? (
              <><span className="spinner-border spinner-border-sm me-2"></span> Đang xử lý...</>
            ) : "Xác nhận tạo yêu cầu"}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}