import { useState, useEffect, useRef } from "react";
import { customerCreate } from "services/Customer/customer.service";
import BaseModal from "components/common/BaseModal";
import AlertMessage from "components/common/AlertMessage";
import { isValidPhone, isNotEmpty } from "utils/validators";
import { useNotification } from "components/global/Notification/NotificationContext";

export default function CustomerCreateModal({
  phone,
  onClose,
  onCreated,
}) {
  const [form, setForm] = useState({
    name: "",
    phone: phone || "",
  });

  const { showNotification } = useNotification();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const nameRef = useRef(null);
  const phoneRef = useRef(null);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      phone: phone || "",
    }));
  }, [phone]);

  const handleSubmit = async () => {
    if (saving) return;
    if (!isNotEmpty(form.name)) {
      setError("Vui lòng nhập tên khách hàng");
      nameRef.current?.focus();
      return;
    }

    if (!isValidPhone(form.phone)) {
      setError("Số điện thoại không hợp lệ");
      phoneRef.current?.focus();
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
      }

      const res = await customerCreate(payload);
      onCreated(res.data);
      showNotification("Tạo khách hàng thành công", "success");
      onClose();
    } catch (err) {
      setError(err?.message || "Có lỗi xảy ra.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <BaseModal onClose={onClose} disableClose={saving}>
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
              ref={nameRef}
              className="form-control"
              style={{
                borderRadius: "10px",
                padding: "10px 15px",
                backgroundColor: "#f8fafc",
              }}
              placeholder="Nhập tên khách hàng..."
              value={form.name}
              autoFocus
              onChange={(e) => {
                setError("");
                setForm({ ...form, name: e.target.value })
              }
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  phoneRef.current?.focus();
                }
              }}
            />
          </div>

          {/* PHONE */}
          <div className="mb-2">
            <label className="form-label small fw-semibold text-muted mb-1">
              SỐ ĐIỆN THOẠI
            </label>
            <input
              ref={phoneRef}
              className="form-control"
              style={{
                borderRadius: "10px",
                padding: "10px 15px",
                backgroundColor: "#f8fafc",
              }}
              placeholder="Nhập số điện thoại..."
              value={form.phone}
              inputMode="numeric"
              onChange={(e) => {
                setError("");
                setForm({
                  ...form,
                  phone: e.target.value.replace(/\D/g, ""),
                });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
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