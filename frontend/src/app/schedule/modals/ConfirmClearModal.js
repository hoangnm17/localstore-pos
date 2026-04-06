import React from 'react';
import BaseModal from '../../../components/common/BaseModal';

const ConfirmClearModal = ({ onConfirm, onClose, loading, staffName, startDate, endDate }) => {
    return (
        <BaseModal onClose={onClose} maxWidth="480px" disableClose={loading}>
            <div style={{
                background: '#fff', borderRadius: '24px', overflow: 'hidden',
                boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
            }}>
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    padding: '20px 28px', color: '#fff',
                }}>
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="fw-bold m-0" style={{ fontSize: '1.1rem' }}>
                            Xác Nhận Xóa Ca
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
                        background: '#fef2f2', margin: '0 auto 20px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '2.4rem', color: '#ef4444' }} />
                    </div>
                    <h6 className="fw-bold mb-3" style={{ fontSize: '1.1rem', color: '#1e293b' }}>
                        Xóa các ca đã gán của {staffName}?
                    </h6>
                    <div style={{
                        background: '#f8fafc', padding: '15px', borderRadius: '12px',
                        border: '1px solid #e2e8f0', marginBottom: '15px', textAlign: 'left'
                    }}>
                        <div className="small text-secondary mb-1">Khoảng thời gian:</div>
                        <div className="fw-bold text-primary">
                            <i className="bi bi-calendar-range me-2" />
                            {startDate} <i className="bi bi-arrow-right mx-1 text-secondary" /> {endDate}
                        </div>
                    </div>
                    {/* <p className="text-secondary small mb-0 px-2" style={{ lineHeight: '1.6' }}>
                        Hệ thống sẽ xóa các ca chưa diễn ra trong khoảng thời gian được chọn.
                    </p> */}
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
                    <button className="btn btn-danger px-4 fw-bold shadow-sm"
                        style={{ borderRadius: '12px', fontSize: '0.9rem' }}
                        onClick={onConfirm} disabled={loading}>
                        {loading
                            ? <><span className="spinner-border spinner-border-sm me-2" />Đang xử lý...</>
                            : <>Đồng Ý</>}
                    </button>
                </div>
            </div>
        </BaseModal>
    );
};

export default ConfirmClearModal;
