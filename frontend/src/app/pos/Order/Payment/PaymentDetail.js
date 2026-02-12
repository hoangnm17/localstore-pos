import React from "react";

const PaymentDetail = ({ items, customer, onOpenPayment }) => {
  // Tính tổng tiền
  const total = items.reduce(
    (sum, i) => sum + i.unitPrice * i.quantity,
    0
  );

  return (
    <div className="p-4 bg-white border-top shadow-lg rounded-t-4" style={{ borderRadius: '20px 20px 0 0' }}>
      {/* Tóm tắt nhanh số lượng */}
      <div className="d-flex justify-content-between align-items-center mb-2 px-1">
        <span className="text-secondary small fw-medium">Tạm tính ({items.length} món)</span>
        <span className="text-dark fw-bold">{total.toLocaleString()} đ</span>
      </div>

      {/* Dòng Tổng cộng nổi bật */}
      <div className="d-flex justify-content-between align-items-center mb-4 px-1">
        <h5 className="fw-bold mb-0 text-dark">Tổng thanh toán</h5>
        <h4 className="fw-black mb-0 text-primary" style={{ fontSize: '1.75rem' }}>
          {total.toLocaleString()} <small style={{ fontSize: '1rem' }}>đ</small>
        </h4>
      </div>

      {/* Nút thanh toán */}
      <button
        disabled={items.length === 0}
        onClick={() =>
          onOpenPayment({
            items,
            customer,
            total,
          })
        }
        className={`btn w-100 py-3 rounded-4 fw-bold shadow-sm transition-all d-flex align-items-center justify-content-center gap-2 ${
          items.length === 0 
            ? "btn-light text-muted" 
            : "btn-primary"
        }`}
        style={{ 
          fontSize: '1.1rem',
          letterSpacing: '0.5px',
          height: '60px'
        }}
      >
        <i className={`bi ${items.length === 0 ? 'bi-cart-x' : 'bi-credit-card-2-front'} fs-5`}></i>
        {items.length === 0 ? "Giỏ hàng trống" : "THANH TOÁN NGAY"}
      </button>

      {/* Hiệu ứng hover cho nút (nếu dùng CSS-in-JS hoặc style inline) */}
      <style>{`
        .fw-black { font-weight: 900; }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 15px rgba(13, 110, 253, 0.2) !important;
        }
        .rounded-t-4 { border-radius: 1.5rem 1.5rem 0 0 !important; }
      `}</style>
    </div>
  );
};

export default PaymentDetail;
