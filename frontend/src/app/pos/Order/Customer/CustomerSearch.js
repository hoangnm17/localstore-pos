import { useState } from "react";
import CustomerCreateModal from "./CustomerCreateModal";
import { useCustomerSearch } from "../../../../hooks/useCustomerSearch";

export default function CustomerSearch() {
  const [phone, setPhone] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const { customer, loading, setCustomer } = useCustomerSearch(phone);

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    if (!value || /^[0-9]+$/.test(value)) {
      setPhone(value);
    }
  };

  const handleClear = () => {
    setPhone("");
    setCustomer(null);
  };

  return (
    <div className="card border-0 shadow-sm rounded-4">
      <div className="card-body p-3">
        
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <label className="small fw-bold text-secondary text-uppercase mb-0">
            Khách hàng
          </label>
          {phone && (
            <button 
              className="btn btn-sm p-0 text-danger border-0 bg-transparent" 
              onClick={handleClear}
              style={{ fontSize: '0.75rem' }}
            >
              Làm mới
            </button>
          )}
        </div>

        {/* INPUT SEARCH */}
        <div className="position-relative">
          <input
            type="tel"
            className="form-control form-control-lg border-0 bg-light rounded-3 shadow-none"
            placeholder="Tìm theo số điện thoại..."
            value={phone}
            onChange={handlePhoneChange}
            maxLength={11}
            style={{ fontSize: '0.95rem', paddingRight: '40px' }}
          />
          {loading && (
            <div className="position-absolute top-50 end-0 translate-middle-y pe-3">
              <div className="spinner-border spinner-border-sm text-primary" style={{ width: '1rem', height: '1rem' }}></div>
            </div>
          )}
        </div>

        {/* CHỈ HIỂN THỊ KHI CÓ DỮ LIỆU HOẶC CẦN TẠO MỚI */}
        {(customer || (phone.length >= 6 && !loading && !customer)) && (
          <div className="mt-3 pt-2 border-top">
            
            {/* 1. Khi tìm thấy khách hàng */}
            {customer && !loading && (
              <div className="d-flex align-items-center p-2 rounded-3 bg-primary bg-opacity-10 border border-primary border-opacity-10">
                <div className="avatar-circle bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold me-2" 
                     style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <div className="fw-bold text-primary text-truncate" style={{ fontSize: '0.9rem' }}>{customer.name}</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                    {customer.phone} • <span className="text-dark fw-medium">{customer.points} điểm</span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Khi không tìm thấy */}
            {phone.length >= 6 && !loading && !customer && (
              <div className="d-flex align-items-center justify-content-between bg-light p-2 rounded-3 border border-dashed">
                <span className="text-danger small fw-medium">Chưa có thành viên</span>
                <button
                  className="btn btn-primary btn-sm rounded-pill fw-bold"
                  style={{ fontSize: '0.7rem' }}
                  onClick={() => setShowCreate(true)}
                >
                  + ĐĂNG KÝ
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showCreate && (
        <CustomerCreateModal
          phone={phone}
          onClose={() => setShowCreate(false)}
          onCreated={(newCustomer) => {
            setCustomer(newCustomer);
            setShowCreate(false);
          }}
        />
      )}
    </div>
  );
}