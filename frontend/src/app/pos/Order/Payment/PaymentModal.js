import { useState, useMemo, useEffect } from "react";
import { formatCurrency } from "../../../../utils/formatters";

export default function PaymentModal({
  orderId,
  total = 0,
  onClose = () => {},
  onConfirm = () => {},
}) {

  const safeTotal = useMemo(() => Number(total) || 0, [total]);

  const [method, setMethod] = useState("CASH");
  const [customerPay, setCustomerPay] = useState("");

  //Reset toàn bộ state khi modal mở lại
  useEffect(() => {
    setMethod("CASH");
    setCustomerPay("");
  }, [safeTotal]); 
  // dùng safeTotal làm trigger vì mỗi lần mở modal total sẽ thay đổi

  // ===== QUICK MONEY =====
  const QUICK_MONEY = [10000, 20000, 50000, 100000, 200000, 500000];

  // ===== CALCULATE =====

  // Đảm bảo không bị số âm hoặc NaN
  const customerPayNumber = useMemo(() => {
    if (method === "BANK") return safeTotal;
    const parsed = Number(customerPay);
    return isNaN(parsed) || parsed < 0 ? 0 : parsed;
  }, [method, customerPay, safeTotal]);

  // Không cần Math.max nếu đã xử lý trên
  const change = useMemo(() => {
    return customerPayNumber > safeTotal
      ? customerPayNumber - safeTotal
      : 0;
  }, [customerPayNumber, safeTotal]);


  const handleQuickAdd = (amount) => {
    const current = Number(customerPay) || 0;
    setCustomerPay(String(current + amount));
  };

  const handleSubmit = () => {

    //Chặn submit nếu chưa đủ tiền mặt
    if (method === "CASH" && customerPayNumber < safeTotal) return;

    onConfirm({
      orderId,
      method,
      customerPay: customerPayNumber,
    });
  };

  return (
    <div
      className="modal fade show d-block"
      style={{
        backgroundColor: "rgba(15, 23, 42, 0.7)",
        backdropFilter: "blur(5px)",
      }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: "480px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          
          {/* HEADER */}
          <div className="modal-header border-0 pt-4 px-4 pb-0">
            <h5 className="modal-title fw-bold fs-4">Thanh toán</h5>
            <button
              className="btn-close shadow-none"
              onClick={onClose}
            ></button>
          </div>

          {/* BODY */}
          <div className="modal-body p-4">
            
            {/* TOTAL */}
            <div className="text-center mb-4 p-3 rounded-4 bg-primary bg-opacity-10 border border-primary border-opacity-10">
              <div className="text-secondary small fw-bold text-uppercase mb-1">
                Tổng tiền cần thu
              </div>
              <h2 className="text-primary fw-bold mb-0">
                {/* ✅ SỬA 5: format tiền chuẩn */}
                {formatCurrency(safeTotal)}
              </h2>
            </div>

            {/* METHOD */}
            <div className="mb-4">
              <label className="form-label small fw-bold text-muted">
                HÌNH THỨC
              </label>
              <div className="d-flex gap-2">
                {[
                  { id: "CASH", label: "Tiền mặt", icon: "bi-cash-stack" },
                  { id: "BANK", label: "Chuyển khoản", icon: "bi-qr-code-scan" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className={`btn flex-grow-1 py-3 fw-bold rounded-3 border-2 d-flex flex-column align-items-center gap-1 ${
                      method === m.id
                        ? "btn-primary border-primary shadow"
                        : "btn-light text-secondary border-light bg-light"
                    }`}
                    onClick={() => setMethod(m.id)}
                  >
                    <i className={`bi ${m.icon} fs-4`} />
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* CASH */}
            {method === "CASH" ? (
              <>
                <label className="form-label small fw-bold text-muted">
                  TIỀN KHÁCH ĐƯA
                </label>

                <div className="input-group mb-3">
                  <input
                    type="number"
                    className="form-control form-control-lg bg-light border-0 rounded-start-3 fw-bold text-primary"
                    placeholder="Nhập số tiền..."
                    value={customerPay}
                    onChange={(e) => setCustomerPay(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-light border-0 px-3"
                    onClick={() => setCustomerPay("")}
                  >
                    <i className="bi bi-x-circle-fill text-muted" />
                  </button>
                </div>

                {/* QUICK BUTTON */}
                <div className="row g-2 mb-4">
                  {QUICK_MONEY.map((amount) => (
                    <div key={amount} className="col-4">
                      <button
                        type="button"
                        className="btn btn-outline-secondary w-100 py-2 small fw-bold"
                        onClick={() => handleQuickAdd(amount)}
                      >
                        +{amount / 1000}k
                      </button>
                    </div>
                  ))}

                  <div className="col-4">
                    <button
                      type="button"
                      className="btn btn-warning w-100 py-2 small fw-bold border-0"
                      onClick={() => setCustomerPay(String(safeTotal))}
                    >
                      Đủ tiền
                    </button>
                  </div>
                </div>

                {/* CHANGE */}
                <div className="d-flex justify-content-between align-items-center p-3 rounded-3 bg-dark bg-opacity-5">
                  <span className="fw-bold text-muted">Tiền thừa:</span>
                  <span
                    className={`fs-4 fw-bold ${
                      change > 0 ? "text-success" : "text-danger"
                    }`}
                  >
                    {formatCurrency(change)}
                  </span>
                </div>
              </>
            ) : (
              /* BANK */
              <div className="text-center py-4">
                <div className="p-4 border rounded-4 bg-light">
                  <i className="bi bi-check2-circle text-success display-4 mb-2" />
                  <p className="text-muted mb-0">
                    Hệ thống sẽ ghi nhận thanh toán đúng số tiền{" "}
                    <strong>{formatCurrency(safeTotal)}</strong>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="modal-footer border-0 p-4 pt-0 d-flex gap-3">
            <button
              type="button"
              className="btn btn-light btn-lg flex-grow-1 fw-bold text-secondary"
              onClick={onClose}
            >
              HUỶ
            </button>

            <button
              type="button"
              className="btn btn-primary btn-lg flex-grow-1 fw-bold shadow"
              disabled={method === "CASH" && customerPayNumber < safeTotal}
              onClick={handleSubmit}
            >
              XÁC NHẬN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}