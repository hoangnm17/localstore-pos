import { useState } from "react";
import supplierService from "../../../services/Inventory/supplierService";

function CreateSupplierModal({ isOpen, onClose, onCreated }) {
  const [formData, setFormData] = useState({
    name: "",
    contactInfo: "",
    address: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let loi = {};

    if (!formData.name.trim()) loi.name = "Vui long nhap ten nha cung cap";
    if (!formData.contactInfo.trim()) loi.contactInfo = "Vui long nhap thong tin lien he";
    if (!formData.address.trim()) loi.address = "Vui long nhap dia chi";

    setErrors(loi);

    if (Object.keys(loi).length > 0) return;

    try {
      setLoading(true);

      const res = await supplierService.createSupplier(formData);

      if (!res?.data?.success) {
        onCreated(false);
        return;
      }

      onCreated(true);
      onClose();

      setFormData({ name: "", contactInfo: "", address: "" });
      setErrors({});
    } catch (error) {
      console.error("Create supplier error:", error);
      onCreated(false);
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
            ></button>
          </div>

          {/* Body */}
          <div className="modal-body pt-4 px-4 px-md-5">
            <form onSubmit={handleSubmit}>

              {/* Name */}
              <div className="mb-4">
                <label className="form-label fw-semibold text-muted">
                  Tên nhà cung cấp <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control form-control-lg rounded-3 ${errors.name ? "is-invalid" : ""}`}
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ví dụ: Công ty ABC"
                />
                {errors.name && <div className="text-danger mt-1">{errors.name}</div>}
              </div>

              {/* Contact */}
              <div className="mb-4">
                <label className="form-label fw-semibold text-muted">
                  Thông tin liên hệ <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control form-control-lg rounded-3 ${errors.contactInfo ? "is-invalid" : ""}`}
                  name="contactInfo"
                  value={formData.contactInfo}
                  onChange={handleChange}
                  placeholder="SĐT / Email / Zalo..."
                />
                {errors.contactInfo && <div className="text-danger mt-1">{errors.contactInfo}</div>}
              </div>

              {/* Address */}
              <div className="mb-4">
                <label className="form-label fw-semibold text-muted">
                  Địa chỉ <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control form-control-lg rounded-3 ${errors.address ? "is-invalid" : ""}`}
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Số nhà, đường, quận/huyện, thành phố..."
                />
                {errors.address && <div className="text-danger mt-1">{errors.address}</div>}
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
                      <span className="spinner-border spinner-border-sm me-2"></span>
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