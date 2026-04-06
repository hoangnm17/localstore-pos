import React, { useState } from 'react';
import BaseModal from '../../../components/common/BaseModal';
import { useNotification } from '../../../components/global/Notification/NotificationContext';
import { resignStaff } from '../../../services/Staff/staff.service';

const StaffResignModal = ({ staff, onClose, onSuccess }) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const { showNotification } = useNotification();

    const handleConfirm = async () => {
        if (isUpdating) return;
        setIsUpdating(true);
        try {
            const res = await resignStaff(staff.id);
            if (res?.success) {
                showNotification(`Đã ghi nhận ${staff.fullName} nghỉ việc!`, 'warning');
                onSuccess();
            } else {
                showNotification(res.message ?? res.data?.message ?? 'Lỗi xử lý!', 'error');
            }
        } catch (err) {
            showNotification('Không thể kết nối server!', 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <BaseModal onClose={onClose} maxWidth="460px" disableClose={isUpdating}>
            <div style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.15)' }}>
                <div style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', padding: '24px 32px', color: '#fff', textAlign: 'center' }}>
                    <h5 className="fw-bold">Xác Nhận Nghỉ Việc</h5>
                </div>
                <div className="p-4 text-center">
                    <p className="text-secondary mb-1">Bạn chắc chắn muốn cho nhân viên</p>
                    <p className="fw-bold fs-5 mb-1">
                        <span className="text-warning">{staff?.fullName}</span>
                    </p>
                    <p className="text-secondary mb-3"><strong>nghỉ việc</strong>?</p>
                    <div className="alert alert-warning py-2 small text-start">
                        Tài khoản đăng nhập sẽ bị <strong>khóa</strong>. Hành động này không thể hoàn tác.
                    </div>
                </div>
                <div className="d-flex gap-3 justify-content-center px-4 pb-4">
                    <button className="btn btn-light border px-4 fw-bold" style={{ borderRadius: '12px' }}
                        onClick={onClose} disabled={isUpdating}>Hủy</button>
                    <button className="btn text-white px-4 fw-bold"
                        style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none' }}
                        onClick={handleConfirm} disabled={isUpdating}>
                        {isUpdating
                            ? <><span className="spinner-border spinner-border-sm me-2" />Đang xử lý...</>
                            : <>Xác nhận</>}
                    </button>
                </div>
            </div>
        </BaseModal>
    );
};
export default StaffResignModal;
