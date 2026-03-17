import React, { useState } from 'react';
import BaseModal from '../../../components/common/BaseModal';
import { useNotification } from '../../../components/global/Notification/NotificationContext';
import api from '../../../services/axiosInstance';

const ShiftToggleModal = ({ shift, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const isActive = shift.isActive === 1 || shift.isActive === true;

  const handleConfirm = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await api.patch(`/shifts/${shift.id}/toggle`);
      const isSuccess = res.data?.success ?? res.success;

      if (isSuccess) {
        showNotification(
          `Đã ${isActive ? 'ngừng sử dụng' : 'kích hoạt'} ca "${shift.name}"!`,
          isActive ? 'warning' : 'success'
        );
        onSuccess();
        return;
      }

      const msg = res.data?.message || res.message || 'Có lỗi xảy ra!';
      showNotification(msg, 'error');
    } catch (err) {
      showNotification(
        err.response?.data?.message || 'Không thể cập nhật trạng thái ca!',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal onClose={onClose} maxWidth="440px" disableClose={loading}>
      <div style={{
        background: '#fff',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 25px 60px rgba(0,0,0,0.15)'
      }}>
        {/* Header */}
        <div style={{
          background: isActive
            ? 'linear-gradient(135deg, #ef4444, #dc2626)'
            : 'linear-gradient(135deg, #22c55e, #16a34a)',
          padding: '28px 32px',
          color: '#fff',
          textAlign: 'center'
        }}>
          <h5 className="fw-bold mt-2 mb-0">
            {isActive ? 'Ngừng Sử Dụng Ca' : 'Kích Hoạt Lại Ca'}
          </h5>
        </div>

        {/* Body */}
        <div className="p-4 text-center">
          <p className="text-secondary mb-1">Bạn chắc chắn muốn</p>
          <p className="fw-bold fs-5 mb-2">
            {isActive
              ? <span className="text-danger">Ngừng Sử Dụng</span>
              : <span className="text-success">Kích Hoạt Lại</span>
            }
          </p>
          <div className="badge px-3 py-2 rounded-pill fw-bold fs-6 mb-2"
            style={{
              background: isActive ? '#fee2e2' : '#dcfce7',
              color: isActive ? '#b91c1c' : '#15803d'
            }}>
            {shift.name}
          </div>
          <p className="text-muted small mb-3">{shift.startTime} – {shift.endTime}</p>

          <div className="alert py-2 text-start"
            style={{
              fontSize: '.82rem',
              background: isActive ? '#fef2f2' : '#f0fdf4',
              border: `1px solid ${isActive ? '#fecaca' : '#bbf7d0'}`,
              borderRadius: '10px',
              color: isActive ? '#7f1d1d' : '#14532d'
            }}>
            <i className={`bi ${isActive ? 'bi-info-circle' : 'bi-check-circle'} me-1`} />
            {isActive
              ? 'Ca sẽ bị ẩn khỏi lịch phân công. Dữ liệu lịch sử vẫn được giữ nguyên.'
              : 'Ca sẽ được hiển thị trở lại và có thể phân công cho nhân viên.'
            }
          </div>
        </div>

        {/* Footer */}
        <div className="d-flex gap-3 justify-content-center px-4 pb-4">
          <button
            className="btn btn-light border px-4 fw-bold"
            style={{ borderRadius: '12px' }}
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </button>
          <button
            className="btn text-white px-4 fw-bold"
            style={{
              borderRadius: '12px',
              background: isActive
                ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                : 'linear-gradient(135deg, #22c55e, #16a34a)',
              border: 'none'
            }}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading
              ? <><span className="spinner-border spinner-border-sm me-2" />Đang xử lý...</>
              : 'Đồng Ý'
            }
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default ShiftToggleModal;
