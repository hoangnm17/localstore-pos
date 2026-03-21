import { useState, useEffect, useRef } from "react";
import { customerCreate } from "services/Customer/customer.service";
import BaseModal from "components/common/BaseModal";
import AlertMessage from "components/common/AlertMessage";
import { isValidPhone, isNotEmpty } from "utils/validators";
import { useNotification } from "components/global/Notification/NotificationContext";
import useTitle from "hooks/common/useTitle";

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
      setError("Số điện thoại không hợp lệ (10 chữ số)");
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
      onCreated(res.data || res);
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

      <style jsx>{`
        .customer-modal-premium {
          background: #ffffff;
          border-radius: 28px;
          max-width: 440px;
          width: 100%;
          margin: 0 auto;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
        }

        .modal-header-section {
          padding: 32px 32px 20px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .header-content {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .header-icon {
          width: 48px;
          height: 48px;
          background: #eff6ff;
          color: #2563eb;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
        }

        .modal-title {
          font-weight: 800;
          color: #1e293b;
          margin: 0;
          font-size: 1.25rem;
        }

        .modal-subtitle {
          color: #64748b;
          font-size: 0.85rem;
          margin: 4px 0 0;
        }

        .btn-close-minimal {
          border: none;
          background: #f1f5f9;
          color: #64748b;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .btn-close-minimal:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .modal-body-section {
          padding: 0 32px;
        }

        .input-group-custom {
          margin-bottom: 20px;
        }

        .input-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }

        .input-field-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          background: #f8fafc;
          border: 2px solid #f1f5f9;
          border-radius: 16px;
          padding: 4px 16px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .input-field-wrapper:focus-within {
          background: #ffffff;
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }

        .field-error {
          border-color: #fecaca;
          background: #fff8f8;
        }

        .field-icon {
          color: #94a3b8;
          font-size: 18px;
          margin-right: 12px;
        }

        .input-field-wrapper input {
          border: none;
          background: transparent;
          width: 100%;
          padding: 12px 0;
          font-size: 0.95rem;
          color: #1e293b;
          font-weight: 500;
          outline: none;
        }

        .alert-wrapper {
          min-height: 40px;
          margin-top: 8px;
        }

        .modal-footer-section {
          padding: 20px 32px 32px;
          display: flex;
          gap: 12px;
        }

        .btn-cancel {
          flex: 1;
          padding: 14px;
          border-radius: 16px;
          border: none;
          background: #f1f5f9;
          color: #475569;
          font-weight: 700;
          transition: all 0.2s;
        }

        .btn-cancel:hover {
          background: #e2e8f0;
        }

        .btn-submit {
          flex: 2;
          padding: 14px;
          border-radius: 16px;
          border: none;
          background: #2563eb;
          color: white;
          font-weight: 700;
          box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-submit:hover:not(:disabled) {
          background: #1d4ed8;
          transform: translateY(-2px);
          box-shadow: 0 15px 20px -3px rgba(37, 99, 235, 0.4);
        }

        .btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
      `}</style>
    </BaseModal>
  );
}