import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/axiosInstance';
import { useNotification } from '../../components/global/Notification/NotificationContext';
import { useAuth } from '../../hooks/useAuth';
import { attendanceService } from '../../services/Attendance/attendance.service';
import CashHandover from './CashHandover';
import { useShiftReminder } from '../../hooks/useShiftReminder';
import useTitle from "hooks/common/useTitle";

const getMonday = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    date.setDate(date.getDate() + diff);
    return date;
};

const formatDate = (d) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const formatHours = (h) => {
    if (!h) return '0h 00m';
    const hours = Math.floor(h);
    const mins = Math.round((h - hours) * 60);
    return `${hours}h ${String(mins).padStart(2, '0')}m`;
};

const calcHours = (start, end) => {
    if (!start || !end) return 0;
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    let mins = (eh * 60 + em) - (sh * 60 + sm);
    if (mins < 0) mins += 24 * 60;
    return mins / 60;
};

const dayLabels = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];

const shiftColors = [
    { bg: '#dbeafe', text: '#1d4ed8', border: '#93c5fd' },
    { bg: '#dcfce7', text: '#15803d', border: '#86efac' },
    { bg: '#fef3c7', text: '#b45309', border: '#fcd34d' },
    { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' },
    { bg: '#f3e8ff', text: '#7e22ce', border: '#d8b4fe' }
];
const getShiftStyle = (id) => shiftColors[(id - 1) % shiftColors.length] || shiftColors[0];

const MySchedule = () => {
    useTitle("Lịch Của Tôi")
    const { showNotification } = useNotification();
    const { roleName } = useAuth();

    const [loading, setLoading] = useState(true);
    const [currentMonday, setCurrentMonday] = useState(getMonday(new Date()));
    const [staffInfo, setStaffInfo] = useState(null);
    const [schedules, setSchedules] = useState([]);
    const [showHandover, setShowHandover] = useState(false);

    const weekDates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(currentMonday);
        d.setDate(d.getDate() + i);
        return d;
    });
    const startDate = formatDate(weekDates[0]);
    const endDate = formatDate(weekDates[6]);
    const todayStr = formatDate(new Date());

    const mapByDate = {};
    let totalWeekHours = 0;

    schedules.forEach(sc => {
        const dStr = sc.workDate.split('T')[0];
        if (!mapByDate[dStr]) mapByDate[dStr] = [];
        mapByDate[dStr].push(sc);
        totalWeekHours += calcHours(sc.startTime, sc.endTime);
    });

    const todayShifts = mapByDate[todayStr] || [];
    const activeShift = todayShifts.find(sc => sc.scheduleStatus === 'working');

    useShiftReminder(activeShift);
    const fetchMySchedule = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/cashier/my-schedule?startDate=${startDate}&endDate=${endDate}`);
            const isSuccess = res.data?.success ?? res.success;
            if (isSuccess) {
                const responseData = res.data?.data || res.data;
                setStaffInfo(responseData.staff);
                setSchedules(responseData.schedules || []);
            }
        } catch (err) {
            showNotification('Không thể tải lịch làm việc!', 'error');
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate, showNotification]);

    useEffect(() => { fetchMySchedule(); }, [fetchMySchedule]);

    const prevWeek = () => { const d = new Date(currentMonday); d.setDate(d.getDate() - 7); setCurrentMonday(d); };
    const nextWeek = () => { const d = new Date(currentMonday); d.setDate(d.getDate() + 7); setCurrentMonday(d); };

    const isOver48 = totalWeekHours > 48;

    return (
        <div className="d-flex" style={{ background: '#f0f2f5', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            <div className="flex-grow-1 p-4" style={{ background: '#f0f2f5', maxHeight: '100vh' }}>

                {/* Header & Điều hướng */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h3 className="fw-bold m-0 text-dark">Lịch Làm Việc Cá Nhân</h3>
                        <p className="m-0 mt-2 text-secondary">Xem ca làm việc.</p>
                    </div>
                    <div className="d-flex align-items-center gap-2 p-1 bg-white rounded-pill shadow-sm border border-light">
                        <button className="btn btn-sm btn-light rounded-pill fw-bold px-3 text-secondary" onClick={prevWeek}>
                            <i className="bi bi-chevron-left me-1"></i> Trước
                        </button>
                        <span className="fw-bold text-dark px-2" style={{ fontSize: '0.88rem' }}>
                            {weekDates[0].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                            &nbsp;—&nbsp;
                            {weekDates[6].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </span>
                        <button className="btn btn-sm btn-light rounded-pill fw-bold px-3 text-secondary" onClick={nextWeek}>
                            Sau <i className="bi bi-chevron-right ms-1"></i>
                        </button>
                    </div>
                </div>

                {/* Staff Info & Nút Action */}
                <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 d-flex flex-row justify-content-between align-items-center">
                    <div className="fw-bold text-secondary" style={{ fontSize: '1rem' }}>
                        <i className="bi bi-person-badge-fill me-2 text-primary" />
                        Nhân viên: <span className="text-dark">{staffInfo ? staffInfo.fullName : (loading ? 'Đang tải...' : '')}</span>
                    </div>

                    {(() => {
                        const todayShifts = mapByDate[todayStr] || [];
                        const activeShift = todayShifts.find(sc => sc.scheduleStatus === 'working');
                        if (roleName === 'Manager') {
                            if (!activeShift) {
                                return (
                                    <button className="btn btn-secondary fw-bold px-4 py-2 opacity-50" disabled>
                                        Không Có Ca Hôm Nay
                                    </button>
                                );
                            }
                            return (
                                <button
                                    className="btn text-white fw-bold px-4 py-2 shadow-sm d-flex align-items-center gap-2"
                                    style={{ borderRadius: '8px', background: '#6366f1', border: 'none' }}
                                    onClick={() => setShowHandover(true)}
                                    disabled={loading || !staffInfo}
                                >
                                    <i className="bi bi-wallet2" /> Kết Ca & Bàn Giao
                                </button>
                            );
                        }
                        // WAREHOUSE: Nếu đang làm → hiện nút Kết Ca Ra Về
                        if (roleName === 'Warehouse') {
                            if (!activeShift) {
                                return (
                                    <button className="btn btn-secondary fw-bold px-4 py-2 opacity-50" disabled>
                                        Đang Chờ Vào Ca
                                    </button>
                                );
                            }
                            return (
                                <button
                                    className="btn btn-danger text-white fw-bold px-4 py-2 shadow-sm d-flex align-items-center gap-2"
                                    style={{ borderRadius: '8px', border: 'none' }}
                                    disabled={loading || !staffInfo}
                                    onClick={async () => {
                                        try {
                                            const res = await attendanceService.simpleCheckOut(activeShift.scheduleId);
                                            if (res.success) {
                                                showNotification(res.data?.message || 'Tan ca thành công!', 'success');
                                                fetchMySchedule();
                                            } else {
                                                showNotification(res.message || 'Lỗi kết ca!', 'error');
                                            }
                                        } catch (error) {
                                            showNotification(error.response?.data?.message || error.message || 'Lỗi!', 'error');
                                        }
                                    }}
                                >
                                    <i className="bi bi-box-arrow-right" /> Kết Ca Ra Về
                                </button>
                            );
                        }

                        if (!activeShift) {
                            return (
                                <button className="btn btn-secondary fw-bold px-4 py-2 opacity-50" disabled>
                                    Đang Chờ Vào Ca
                                </button>
                            );
                        }
                        return (
                            <button
                                className="btn text-white fw-bold px-4 py-2 shadow-sm d-flex align-items-center gap-2"
                                style={{ borderRadius: '8px', background: '#6366f1', border: 'none' }}
                                onClick={() => setShowHandover(true)}
                                disabled={loading || !staffInfo}
                            >
                                <i className="bi bi-wallet2" /> Bàn Giao Tiền Két
                            </button>
                        );
                    })()}
                </div>

                {/* Bảng Lịch */}
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} />
                            <div className="mt-2 text-secondary fw-bold">Đang tải dữ liệu...</div>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="table table-hover align-middle mb-0" style={{ minWidth: '1100px' }}>
                                <thead style={{ background: '#f8faff' }}>
                                    <tr>
                                        <th className="py-3 ps-4 fw-bold text-secondary" style={{ fontSize: '0.75rem', textTransform: 'uppercase', width: '220px' }}>
                                            NHÂN VIÊN
                                        </th>
                                        <th className="py-3 text-center fw-bold text-secondary" style={{ fontSize: '0.75rem', textTransform: 'uppercase', width: '90px' }}>
                                            TỔNG GIỜ
                                        </th>
                                        {weekDates.map((d, i) => {
                                            const isToday = formatDate(d) === todayStr;
                                            return (
                                                <th key={i} className="py-2 text-center border-start border-light" style={{ width: '120px' }}>
                                                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: isToday ? '#d97706' : '#64748b', textTransform: 'uppercase' }}>
                                                        {dayLabels[i]}
                                                    </div>
                                                    <span style={{
                                                        display: 'inline-block',
                                                        background: isToday ? '#f59e0b' : '#e2e8f0',
                                                        color: isToday ? '#fff' : '#475569',
                                                        borderRadius: '6px', padding: '2px 8px',
                                                        fontWeight: 700, fontSize: '0.8rem', marginTop: '2px'
                                                    }}>
                                                        {d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                                    </span>
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-top bg-white">
                                        <td className="ps-4 py-3 align-top">
                                            <div className="d-flex align-items-center gap-2">
                                                <div style={{
                                                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                                                    background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: '#fff', fontWeight: 800, fontSize: '1rem',
                                                }}>
                                                    {staffInfo?.fullName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="fw-bold" style={{ fontSize: '0.9rem', color: '#0f172a' }}>
                                                        {staffInfo?.fullName}
                                                    </div>
                                                    <span className="badge bg-primary rounded-pill mt-1" style={{ fontSize: '0.65rem' }}>
                                                        CÁ NHÂN
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-center py-3 align-top">
                                            {(roleName === 'Manager' || roleName === 'Warehouse')
                                                ? <span className="text-secondary fw-bold" style={{ fontSize: '0.85rem' }}>HÀNH CHÍNH</span>
                                                : <span style={{ fontWeight: 800, fontSize: '0.85rem', color: isOver48 ? '#dc2626' : '#2563eb' }}>
                                                    {isOver48 && <i className="bi bi-exclamation-triangle-fill me-1 text-warning" />}
                                                    {formatHours(totalWeekHours)}
                                                </span>
                                            }
                                        </td>

                                        {weekDates.map((d, i) => {
                                            const dStr = formatDate(d);
                                            const isToday = dStr === todayStr;
                                            const dayShifts = mapByDate[dStr] || [];

                                            return (
                                                <td key={i} className="py-2 align-top" style={{ borderLeft: '1px dashed #e2e8f0', background: isToday ? '#fffbeb' : 'transparent' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '2px 4px' }}>
                                                        {dayShifts.map(sc => {
                                                            const sStyle = getShiftStyle(sc.shiftId);
                                                            const isCompleted = sc.scheduleStatus === 'completed' || sc.handoverId;
                                                            return (
                                                                <div key={sc.scheduleId} style={{
                                                                    borderRadius: '8px', padding: '8px',
                                                                    backgroundColor: isCompleted ? '#f1f5f9' : sStyle.bg,
                                                                    border: `1px solid ${isCompleted ? '#cbd5e1' : sStyle.border}`,
                                                                    color: isCompleted ? '#64748b' : sStyle.text,
                                                                    position: 'relative',
                                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                                                }}>
                                                                    <div style={{ fontWeight: 700, fontSize: '0.78rem', paddingRight: '15px' }}>
                                                                        {sc.shiftName || sc.snapshotShiftName}
                                                                    </div>
                                                                    <div style={{ fontSize: '0.68rem', opacity: 0.85, margin: '2px 0' }}>
                                                                        <i className="bi bi-clock me-1" />{sc.startTime} – {sc.endTime}
                                                                    </div>
                                                                    {(sc.counterName || sc.counterCode) && (
                                                                        <div style={{ fontSize: '0.68rem', opacity: 0.9 }}>
                                                                            <i className="bi bi-shop me-1" />
                                                                            {sc.counterName || sc.counterCode}
                                                                        </div>
                                                                    )}
                                                                    {isCompleted && (
                                                                        <i className="bi bi-check-circle-fill text-success position-absolute"
                                                                            style={{ top: '8px', right: '8px', fontSize: '0.8rem' }}
                                                                            title="Đã kết ca" />
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                        {dayShifts.length === 0 && (
                                                            <div className="text-center" style={{ fontSize: '0.75rem', color: '#cbd5e1', padding: '8px' }}>—</div>
                                                        )}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {showHandover && (
                <CashHandover
                    staffInfo={staffInfo}
                    todayStr={todayStr}
                    onClose={() => setShowHandover(false)}
                    onSuccess={() => {
                        setShowHandover(false);
                        fetchMySchedule();
                    }}
                />
            )}
        </div>
    );
};

export default MySchedule;
