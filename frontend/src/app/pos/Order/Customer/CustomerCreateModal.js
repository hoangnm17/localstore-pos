import { useState } from "react";
import { customerCreate } from "../../../../services/Customer/customer.service";

export default function CustomerCreateModal({ phone, onClose, onCreated }) {
  const [form, setForm] = useState({
    name: "",
    phone: phone,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("Vui lòng nhập tên khách hàng");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const res = await customerCreate(form);
      onCreated(res.data);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Tạo khách hàng thất bại. Vui lòng thử lại!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="modal fade show"
      style={{ 
        display: "block", 
        backgroundColor: "rgba(15, 23, 42, 0.6)", // Overlay đậm chất Modern
        backdropFilter: "blur(4px)" // Làm mờ hậu cảnh
      }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: "400px" }} // Giới hạn chiều rộng cho tinh tế
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "16px" }}>
          
          {/* HEADER: Font chữ đậm hơn và padding thoáng */}
          <div className="modal-header border-0 pt-4 px-4 pb-2">
            <h5 className="modal-title fw-bold text-dark">Thêm khách hàng mới</h5>
            <button
              className="btn-close shadow-none"
              onClick={onClose}
              disabled={saving}
              style={{ fontSize: "0.8rem" }}
            />
          </div>

          {/* BODY: Tinh chỉnh Input và Label */}
          <div className="modal-body px-4">
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted mb-1">
                TÊN KHÁCH HÀNG
              </label>
              <input
                className={`form-control ${error ? 'is-invalid' : ''}`}
                style={{ 
                  borderRadius: "10px", 
                  padding: "10px 15px",
                  backgroundColor: "#f8fafc"
                }}
                placeholder="Nhập tên khách hàng..."
                value={form.name}
                autoFocus
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="mb-2">
              <label className="form-label small fw-semibold text-muted mb-1">
                SỐ ĐIỆN THOẠI
              </label>
              <input
                className="form-control border-dashed"
                style={{ 
                  borderRadius: "10px", 
                  padding: "10px 15px",
                  backgroundColor: "#f1f5f9",
                  color: "#64748b",
                  borderStyle: "dashed" 
                }}
                value={form.phone}
                disabled
              />
            </div>

            {error && (
              <div className="alert alert-danger py-2 px-3 rounded-3 mt-3 mb-0 border-0" style={{ fontSize: "0.85rem" }}>
                <i className="bi bi-exclamation-circle me-2"></i>{error}
              </div>
            )}
          </div>

          {/* FOOTER: Nút bấm to, rõ ràng */}
          <div className="modal-footer border-0 pb-4 px-4 pt-3">
            <button
              className="btn btn-light fw-medium flex-grow-1"
              style={{ borderRadius: "10px", padding: "10px", color: "#64748b" }}
              onClick={onClose}
              disabled={saving}
            >
              Hủy
            </button>

            <button
              className="btn btn-primary fw-medium flex-grow-1 shadow-sm"
              style={{ 
                borderRadius: "10px", 
                padding: "10px",
                backgroundColor: "#4f46e5",
                borderColor: "#4f46e5"
              }}
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? (
                <span className="spinner-border spinner-border-sm"></span>
              ) : (
                "Lưu thông tin"
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}