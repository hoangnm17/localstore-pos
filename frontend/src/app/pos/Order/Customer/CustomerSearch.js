import { useState, useEffect, useRef } from "react";
import CustomerCreateModal from "app/pos/Order/Customer/CustomerCreateModal";
import { useCustomerSearch } from "hooks/pos/useCustomerSearch";
import useHotkeys from "hooks/pos/useHotKeys";
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

  useHotkeys({
    [POS_HOTKEYS.SEARCH_CUSTOMER]: () => {
      inputRef.current?.focus();
      inputRef.current?.select();
    },

    [POS_HOTKEYS.CREATE_CUSTOMER]: () => {
      setShowCreate(true);
    }
  });

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
          onCreated={(newCustomer) => {
            onSelectCustomer(newCustomer);
            setPhone("");
            setShowCreate(false);
          }}
        />
      )}

      <style>{customStyles}</style>
    </div>
  );
}

// --- CSS STYLES ---
const customStyles = `
  /* Container & Label */
  .customer-label {
    font-size: 11px;
    font-weight: 700;
    color: #64748b;
    letter-spacing: 0.05rem;
  }
  
  .customer-badge-active {
    background: #ecfdf5;
    color: #10b981;
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 20px;
    border: 1px solid #d1fae5;
  }

  /* Search Box */
  .search-box-container {
    position: relative;
    display: flex;
    align-items: center;
  }

  .search-icon {
    position: absolute;
    left: 12px;
    color: #94a3b8;
    pointer-events: none;
  }

  .search-input {
    padding-left: 36px !important;
    height: 42px;
    border-radius: 10px !important;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    font-size: 14px;
    transition: all 0.2s ease;
  }

  .search-input:focus {
    background: #fff;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .loader {
    position: absolute;
    right: 12px;
  }

  /* Create Button */
  .btn-create-customer {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
  }

  /* Dropdown Results */
  .search-results-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border-radius: 12px;
    margin-top: 8px;
    z-index: 1060;
    border: 1px solid #e2e8f0;
    overflow: hidden;
  }

  .result-item {
    padding: 10px 15px;
    border-bottom: 1px solid #f1f5f9;
  }

  .avatar-circle {
    width: 32px;
    height: 32px;
    background: #eff6ff;
    color: #3b82f6;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .customer-name {
    font-size: 13.5px;
    font-weight: 600;
    color: #1e293b;
  }

  .customer-phone {
    font-size: 11px;
    color: #64748b;
  }

  .points-badge {
    font-size: 11px;
    background: #fffbeb;
    color: #b45309;
    padding: 2px 8px;
    border-radius: 10px;
    font-weight: 600;
  }

  .no-result {
    font-size: 13px;
    color: #94a3b8;
  }

  /* Selected Customer Card */
  .selected-customer-card {
    background: linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%);
    border: 1px solid #bfdbfe;
    border-radius: 12px;
    padding: 12px;
  }

  .selected-icon {
    width: 44px;
    height: 44px;
    background: #3b82f6;
    color: white;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
  }

  .selected-name {
    font-size: 15px;
    font-weight: 700;
    color: #1e3a8a;
  }

  .selected-sub {
    font-size: 12px;
    color: #475569;
  }

  .btn-remove-customer {
    background: #fff;
    border: 1px solid #fecaca;
    color: #ef4444;
    width: 34px;
    height: 34px;
    border-radius: 8px;
    transition: all 0.2s;
  }

  .btn-remove-customer:hover {
    background: #ef4444;
    color: #fff;
  }

  .animate-fade-in {
    animation: fadeIn 0.3s ease-in-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;