import React from 'react';

const formatVND = (num) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);

const SalaryHeader = ({ summary }) => {
    return (
        <div style={{
            background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
            borderRadius: '20px', padding: '28px 32px', marginBottom: '24px', color: '#fff'
        }}>
            <div className="mb-4">
                <h3 className="fw-bold m-0">Báo Cáo Lương Nhân Viên</h3>
                <p className="m-0 mt-1 opacity-75 small">Tổng hợp công lương theo tháng thực tế</p>
            </div>

            {summary ? (
                <div className="row g-3">
                    {[
                        { label: 'Tổng nhân viên', value: summary.totalStaff, icon: 'bi-people-fill' },
                        { label: 'Tổng lương gộp', value: formatVND(summary.totalGross), icon: 'bi-cash-stack' },
                        { label: 'Tổng phạt/trừ', value: formatVND(summary.totalDeductions), icon: 'bi-graph-down-arrow' },
                        { label: 'Thực lĩnh', value: formatVND(summary.totalNet), icon: 'bi-wallet-fill' },
                    ].map(({ label, value, icon }, idx) => (
                        <div key={label} className="col-6 col-md-3">
                            <div style={{ 
                                background: idx === 3 ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.15)', 
                                borderRadius: '12px', padding: '14px 16px', backdropFilter: 'blur(10px)',
                                border: idx === 3 ? '1px solid rgba(255,255,255,0.4)' : 'none'
                            }}>
                                <div className="d-flex align-items-center gap-2">
                                    <i className={`bi ${icon} fs-5 opacity-75`} />
                                    <div>
                                        <div className="fw-bold fs-5 lh-1">{value}</div>
                                        <small className="opacity-75" style={{ fontSize: '0.75rem' }}>{label}</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="opacity-50 small"><i className="bi bi-hourglass-split me-2" /> Đang tính toán dữ liệu tổng hợp...</div>
            )}
        </div>
    );
};

export default SalaryHeader;