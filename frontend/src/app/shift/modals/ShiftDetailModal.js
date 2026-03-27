import React from 'react';
import BaseModal from '../../../components/common/BaseModal';

const ShiftDetailModal = ({ shift, onClose }) => {
    if (!shift) return null;

    return (
        <BaseModal onClose={onClose} maxWidth="580px">
            <div style={{
                background: '#fff',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 25px 60px rgba(0,0,0,0.15)',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '95vh',
            }}>
                {/* Header  */}
                <div style={{ background: 'linear-gradient(135deg, #61c8ee 0%, #6fbaed 100%)', padding: '18px 28px', color: '#fff', flexShrink: 0 }}>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 className="fw-bold m-0" style={{ fontSize: '1rem' }}>
                                <i className="bi bi-eye-fill me-2" />Chi Tiết Ca Làm Việc
                            </h5>
                            <small className="opacity-75">Xem thông tin giới hạn giờ của ca</small>
                        </div>
                        <button onClick={onClose}
                            style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1 }}>
                            <i className="bi bi-x-lg" />
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                    {/* Body */}
                    <div style={{ padding: '20px 28px', overflowY: 'auto', flex: 1 }}>

                        {/* Tên ca */}
                        <div className="mb-3">
                            <label className="small fw-bold text-secondary">Tên ca</label>
                            <input type="text" className="form-control form-control-sm border-0 bg-light fw-bold"
                                value={shift.name || ''} readOnly disabled />
                        </div>

                        {/* Thời gian ca */}
                        <div style={{ background: '#f8faff', borderRadius: '10px', padding: '14px 16px', border: '1px solid #e0eaff', marginBottom: '12px' }}>
                            <div className="fw-bold text-primary mb-2" style={{ fontSize: '0.85rem' }}>
                                <i className="bi bi-clock-fill me-2" />Thời Gian Ca
                            </div>
                            <div className="row g-2">
                                <div className="col-6">
                                    <label className="small fw-bold text-secondary">Giờ bắt đầu</label>
                                    <input type="time" className="form-control form-control-sm border-0 bg-white shadow-sm"
                                        value={shift.startTime || ''} readOnly disabled />
                                </div>
                                <div className="col-6">
                                    <label className="small fw-bold text-secondary">Giờ kết thúc</label>
                                    <input type="time" className="form-control form-control-sm border-0 bg-white shadow-sm"
                                        value={shift.endTime || ''} readOnly disabled />
                                </div>
                            </div>
                        </div>

                        {/* Giới hạn chấm công */}
                        <div style={{ background: '#f0fdf4', borderRadius: '10px', padding: '14px 16px', border: '1px solid #bbf7d0', marginBottom: '12px' }}>
                            <div className="fw-bold text-success mb-1" style={{ fontSize: '0.85rem' }}>
                                <i className="bi bi-clock-history me-2" />Giới Hạn Chấm Công (Vào Làm)
                            </div>
                            <small className="text-muted d-block mb-3" style={{ fontSize: '0.76rem' }}>
                                Dùng để tính phạt vào muộn (LateIn) cho thu ngân.
                            </small>
                            <div className="row g-2">
                                <div className="col-6">
                                    <label className="small fw-bold text-secondary">Bắt đầu nhận chấm công</label>
                                    <input type="time" className="form-control form-control-sm border-0 bg-white shadow-sm"
                                        value={shift.checkInStart || ''} readOnly disabled />
                                </div>
                                <div className="col-6">
                                    <label className="small fw-bold text-secondary">Deadline chấm công</label>
                                    <input type="time" className="form-control form-control-sm border-0 bg-white shadow-sm"
                                        value={shift.checkInEnd || ''} readOnly disabled />
                                </div>
                            </div>
                        </div>

                        {/* Thời gian kết ca (logout) */}
                        <div style={{ background: '#fff7ed', borderRadius: '10px', padding: '14px 16px', border: '1px solid #fed7aa' }}>
                            <div className="fw-bold mb-1" style={{ color: '#ea580c', fontSize: '0.85rem' }}>
                                <i className="bi bi-box-arrow-right me-2" />Thời Gian Kết Ca (Ra Về)
                            </div>
                            <small className="text-muted d-block mb-3" style={{ fontSize: '0.76rem' }}>
                                Dùng để bắt buộc thu ngân/kho phải ra ca trước deadline này.
                            </small>
                            <div className="row g-2">
                                <div className="col-6">
                                    <label className="small fw-bold text-secondary">Giờ bắt buộc logout</label>
                                    <input type="time" className="form-control form-control-sm border-0 bg-white shadow-sm"
                                        value={shift.checkOutDeadline || ''} readOnly disabled />
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Footer */}
                    <div style={{
                        padding: '14px 28px',
                        borderTop: '1px solid #f0f0f0',
                        background: '#fafafa',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        flexShrink: 0,
                    }}>
                        <button type="button" className="btn btn-secondary px-4 fw-bold"
                            style={{ borderRadius: '10px', fontSize: '0.9rem' }}
                            onClick={onClose}>
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </BaseModal>
    );
};

export default ShiftDetailModal;
