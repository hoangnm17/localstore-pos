import { useEffect, useState } from "react";
import supplierService from "../../../services/Inventory/supplierService";

function EditSupplierModal({ isOpen, onClose, supplier, onUpdated }) {
  const [name, setName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Khi mở modal → fill dữ liệu
  useEffect(() => {
    if (supplier) {
      setName(supplier.name || "");
      setContactInfo(supplier.contactInfo || "");
      setAddress(supplier.address || "");
      setError("");
    }
  }, [supplier]);

  if (!isOpen || !supplier) return null;

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Tên nhà cung cấp không được để trống");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await supplierService.updateSupplier(supplier.id, {
        name: name.trim(),
        contactInfo,
        address,
      });

      onUpdated(); // reload list
      onClose();   // đóng modal
    } catch (err) {
      console.error("Update supplier error:", err);
      setError("Có lỗi xảy ra khi cập nhật");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Modal */}
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4 shadow">

            {/* Header */}
            <div className="modal-header">
              <h5 className="modal-title fw-bold">
                Chỉnh sửa nhà cung cấp
              </h5>
              <button
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>

            {/* Body */}
            <div className="modal-body">

              {error && (
                <div className="alert alert-danger py-2">
                  {error}
                </div>
              )}

              <div className="mb-3">
                <label className="form-label fw-medium">
                  Tên nhà cung cấp *
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập tên nhà cung cấp..."
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-medium">
                  Số điện thoại / Liên hệ
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="Nhập thông tin liên hệ..."
                />
              </div>

              <div className="mb-2">
                <label className="form-label fw-medium">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Nhập địa chỉ..."
                />
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

      {/* Backdrop nền tối */}
      <div className="modal-backdrop fade show"></div>
    </>
  );
}

export default EditSupplierModal;