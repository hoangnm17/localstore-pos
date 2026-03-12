import React from 'react';

const formatHours = (h) => {
    if (!h) return '—';
    const hours = Math.floor(h);
    const mins = Math.round((h - hours) * 60);
    return `${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m`;
};

const ScheduleHeader = ({ weekDates, stats, onPrevWeek, onNextWeek }) => {
    return (
        <div style={{
            background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
            borderRadius: '20px', padding: '28px 32px', marginBottom: '24px', color: '#fff',
        }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h3 className="fw-bold m-0">Lịch Làm Việc</h3>
                    <p className="m-0 mt-1 opacity-75 small">Quản lý &amp; phân công ca cho nhân viên</p>
                </div>
                {/* Week navigation */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: 'rgba(255,255,255,0.15)', borderRadius: '999px',
                    padding: '4px 8px', backdropFilter: 'blur(10px)',
                }}>
                    <button className="btn btn-sm"
                        style={{
                            borderRadius: '999px', color: '#fff',
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none', fontSize: '0.82rem', fontWeight: 600,
                        }}
                        onClick={onPrevWeek} title="Tuần trước">
                        ◀ Trước
                    </button>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', whiteSpace: 'nowrap', color: '#fff', padding: '0 8px' }}>
                        {weekDates[0].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                        &nbsp;—&nbsp;
                        {weekDates[6].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </span>
                    <button className="btn btn-sm"
                        style={{
                            borderRadius: '999px', color: '#fff',
                            background: 'rgba(255,255,255,0.2)',
                            border: 'none', fontSize: '0.82rem', fontWeight: 600,
                        }}
                        onClick={onNextWeek}>
                        Sau ▶
                    </button>
                </div>
            </div>

            {/* Stats tiles */}
            <div className="row g-3">
                {[
                    { label: 'Thu Ngân', value: stats.totalCashier, icon: 'bi-person-badge-fill' },
                    { label: 'Nhân Viên Kho', value: stats.totalWarehouse, icon: 'bi-box-seam-fill' },
                    { label: 'Ca đã phân công', value: stats.totalAssign, icon: 'bi-calendar-check-fill' },
                    { label: 'Tổng giờ làm', value: formatHours(stats.totalHours), icon: 'bi-clock-fill' },
                    { label: 'Quầy hoạt động', value: stats.activeCounters, icon: 'bi-shop' },
                ].map(({ label, value, icon }) => (
                    <div key={label} className="col-6 col-md">
                        <div style={{
                            background: 'rgba(255,255,255,0.15)', borderRadius: '12px',
                            padding: '12px 14px', backdropFilter: 'blur(10px)',
                        }}>
                            <div className="d-flex align-items-center gap-2">
                                <i className={`bi ${icon} fs-5 opacity-75`} />
                                <div>
                                    <div className="fw-bold fs-5 lh-1">{value}</div>
                                    <small className="opacity-75" style={{ fontSize: '0.73rem' }}>{label}</small>
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
