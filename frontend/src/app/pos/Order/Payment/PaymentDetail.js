import React, { useMemo } from "react";

const PaymentDetail = ({ items = [], onOpenPayment }) => {

  // ✅ SỬA: tính đúng tổng tiền
  const total = useMemo(() => {
    return items.reduce(
      (sum, i) => sum + i.unitPrice * i.quantity,
      0
    );
  }, [items]);

  // ✅ SỬA: tính đúng tổng số lượng (không phải số dòng)
  const totalQuantity = useMemo(() => {
    return items.reduce((sum, i) => sum + i.quantity, 0);
  }, [items]);

  const isEmpty = items.length === 0;

  // ✅ SỬA: chuẩn hoá format tiền VND
  const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND"
    }).format(value);

  return (
    <div
      className="p-4 bg-white border-top shadow-lg"
      style={{ borderRadius: "20px 20px 0 0" }}
    >
      {/* Tạm tính */}
      <div className="d-flex justify-content-between align-items-center mb-2 px-1">
        <span className="text-secondary small fw-medium">
          {/* ✅ SỬA: dùng totalQuantity thay vì items.length */}
          Tạm tính ({totalQuantity} món)
        </span>
        <span className="text-dark fw-bold">
          {/* ✅ SỬA: dùng formatCurrency */}
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
          {/* ✅ SỬA: formatCurrency thay vì toLocaleString */}
          {formatCurrency(total)}
        </h4>
      </div>

      {/* Button */}
      <button
        disabled={isEmpty}
        onClick={onOpenPayment}
        className={`btn w-100 py-3 rounded-4 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 ${
          isEmpty ? "btn-light text-muted" : "btn-primary"
        }`}
        style={{
          fontSize: "1.1rem",
          letterSpacing: "0.5px",
          height: "60px",
        }}
      >
        <i
          className={`bi ${
            isEmpty ? "bi-cart-x" : "bi-credit-card-2-front"
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