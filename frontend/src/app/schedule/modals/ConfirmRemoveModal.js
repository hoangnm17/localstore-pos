import React from 'react';
import BaseModal from '../../../components/common/BaseModal';

const ConfirmRemoveModal = ({ onConfirm, onClose, loading }) => {
    return (
        <BaseModal onClose={onClose} maxWidth="420px" disableClose={loading}>
            <div style={{
                background: '#fff', borderRadius: '20px', overflow: 'hidden',
                boxShadow: '0 25px 60px rgba(0,0,0,0.15)',
            }}>
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    padding: '18px 28px', color: '#fff',
                }}>
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="fw-bold m-0" style={{ fontSize: '1rem' }}>
                            <i className="bi bi-exclamation-triangle-fill me-2" />
                            Xác Nhận Xóa Ca
                        </h5>
                        <button onClick={onClose} disabled={loading}
                            style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.4rem', cursor: 'pointer' }}>
                            <i className="bi bi-x-lg" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div style={{ padding: '24px 28px', textAlign: 'center' }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: '50%',
                        background: '#fef2f2', margin: '0 auto 16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <i className="bi bi-trash3-fill" style={{ fontSize: '1.8rem', color: '#ef4444' }} />
                    </div>
                    <p className="fw-bold mb-1" style={{ fontSize: '1rem', color: '#0f172a' }}>
                        Bỏ phân công ca này?
                    </p>
                    <p className="text-secondary" style={{ fontSize: '0.88rem' }}>
                        Hành động này không thể hoàn tác.
                    </p>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '14px 28px', borderTop: '1px solid #f0f0f0',
                    background: '#fafafa', display: 'flex',
                    justifyContent: 'flex-end', gap: '10px',
                }}>
                    <button className="btn btn-light border px-4 fw-bold"
                        style={{ borderRadius: '10px' }}
                        onClick={onClose} disabled={loading}>
                        Hủy
                    </button>
                    <button className="btn btn-danger px-4 fw-bold"
                        style={{ borderRadius: '10px' }}
                        onClick={onConfirm} disabled={loading}>
                        {loading
                            ? <><span className="spinner-border spinner-border-sm me-2" />Đang xóa...</>
                            : <><i className="bi bi-trash3-fill me-2" />Xác Nhận Xóa</>}
                    </button>
                </div>
            </div>
        </BaseModal>
    );
};

export default ConfirmRemoveModal;
