import { useEffect, useState } from "react";
import supplierService from "../../../services/Inventory/supplierService";

function EditSupplierModal({ isOpen, onClose, supplier, onUpdated }) {
  const [formData, setFormData] = useState({
    name: "",
    contactInfo: "",
    address: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // fill dữ liệu khi mở modal
  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name || "",
        contactInfo: supplier.contactInfo || "",
        address: supplier.address || "",
      });
      setErrors({});
    }
  }, [supplier]);

  if (!isOpen || !supplier) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // clear lỗi khi nhập lại
    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  const handleSubmit = async () => {
    let loi = {};

    if (!formData.name.trim()) loi.name = "Vui long nhap ten nha cung cap";
    if (!formData.contactInfo.trim()) loi.contactInfo = "Vui long nhap thong tin lien he";
    if (!formData.address.trim()) loi.address = "Vui long nhap dia chi";

    setErrors(loi);

    if (Object.keys(loi).length > 0) return;

    try {
      setLoading(true);

      await supplierService.updateSupplier(supplier.id, {
        name: formData.name.trim(),
        contactInfo: formData.contactInfo.trim(),
        address: formData.address.trim(),
      });

      onUpdated();
      onClose();
    } catch (err) {
      console.error("Update supplier error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4 shadow">

            {/* Header */}
            <div className="modal-header">
              <h5 className="modal-title fw-bold">
                Chỉnh sửa nhà cung cấp
              </h5>
              <button className="btn-close" onClick={onClose}></button>
            </div>

            {/* Body */}
            <div className="modal-body">

              {/* Name */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Tên nhà cung cấp *
                </label>
                <input
                  type="text"
                  name="name"
                  className={`form-control ${errors.name ? "is-invalid" : ""}`}
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nhập tên nhà cung cấp..."
                />
                {errors.name && <div className="text-danger mt-1">{errors.name}</div>}
              </div>

              {/* Contact */}
              <div className="mb-3">
                <label className="form-label fw-medium">
                  Số điện thoại / Liên hệ *
                </label>
                <input
                  type="text"
                  name="contactInfo"
                  className={`form-control ${errors.contactInfo ? "is-invalid" : ""}`}
                  value={formData.contactInfo}
                  onChange={handleChange}
                  placeholder="Nhập thông tin liên hệ..."
                />
                {errors.contactInfo && <div className="text-danger mt-1">{errors.contactInfo}</div>}
              </div>

              {/* Address */}
              <div className="mb-2">
                <label className="form-label fw-medium">
                  Địa chỉ *
                </label>
                <input
                  type="text"
                  name="address"
                  className={`form-control ${errors.address ? "is-invalid" : ""}`}
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Nhập địa chỉ..."
                />
                {errors.address && <div className="text-danger mt-1">{errors.address}</div>}
              </div>

            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Huỷ
              </button>

              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>

          </div>
        </div>
      </div>

      <div className="modal-backdrop fade show"></div>
    </>
  );
}

export default EditSupplierModal;