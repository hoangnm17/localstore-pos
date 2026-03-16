import { useState, useMemo, useRef, useEffect } from "react";
import { formatCurrency } from "utils/formatters";
import useHotkeys from "hooks/pos/useHotKeys";

export default function CashPayment({ total, onConfirm }) {
  const [customerPay, setCustomerPay] = useState("");
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
    return customerPayNumber > total
      ? customerPayNumber - total
      : 0;
  }, [customerPayNumber, total]);

  const handleChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    setCustomerPay(raw);
  };

  useHotkeys({
    F9: () => setCustomerPay(String(total)),
    Enter: () => handleSubmit(),
  });

  const handleSubmit = () => {
    if (customerPayNumber < total) return;
    onConfirm({
      amount: customerPayNumber,
    });
  };

  return (
    <>
      {/* LABEL */}
      <label className="form-label small fw-bold text-muted">
        TIỀN KHÁCH ĐƯA
      </label>

      {/* INPUT WITH CLEAR BUTTON */}
      <div className="position-relative mb-3">
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          className="form-control form-control-lg fw-bold text-primary pe-5"
          value={formatNumber(customerPay)}
          onChange={handleChange}
        />

        {customerPay && (
          <button
            type="button"
            className="btn position-absolute top-50 end-0 translate-middle-y me-2 p-1"
            onClick={() => {
              setCustomerPay("");
              setTimeout(() => {
                inputRef.current?.focus();
              }, 0);
            }}
            style={{ lineHeight: 1 }}
          >
            <i className="bi bi-x-circle-fill text-secondary fs-5"></i>
          </button>
        )}
      </div>

      {/* QUICK MONEY */}
      <div className="row g-2 mb-3">

        <div className="col-4">
          <button
            type="button"
            className="btn btn-warning w-100 small fw-bold border-0"
            onClick={() => setCustomerPay(String(total))}
          >
            Đủ tiền
          </button>
        </div>
      </div>

      {/* CHANGE DISPLAY */}
      <div
        className={`d-flex justify-content-between align-items-center p-4 rounded-4 mb-4 border ${change > 0
          ? "bg-success bg-opacity-10 border-success border-opacity-25"
          : "bg-light border-light"
          }`}
        style={{
          transition: "all 0.2s ease",
        }}
      >
        <div>
          <div className="small text-muted fw-bold text-uppercase">
            Tiền thừa
          </div>
          <div
            className={`display-6 fw-bold ${change > 0 ? "text-success" : "text-secondary"
              }`}
          >
            {formatCurrency(change)}
          </div>
        </div>

        {change > 0 && (
          <div className="fs-1 text-success opacity-50">
            <i className="bi bi-cash-coin"></i>
          </div>
        )}
      </div>

      {/* CONFIRM BUTTON */}
      <button
        type="button"
        className="btn btn-primary btn-lg w-100 fw-bold shadow"
        disabled={customerPayNumber < total}
        onClick={handleSubmit}
      >
        XÁC NHẬN
      </button>
    </>
  );
}