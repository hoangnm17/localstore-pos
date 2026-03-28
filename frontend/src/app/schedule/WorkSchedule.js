import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../components/global/Notification/NotificationContext';
import Pagination from '../../components/Pagination/Pagination';
import AssignShiftModal from './modals/AssignShiftModal';
import ConfirmRemoveModal from './modals/ConfirmRemoveModal';
import ScheduleHeader from './components/ScheduleHeader';
import ScheduleFilter from './components/ScheduleFilter';
import ScheduleTable from './components/ScheduleTable';
import { getWeeklySchedule, removeShift } from '../../services/Roster/roster.service';
import { getShifts } from '../../services/Shift/shift.service.js';
import useTitle from "hooks/common/useTitle";

const getMonday = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    date.setDate(date.getDate() + diff);
    date.setHours(0, 0, 0, 0);
    return date;
};
const formatDate = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const PAGE_SIZE = 5;

const WorkSchedule = () => {
    const { hasFeature } = useAuth();
    const { showNotification } = useNotification();
    const canAssign = hasFeature('CREATE_SCHEDULE') || hasFeature('CREATE_SHIFT');

    const todayStr = formatDate(new Date());

    const [currentMonday, setCurrentMonday] = useState(getMonday(new Date()));
    const [staffList, setStaffList] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filterMode, setFilterMode] = useState('staff');
    const [currentPage, setCurrentPage] = useState(1);

    const [assignCell, setAssignCell] = useState(null);
    const [removeId, setRemoveId] = useState(null);
    const [removeLoading, setRemoveLoading] = useState(false);

    useTitle("Phân công lịch")
    const weekDates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(currentMonday);
        d.setDate(d.getDate() + i);
        return d;
    });
    const startDate = formatDate(weekDates[0]);
    const endDate = formatDate(weekDates[6]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [schedRes, shiftRes] = await Promise.all([
                getWeeklySchedule(startDate, endDate),
                getShifts()
            ]);
            if (schedRes?.success) setStaffList(schedRes.data);
            if (shiftRes?.success) setShifts(shiftRes.data.filter(s => s.isActive === 1 || s.isActive === true));
        } catch (err) {
            console.error(err);
            showNotification(err.message || 'Không thể tải dữ liệu lịch làm!', 'error');
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate, showNotification]);

    useEffect(() => { fetchData(); }, [fetchData]);
    useEffect(() => { setCurrentPage(1); }, [searchText, filterMode, currentMonday]);

    const prevWeek = () => {
        const d = new Date(currentMonday);
        d.setDate(d.getDate() - 7);
        setCurrentMonday(d);
    };
    const nextWeek = () => {
        const d = new Date(currentMonday);
        d.setDate(d.getDate() + 7);
        setCurrentMonday(d);
    };

    const openAssign = (staff, dateStr) => {
        setAssignCell({
            staffId: staff.staffId,
            fullName: staff.fullName,
            roleName: staff.roleName,
            workDate: dateStr,
        });
    };
    const closeAssign = () => setAssignCell(null);
    const handleAssignSuccess = () => { closeAssign(); fetchData(); };

    const openRemove = (scheduleId) => setRemoveId(scheduleId);
    const closeRemove = () => setRemoveId(null);

    const handleConfirmRemove = async () => {
        setRemoveLoading(true);
        try {
            const res = await removeShift(removeId);
            if (res.success) {
                showNotification('Đã xóa phân công!', 'success');
                closeRemove();
                fetchData();
            }
        } catch (err) {
            showNotification(err.message || 'Lỗi xóa phân công!', 'error');
        } finally {
            setRemoveLoading(false);
        }
    };

    /* Filter */
    const filteredStaff = useMemo(() =>
        staffList.filter(s => {
            if (s.roleName !== 'Cashier' && s.roleName !== 'Warehouse') return false;
            const matchName = s.fullName.toLowerCase().includes(searchText.toLowerCase());
            return matchName;
        }),
        [staffList, searchText]);

    /* Paganation */
    const totalPages = Math.max(1, Math.ceil(filteredStaff.length / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const staffPage = filteredStaff.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    /* Stats */
    const stats = useMemo(() => ({
        totalCashier: filteredStaff.filter(s => s.roleName === 'Cashier').length,
        totalWarehouse: filteredStaff.filter(s => s.roleName === 'Warehouse').length,
        totalAssign: filteredStaff.reduce((acc, s) => {
            if (s.roleName !== 'Cashier') return acc;
            return acc + Object.values(s.schedules || {}).reduce((a, arr) => a + arr.length, 0);
        }, 0),
        totalHours: filteredStaff.reduce((acc, s) => acc + (s.totalHours || 0), 0),
        // activeCounters: counters.length,
    }), [filteredStaff]);

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                @keyframes spin { to { transform: rotate(360deg); } }
                .ws-add-btn:hover  { background: #eff6ff !important; border-color: #93c5fd !important; color: #3b82f6 !important; }
                .ws-remove-btn:hover { background: rgba(239,68,68,0.25) !important; }
                .ws-row:hover      { background: #f8fafc !important; }
                .ws-shift-card:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            `}</style>

            <div className="d-flex" style={{ background: '#f0f2f5', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
                <div className=" flex-grow-1 p-4" style={{ background: '#f0f2f5', maxHeight: '100vh' }}>

                    {/* Header */}
                    <ScheduleHeader
                        weekDates={weekDates}
                        stats={stats}
                        onPrevWeek={prevWeek}
                        onNextWeek={nextWeek}
                    />

                    {/* Filter */}
                    <ScheduleFilter
                        searchText={searchText} setSearchText={setSearchText}
                        filterMode={filterMode} setFilterMode={setFilterMode}
                        totalCount={filteredStaff.length}
                        onRefresh={fetchData}
                    />

                    {/* Table */}
                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                        <ScheduleTable
                            loading={loading}
                            filterMode={filterMode}
                            staffPage={staffPage}
                            shifts={shifts}
                            filteredStaff={filteredStaff}
                            weekDates={weekDates}
                            todayStr={todayStr}
                            canAssign={canAssign}
                            onOpenAssign={openAssign}
                            onRemove={openRemove}
                        />
                    </div>

                    {/* Pagination */}
                    {!loading && filterMode === 'staff' && (
                        <Pagination
                            currentPage={safePage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </div>
            </div>

            {assignCell && (
                <AssignShiftModal
                    cell={assignCell}
                    shifts={shifts}
                    // counters={counters}
                    isCashier={assignCell.roleName === 'Cashier'}
                    onClose={closeAssign}
                    onSuccess={handleAssignSuccess}
                />
            )}

            {removeId && (
                <ConfirmRemoveModal
                    onConfirm={handleConfirmRemove}
                    onClose={closeRemove}
                    loading={removeLoading}
                />
            )}
        </>
    );
};

export default WorkSchedule;
