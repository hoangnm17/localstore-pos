import React, { useState } from 'react';
import BaseModal from '../../../components/common/BaseModal';
import { useNotification } from '../../../components/global/Notification/NotificationContext';
import api from '../../../services/axiosInstance';
const StaffToggleModal = ({ staff, onClose, onSuccess }) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const { showNotification } = useNotification();

    const isActive = staff?.isActive === 'active';

    const handleConfirm = async () => {
        if (isUpdating) return;
        setIsUpdating(true);
        try {
            const newStatus = isActive ? 'locked' : 'active';
            const res = await api.put(`/staff/toggle-status`, {
                id: staff.id,
                isActive: newStatus
            });
            if (res.data.success) {
                showNotification(
                    `Đã ${isActive ? 'vô hiệu hóa' : 'kích hoạt'} tài khoản ${staff.fullName}!`,
                    isActive ? 'warning' : 'success'
                );
                onSuccess();
            }
        } catch (err) {
            showNotification(
                err.response?.data?.message || 'Không thể cập nhật trạng thái!',
                'error'
            );
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <BaseModal onClose={onClose} maxWidth="460px" disableClose={isUpdating}>
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
                    padding: '24px 32px',
                    color: '#fff',
                    textAlign: 'center'
                }}>
                    <i className={`bi ${isActive ? 'bi-person-x-fill' : 'bi-person-check-fill'}`}
                        style={{ fontSize: '2.5rem' }} />
                    <h5 className="fw-bold mt-2 mb-0">Xác Nhận Thao Tác</h5>
                </div>
                <div className="p-4 text-center">
                    <p className="text-secondary mb-1">Bạn chắc chắn muốn</p>
                    <p className="fw-bold fs-5 mb-1">
                        {isActive ? (
                            <span className="text-danger">Vô Hiệu Hóa</span>
                        ) : (
                            <span className="text-success">Kích Hoạt</span>
                        )}
                    </p>
                    <p className="text-secondary">
                        tài khoản của nhân viên{' '}
                        <strong className="text-dark">{staff?.fullName}</strong>?
                    </p>
                </div>
                <div className="d-flex gap-3 justify-content-center px-4 pb-4">
                    <button
                        className="btn btn-light border px-4 fw-bold"
                        style={{ borderRadius: '12px' }}
                        onClick={onClose}
                        disabled={isUpdating}
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
                        disabled={isUpdating}
                    >
                        {isUpdating ? (
                            <><span className="spinner-border spinner-border-sm me-2" />Đang xử lý...</>
                        ) : 'Đồng Ý'}
                    </button>
                </div>
            </div>
        </BaseModal>
    );
};
export default StaffToggleModal;
