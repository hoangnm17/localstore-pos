import { useState, useEffect, useRef } from "react";
import CustomerCreateModal from "app/pos/Order/Customer/CustomerCreateModal";
import { useCustomerSearch } from "hooks/pos/useCustomerSearch";
import 'style/POS/Customer.css'
import { POS_HOTKEYS } from "config/HotKey";

export default function CustomerSearch({
  invoiceId,
  customer,
  onSelectCustomer
}) {
  const [phone, setPhone] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const { result, loading } = useCustomerSearch(phone);
  const inputRef = useRef(null);

  useEffect(() => {
    setPhone("");
  }, [invoiceId]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // F1 -> focus input
      if (e.key === "F1") {
        e.preventDefault();
        inputRef.current?.focus();
      }

      // Ctrl + N -> mở tạo khách
      if (e.key === "F8") {
        e.preventDefault();
        setShowCreate(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    if (!value || /^[0-9]+$/.test(value)) {
      setPhone(value);
    }
  };

  const handleSelectCustomer = (cust) => {
    onSelectCustomer(cust);
    setPhone("");
  };

  const handleCreatedSuccess = (newCustomer) => {
    onSelectCustomer(newCustomer);
    setPhone("");
    setShowCreate(false);
  };

  return (
    <div className="customer-search-wrapper p-3 border-bottom bg-white">
      {/* HEADER */}
      <div className="d-flex align-items-center justify-content-between mb-2">
        <label className="customer-label">
          <i className="bi bi-person-bounding-box me-2"></i>
          KHÁCH HÀNG
        </label>
        {customer && (
          <span className="customer-badge-active">
            <i className="bi bi-check2-circle me-1"></i>Đã chọn
          </span>
        )}
      </div>

      {/* SEARCH & ACTION AREA */}
      {!customer ? (
        <div className="position-relative">
          <div className="d-flex gap-2">
            {/* Input Group */}
            <div className="search-box-container flex-grow-1">
              <i className="bi bi-search search-icon"></i>
              <input
                ref={inputRef}
                type="tel"
                className="form-control search-input"
                placeholder="Nhập SĐT tìm khách hàng..."
                value={phone}
                onChange={handlePhoneChange}
                maxLength={11}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (result.length > 0) {
                      handleSelectCustomer(result[0]);
                    } else if (phone.length >= 6) {
                      setShowCreate(true);
                    }
                  }

                  if (e.key === "Escape") {
                    onSelectCustomer(null);
                    setPhone("");
                  }
                }}
              />
              {loading && (
                <div className="spinner-border spinner-border-sm loader" />
              )}
            </div>

            <button
              className="btn btn-primary btn-create-customer"
              onClick={() => setShowCreate(true)}
              type="button"
              title="Thêm khách mới"
            >
              <i className="bi bi-person-plus-fill"></i>
            </button>
          </div>

          {/* DROPDOWN RESULTS */}
          {phone.length >= 3 && (
            <div className="search-results-dropdown shadow-lg">
              {result.length > 0 ? (
                <div className="list-group list-group-flush">
                  {result.map((cust) => (
                    <button
                      key={cust.id}
                      className="list-group-item list-group-item-action result-item"
                      onClick={() => handleSelectCustomer(cust)}
                    >
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-2">
                          <div className="avatar-circle">
                            <i className="bi bi-person"></i>
                          </div>
                          <div>
                            <div className="customer-name">{cust.name}</div>
                            <div className="customer-phone">{cust.phone}</div>
                          </div>
                        </div>
                        <span className="points-badge">
                          {cust.loyaltyPoints ?? 0} <i className="bi bi-star-fill ms-1"></i>
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : !loading && phone.length >= 6 && (
                <div className="p-3 text-center no-result">
                  <i className="bi bi-exclamation-circle d-block mb-1"></i>
                  Chưa có thông tin khách hàng này
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* SELECTED CUSTOMER CARD */
        <div className="selected-customer-card shadow-sm animate-fade-in">
          <div className="d-flex align-items-center gap-3">
            <div className="selected-icon">
              <i className="bi bi-person-check-fill"></i>
            </div>
            <div className="flex-grow-1">
              <div className="selected-name">{customer.name}</div>
              <div className="selected-sub">
                <span><i className="bi bi-telephone me-1"></i>{customer.phone}</span>
                <span className="mx-2">|</span>
                <span className="text-warning-emphasis fw-bold">
                  {customer.loyaltyPoints ?? 0} điểm
                </span>
              </div>
            </div>
            <button
              className="btn-remove-customer"
              onClick={() => {
                setPhone("");
                onSelectCustomer(null);
              }}
            >
              <i className="bi bi-trash3"></i>
            </button>
          </div>
        </div>
      )}

      {/* MODAL */}
      {showCreate && (
        <CustomerCreateModal
          phone={phone}
          onClose={() => setShowCreate(false)}
          onCreated={handleCreatedSuccess}
        />
      )}
    </div>
  );
}