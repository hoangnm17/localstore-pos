import { useState, useEffect } from "react";
import CustomerCreateModal from "./CustomerCreateModal";
import { useCustomerSearch } from "../../../../hooks/useCustomerSearch";

export default function CustomerSearch({
  invoiceId,
  customer,               // 👈 customer từ invoice
  onSelectCustomer        // 👈 callback cập nhật invoice
}) {
  const [phone, setPhone] = useState(customer?.phone || "");
  const [showCreate, setShowCreate] = useState(false);

  const { result, loading } = useCustomerSearch(phone);

  // Khi đổi tab → sync phone theo invoice
  useEffect(() => {
    setPhone(customer?.phone || "");
  }, [invoiceId, customer]);

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    if (!value || /^[0-9]+$/.test(value)) {
      setPhone(value);
    }
  };

  const handleClear = () => {
    setPhone("");
    onSelectCustomer(null); // 👈 clear customer trong invoice
  };

  const handleSelect = () => {
    if (result) {
      onSelectCustomer(result); // 👈 cập nhật vào invoice
    }
  };

  return (
    <div className="card border-0 shadow-sm rounded-4">
      <div className="card-body p-3">

        <div className="d-flex justify-content-between align-items-center mb-2">
          <label className="small fw-bold text-secondary text-uppercase mb-0">
            Khách hàng
          </label>
          {phone && (
            <button
              className="btn btn-sm p-0 text-danger border-0 bg-transparent"
              onClick={handleClear}
              style={{ fontSize: "0.75rem" }}
            >
              Làm mới
            </button>
          )}
        </div>

        <div className="position-relative">
          <input
            type="tel"
            className="form-control form-control-lg border-0 bg-light rounded-3 shadow-none"
            placeholder="Tìm theo số điện thoại..."
            value={phone}
            onChange={handlePhoneChange}
            maxLength={11}
          />

          {loading && (
            <div className="position-absolute top-50 end-0 translate-middle-y pe-3">
              <div className="spinner-border spinner-border-sm text-primary"></div>
            </div>
          )}
        </div>

        {(result || (phone.length >= 6 && !loading && !result)) && (
          <div className="mt-3 pt-2 border-top">

            {result && !loading && (
              <div
                className="d-flex align-items-center p-2 rounded-3 bg-primary bg-opacity-10 border border-primary border-opacity-10 cursor-pointer"
                onClick={handleSelect}
              >
                <div
                  className="avatar-circle bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold me-2"
                  style={{ width: "32px", height: "32px" }}
                >
                  {result.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="fw-bold text-primary">
                    {result.name}
                  </div>
                  <div className="text-muted small">
                    {result.phone} • {result.points} điểm
                  </div>
                </div>
              </div>
            )}

            {phone.length >= 6 && !loading && !result && (
              <div className="d-flex justify-content-between bg-light p-2 rounded-3">
                <span className="text-danger small">Chưa có thành viên</span>
                <button
                  className="btn btn-primary btn-sm"
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
            onSelectCustomer(newCustomer); // 👈 cập nhật invoice
            setShowCreate(false);
          }}
        />
      )}
    </div>
  );
}