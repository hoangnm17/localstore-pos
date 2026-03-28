import { useState, useEffect, useRef } from "react";
import { customerCreate } from "services/Customer/customer.service";
import BaseModal from "components/common/BaseModal";
import AlertMessage from "components/common/AlertMessage";
import { isValidPhone, isNotEmpty } from "utils/validators";
import { useNotification } from "components/global/Notification/NotificationContext";
import useTitle from "hooks/common/useTitle";
import 'style/POS/Customer.css'

export default function CustomerCreateModal({ phone, onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", phone: phone || "" });
  const { showNotification } = useNotification();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const nameRef = useRef(null);
  const phoneRef = useRef(null);

  useTitle("Thêm khách hàng")
  useEffect(() => {
    setForm((prev) => ({ ...prev, phone: phone || "" }));
  }, [phone]);

  const handleSubmit = async () => {
    if (saving) return;

    if (!isNotEmpty(form.name.trim())) {
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
      };

      const res = await customerCreate(payload);
      if (res?.success === false) {
        throw new Error(res.message || "Số điện thoại này đã tồn tại.");
      }

      showNotification("Tạo khách hàng thành công", "success");
      onCreated(res.data.data || res);
      onClose();

    } catch (err) {
      const serverMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Có lỗi xảy ra khi kết nối server.";

      setError(serverMsg);

      if (serverMsg.toLowerCase().includes("điện thoại")) {
        setTimeout(() => phoneRef.current?.focus(), 10);
      } else {
        setTimeout(() => nameRef.current?.focus(), 10);
      }

    } finally {
      setSaving(false);
    }
  };

  return (
    <BaseModal onClose={onClose} disableClose={saving}>
      <div className="customer-modal-premium">
        <div className="modal-header-section">
          <div className="header-content">
            <div className="header-icon">
              <i className="bi bi-person-plus-fill"></i>
            </div>
            <div>
              <h4 className="modal-title">Khách hàng mới</h4>
              <p className="modal-subtitle">Thông tin này sẽ được dùng để tích điểm</p>
            </div>
          </div>
          <button className="btn-close-minimal" onClick={onClose} disabled={saving}>
            <i className="bi bi-x"></i>
          </button>
        </div>

        <div className="modal-body-section">
          <form onSubmit={handleSubmit}>
            <div className="input-group-custom">
              <label className="input-label">Họ và tên</label>
              <div className={`input-field-wrapper ${error && !form.name ? 'field-error' : ''}`}>
                <i className="bi bi-person field-icon"></i>
                <input
                  ref={nameRef}
                  type="text"
                  placeholder="Nguyễn Văn A..."
                  value={form.name}
                  autoFocus
                  disabled={saving}
                  onChange={(e) => {
                    setError("");
                    setForm({ ...form, name: e.target.value });
                  }}
                  onKeyDown={(e) => e.key === "Enter" && phoneRef.current?.focus()}
                />
              </div>
            </div>

            <div className="input-group-custom">
              <label className="input-label">Số điện thoại</label>
              <div className={`input-field-wrapper ${error.includes("điện thoại") ? 'field-error' : ''}`}>
                <i className="bi bi-telephone field-icon"></i>
                <input
                  ref={phoneRef}
                  type="tel"
                  placeholder="09xx xxx xxx"
                  value={form.phone}
                  disabled={saving}
                  inputMode="numeric"
                  onChange={(e) => {
                    setError("");
                    setForm({ ...form, phone: e.target.value.replace(/\D/g, "") });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                />
              </div>
            </div>
          </form>

          <div className="alert-wrapper">
            <AlertMessage message={error} />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="modal-footer-section">
          <button className="btn-cancel" onClick={onClose} disabled={saving}>
            Hủy bỏ
          </button>
          <button className="btn-submit" onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Đang xử lý...
              </>
            ) : (
              <>
                <i className="bi bi-check-lg me-2"></i>
                Lưu khách hàng
              </>
            )}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}