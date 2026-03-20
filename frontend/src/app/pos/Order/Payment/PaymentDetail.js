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
      className="p-2 bg-white border-top shadow-lg position-relative"
      style={{ 
        borderRadius: "24px 24px 0 0",
        zIndex: 10
      }}
    >
      <div className="d-flex justify-content-center mb-3">
        <div style={{ width: '40px', height: '4px', backgroundColor: '#e9ecef', borderRadius: '2px' }}></div>
      </div>

      {/* Chi tiết tạm tính */}
      <div className="d-flex justify-content-between align-items-center mb-1 px-1">
        <span className="text-muted fw-medium">
          Tạm tính ({totalQuantity} mặt hàng)
        </span>
        <span className="text-dark fw-semibold">
          {formatCurrency(total)}
        </span>
      </div>

      <hr className="my-3 opacity-50" />

      <div className="d-flex justify-content-between align-items-end mb-4 px-1">
        <div>
          <h6 className="fw-bold mb-1 text-dark text-uppercase" style={{ fontSize: '0.9rem', letterSpacing: '0.5px' }}>
            Tổng cộng
          </h6>
        </div>
        <div className="text-end">
          <h3
            className="fw-black mb-0 text-primary transition-all"
            style={{ fontSize: "1.7rem", lineHeight: '1' }}
          >
            {formatCurrency(total)}
          </h3>
        </div>
      </div>

      <button
        disabled={isEmpty}
        onClick={onOpenPayment}
        className={`btn w-100 py-3 rounded-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 border-0 transition-all ${
          isEmpty 
            ? "btn-light text-muted opacity-75" 
            : "btn-pay-gradient text-white"
        }`}
        style={{
          fontSize: "1rem",
          height: "55px",
        }}
      >
        {isEmpty ? (
          <>
            <i className="bi bi-cart-x fs-4"></i>
            CHƯA CÓ SẢN PHẨM
          </>
        ) : (
          <>
            <i className="bi bi-shield-check fs-4"></i>
            THANH TOÁN (F2)
          </>
        )}
      </button>

      <style jsx>{`
        .fw-black { font-weight: 900; }
        
        /* Gradient chuyên nghiệp cho nút thanh toán */
        .btn-pay-gradient {
          background: linear-gradient(135deg, #0d6efd 0%, #004dc7 100%);
          box-shadow: 0 4px 15px rgba(13, 110, 253, 0.3);
        }

        .btn-pay-gradient:hover:not(:disabled) {
          background: linear-gradient(135deg, #0b5ed7 0%, #003da1 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(13, 110, 253, 0.4);
        }

        .btn-pay-gradient:active {
          transform: translateY(0);
        }

        .transition-all {
          transition: all 0.2s ease-in-out;
        }

        /* Hiệu ứng focus cho nút */
        .btn:focus {
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
        }
      `}</style>
    </div>
  );
};

export default PaymentDetail;