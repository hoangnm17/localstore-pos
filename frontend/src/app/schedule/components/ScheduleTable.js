import React from 'react';

const dayLabels = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];

const shiftColors = [
    { bg: '#dbeafe', text: '#1d4ed8', border: '#93c5fd' },
    { bg: '#dcfce7', text: '#15803d', border: '#86efac' },
    { bg: '#fef3c7', text: '#b45309', border: '#fcd34d' },
    { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' },
    { bg: '#f3e8ff', text: '#7e22ce', border: '#d8b4fe' },
    { bg: '#f1f5f9', text: '#334155', border: '#cbd5e1' },
];
const getShiftStyle = (id) => shiftColors[(id - 1) % shiftColors.length];

const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const formatHours = (h) => {
    if (!h) return '—';
    const hours = Math.floor(h);
    const mins = Math.round((h - hours) * 60);
    return `${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m`;
};

const ScheduleTable = ({
    loading, filterMode, staffPage, shifts, filteredStaff, weekDates, todayStr, canAssign, onOpenAssign, onRemove,
}) => {
    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} />
                <p className="mt-3 text-secondary">Đang tải dữ liệu...</p>
            </div>
        );
    }

    return (
        <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '60vh' }}>
            <table className="table table-hover align-middle mb-0" style={{ minWidth: '1100px', fontSize: '0.875rem' }}>
                <thead style={{ background: '#1e293b', position: 'sticky', top: 0, zIndex: 10 }}>
                    <tr>
                        <th className="py-3 ps-4 fw-bold"
                            style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.7px', width: '190px', color: '#040c13' }}>
                            {filterMode === 'staff' ? 'NHÂN VIÊN' : 'CA LÀM VIỆC'}
                        </th>
                        <th className="py-3 text-center fw-bold"
                            style={{ fontSize: '0.75rem', textTransform: 'uppercase', width: '80px', color: '#0e0e0e' }}>
                            {filterMode === 'staff' ? 'GIỜ' : 'SL'}
                        </th>
                        {weekDates.map((d, i) => {
                            const dStr = formatDate(d);
                            const isToday = dStr === todayStr;
                            return (
                                <th key={i} className="py-2 text-center" style={{ width: '120px', minWidth: '110px' }}>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: isToday ? '#fbbf24' : '#020304', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                        {dayLabels[i]}
                                    </div>
                                    <span style={{ display: 'inline-block', background: isToday ? '#f59e0b' : 'rgba(255,255,255,0.1)', color: isToday ? '#1e293b' : '#0e0909', borderRadius: '6px', padding: '2px 8px', fontWeight: 700, fontSize: '0.8rem' }}>
                                        {d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                    </span>
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody>
                    {filterMode === 'staff' ? (
                        <StaffRows staffPage={staffPage} weekDates={weekDates} todayStr={todayStr} canAssign={canAssign} onOpenAssign={onOpenAssign} onRemove={onRemove} />
                    ) : (
                        <ShiftRows shifts={shifts} filteredStaff={filteredStaff} weekDates={weekDates} todayStr={todayStr} canAssign={canAssign} onRemove={onRemove} />
                    )}
                </tbody>
            </table>
        </div>
    );
};

/* ── Staff Rows ── */
const StaffRows = ({ staffPage, weekDates, todayStr, canAssign, onOpenAssign, onRemove }) => {
    if (staffPage.length === 0) {
        return (
            <tr><td colSpan={9} className="text-center py-5 text-secondary"><i className="bi bi-inbox fs-2 d-block mb-2" />Không tìm thấy nhân viên phù hợp.</td></tr>
        );
    }

    return staffPage.map(staff => {
        const isCashier = staff.roleName === 'Cashier';
        const isWarehouse = staff.roleName === 'Warehouse';
        const isOver48 = staff.totalHours > 48;

        return (
            <tr key={staff.staffId} className="ws-row border-top" style={{ background: isWarehouse ? '#fafaf9' : '#fff' }}>
                {/* Cột nhân viên */}
                <td className="ps-4 py-3">
                    <div className="d-flex align-items-center gap-2">
                        <div style={{
                            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                            background: isCashier ? 'linear-gradient(135deg, #0ea5e9, #3b82f6)' : 'linear-gradient(135deg, #94a3b8, #64748b)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.9rem',
                        }}>
                            {staff.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div className="fw-bold" style={{ fontSize: '0.88rem', color: '#0f172a' }}>{staff.fullName}</div>

                            {/* ĐÃ MỞ KHÓA CHO 3 LOẠI CHỨC VỤ CA/WH/MG */}
                            <span className={`badge rounded-pill mt-1 text-uppercase ${isCashier ? 'bg-primary' : isWarehouse ? 'bg-secondary' : 'bg-danger'}`} style={{ fontSize: '0.65rem' }}>
                                {isCashier ? 'THU NGÂN' : isWarehouse ? 'KHO' : 'QUẢN LÝ'}
                            </span>
                        </div>
                    </div>
                </td>

                {/* Cột Tổng Giờ */}
                <td className="text-center py-3">
                    <span style={{ fontWeight: 800, fontSize: '0.85rem', color: isOver48 ? '#dc2626' : '#2563eb' }} title={isOver48 ? 'Vượt quá 48h/tuần!' : ''}>
                        {isOver48 && <i className="bi bi-exclamation-triangle-fill me-1 text-warning" />}
                        {formatHours(staff.totalHours)}
                    </span>
                </td>

                {/* Cột Chi Tiết Hành Động Khắp 7 Ngày */}
                {weekDates.map((d, i) => {
                    const dateStr = formatDate(d);
                    const isToday = dateStr === todayStr;
                    const isPast = dateStr < todayStr;
                    const dayShifts = staff.schedules?.[dateStr] || [];

                    return (
                        <td key={i} className="py-2 align-top" style={{ borderLeft: '1px dashed #e2e8f0', background: isToday ? '#fffbeb' : 'transparent', minWidth: '110px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '2px 4px' }}>
                                {dayShifts.map(sc => {
                                    const sStyle = getShiftStyle(sc.shiftId);
                                    const counterDisplay = sc.counterName || sc.counterCode;
                                    return (
                                        <div key={sc.scheduleId} style={{
                                            borderRadius: '8px', padding: '5px 8px', backgroundColor: sStyle.bg, border: `1px solid ${sStyle.border}`,
                                            color: sStyle.text, position: 'relative', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                                        }}>
                                            <span style={{ fontWeight: 700, fontSize: '0.78rem', display: 'block', paddingRight: '22px' }}>{sc.shiftName}</span>
                                            <span style={{ fontSize: '0.68rem', opacity: 0.8, display: 'block' }}>{sc.startTime} – {sc.endTime}</span>
                                            {counterDisplay && <span style={{ fontSize: '0.65rem', display: 'block', marginTop: '2px', opacity: 0.85 }}><i className="bi bi-shop me-1" />{counterDisplay}</span>}
                                            {canAssign && (
                                                <button className="ws-remove-btn" title="Xóa ca này" onClick={() => onRemove(sc.scheduleId)}
                                                    style={{ position: 'absolute', top: '50%', right: '5px', transform: 'translateY(-50%)', background: 'rgba(239,68,68,0.15)', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ef4444', fontWeight: 900, fontSize: '0.7rem', padding: 0 }}>✕</button>
                                            )}
                                        </div>
                                    );
                                })}
                                {/* ÁP DỤNG BUTTON CHO CẢ 3 ROLE */}
                                {canAssign && !isPast && (
                                    <button className="ws-add-btn" onClick={() => onOpenAssign(staff, dateStr)}
                                        style={{ width: '100%', border: '1.5px dashed #cbd5e1', borderRadius: '8px', padding: '4px 0', background: 'transparent', color: '#94a3b8', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', marginTop: '2px' }}>
                                        + Thêm ca
                                    </button>
                                )}
                                {isPast && dayShifts.length === 0 && <div className="text-center" style={{ fontSize: '0.7rem', color: '#cbd5e1', padding: '4px' }}>—</div>}
                            </div>
                        </td>
                    );
                })}
            </tr>
        );
    });
};

/* ── Shift Rows ── */
const ShiftRows = ({ shifts, filteredStaff, weekDates, todayStr, canAssign, onRemove }) => {
    if (shifts.length === 0) return <tr><td colSpan={9} className="text-center py-5 text-secondary"><i className="bi bi-inbox fs-2 d-block mb-2" />Chưa có ca làm việc nào.</td></tr>;

    return shifts.map(shift => {
        const sStyle = getShiftStyle(shift.id);
        return (
            <tr key={shift.id} className="ws-row border-top">
                <td className="ps-4 py-3">
                    <span className="badge px-3 py-2 rounded-pill fw-bold" style={{ background: sStyle.bg, color: sStyle.text, fontSize: '0.85rem' }}>{shift.name}</span>
                    <div className="small text-secondary mt-1">{shift.startTime} → {shift.endTime}</div>
                </td>
                <td className="text-center">
                    {(() => {
                        let count = 0;
                        weekDates.forEach(d => {
                            const ds = formatDate(d);
                            filteredStaff.forEach(s => { if (s.schedules?.[ds]?.some(sc => sc.shiftId === shift.id)) count++; });
                        });
                        return count > 0 ? <span className="fw-bold text-success">{count}</span> : <span className="text-secondary">—</span>;
                    })()}
                </td>
                {weekDates.map((d, i) => {
                    const ds = formatDate(d);
                    const isToday = ds === todayStr;
                    const inShift = filteredStaff.filter(s => s.schedules?.[ds]?.some(sc => sc.shiftId === shift.id));
                    return (
                        <td key={i} className="py-2 align-top" style={{ borderLeft: '1px dashed #e2e8f0', background: isToday ? '#fffbeb' : 'transparent' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '2px 4px' }}>
                                {inShift.map(s => {
                                    const entry = s.schedules[ds].find(sc => sc.shiftId === shift.id);
                                    return (
                                        <div key={s.staffId} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '5px 8px', position: 'relative', paddingRight: canAssign ? '28px' : '8px' }}>
                                            <div className="fw-semibold" style={{ fontSize: '0.78rem', color: '#334155' }}>{s.fullName}</div>
                                            {(entry?.counterName || entry?.counterCode) && <div style={{ fontSize: '0.68rem', color: '#64748b' }}><i className="bi bi-shop me-1" />{entry.counterName || entry.counterCode}</div>}
                                            {canAssign && (
                                                <button className="ws-remove-btn" onClick={() => onRemove(entry.scheduleId)}
                                                    style={{ position: 'absolute', top: '50%', right: '5px', transform: 'translateY(-50%)', background: 'rgba(239,68,68,0.15)', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ef4444', fontWeight: 900, fontSize: '0.7rem', padding: 0 }}>✕</button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </td>
                    );
                })}
            </tr>
        );
    });
};

export default ScheduleTable;
