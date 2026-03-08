import { useEffect, useState } from "react";
import { createBankPayment } from "services/Payment/payment.service";

export default function BankPayment({
  total,
  invoiceId,
  discount,
  onPaid = () => {},
}) {
  const [loading, setLoading] = useState(true);
  const [qrUrl, setQrUrl] = useState("");
  const [qrContent, setQrContent] = useState("");
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!invoiceId) return;

    let eventSource;

    const init = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await createBankPayment(invoiceId, { discount });

        const data = res?.data?.data;

        setQrUrl(data?.qr?.url || "");
        setQrContent(data?.qr?.content || "");
        setAmount(data?.qr?.amount || 0);

        eventSource = new EventSource("http://localhost:5000/api/sse");

        eventSource.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);

            if (
              payload?.type === "PAYMENT_SUCCESS" &&
              String(payload?.invoiceId) === String(invoiceId)
            ) {
              onPaid(payload);
            }
          } catch (err) {
            console.error("SSE parse error:", err);
          }
        };

        eventSource.onerror = (err) => {
          console.error("SSE error:", err);
        };
      } catch (err) {
        console.error("QR error", err);
        setError("Không thể tạo mã QR");
      } finally {
        setLoading(false);
      }
    };

    init();

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [invoiceId, discount]);

  return (
    <div className="mt-3">
      <div className="text-center mb-4">
        <div className="fw-bold mb-2">Quét QR để thanh toán</div>

        <div
          className="d-flex align-items-center justify-content-center border rounded-3 bg-white mx-auto"
          style={{ width: 220, height: 220 }}
        >
          {loading ? (
            <div className="text-muted small">Đang tạo QR...</div>
          ) : error ? (
            <div className="text-danger small px-3 text-center">{error}</div>
          ) : qrUrl ? (
            <img
              src={qrUrl}
              alt="VietQR Payment"
              style={{ width: 280, height: 280, objectFit: "contain" }}
            />
          ) : (
            <div className="text-muted small">Không có dữ liệu QR</div>
          )}
        </div>
      </div>

      <div className="border rounded-3 p-3 bg-light">
        <div className="d-flex justify-content-between mb-2">
          <span className="text-muted">Số tiền</span>
          <span className="fw-semibold">
            {Number(amount || total || 0).toLocaleString("vi-VN")} đ
          </span>
        </div>

        {qrContent && (
          <div className="d-flex justify-content-between">
            <span className="text-muted">Nội dung CK</span>
            <span className="fw-semibold">{qrContent}</span>
          </div>
        )}
      </div>
    </div>
  );
}