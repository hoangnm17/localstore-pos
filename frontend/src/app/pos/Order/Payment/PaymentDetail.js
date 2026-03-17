import React from "react";
import { formatCurrency } from "utils/formatters";

const PaymentDetail = ({
  total = 0,
  totalQuantity = 0,
  onOpenPayment = () => {},
}) => {

  const isEmpty = totalQuantity === 0;
  return (
    <div
      className="p-4 bg-white border-top shadow-lg"
      style={{ borderRadius: "20px 20px 0 0" }}
    >
      {/* Tạm tính */}
      <div className="d-flex justify-content-between align-items-center mb-2 px-1">
        <span className="text-secondary small fw-medium">
          Tạm tính ({totalQuantity} món)
        </span>
        <span className="text-dark fw-bold">
          {formatCurrency(total)}
        </span>
      </div>

      {/* Tổng thanh toán */}
      <div className="d-flex justify-content-between align-items-center mb-4 px-1">
        <h5 className="fw-bold mb-0 text-dark">Tổng thanh toán</h5>
        <h4
          className="fw-black mb-0 text-primary"
          style={{ fontSize: "1.75rem" }}
        >
          {formatCurrency(total)}
        </h4>
      </div>

      {/* Button */}
      <button
        disabled={isEmpty}
        onClick={onOpenPayment}
        className={`btn w-100 py-3 rounded-4 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 ${isEmpty ? "btn-light text-muted" : "btn-primary"
          }`}
        style={{
          fontSize: "1.1rem",
          letterSpacing: "0.5px",
          height: "60px",
        }}
      >
        <i
          className={`bi ${isEmpty ? "bi-cart-x" : "bi-credit-card-2-front"
            } fs-5`}
        ></i>
        {isEmpty ? "Giỏ hàng trống" : "THANH TOÁN NGAY"}
      </button>

      <style>{`
        .fw-black { font-weight: 900; }
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 15px rgba(13, 110, 253, 0.2) !important;
        }
      `}</style>
    </div>
  );
};

export default PaymentDetail;