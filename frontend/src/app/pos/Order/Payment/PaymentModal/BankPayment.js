import { useEffect, useState } from "react";

export default function BankPayment({
  qr,
  total,
  expiresAt,
}) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    console.log(expiresAt);
  }, [])
  /* ===== COUNTDOWN ===== */
  useEffect(() => {
    if (!expiresAt) return;
    
    
    const updateTime = () => {
      const now = new Date();
      const expire = new Date(expiresAt);
      const diff = Math.max(0, expire - now);
      setTimeLeft(diff);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const formatTime = (ms) => {
    if (!ms || ms <= 0) return "00:00";

    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;

    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const isExpired = timeLeft === 0;

  /* ===== UI ===== */

  if (!qr) {
    return (
      <div className="text-center mt-3 text-muted small">
        Đang tạo QR...
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="text-center mt-4">
        <div className="text-danger fw-semibold mb-2">
          QR đã hết hạn
        </div>
        <div className="small text-muted">
          Vui lòng tạo lại mã QR
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3">

      {/* ===== COUNTDOWN ===== */}
      <div className="text-center mb-2">
        <span className="small text-muted">
          Hết hạn sau:{" "}
        </span>
        <span className="fw-bold text-danger">
          {formatTime(timeLeft)}
        </span>
      </div>

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