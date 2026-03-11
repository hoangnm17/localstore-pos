import React, { useState } from 'react';
import BaseModal from '../../../components/common/BaseModal';
import AlertMessage from '../../../components/common/AlertMessage';
import { useNotification } from '../../../components/global/Notification/NotificationContext';
import api from '../../../services/axiosInstance';

const ShiftDeleteModal = ({ shift, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { showNotification } = useNotification();

  const handleDelete = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.delete(`/shifts/${shift.id}`);
      if (res.data?.success) {
        showNotification(`Đã vô hiệu hóa ca "${shift.name}"!`, 'success');
        onSuccess();
        return;
      }
      setErrorMsg(res.data?.message || 'Vô hiệu hóa thất bại!');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Không thể vô hiệu hóa ca này!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal onClose={onClose} maxWidth="420px" disableClose={loading}>
      <div style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.15)' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', padding: '24px 32px', color: '#fff' }}>
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="fw-bold m-0"><i className="bi bi-trash-fill me-2" />Vô Hiệu Hóa Ca</h5>
            <button onClick={onClose} disabled={loading}
              style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>
              <i className="bi bi-x-lg" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '32px' }}>
          <div className="text-center mb-4">
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <i className="bi bi-exclamation-triangle-fill text-danger" style={{ fontSize: '2.5rem' }} />
            </div>
            <p className="mb-1 fw-semibold" style={{ color: '#374151' }}>Bạn muốn vô hiệu hóa ca làm việc:</p>
            <div className="badge px-3 py-2 rounded-pill fw-bold fs-6 mt-1"
              style={{ background: '#fee2e2', color: '#b91c1c' }}>
              {shift.name}
            </div>
            <p className="text-muted small mt-2">{shift.startTime} – {shift.endTime}</p>
          </div>

          <div className="alert alert-info py-2 text-start" style={{ fontSize: '.82rem' }}>
            <i className="bi bi-info-circle me-1" />
            Ca sẽ bị <strong>ẩn</strong> khỏi danh sách nhưng lịch sử dữ liệu vẫn được giữ nguyên.
          </div>

          {errorMsg && <AlertMessage type="danger" message={errorMsg} className="mt-2" />}
        </div>

        {/* Footer */}
        <div style={{ padding: '0 32px 32px 32px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button className="btn btn-light border px-4 fw-bold"
            style={{ borderRadius: '12px' }} onClick={onClose} disabled={loading}>Giữ lại</button>
          <button className="btn btn-danger px-4 fw-bold"
            style={{ borderRadius: '12px' }} onClick={handleDelete} disabled={loading}>
            {loading
              ? <><span className="spinner-border spinner-border-sm me-2" />Đang xử lý...</>
              : <><i className="bi bi-trash-fill me-2" />Vô Hiệu Hóa</>}
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default ShiftDeleteModal;
