import { useState } from "react";

export default function PaymentModal({ total, onClose, onConfirm }) {
  const [method, setMethod] = useState("CASH");
  const [customerPay, setCustomerPay] = useState("");
  
  const QUICK_MONEY = [10000, 20000, 50000, 100000, 200000, 500000];
  
  const customerPayNumber = method === "BANK" ? total : (Number(customerPay) || 0);
  const change = customerPayNumber - total;

  const handleQuickAdd = (amount) => {
    const current = Number(customerPay) || 0;
    setCustomerPay(current + amount);
  };

  const handleSubmit = () => {
    onConfirm({
      method,
      customerPay: customerPayNumber,
      change: method === "BANK" ? 0 : change,
    });
  };

  return (
    <div 
      className="modal fade show d-block" 
      style={{ backgroundColor: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(5px)" }}
      onClick={onClose}
    >
      <div 
        className="modal-dialog modal-dialog-centered" 
        style={{ maxWidth: "480px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          
          <div className="modal-header border-0 pt-4 px-4 pb-0">
            <h5 className="modal-title fw-bold fs-4">Thanh toán</h5>
            <button className="btn-close shadow-none" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4">
            {/* TỔNG TIỀN */}
            <div className="text-center mb-4 p-3 rounded-4 bg-primary bg-opacity-10 border border-primary border-opacity-10">
              <div className="text-secondary small fw-bold text-uppercase mb-1">Tổng tiền cần thu</div>
              <h2 className="text-primary fw-bold mb-0">{total.toLocaleString()}đ</h2>
            </div>

            {/* HÌNH THỨC THANH TOÁN */}
            <div className="mb-4">
              <label className="form-label small fw-bold text-muted">HÌNH THỨC</label>
              <div className="d-flex gap-2">
                {[
                  { id: "CASH", label: "Tiền mặt", icon: "bi-cash-stack" },
                  { id: "BANK", label: "Chuyển khoản", icon: "bi-qr-code-scan" }
                ].map((m) => (
                  <button
                    key={m.id}
                    className={`btn flex-grow-1 py-3 fw-bold rounded-3 border-2 d-flex flex-column align-items-center gap-1 transition-all ${
                      method === m.id ? "btn-primary border-primary shadow" : "btn-light text-secondary border-light bg-light"
                    }`}
                    onClick={() => {
                        setMethod(m.id);
                        if(m.id === "BANK") setCustomerPay(""); // Reset tiền mặt khi sang chuyển khoản
                    }}
                  >
                    <i className={`bi ${m.icon} fs-4`}></i>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* CHỈ HIỆN KHI LÀ TIỀN MẶT */}
            {method === "CASH" ? (
              <div className="animate-fade-in">
                <label className="form-label small fw-bold text-muted">TIỀN KHÁCH ĐƯA</label>
                <div className="input-group mb-3">
                  <input
                    type="number"
                    className="form-control form-control-lg bg-light border-0 rounded-start-3 fw-bold text-primary"
                    placeholder="Nhập số tiền..."
                    value={customerPay}
                    onChange={(e) => setCustomerPay(e.target.value)}
                    autoFocus
                  />
                  <button className="btn btn-light border-0 px-3" onClick={() => setCustomerPay("")}>
                    <i className="bi bi-x-circle-fill text-muted"></i>
                  </button>
                </div>

                {/* NÚT CHỌN NHANH */}
                <div className="row g-2 mb-4">
                  {QUICK_MONEY.map((amount) => (
                    <div key={amount} className="col-4">
                      <button 
                        className="btn btn-outline-secondary w-100 py-2 small fw-bold border-1 border-opacity-25"
                        onClick={() => handleQuickAdd(amount)}
                        style={{ fontSize: '0.8rem' }}
                      >
                        +{amount/1000}k
                      </button>
                    </div>
                  ))}
                  <div className="col-4">
                    <button 
                      className="btn btn-warning w-100 py-2 small fw-bold border-0"
                      onClick={() => setCustomerPay(total)}
                      style={{ fontSize: '0.8rem' }}
                    >
                      Đủ tiền
                    </button>
                  </div>
                </div>

                {/* TIỀN THỪA */}
                <div className="d-flex justify-content-between align-items-center p-3 rounded-3 bg-dark bg-opacity-5 mt-2">
                  <span className="fw-bold text-muted">Tiền thừa:</span>
                  <span className={`fs-4 fw-bold ${change >= 0 ? "text-success" : "text-danger"}`}>
                    {change >= 0 ? change.toLocaleString() : 0}đ
                  </span>
                </div>
              </div>
            ) : (
              /* HIỆN KHI LÀ CHUYỂN KHOẢN */
              <div className="text-center py-4 animate-fade-in">
                <div className="p-4 border border-dashed rounded-4 bg-light">
                  <i className="bi bi-check2-circle text-success display-4 mb-2"></i>
                  <p className="text-muted mb-0">Hệ thống sẽ ghi nhận thanh toán<br/>đúng số tiền <strong>{total.toLocaleString()}đ</strong></p>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer border-0 p-4 pt-0 d-flex gap-3">
            <button className="btn btn-light btn-lg flex-grow-1 fw-bold text-secondary rounded-3" onClick={onClose}>HUỶ</button>
            <button
              className="btn btn-primary btn-lg flex-grow-1 fw-bold rounded-3 shadow"
              disabled={method === "CASH" && customerPayNumber < total}
              onClick={handleSubmit}
            >
              XÁC NHẬN
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .transition-all { transition: all 0.2s; }
        .animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}