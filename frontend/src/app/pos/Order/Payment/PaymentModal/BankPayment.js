export default function BankPayment({ total, onConfirm }) {
  return (
    <>
      <div className="text-center mb-4">
        <div className="fw-bold mb-2">
          Quét QR để thanh toán
        </div>

        <div
          style={{
            width: 200,
            height: 200,
            background: "#eee",
            margin: "0 auto",
          }}
        />
      </div>

      <button
        className="btn btn-primary w-100"
        onClick={() =>
          onConfirm({
            customerPay: total,
          })
        }
      >
        ĐÃ THANH TOÁN
      </button>
    </>
  );
}