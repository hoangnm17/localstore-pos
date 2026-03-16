import React from 'react';
import BaseModal from '../../../components/common/BaseModal';

const formatVND = (num) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);
const formatHours = (decimalHours) => {
    if (!decimalHours) return '0h 00m';
    const h = Math.floor(decimalHours);
    const m = Math.round((decimalHours - h) * 60);
    return `${h}h ${String(m).padStart(2, '0')}m`;
};
const SalaryDetailModal = ({ row, month, year, onClose }) => {
    if (!row) return null;

    const isHourly = row.salaryType === 'hourly';

    const baseSalaryDisplay = isHourly
        ? `${formatVND(row.baseSalary)} / giờ`
        : formatVND(row.baseSalary);

    return (
        <BaseModal onClose={onClose} maxWidth="550px">
            <div style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.15)' }}>

                <div style={{ background: 'linear-gradient(135deg, #39bdd1 0%)', padding: '24px 32px', color: '#fff' }}>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 className="fw-bold m-0"><i className="bi bi-file-earmark-spreadsheet-fill me-2" />Chi Tiết Bảng Lương</h5>
                            <small className="opacity-75">Tháng {month} năm {year}</small>
                        </div>
                        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer' }}>
                            <i className="bi bi-x-lg" />
                        </button>
                    </div>
                </div>

                <div style={{ padding: '28px 32px' }}>

                    <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-light rounded-4 border">
                        <div style={{
                            width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontWeight: 'bold', fontSize: '1.4rem'
                        }}>
                            {row.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="fw-bold fs-5 text-dark">{row.fullName}</div>
                            <div className="d-flex gap-2 mt-1">
                                <span className="badge bg-secondary rounded-pill">{row.roleName}</span>
                                <span className={`badge rounded-pill ${isHourly ? 'bg-primary-subtle text-primary border border-primary' : 'bg-success-subtle text-success border border-success'}`}>
                                    {isHourly ? 'Lương theo giờ' : 'Lương cố định'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <h6 className="fw-bold text-secondary mb-3 text-uppercase" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>
                        <i className="bi bi-calculator me-2" />Diễn giải lương
                    </h6>

                    <div className="mb-2 d-flex justify-content-between align-items-center border-bottom pb-2">
                        <span className="text-secondary fw-medium small">Mức lương cơ sở</span>
                        <span className="fw-bold text-dark">{baseSalaryDisplay}</span>
                    </div>

                    {isHourly ? (
                        <div className="mb-2 d-flex justify-content-between align-items-center border-bottom pb-2">
                            <span className="text-secondary fw-medium small">Tổng thời gian làm việc</span>
                            <span className="fw-bold text-primary">{formatHours(row.totalHours)}</span>
                        </div>
                    ) : (
                        <>
                            <div className="mb-2 d-flex justify-content-between align-items-center border-bottom pb-2">
                                <span className="text-secondary fw-medium small">Số ngày đi làm</span>
                                <span className="fw-bold text-dark">{row.workingDays} ngày</span>
                            </div>
                            <div className="mb-2 d-flex justify-content-between align-items-center border-bottom pb-2">
                                <span className="text-secondary fw-medium small">Tổng ngày trong tháng</span>
                                <span className="fw-bold text-dark">{row.totalDaysInMonth} ngày</span>
                            </div>
                        </>
                    )}

                    <div className="mb-2 d-flex justify-content-between align-items-center border-bottom pb-2 mt-3">
                        <span className="text-secondary fw-medium small">Lương gộp (Gross)</span>
                        <span className="fw-bold text-success">{formatVND(row.grossSalary)}</span>
                    </div>

                    <div className="mb-2 d-flex justify-content-between align-items-center border-bottom pb-2">
                        <span className="text-secondary fw-medium small">Khấu trừ / Phạt</span>
                        <span className={`fw-bold ${row.deductions > 0 ? 'text-danger' : 'text-muted'}`}>
                            {row.deductions > 0 ? `- ${formatVND(row.deductions)}` : '0 đ'}
                        </span>
                    </div>

                    <div className="mt-4 p-3 rounded-4" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                        <div className="d-flex justify-content-between align-items-center">
                            <span className="fw-bold text-success fs-6 text-uppercase">THỰC LĨNH</span>
                            <span className="fw-bold text-success" style={{ fontSize: '1.4rem' }}>{formatVND(row.netSalary)}</span>
                        </div>
                    </div>

                    {row.note && (
                        <div className="alert alert-warning py-2 mt-3 small mb-0">
                            <i className="bi bi-info-circle-fill me-2" />
                            <strong>Ghi chú:</strong> {row.note}
                        </div>
                    )}
                </div>

                <div style={{ padding: '16px 32px', borderTop: '1px solid #f0f0f0', background: '#fafafa', display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn btn-light border px-4 fw-bold" style={{ borderRadius: '10px' }} onClick={onClose}>Đóng</button>
                </div>
            </div>
        </BaseModal>
    );
};

export default SalaryDetailModal;