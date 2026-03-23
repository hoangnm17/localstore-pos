import { useEffect, useState } from "react";

export default function BankPayment({
  qr,
  total,
}) {

  if (!qr) {
    return (
      <div className="text-center mt-3 text-muted small">
        Đang tạo QR...
      </div>
    );
  }

  return (
    <div className="mt-3">

      <div className="text-center mb-4">
        <div className="fw-bold mb-2">
          Quét QR để thanh toán
        </div>

        <div
          className="d-flex align-items-center justify-content-center border rounded-3 bg-white mx-auto"
          style={{ width: 220, height: 220 }}
        >
          <img
            src={qr.url}
            alt="VietQR"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </div>
      </div>

      <div className="border rounded-3 p-3 bg-light">

        <div className="d-flex justify-content-between mb-2">
          <span className="text-muted">Số tiền</span>
          <span className="fw-semibold">
            {Number(qr?.amount ?? total ?? 0).toLocaleString("vi-VN")} đ
          </span>
        </div>

        {qr.content && (
          <div className="d-flex justify-content-between">
            <span className="text-muted">Nội dung CK</span>
            <span className="fw-semibold">{qr.content}</span>
          </div>
        )}

      </div>

    </div>
  );
}