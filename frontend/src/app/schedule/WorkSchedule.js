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
import { getShifts } from '../../services/Shift/shift.service';
import useTitle from 'hooks/common/useTitle';
import { getMonday, formatDate, getTodayString, isActiveShift, isCashierRole } from './utils/schedule.utils';

const PAGE_SIZE = 5;

const WorkSchedule = () => {
    const { hasFeature } = useAuth();
    const { showNotification } = useNotification();
    const canAssign = hasFeature('CREATE_SCHEDULE');

    const todayStr = getTodayString();

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

    useTitle('Phân công lịch');

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
                getShifts(),
            ]);

            if (schedRes?.success) {
                setStaffList(schedRes.data);
            }

            if (shiftRes?.success) {
                setShifts(shiftRes.data.filter(isActiveShift));
            }
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

    const handleAssignSuccess = () => {
        closeAssign();
        fetchData();
    };

    const openRemove = (scheduleId) => setRemoveId(scheduleId);
    const closeRemove = () => setRemoveId(null);

    const handleConfirmRemove = async () => {
        if (!removeId) return;
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

    const filteredStaff = useMemo(() => {
        return staffList.filter((staff) => {
            const isCashier = isCashierRole(staff.roleName);
            const matchName = staff.fullName
                .toLowerCase()
                .includes(searchText.toLowerCase());

            return isCashier && matchName;
        });
    }, [staffList, searchText]);

    const totalPages = Math.max(1, Math.ceil(filteredStaff.length / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const staffPage = filteredStaff.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    return (
        <>
            <div className="d-flex min-vh-100 bg-light">
                <div className="flex-grow-1 p-4 bg-light">

                    <ScheduleHeader
                        weekDates={weekDates}
                        onPrevWeek={prevWeek}
                        onNextWeek={nextWeek}
                    />

                    <ScheduleFilter
                        searchText={searchText}
                        setSearchText={setSearchText}
                        filterMode={filterMode}
                        setFilterMode={setFilterMode}
                        totalCount={filteredStaff.length}
                        onRefresh={fetchData}
                    />

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
                    onClose={closeAssign}
                    onSuccess={handleAssignSuccess}
                    onRefreshData={fetchData}
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