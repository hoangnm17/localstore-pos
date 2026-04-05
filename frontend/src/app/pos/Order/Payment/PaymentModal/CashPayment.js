import { useState, useMemo, useRef, useEffect } from "react";
import { formatCurrency } from "utils/formatters";

export default function CashPayment({ total, onConfirm }) {
  const [customerPay, setCustomerPay] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const formatNumber = (value) => {
    if (!value) return "";
    return Number(value).toLocaleString("vi-VN");
  };

  const customerPayNumber = useMemo(() => {
    return Number(customerPay) || 0;
  }, [customerPay]);

  const change = useMemo(() => {
    return customerPayNumber > total ? customerPayNumber - total : 0;
  }, [customerPayNumber, total]);

  const handleChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    setCustomerPay(raw);
  };

  const handleSubmit = async () => {
    if (isSubmitting || customerPayNumber < total) return;

    setIsSubmitting(true);
    try {
      await onConfirm({
        amount: customerPayNumber,
      });
    } catch (error) {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "F9") {
        e.preventDefault();
        setCustomerPay(String(total));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [total]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        handleSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true); // Dùng true để capture trước
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [customerPayNumber, total, isSubmitting]);

  return (
    <>
      <label className="form-label small fw-bold text-muted">
        TIỀN KHÁCH ĐƯA
      </label>

      <div className="position-relative mb-3">
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          disabled={isSubmitting} // Khóa input khi đang xử lý
          className="form-control form-control-lg fw-bold text-primary pe-5"
          value={formatNumber(customerPay)}
          onChange={handleChange}
        />

        {customerPay && !isSubmitting && (
          <button
            type="button"
            className="btn position-absolute top-50 end-0 translate-middle-y me-2 p-1"
            onClick={() => {
              setCustomerPay("");
              setTimeout(() => inputRef.current?.focus(), 0);
            }}
          >
            <i className="bi bi-x-circle-fill text-secondary fs-5"></i>
          </button>
        )}
      </div>

      <div className="row g-2 mb-3">
        <div className="col-4">
          <button
            type="button"
            className="btn btn-warning w-100 small fw-bold border-0"
            disabled={isSubmitting}
            onClick={() => setCustomerPay(String(total))}
          >
            Đủ tiền (F9)
          </button>
        </div>
      </div>

      <div
        className={`d-flex justify-content-between align-items-center p-4 rounded-4 mb-4 border ${
          change > 0
            ? "bg-success bg-opacity-10 border-success border-opacity-25"
            : "bg-light border-light"
        }`}
      >
        <div>
          <div className="small text-muted fw-bold text-uppercase">Tiền thừa</div>
          <div className={`display-6 fw-bold ${change > 0 ? "text-success" : "text-secondary"}`}>
            {formatCurrency(change)}
          </div>
        </div>
      </div>

      <button
        type="button"
        className="btn btn-primary btn-lg w-100 fw-bold shadow"
        disabled={customerPayNumber < total || isSubmitting} // Vô hiệu hóa nút khi đang gửi
        onClick={handleSubmit}
      >
        {isSubmitting ? (
          <>
            <span className="spinner-border spinner-border-sm me-2"></span>
            ĐANG XỬ LÝ...
          </>
        ) : (
          "XÁC NHẬN (ENTER)"
        )}
      </button>
    </>
  );
}