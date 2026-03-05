import { useState } from "react";
import supplierService from "../../../services/Inventory/supplierService";

function CreateSupplierModal({ isOpen, onClose, onCreated }) {
  const [formData, setFormData] = useState({
    name: "",
    contactInfo: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await supplierService.createSupplier(formData);
      onCreated();
      onClose();
      setFormData({ name: "", contactInfo: "", address: "" });
    } catch (error) {
      console.error("Create supplier error:", error);
      // Bạn có thể thêm thông báo lỗi bằng toast/alert ở đây sau
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal fade show"
      tabIndex="-1"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.6)" }}
      aria-modal="true"
      role="dialog"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-xl rounded-4 overflow-hidden">
          {/* Header */}
          <div className="modal-header bg-gradient-primary text-white border-0 pb-0">
            <h5 className="modal-title fw-bold fs-4">Thêm Nhà Cung Cấp Mới</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          {/* Body */}
          <div className="modal-body pt-4 px-4 px-md-5">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="form-label fw-semibold text-muted">
                  Tên nhà cung cấp <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg rounded-3"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Ví dụ: Công ty ABC"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="contactInfo" className="form-label fw-semibold text-muted">
                  Thông tin liên hệ
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg rounded-3"
                  id="contactInfo"
                  name="contactInfo"
                  value={formData.contactInfo}
                  onChange={handleChange}
                  placeholder="SĐT / Email / Zalo..."
                />
              </div>

              <div className="mb-4">
                <label htmlFor="address" className="form-label fw-semibold text-muted">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg rounded-3"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Số nhà, đường, quận/huyện, thành phố..."
                />
              </div>

              {/* Footer */}
              <div className="d-flex justify-content-end gap-3 mt-5 pt-4 border-top">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-lg px-5"
                  onClick={onClose}
                  disabled={loading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg px-5 fw-bold"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Đang tạo...
                    </>
                  ) : (
                    "Tạo nhà cung cấp"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateSupplierModal;