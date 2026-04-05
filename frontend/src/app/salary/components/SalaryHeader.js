import React from 'react';

const formatVND = (num) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);

const SalaryHeader = ({ summary }) => {
    return (
        <div className="mb-4">
            <div className="mb-4">
                <h3 className="fw-bold m-0 text-dark">Báo Cáo Lương Nhân Viên</h3>
                <p className="m-0 mt-2 text-secondary">Tổng hợp công lương theo tháng thực tế.</p>
            </div>

            {summary ? (
                <div className="row g-3">
                    {[
                        { label: 'Tổng nhân viên', value: summary.totalStaff, icon: 'bi-people-fill', textClass: 'text-primary', bgClass: 'bg-primary-subtle' },
                        { label: 'Tổng lương ', value: formatVND(summary.totalGross), icon: 'bi-cash-stack', textClass: 'text-info', bgClass: 'bg-info-subtle' },
                        { label: 'Tổng phạt/trừ', value: formatVND(summary.totalDeductions), icon: 'bi-graph-down-arrow', textClass: 'text-danger', bgClass: 'bg-danger-subtle' },
                        { label: 'Thực lĩnh', value: formatVND(summary.totalNet), icon: 'bi-wallet-fill', textClass: 'text-success', bgClass: 'bg-success-subtle' },
                    ].map(({ label, value, icon, textClass, bgClass }) => (
                        <div key={label} className="col-12 col-sm-6 col-md-3">
                            <div className="card border-0 shadow-sm rounded-4 h-100 p-3">
                                <div className="d-flex align-items-center gap-3">
                                    <div className={`d-flex align-items-center justify-content-center rounded-3 ${bgClass} ${textClass}`} style={{ width: '48px', height: '48px' }}>
                                        <i className={`bi ${icon} fs-4`} />
                                    </div>
                                    <div>
                                        <div className="fw-bold fs-5 lh-1 text-dark mb-1">{value}</div>
                                        <small className="text-secondary fw-medium" style={{ fontSize: '0.8rem' }}>{label}</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-secondary small"><i className="bi bi-hourglass-split me-2" /> Đang tính toán dữ liệu tổng hợp...</div>
            )}
        </div>
    );
};

export default SalaryHeader;