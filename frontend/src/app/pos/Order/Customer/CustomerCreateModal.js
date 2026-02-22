import { useState, useEffect } from "react";
import { customerCreate } from "../../../../services/Customer/customer.service";
import BaseModal from "../../../../components/common/BaseModal";
import AlertMessage from "../../../../components/common/AlertMessage";
import { isValidPhone, isNotEmpty } from "../../../../utils/validators";

export default function CustomerCreateModal({
  phone,
  onClose,
  onCreated,
}) {
  const [form, setForm] = useState({
    name: "",
    phone: phone || "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Sync phone khi prop thay đổi
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      phone: phone || "",
    }));
  }, [phone]);

  const handleSubmit = async () => {
    if (!isNotEmpty(form.name)) {
      setError("Vui lòng nhập tên khách hàng");
      return;
    }

    if (!isValidPhone(form.phone)) {
      setError("Số điện thoại không hợp lệ");
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
    <BaseModal onClose={onClose}>
      <div
        className="modal-content border-0 shadow-lg bg-white"
        style={{
          borderRadius: "16px",
          maxWidth: "400px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}
        <div className="modal-header border-0 pt-4 px-4 pb-2">
          <h5 className="modal-title fw-bold text-dark">
            Thêm khách hàng mới
          </h5>
          <button
            className="btn-close shadow-none"
            onClick={onClose}
            disabled={saving}
          />
        </div>

        {/* BODY */}
        <div className="modal-body px-4">
          {/* NAME */}
          <div className="mb-3">
            <label className="form-label small fw-semibold text-muted mb-1">
              TÊN KHÁCH HÀNG
            </label>
            <input
              className="form-control"
              style={{
                borderRadius: "10px",
                padding: "10px 15px",
                backgroundColor: "#f8fafc",
              }}
              placeholder="Nhập tên khách hàng..."
              value={form.name}
              autoFocus
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />
          </div>

          {/* PHONE */}
          <div className="mb-2">
            <label className="form-label small fw-semibold text-muted mb-1">
              SỐ ĐIỆN THOẠI
            </label>
            <input
              className="form-control"
              style={{
                borderRadius: "10px",
                padding: "10px 15px",
                backgroundColor: "#f8fafc",
              }}
              placeholder="Nhập số điện thoại..."
              value={form.phone}
              inputMode="numeric"
              onChange={(e) =>
                setForm({
                  ...form,
                  phone: e.target.value.replace(/\D/g, ""),
                })
              }
            />
          </div>

          <AlertMessage message={error} />
        </div>

        {/* FOOTER */}
        <div className="modal-footer border-0 pb-4 px-4 pt-3 d-flex gap-2">
          <button
            className="btn btn-light flex-grow-1"
            onClick={onClose}
            disabled={saving}
          >
            Hủy
          </button>

          <button
            className="btn btn-primary flex-grow-1"
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
    </BaseModal>
  );
}