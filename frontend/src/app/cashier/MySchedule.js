import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNotification } from '../../components/global/Notification/NotificationContext';
import { useAuth } from '../../hooks/useAuth';
import { attendanceService } from '../../services/Attendance/attendance.service';
import CashHandover from './CashHandover';
import { useShiftReminder } from '../../hooks/useShiftReminder';
import useTitle from 'hooks/common/useTitle';
import { getDuration } from '../shift/utils/time';
import { getMySchedule } from '../../services/Cashier/cashier.service';
import {
    getMonday,
    formatDate,
    getWeekDates,
    formatHours,
    groupSchedulesByDate,
    getScheduleCardStyle,
    formatDisplayTime,
} from './utils/cashier.utils';

const dayLabels = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];

const MySchedule = () => {
    useTitle('Lịch Của Tôi');

    const { showNotification } = useNotification();
    const { roleName } = useAuth();

    const [loading, setLoading] = useState(true);
    const [currentMonday, setCurrentMonday] = useState(getMonday(new Date()));
    const [staffInfo, setStaffInfo] = useState(null);
    const [schedules, setSchedules] = useState([]);
    const [showHandover, setShowHandover] = useState(false);

    const weekDates = useMemo(() => getWeekDates(currentMonday), [currentMonday]);
    const startDate = formatDate(weekDates[0]);
    const endDate = formatDate(weekDates[6]);
    const todayStr = formatDate(new Date());

    const { scheduleMap, totalWeekHours } = useMemo(() => {
        return groupSchedulesByDate(schedules, getDuration);
    }, [schedules]);

    const todayShifts = scheduleMap[todayStr] || [];
    const activeShift = todayShifts.find((schedule) => schedule.scheduleStatus === 'working');

    useShiftReminder(activeShift);

    const fetchMySchedule = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getMySchedule(startDate, endDate);
            const isSuccess = res?.success;

            if (isSuccess) {
                const responseData = res.data || res;
                setStaffInfo(responseData.staff);
                setSchedules(responseData.schedules || []);
            }
        } catch (err) {
            showNotification(
                err.response?.data?.message || 'Không thể tải lịch làm việc!',
                'error'
            );
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate, showNotification]);

    useEffect(() => {
        fetchMySchedule();
    }, [fetchMySchedule]);

    const prevWeek = () => {
        const date = new Date(currentMonday);
        date.setDate(date.getDate() - 7);
        setCurrentMonday(date);
    };

    const nextWeek = () => {
        const date = new Date(currentMonday);
        date.setDate(date.getDate() + 7);
        setCurrentMonday(date);
    };

    const handleWarehouseCheckOut = async () => {
        if (!activeShift) return;

        try {
            const res = await attendanceService.simpleCheckOut(activeShift.scheduleId);
            if (res.success) {
                showNotification(res.data?.message || 'Tan ca thành công!', 'success');
                fetchMySchedule();
            } else {
                showNotification(res.message || 'Lỗi kết ca!', 'error');
            }
        } catch (error) {
            showNotification(
                error.response?.data?.message || error.message || 'Lỗi!',
                'error'
            );
        }
    };

    const renderActionButton = () => {
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
                    onClick={handleWarehouseCheckOut}
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
                <i className="bi bi-wallet2" />
                {roleName === 'Manager' ? 'Kết Ca & Bàn Giao' : 'Bàn Giao Tiền Két'}
            </button>
        );
    };

    const isOver48 = totalWeekHours > 48;

    return (
        <div className="d-flex" style={{ background: '#f0f2f5', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            <div className="flex-grow-1 p-4" style={{ background: '#f0f2f5', maxHeight: '100vh' }}>
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

                <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 d-flex flex-row justify-content-between align-items-center">
                    <div className="fw-bold text-secondary" style={{ fontSize: '1rem' }}>
                        <i className="bi bi-person-badge-fill me-2 text-primary" />
                        Nhân viên: <span className="text-dark">{staffInfo ? staffInfo.fullName : (loading ? 'Đang tải...' : '')}</span>
                    </div>

                    {renderActionButton()}
                </div>

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

                                        {weekDates.map((date, index) => {
                                            const isToday = formatDate(date) === todayStr;

                                            return (
                                                <th key={index} className="py-2 text-center border-start border-light" style={{ width: '120px' }}>
                                                    <div
                                                        style={{
                                                            fontSize: '0.7rem',
                                                            fontWeight: 700,
                                                            color: isToday ? '#d97706' : '#64748b',
                                                            textTransform: 'uppercase'
                                                        }}
                                                    >
                                                        {dayLabels[index]}
                                                    </div>

                                                    <span
                                                        style={{
                                                            display: 'inline-block',
                                                            background: isToday ? '#f59e0b' : '#e2e8f0',
                                                            color: isToday ? '#fff' : '#475569',
                                                            borderRadius: '6px',
                                                            padding: '2px 8px',
                                                            fontWeight: 700,
                                                            fontSize: '0.8rem',
                                                            marginTop: '2px'
                                                        }}
                                                    >
                                                        {date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
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
                                                <div
                                                    style={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: '50%',
                                                        flexShrink: 0,
                                                        background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: '#fff',
                                                        fontWeight: 800,
                                                        fontSize: '1rem',
                                                    }}
                                                >
                                                    {staffInfo?.fullName?.charAt(0).toUpperCase()}
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
                                            {roleName === 'Manager' || roleName === 'Warehouse' ? (
                                                <span className="text-secondary fw-bold" style={{ fontSize: '0.85rem' }}>
                                                    HÀNH CHÍNH
                                                </span>
                                            ) : (
                                                <span style={{ fontWeight: 800, fontSize: '0.85rem', color: isOver48 ? '#dc2626' : '#2563eb' }}>
                                                    {isOver48 && <i className="bi bi-exclamation-triangle-fill me-1 text-warning" />}
                                                    {formatHours(totalWeekHours)}
                                                </span>
                                            )}
                                        </td>

                                        {weekDates.map((date, index) => {
                                            const dateKey = formatDate(date);
                                            const isToday = dateKey === todayStr;
                                            const dayShifts = scheduleMap[dateKey] || [];

                                            return (
                                                <td
                                                    key={index}
                                                    className="py-2 align-top"
                                                    style={{ borderLeft: '1px dashed #e2e8f0', background: isToday ? '#fffbeb' : 'transparent' }}
                                                >
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '2px 4px' }}>
                                                        {dayShifts.map((schedule) => {
                                                            const cardStyle = getScheduleCardStyle(schedule.scheduleStatus, schedule.handoverId);
                                                            const isAbsent = schedule.scheduleStatus === 'absent';
                                                            const isCompleted = schedule.scheduleStatus === 'completed' || schedule.handoverId;

                                                            return (
                                                                <div
                                                                    key={schedule.scheduleId}
                                                                    style={{
                                                                        borderRadius: '8px',
                                                                        padding: '8px',
                                                                        backgroundColor: cardStyle.bg,
                                                                        border: `1px solid ${cardStyle.border}`,
                                                                        color: cardStyle.text,
                                                                        position: 'relative',
                                                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                                                    }}
                                                                >
                                                                    <div style={{ fontWeight: 700, fontSize: '0.78rem', paddingRight: '15px' }}>
                                                                        {schedule.shiftName || schedule.snapshotShiftName}
                                                                        {isAbsent && <small className="text-danger ms-1">[Vắng]</small>}
                                                                    </div>

                                                                    <div style={{ fontSize: '0.68rem', opacity: 0.85, margin: '2px 0' }}>
                                                                        <i className="bi bi-clock me-1" />
                                                                        {formatDisplayTime(schedule.startTime)} – {formatDisplayTime(schedule.endTime)}
                                                                    </div>

                                                                    {isCompleted && (
                                                                        <i
                                                                            className="bi bi-check-circle-fill text-success position-absolute"
                                                                            style={{ top: '8px', right: '8px', fontSize: '0.8rem' }}
                                                                            title="Đã kết ca"
                                                                        />
                                                                    )}
                                                                </div>
                                                            );
                                                        })}

                                                        {dayShifts.length === 0 && (
                                                            <div className="text-center" style={{ fontSize: '0.75rem', color: '#cbd5e1', padding: '8px' }}>
                                                                —
                                                            </div>
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