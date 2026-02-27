import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import api from '../../services/axiosInstance';
import { useAuth } from '../../hooks/useAuth';


const getMonday = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    date.setDate(date.getDate() + diff);
    date.setHours(0, 0, 0, 0);
    return date;
};

const formatDate = (d) => d.toISOString().split('T')[0];

const dayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const WorkSchedule = () => {
    const { hasFeature } = useAuth();
    const canAssign = hasFeature('CREATE_SHIFT');

    const [currentMonday, setCurrentMonday] = useState(getMonday(new Date()));
    const [staffList, setStaffList] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filterMode, setFilterMode] = useState('staff');
    const [roleFilter, setRoleFilter] = useState('all');

    const [showModal, setShowModal] = useState(false);
    const [modalCell, setModalCell] = useState(null);
    const [selectedShiftIds, setSelectedShiftIds] = useState([]);   
    const [modalMsg, setModalMsg] = useState('');

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
                api.get(`/roster?startDate=${startDate}&endDate=${endDate}`),
                api.get('/shifts')
            ]);
            if (schedRes.data?.success) setStaffList(schedRes.data.data);
            if (shiftRes.data?.success) setShifts(shiftRes.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]);

    useEffect(() => { fetchData(); }, [fetchData]);

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

    const openAssignModal = (staff, dateStr) => {
        setModalCell({ staffId: staff.staffId, fullName: staff.fullName, workDate: dateStr });
        setSelectedShiftIds([]);   // ← reset mảng
        setModalMsg('');
        setShowModal(true);
    };

    const handleAssign = async () => {
        if (selectedShiftIds.length === 0) {
            setModalMsg('Vui lòng chọn ít nhất một ca!');
            return;
        }
        try {
            // Gọi API song song cho từng ca được chọn
            const results = await Promise.all(
                selectedShiftIds.map(shiftId =>
                    api.post('/roster', {
                        staffId: modalCell.staffId,
                        shiftId,
                        workDate: modalCell.workDate
                    })
                )
            );
            const failedResult = results.find(r => !r.data?.success);
            if (!failedResult) {
                setShowModal(false);
                fetchData();
            } else {
                setModalMsg(failedResult.data?.message || 'Lỗi phân công!');
            }
        } catch (err) {
            setModalMsg(err.response?.data?.message || 'Lỗi phân công!');
        }
    };

    const handleRemove = async (scheduleId) => {
        if (!window.confirm('Bỏ phân công ca này?')) return;
        try {
            await api.delete(`/roster/${scheduleId}`);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi xóa phân công!');
        }
    };

    const formatHours = (h) => {
        const hours = Math.floor(h);
        const mins = Math.round((h - hours) * 60);
        return `${String(hours).padStart(2, '0')}h${String(mins).padStart(2, '0')}m`;
    };

    const filteredStaff = staffList.filter(s => {
        const matchName = s.fullName.toLowerCase().includes(searchText.toLowerCase());
        const matchRole = roleFilter === 'all' || s.roleName === roleFilter;
        return matchName && matchRole;
    });

    const shiftColors = ['bg-success', 'bg-primary', 'bg-warning text-dark', 'bg-info text-dark', 'bg-danger', 'bg-secondary'];
    const getShiftColor = (shiftId) => shiftColors[(shiftId - 1) % shiftColors.length];

    const toggleShift = (shiftId) => {
        setModalMsg('');
        setSelectedShiftIds(prev =>
            prev.includes(shiftId) ? prev.filter(id => id !== shiftId) : [...prev, shiftId]
        );
    };

    return (
        <div className="d-flex" style={{ background: '#f0f2f5', minHeight: '100vh' }}>
            <Sidebar />

            <div className="flex-grow-1 p-3">
                <div className="card shadow border-0 rounded-4">
                    {/* Header */}
                    <div className="card-header bg-dark text-white p-3 rounded-top-4 d-flex justify-content-between align-items-center">
                        <h5 className="m-0 fw-bold">
                            <i className="bi bi-calendar3-week me-2"></i>
                            THỜI KHÓA BIỂU NHÂN VIÊN
                        </h5>
                        {/* Week picker */}
                        <div className="d-flex align-items-center gap-2">
                            <button className="btn btn-sm btn-outline-light" onClick={prevWeek}>
                                <i className="bi bi-chevron-left"></i>
                            </button>
                            <span className="fw-bold text-white small">
                                {weekDates[0].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                {' – '}
                                {weekDates[6].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </span>
                            <button className="btn btn-sm btn-outline-light" onClick={nextWeek}>
                                <i className="bi bi-chevron-right"></i>
                            </button>
                        </div>
                    </div>

                    <div className="card-body p-3">
                        {/* Toolbar */}
                        <div className="d-flex gap-2 mb-3 flex-wrap">
                            <input
                                type="text"
                                className="form-control"
                                style={{ maxWidth: 220 }}
                                placeholder="Tìm kiếm nhân viên..."
                                value={searchText}
                                onChange={e => setSearchText(e.target.value)}
                            />
                            <select
                                className="form-select"
                                style={{ maxWidth: 200 }}
                                value={filterMode}
                                onChange={e => setFilterMode(e.target.value)}
                            >
                                <option value="staff">Xem theo nhân viên</option>
                                <option value="shift">Xem theo ca</option>
                            </select>
                            <select
                                className="form-select"
                                style={{ maxWidth: 200 }}
                                value={roleFilter}
                                onChange={e => setRoleFilter(e.target.value)}
                            >
                                <option value="all">Tất cả nhân viên</option>
                                <option value="Cashier">Cashier (theo ca)</option>
                                <option value="Warehouse">Warehouse (theo tháng)</option>
                            </select>
                        </div>

                        {/* Table */}
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary"></div>
                                <p className="mt-2">Đang tải...</p>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-bordered align-middle text-center" style={{ minWidth: 900 }}>
                                    <thead className="table-dark">
                                        <tr>
                                            <th style={{ minWidth: 130 }}>Nhân viên</th>
                                            <th style={{ width: 80 }}>Tổng giờ</th>
                                            {weekDates.map((d, i) => (
                                                <th key={i} style={{ minWidth: 110 }}>
                                                    {dayLabels[i]} {d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStaff.length === 0 ? (
                                            <tr>
                                                <td colSpan={9} className="text-center py-5 text-secondary">
                                                    <i className="bi bi-calendar-x fs-1"></i>
                                                    <p className="mt-2">Không có dữ liệu</p>
                                                </td>
                                            </tr>
                                        ) : filteredStaff.map(staff => {
                                            const isCashier   = staff.roleName === 'Cashier';
                                            const isWarehouse = staff.roleName === 'Warehouse';
                                            return (
                                            <tr key={staff.staffId}
                                                className={isWarehouse ? 'table-light' : ''}
                                            >
                                                {/* Tên + badge role */}
                                                <td className="text-start ps-3">
                                                    <div className="fw-bold">{staff.fullName}</div>
                                                    <span className={`badge ${isCashier ? 'bg-primary' : 'bg-secondary'} mt-1`}
                                                        style={{ fontSize: '0.65rem' }}>
                                                        {isCashier ? '⚡ Cashier' : '📦 Warehouse'}
                                                    </span>
                                                </td>

                                                {/* Tổng giờ — chỉ Cashier mới tính */}
                                                <td className="fw-bold text-primary">
                                                    {isCashier ? formatHours(staff.totalHours) : <span className="text-secondary">—</span>}
                                                </td>

                                                {weekDates.map((d, i) => {
                                                    const dateStr   = formatDate(d);
                                                    const dayShifts = isCashier ? (staff.schedules?.[dateStr] || []) : [];
                                                    return (
                                                        <td key={i} className="p-1" style={{ verticalAlign: 'middle' }}>
                                                            {isWarehouse ? (
                                                                // Warehouse: ô trống, không cho gán ca
                                                                null
                                                            ) : (
                                                                // Cashier: hiện ca và nút + (nếu có quyền)
                                                                <>
                                                                    {dayShifts.map(sc => (
                                                                        <div
                                                                            key={sc.scheduleId}
                                                                            className={`badge ${getShiftColor(sc.shiftId)} me-1 mb-1 p-2 d-flex align-items-center justify-content-between`}
                                                                            style={{ cursor: 'default', fontSize: '0.75rem', borderRadius: 6 }}
                                                                            title={`${sc.shiftName}: ${sc.startTime}–${sc.endTime}`}
                                                                        >
                                                                            <span>{sc.shiftName}</span>
                                                                            {/* Nút × chỉ hiện với ASSIGN_SHIFT */}
                                                                            {canAssign && (
                                                                                <i
                                                                                    className="bi bi-x ms-1"
                                                                                    style={{ cursor: 'pointer' }}
                                                                                    onClick={() => handleRemove(sc.scheduleId)}
                                                                                    title="Xóa phân công"
                                                                                ></i>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                    {/* Nút + chỉ hiện với ASSIGN_SHIFT */}
                                                                    {canAssign && (
                                                                        <button
                                                                            className="btn btn-sm btn-outline-secondary rounded-circle p-0"
                                                                            style={{ width: 26, height: 26, fontSize: '1rem', lineHeight: 1 }}
                                                                            onClick={() => openAssignModal(staff, dateStr)}
                                                                            title="Thêm ca"
                                                                        >
                                                                            <i className="bi bi-plus"></i>
                                                                        </button>
                                                                    )}
                                                                </>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal phân công ca */}
            {showModal && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg rounded-4">
                            <div className="modal-header bg-dark text-white">
                                <h5 className="modal-title fw-bold">
                                    <i className="bi bi-calendar-plus me-2"></i>
                                    Gán lịch làm việc
                                </h5>
                                <button className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <p className="mb-1"><strong>Nhân viên:</strong> {modalCell?.fullName}</p>
                                <p className="mb-3"><strong>Ngày:</strong> {new Date(modalCell?.workDate + 'T00:00:00').toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}</p>

                                <label className="form-label fw-bold">Chọn ca làm việc *</label>

                                {/* Checkbox grid — giống ảnh 3 */}
                                <div
                                    className="border rounded p-3"
                                    style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}
                                >
                                    {shifts.map(s => (
                                        <div
                                            key={s.id}
                                            className="p-3 border rounded"
                                            style={{
                                                cursor: 'pointer',
                                                background: selectedShiftIds.includes(s.id) ? '#eef2ff' : 'white',
                                                borderColor: selectedShiftIds.includes(s.id) ? '#6366f1' : '#dee2e6'
                                            }}
                                            onClick={() => toggleShift(s.id)}
                                        >
                                            <div className="d-flex align-items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input mt-0"
                                                    checked={selectedShiftIds.includes(s.id)}
                                                    onChange={() => {}}
                                                    readOnly
                                                />
                                                <strong>{s.name}</strong>
                                            </div>
                                            <div className="text-secondary ms-4" style={{ fontSize: '0.8rem' }}>
                                                {s.startTime} - {s.endTime}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {modalMsg && (
                                    <div className="alert alert-danger mt-3 py-2">
                                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                        {modalMsg}
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer border-0">
                                <button className="btn btn-light px-4" onClick={() => setShowModal(false)}>Thoát</button>
                                <button className="btn btn-primary px-4 fw-bold" onClick={handleAssign}>
                                    <i className="bi bi-check-circle me-2"></i>
                                    Lưu
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkSchedule;
