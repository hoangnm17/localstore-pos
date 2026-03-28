import React from 'react';
import BaseModal from '../../../components/common/BaseModal';

const formatVND = (num) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);

const fmtTime = (str) => {
    if (!str) return '—';
    const d = new Date(str);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
};
const fmtDate = (str) => {
    if (!str) return '—';
    return new Date(str).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
};

const InfoRow = ({ label, value, valueClass = 'text-dark fw-bold' }) => (
    <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
        <span className="text-secondary small fw-medium">{label}</span>
        <span className={valueClass} style={{ fontSize: '0.9rem' }}>{value}</span>
    </div>
);

const HandoverDetailModal = ({ row, onClose }) => {
    if (!row) return null;

    const diff = Number(row.difference);
    const diffColor = diff < 0 ? '#dc2626' : diff > 0 ? '#d97706' : '#16a34a';
    const diffLabel = diff < 0 ? 'Thiếu' : diff > 0 ? 'Thừa' : 'Khớp';

    return (
        <BaseModal onClose={onClose} maxWidth="560px">
            <div style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>

                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)', padding: '24px 32px', color: '#fff' }}>
                    <div className="d-flex justify-content-between align-items-start">
                        <div>
                            <h5 className="fw-bold m-0">
                                <i className="bi bi-wallet2 me-2" />Chi Tiết Bàn Giao Tiền Mặt
                            </h5>
                        </div>
                        <button onClick={onClose}
                            style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1 }}>
                            <i className="bi bi-x-lg" />
                        </button>
                    </div>
                </div>

                <div style={{ padding: '28px 32px' }}>

                    {/* ── Thông tin nhân viên & ca ── */}
                    <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-light rounded-4 border">
                        <div style={{
                            width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
                            background: row.roleName === 'Manager'
                                ? 'linear-gradient(135deg, #0ea5e9, #3b82f6)'
                                : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontWeight: 'bold', fontSize: '1.3rem'
                        }}>
                            {(row.cashierName || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-grow-1">
                            <div className="fw-bold" style={{ color: '#0f172a', fontSize: '1rem' }}>{row.cashierName}</div>
                            <div className="d-flex gap-2 mt-1">
                                <span className={`badge rounded-pill ${row.roleName === 'Manager'
                                    ? 'bg-info-subtle text-info border border-info'
                                    : 'bg-primary-subtle text-primary border border-primary'}`}
                                    style={{ fontSize: '0.65rem' }}>
                                    {row.roleName === 'Manager' ? 'Quản Lý' : 'Thu Ngân'}
                                </span>
                                {row.counterName && (
                                    <span className="badge bg-secondary-subtle text-secondary border" style={{ fontSize: '0.65rem' }}>
                                        <i className="bi bi-shop me-1" />{row.counterName}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Thông tin ca ── */}
                    <h6 className="fw-bold text-secondary mb-2 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                        <i className="bi bi-clock-fill me-2" />Thông Tin Ca Làm
                    </h6>
                    <div className="mb-4">
                        <InfoRow label="Ca làm việc" value={row.shiftName || '—'} />
                        <InfoRow label="Giờ ca" value={`${row.shiftStart} – ${row.shiftEnd}`} />
                        <InfoRow label="Ngày làm việc" value={row.workDate ? new Date(row.workDate).toLocaleDateString('vi-VN') : '—'} />
                        <InfoRow label="Thời điểm bàn giao" value={`${fmtTime(row.handoverTime.replace('Z', ''))}`} />
                    </div>

                    {/* ── Kiểm kê tiền mặt ── */}
                    <h6 className="fw-bold text-secondary mb-2 text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                        <i className="bi bi-cash-stack me-2" />Kiểm Kê Tiền Mặt
                    </h6>
                    <div className="mb-3">
                        <InfoRow
                            label="Tiền lẻ đầu ca"
                            value={formatVND(row.openingCash)}
                            valueClass="fw-semibold text-secondary"
                        />
                        <InfoRow
                            label="Doanh thu bán hàng"
                            value={formatVND(Number(row.systemCash) + Number(row.returnCash))}
                            valueClass="fw-semibold text-primary"
                        />
                        <InfoRow
                            label="Tiền hoàn trả khách"
                            value={"-" + formatVND(row.returnCash)}
                            valueClass="fw-semibold text-danger"
                        />
                        <InfoRow
                            label="Tổng cần có (Két)"
                            value={formatVND(Number(row.openingCash) + Number(row.systemCash))}
                            valueClass="fw-bold fs-5 text-dark"
                        />
                        <InfoRow
                            label="Thực đếm trong két"
                            value={formatVND(row.actualCash)}
                            valueClass="fw-bold text-success"
                        />
                    </div>

                    {/* ── Kết quả chênh lệch ── */}
                    <div className="rounded-4 p-3 mt-2" style={{
                        background: diff === 0 ? '#f0fdf4' : diff < 0 ? '#fef2f2' : '#fffbeb',
                        border: `1px solid ${diff === 0 ? '#bbf7d0' : diff < 0 ? '#fecaca' : '#fde68a'}`
                    }}>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <div className="fw-bold text-uppercase" style={{ fontSize: '0.75rem', color: diffColor }}>
                                    <i className={`bi ${diff === 0 ? 'bi-check-circle-fill' : diff < 0 ? 'bi-exclamation-triangle-fill' : 'bi-arrow-up-circle-fill'} me-2`} />
                                    {diffLabel}
                                </div>
                                <div className="small text-muted mt-1">
                                    {diff === 0 ? 'Tiền két khớp với hệ thống'
                                        : diff < 0 ? 'Tiền két thiếu so với hệ thống'
                                            : 'Tiền két thừa so với hệ thống'}
                                </div>
                            </div>
                            <div className="fw-bold" style={{ fontSize: '1.5rem', color: diffColor }}>
                                {diff > 0 ? '+' : ''}{formatVND(diff)}
                            </div>
                        </div>
                    </div>

                    {/* Ghi chú */}
                    {row.note && (
                        <div className="alert alert-warning py-2 mt-3 small mb-0">
                            <i className="bi bi-info-circle-fill me-2" />
                            <strong>Ghi chú:</strong> {row.note}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '16px 32px', borderTop: '1px solid #f0f0f0', background: '#fafafa', display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn btn-light border px-4 fw-bold" style={{ borderRadius: '10px' }} onClick={onClose}>
                        Đóng
                    </button>
                </div>
            </div>
        </BaseModal>
    );
};

export default HandoverDetailModal;
