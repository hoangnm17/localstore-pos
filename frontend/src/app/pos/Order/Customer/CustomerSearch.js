import { useState, useEffect } from "react";
import CustomerCreateModal from "app/pos/Order/Customer/CustomerCreateModal";
import { useCustomerSearch } from "hooks/pos/useCustomerSearch";

export default function CustomerSearch({
  invoiceId,
  customer,
  onSelectCustomer
}) {
  const [phone, setPhone] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const { result, loading } = useCustomerSearch(phone);

  useEffect(() => {
    // whenever invoice or selected customer updates we want to reflect it
    setPhone(customer?.phone || "");
  }, [invoiceId]);

  const handlePhoneChange = (e) => {
    const value = e.target.value;

    if (!value || /^[0-9]+$/.test(value)) {
      if (customer) {
        onSelectCustomer(null);
      }
      setPhone(value);
    }
  };

  const handleSelectCustomer = (cust) => {
    onSelectCustomer(cust);
    setPhone("");
  };

  return (
    <div
      className="border-bottom"
      style={{
        padding: 12,
        background: "#fff",
      }}
    >
      {/* LABEL */}
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div className="fw-semibold" style={{ fontSize: 13, color: "#0f172a" }}>
          Khách hàng
        </div>
      </div>

      <div
        className="d-flex align-items-center gap-2"
        style={{
          border: "1px solid #e5e7eb",
          background: "#f8fafc",
          borderRadius: 14,
          padding: "8px 10px",
        }}
      >
        <span style={{ opacity: 0.7 }}>📞</span>

        <input
          type="tel"
          className="form-control form-control-sm border-0"
          style={{
            background: "transparent",
            boxShadow: "none",
            padding: "6px 8px",
          }}
          placeholder="Nhập SĐT khách hàng..."
          value={phone}
          onChange={handlePhoneChange}
          maxLength={11}
        />

        {loading && (
          <div className="spinner-border spinner-border-sm text-primary" />
        )}
      </div>

      {phone.length >= 6 && !loading && (
        <div className="mt-2">
          {result.length > 0 ? (
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 14,
                overflow: "hidden",
                background: "#fff",
              }}
            >
              {result.map((cust) => (
                <button
                  key={cust.id}
                  type="button"
                  className="w-100 text-start border-0"
                  style={{
                    padding: "10px 12px",
                    background: "#fff",
                    cursor: "pointer",
                  }}
                  onClick={() => handleSelectCustomer(cust)}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f8fafc")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#fff")
                  }
                >
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <div
                        className="fw-semibold"
                        style={{ fontSize: 13, color: "#0f172a" }}
                      >
                        {cust.name}
                      </div>
                      <div className="small text-muted">{cust.phone}</div>
                    </div>

                    <span
                      className="badge bg-warning text-dark"
                      style={{ borderRadius: 999 }}
                    >
                      {cust.loyaltyPoints ?? 0} điểm
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div
              className="d-flex align-items-center justify-content-between"
              style={{
                border: "1px dashed #cbd5e1",
                background: "#f8fafc",
                borderRadius: 14,
                padding: "10px 12px",
              }}
            >
              <span className="small text-muted">Chưa có thành viên</span>

              <button
                className="btn btn-sm btn-primary"
                style={{
                  borderRadius: 12,
                  padding: "6px 10px",
                }}
                onClick={() => setShowCreate(true)}
                type="button"
              >
                + Tạo
              </button>
            </div>
          )}
        </div>
      )}

      {customer && (
        <div
          className="mt-2 d-flex align-items-center justify-content-between"
          style={{
            border: "1px solid #dbeafe",
            background: "#eff6ff",
            borderRadius: 14,
            padding: "10px 12px",
          }}
        >
          <div className="flex-grow-1">
            <div className="fw-semibold" style={{ color: "#1d4ed8" }}>
              {customer.name}
            </div>
            <div className="small" style={{ color: "#334155" }}>
              {customer.phone}
              <span
                className="badge bg-warning text-dark ms-2"
                style={{ borderRadius: 999 }}
              >
                {customer.loyaltyPoints ?? 0} điểm
              </span>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            style={{ borderRadius: 12, padding: "6px 10px" }}
            onClick={() => onSelectCustomer(null)}
            title="Xóa khách"
          >
            ✕
          </button>
        </div>
      )}

      {showCreate && (
        <CustomerCreateModal
          phone={phone}
          onClose={() => setShowCreate(false)}
          onCreated={(newCustomer) => {
            onSelectCustomer(newCustomer);
            setPhone("");
            setShowCreate(false);
          }}
        />
      )}
    </div>
  );
}