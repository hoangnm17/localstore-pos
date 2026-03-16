import BaseModal from "components/common/BaseModal";

export default function ConfirmModal({
  title = "Xác nhận",
  message = "Bạn có chắc chắn muốn thực hiện thao tác này?",
  onConfirm,
  onCancel,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  loading = false
}) {
  return (
    <BaseModal onClose={onCancel} maxWidth="420px">
      <div className="bg-white rounded-4 shadow p-4">

        <h5 className="fw-bold mb-3">{title}</h5>

        <p className="text-muted mb-4">{message}</p>

        <div className="d-flex justify-content-end gap-2">
          <button
            className="btn btn-light rounded-pill px-3"
            onClick={onCancel}
          >
            {cancelText}
          </button>

          <button
            className="btn btn-danger rounded-pill px-3"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : confirmText}
          </button>
        </div>

      </div>
    </BaseModal>
  );
}