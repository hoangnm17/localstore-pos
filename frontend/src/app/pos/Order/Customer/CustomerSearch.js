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
    setPhone("");
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
    <div className="border-bottom p-2">

      {/* INPUT */}
      <div className="d-flex align-items-center gap-2">
        <input
          type="tel"
          className="form-control form-control-sm"
          placeholder="SĐT khách hàng..."
          value={phone}
          onChange={handlePhoneChange}
          maxLength={11}
        />

        {loading && (
          <div className="spinner-border spinner-border-sm text-primary" />
        )}
      </div>

      {/* SEARCH RESULT */}
      {phone.length >= 6 && !loading && (
        <div className="mt-2">

          {result.length > 0 ? (
            result.map((cust) => (
              <div
                key={cust.id}
                className="small py-1 px-2 rounded bg-light cursor-pointer"
                style={{ cursor: "pointer" }}
                onClick={() => handleSelectCustomer(cust)}
              >
                <strong>{cust.name}</strong> — {cust.phone}
                <span className="text-warning ms-2">
                  {cust.loyaltyPoints ?? 0}đ
                </span>
              </div>
            ))
          ) : (
            <div className="small text-danger d-flex justify-content-between">
              <span>Chưa có thành viên</span>
              <button
                className="btn btn-sm btn-primary py-0 px-2"
                onClick={() => setShowCreate(true)}
              >
                + Tạo
              </button>
            </div>
          )}

        </div>
      )}

      {/* DISPLAY SELECTED CUSTOMER */}
      {customer && (
        <div className="mt-2 small d-flex align-items-center text-primary">

          <div className="flex-grow-1">
            <strong>{customer.name}</strong> — {customer.phone}
            <span className="text-warning ms-2">
              <strong>{customer.loyaltyPoints ?? 0} điểm</strong>
            </span>
          </div>

          <i
            className="bi bi-x-circle-fill text-danger ms-2 cursor-pointer"
            style={{ fontSize: "0.9rem", cursor: "pointer" }}
            onClick={() => onSelectCustomer(null)}
            title="Xóa khách"
          />
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