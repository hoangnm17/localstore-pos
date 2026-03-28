import React from 'react';
import BaseModal from '../../../components/common/BaseModal';

const ConfirmPayrollModal = ({ onConfirm, onClose, loading, month, year }) => {
    return (
        <BaseModal onClose={onClose} maxWidth="450px" disableClose={loading}>
            <div style={{
                background: '#fff', borderRadius: '24px', overflow: 'hidden',
                boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
            }}>
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    padding: '20px 28px', color: '#fff',
                }}>
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="fw-bold m-0" style={{ fontSize: '1.1rem' }}>
                            <i className="bi bi-lock-fill me-2" />
                            Xác Nhận Chốt Lương
                        </h5>
                        <button onClick={onClose} disabled={loading}
                            style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.4rem', cursor: 'pointer' }}>
                            <i className="bi bi-x-lg" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div style={{ padding: '30px 28px', textAlign: 'center' }}>
                    <div style={{
                        width: 72, height: 72, borderRadius: '50%',
                        background: '#fffbeb', margin: '0 auto 20px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <i className="bi bi-shield-lock-fill" style={{ fontSize: '2.4rem', color: '#f59e0b' }} />
                    </div>
                    <h6 className="fw-bold mb-3" style={{ fontSize: '1.2rem', color: '#1e293b' }}>
                        Chốt lương tháng {month}/{year}?
                    </h6>
                    <p className="text-secondary mb-4" style={{ lineHeight: '1.6', fontSize: '0.95rem' }}>
                        Sau khi chốt bạn sẽ không thể chỉnh sửa lịch làm việc hoặc thay đổi bảng lương sau thao tác này.
                    </p>
                    <div className="alert alert-warning border-0 small text-start d-flex gap-2"
                        style={{ borderRadius: '12px', background: '#fff9db', color: '#856404' }}>
                        <i className="bi bi-exclamation-circle-fill fs-5" />
                        <div>
                            Dữ liệu sẽ được lưu trữ vĩnh viễn vào lịch sử trả lương của hệ thống.
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '16px 28px', borderTop: '1px solid #f1f5f9',
                    background: '#f8fafc', display: 'flex',
                    justifyContent: 'flex-end', gap: '12px',
                }}>
                    <button className="btn btn-light border px-4 fw-bold"
                        style={{ borderRadius: '12px', fontSize: '0.9rem' }}
                        onClick={onClose} disabled={loading}>
                        Hủy Bỏ
                    </button>
                    <button className="btn btn-warning px-4 fw-bold shadow-sm"
                        style={{ borderRadius: '12px', fontSize: '0.9rem', color: '#451a03' }}
                        onClick={onConfirm} disabled={loading}>
                        {loading
                            ? <><span className="spinner-border spinner-border-sm me-2" />Đang xử lý...</>
                            : <><i className="bi bi-check-circle-fill me-2" />Xác Nhận Chốt</>}
                    </button>
                </div>
            </div>
        </BaseModal>
    );
};

export default ConfirmPayrollModal;
