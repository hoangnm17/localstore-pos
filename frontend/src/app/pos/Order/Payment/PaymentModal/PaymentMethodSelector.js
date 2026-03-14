export default function PaymentMethodSelector({
  method,
  setMethod,
  disabled = false,
}) {
  const METHODS = [
    { id: "CASH", label: "Tiền mặt", icon: "bi-cash-stack" },
    { id: "BANK", label: "Chuyển khoản", icon: "bi-qr-code-scan" },
  ];

  return (
    <div className="mb-4">
      <label className="form-label small fw-bold text-muted">
        HÌNH THỨC
      </label>

      <div className="d-flex gap-2">
        {METHODS.map((m) => (
          <button
            key={m.id}
            type="button"
            disabled={disabled}
            className={`btn flex-grow-1 py-3 fw-bold rounded-3 border-2 d-flex flex-column align-items-center gap-1 ${
              method === m.id
                ? "btn-primary border-primary shadow"
                : "btn-light text-secondary border-light bg-light"
            }`}
            onClick={() => setMethod(m.id)}
          >
            <i className={`bi ${m.icon} fs-4`} />
            <span>{m.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}