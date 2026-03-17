import React from 'react';
const formatHours = (h) => {
    if (!h) return '—';
    const hours = Math.floor(h);
    const mins = Math.round((h - hours) * 60);
    return `${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m`;
};

const ScheduleHeader = ({ weekDates, stats, onPrevWeek, onNextWeek }) => {
    return (
        <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold m-0 text-dark">Lịch Làm Việc</h3>
                    <p className="m-0 mt-2 text-secondary">Quản lý &amp; phân công ca cho nhân viên</p>
                </div>
                {/* Week navigation */}
                <div className="d-flex align-items-center gap-2 p-1 bg-white rounded-pill shadow-sm border border-light">
                    <button className="btn btn-sm btn-light rounded-pill fw-bold px-3 text-secondary" onClick={onPrevWeek}>
                        <i className="bi bi-chevron-left me-1"></i> Trước
                    </button>
                    <span className="fw-bold text-dark px-2" style={{ fontSize: '0.88rem' }}>
                        {weekDates[0].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                        &nbsp;—&nbsp;
                        {weekDates[6].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </span>
                    <button className="btn btn-sm btn-light rounded-pill fw-bold px-3 text-secondary" onClick={onNextWeek}>
                        Sau <i className="bi bi-chevron-right ms-1"></i>
                    </button>
                </div>
            </div>

            {/* Stats tiles */}
            <div className="row g-3">
                {[
                    { label: 'Thu Ngân', value: stats.totalCashier, icon: 'bi-person-badge-fill', textClass: 'text-primary', bgClass: 'bg-primary-subtle' },
                    { label: 'Nhân Viên Kho', value: stats.totalWarehouse, icon: 'bi-box-seam-fill', textClass: 'text-info', bgClass: 'bg-info-subtle' },
                    { label: 'Ca đã phân công', value: stats.totalAssign, icon: 'bi-calendar-check-fill', textClass: 'text-success', bgClass: 'bg-success-subtle' },
                    { label: 'Tổng giờ làm', value: formatHours(stats.totalHours), icon: 'bi-clock-fill', textClass: 'text-warning', bgClass: 'bg-warning-subtle' },
                    { label: 'Quầy hoạt động', value: stats.activeCounters, icon: 'bi-shop', textClass: 'text-secondary', bgClass: 'bg-secondary-subtle' },
                ].map(({ label, value, icon, textClass, bgClass }) => (
                    <div key={label} className="col-6 col-md">
                        <div className="card border-0 shadow-sm rounded-4 h-100 p-3">
                            <div className="d-flex align-items-center gap-3">
                                <div className={`d-flex align-items-center justify-content-center rounded-3 ${bgClass} ${textClass}`} style={{ width: '42px', height: '42px' }}>
                                    <i className={`bi ${icon} fs-5`} />
                                </div>
                                <div>
                                    <div className="fw-bold fs-5 lh-1 text-dark mb-1">{value}</div>
                                    <small className="text-secondary fw-medium" style={{ fontSize: '0.75rem' }}>{label}</small>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ScheduleHeader;