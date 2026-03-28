import React, { useEffect } from "react";
import { formatCurrency } from "utils/formatters";

const PaymentDetail = ({
  total = 0,
  totalQuantity = 0,
  onOpenPayment = () => {},
}) => {
  const isEmpty = totalQuantity === 0;

  return (
    <div
      className="p-3 bg-white border-top shadow-lg position-relative"
      style={{ 
        borderRadius: "24px 24px 0 0",
        zIndex: 10
      }}
    >
      {/* Handle bar trang trí */}
      <div className="d-flex justify-content-center mb-3">
        <div className="bg-light border" style={{ width: '40px', height: '5px', borderRadius: '10px' }}></div>
      </div>

      {/* Chi tiết tạm tính */}
      <div className="d-flex justify-content-between align-items-center mb-2 px-2">
        <span className="text-muted fw-medium small">
          Tạm tính ({totalQuantity} mặt hàng)
        </span>
        <span className="text-dark fw-bold">
          {formatCurrency(total)}
        </span>
      </div>

      <hr className="my-3 opacity-25" />

      {/* Tổng cộng */}
      <div className="d-flex justify-content-between align-items-center mb-4 px-2">
        <div className="lh-sm">
          <h6 className="fw-bold mb-0 text-dark text-uppercase" style={{ fontSize: '0.85rem', letterSpacing: '0.5px' }}>
            Tổng cộng
          </h6>
        </div>
        <div className="text-end">
          <h3
            className="fw-bold mb-0 text-primary"
            style={{ fontSize: "1.8rem", letterSpacing: '-1px' }}
          >
            {formatCurrency(total)}
          </h3>
        </div>
      </div>

      {/* Nút bấm */}
      <button
        disabled={isEmpty}
        onClick={onOpenPayment}
        className={`btn w-100 py-3 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 border-0 ${
          isEmpty 
            ? "btn-secondary opacity-25" 
            : "btn-primary"
        }`}
        style={{
          fontSize: "1rem",
          height: "56px",
        }}
      >
        {isEmpty ? (
          <>
            <i className="bi bi-cart-x fs-5"></i>
            CHƯA CÓ SẢN PHẨM
          </>
        ) : (
          <>
            <i className="bi bi-shield-check fs-5"></i>
            THANH TOÁN (F12)
          </>
        )}
      </button>
    </div>
  );
};

export default PaymentDetail;