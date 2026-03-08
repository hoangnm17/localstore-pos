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

const dayLabels = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];

const styles = {
    page: {
        backgroundColor: '#f0f4f8',
        minHeight: '100vh',
        fontFamily: "'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    },
    content: {
        padding: '2rem 2.5rem',
    },
    // ── Header ──
    headerWrap: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
    },
    pageTitle: {
        fontSize: '1.85rem',
        fontWeight: 800,
        color: '#0f172a',
        letterSpacing: '-0.5px',
        margin: 0,
    },
    pageSubtitle: {
        color: '#64748b',
        fontWeight: 500,
        fontSize: '0.95rem',
        marginTop: '0.2rem',
    },
    weekNav: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: '#ffffff',
        padding: '0.4rem 0.6rem',
        borderRadius: '999px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0',
    },
    weekLabel: {
        padding: '0 1rem',
        fontWeight: 700,
        fontSize: '0.95rem',
        color: '#334155',
        whiteSpace: 'nowrap',
    },
    btnPrev: {
        background: 'transparent',
        border: '1px solid #e2e8f0',
        borderRadius: '999px',
        padding: '0.45rem 1.1rem',
        fontWeight: 600,
        fontSize: '0.88rem',
        color: '#475569',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    btnNext: {
        background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)',
        border: 'none',
        borderRadius: '999px',
        padding: '0.45rem 1.1rem',
        fontWeight: 600,
        fontSize: '0.88rem',
        color: '#ffffff',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    // ── Stats ──
    statsRow: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
    },
    statCard: {
        flex: 1,
        background: '#ffffff',
        borderRadius: '1rem',
        padding: '1rem 1.4rem',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        border: '1px solid #e2e8f0',
    },
    statLabel: {
        fontSize: '0.78rem',
        fontWeight: 600,
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        marginBottom: '0.3rem',
    },
    statValue: {
        fontSize: '1.6rem',
        fontWeight: 800,
        color: '#0f172a',
        lineHeight: 1,
    },
    statSub: {
        fontSize: '0.78rem',
        color: '#64748b',
        marginTop: '0.25rem',
    },
    // ── Card ──
    card: {
        background: '#ffffff',
        borderRadius: '1.25rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
    },
    cardBody: {
        padding: '1.5rem',
    },
    // ── Filters ──
    filterRow: {
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    filterInput: {
        flex: '1 1 220px',
        border: '1.5px solid #e2e8f0',
        borderRadius: '0.75rem',
        padding: '0.6rem 1rem',
        fontSize: '0.9rem',
        fontWeight: 500,
        color: '#334155',
        background: '#f8fafc',
        outline: 'none',
    },
    filterSelect: {
        flex: '0 0 auto',
        border: '1.5px solid #e2e8f0',
        borderRadius: '0.75rem',
        padding: '0.6rem 0.9rem',
        fontSize: '0.9rem',
        fontWeight: 500,
        color: '#334155',
        background: '#f8fafc',
        outline: 'none',
        cursor: 'pointer',
    },
    // ── Table ──
    tableWrap: {
        borderRadius: '0.875rem',
        border: '1px solid #e2e8f0',
        overflowX: 'auto',
        overflowY: 'auto',
        maxHeight: '62vh',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        minWidth: '1100px',
        fontSize: '0.875rem',
    },
    theadTr: {
        background: 'linear-gradient(90deg, #1e293b 0%, #0f172a 100%)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
    },
    th: {
        padding: '0.9rem 0.75rem',
        color: '#e2e8f0',
        fontWeight: 700,
        fontSize: '0.78rem',
        textTransform: 'uppercase',
        letterSpacing: '0.7px',
        textAlign: 'center',
        whiteSpace: 'nowrap',
    },
    thFirst: {
        padding: '0.9rem 1.25rem',
        color: '#e2e8f0',
        fontWeight: 700,
        fontSize: '0.78rem',
        textTransform: 'uppercase',
        letterSpacing: '0.7px',
        textAlign: 'left',
        whiteSpace: 'nowrap',
        width: '200px',
    },
    thDay: {
        padding: '0.5rem 0.4rem',
        textAlign: 'center',
    },
    dayName: {
        color: '#94a3b8',
        fontWeight: 700,
        fontSize: '0.72rem',
        letterSpacing: '1px',
        textTransform: 'uppercase',
        marginBottom: '0.3rem',
    },
    dayBadge: {
        display: 'inline-block',
        background: 'rgba(255,255,255,0.12)',
        color: '#ffffff',
        borderRadius: '6px',
        padding: '0.2rem 0.5rem',
        fontWeight: 700,
        fontSize: '0.82rem',
    },
    tbodyRow: {
        borderBottom: '1px solid #f1f5f9',
        transition: 'background 0.15s',
    },
    tdFirst: {
        padding: '0.9rem 1.25rem',
        textAlign: 'left',
        verticalAlign: 'middle',
    },
    tdHours: {
        padding: '0.9rem 0.5rem',
        textAlign: 'center',
        verticalAlign: 'middle',
    },
    tdDay: {
        padding: '0.5rem 0.4rem',
        textAlign: 'center',
        verticalAlign: 'top',
        borderLeft: '1px dashed #e2e8f0',
        minWidth: '110px',
    },
    staffName: {
        fontWeight: 700,
        color: '#0f172a',
        fontSize: '0.9rem',
        marginBottom: '0.3rem',
    },
    // ── Shift chips in table ──
    shiftChip: {
        borderRadius: '8px',
        padding: '0.35rem 0.5rem',
        marginBottom: '0.3rem',
        position: 'relative',
        textAlign: 'left',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        cursor: 'default',
    },
    shiftChipName: {
        fontWeight: 700,
        fontSize: '0.8rem',
        display: 'block',
        paddingRight: '28px',
    },
    shiftChipTime: {
        fontSize: '0.7rem',
        opacity: 0.8,
        display: 'block',
    },
    removeBtn: {
        position: 'absolute',
        top: '50%',
        right: '6px',
        transform: 'translateY(-50%)',
        background: 'rgba(239,68,68,0.15)',
        border: 'none',
        borderRadius: '50%',
        width: '20px',
        height: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: '#ef4444',
        fontWeight: 900,
        fontSize: '0.75rem',
        lineHeight: 1,
        transition: 'background 0.2s',
        padding: 0,
    },
    addShiftBtn: {
        width: '100%',
        border: '1.5px dashed #cbd5e1',
        borderRadius: '8px',
        padding: '0.4rem 0',
        background: 'transparent',
        color: '#94a3b8',
        fontWeight: 600,
        fontSize: '0.8rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
        marginTop: '0.2rem',
    },
    warehouseNote: {
        fontSize: '0.72rem',
        color: '#94a3b8',
        fontStyle: 'italic',
        textAlign: 'center',
        padding: '0.5rem 0.2rem',
    },
    // ── Modal ──
    overlay: {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(6px)',
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
    },
    modalBox: {
        background: '#ffffff',
        borderRadius: '1.25rem',
        width: '100%',
        maxWidth: '620px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        overflow: 'hidden',
        animation: 'slideUp 0.25s ease',
    },
    modalHeader: {
        background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    modalTitle: {
        color: '#ffffff',
        fontWeight: 800,
        fontSize: '1.1rem',
        margin: 0,
        letterSpacing: '-0.3px',
    },
    modalBody: {
        padding: '1.5rem',
    },
    modalInfoBox: {
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '0.875rem',
        padding: '1rem 1.25rem',
        marginBottom: '1.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
    },
    modalInfoLabel: {
        fontSize: '0.72rem',
        fontWeight: 700,
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: '0.7px',
        marginBottom: '0.2rem',
    },
    modalInfoValue: {
        fontSize: '1.05rem',
        fontWeight: 800,
        color: '#0f172a',
    },
    modalSectionTitle: {
        fontWeight: 700,
        fontSize: '0.88rem',
        color: '#475569',
        marginBottom: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    selectedCount: {
        background: '#dbeafe',
        color: '#1d4ed8',
        borderRadius: '999px',
        padding: '0.1rem 0.6rem',
        fontSize: '0.78rem',
        fontWeight: 700,
    },
    shiftGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '0.6rem',
    },
    shiftCard: {
        borderRadius: '0.75rem',
        padding: '0.75rem 1rem',
        cursor: 'pointer',
        transition: 'all 0.15s',
        border: '2px solid transparent',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
    },
    shiftCardInfo: {
        flex: 1,
    },
    shiftCardName: {
        fontWeight: 700,
        fontSize: '0.9rem',
        marginBottom: '0.1rem',
    },
    shiftCardTime: {
        fontSize: '0.78rem',
        opacity: 0.75,
        fontWeight: 500,
    },
    checkbox: {
        width: '20px',
        height: '20px',
        borderRadius: '5px',
        flexShrink: 0,
        cursor: 'pointer',
    },
    modalError: {
        background: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '0.75rem',
        padding: '0.75rem 1rem',
        color: '#b91c1c',
        fontWeight: 600,
        fontSize: '0.88rem',
        marginTop: '1rem',
        textAlign: 'center',
    },
    modalFooter: {
        padding: '1rem 1.5rem',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '0.75rem',
        borderTop: '1px solid #f1f5f9',
    },
    btnCancel: {
        background: '#f1f5f9',
        border: 'none',
        borderRadius: '0.75rem',
        padding: '0.6rem 1.4rem',
        fontWeight: 600,
        fontSize: '0.9rem',
        color: '#475569',
        cursor: 'pointer',
    },
    btnConfirm: {
        background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)',
        border: 'none',
        borderRadius: '0.75rem',
        padding: '0.6rem 1.5rem',
        fontWeight: 700,
        fontSize: '0.9rem',
        color: '#ffffff',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(59,130,246,0.35)',
    },
    // ── Loading ──
    loadingWrap: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '5rem 0',
        gap: '1rem',
    },
    spinner: {
        width: '44px',
        height: '44px',
        border: '4px solid #e2e8f0',
        borderTopColor: '#3b82f6',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    },
    emptyMsg: {
        textAlign: 'center',
        padding: '4rem 0',
        color: '#94a3b8',
        fontWeight: 600,
        fontSize: '0.95rem',
    },
};

const WorkSchedule = () => {
    const { hasFeature } = useAuth();
    const canAssign = hasFeature('CREATE_SCHEDULE') || hasFeature('CREATE_SHIFT');

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

    // Hover states cho các nút nhỏ
    const [hoveredAdd, setHoveredAdd] = useState(null);
    const [hoveredRemove, setHoveredRemove] = useState(null);

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
        setSelectedShiftIds([]);
        setModalMsg('');
        setShowModal(true);
    };

    const handleAssign = async () => {
        if (selectedShiftIds.length === 0) {
            setModalMsg('Vui lòng chọn ít nhất một ca!');
            return;
        }
        try {
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
        if (!h) return '—';
        const hours = Math.floor(h);
        const mins = Math.round((h - hours) * 60);
        return `${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m`;
    };

    const filteredStaff = staffList.filter(s => {
        if (s.roleName !== 'Cashier' && s.roleName !== 'Warehouse') return false;
        const matchName = s.fullName.toLowerCase().includes(searchText.toLowerCase());
        const matchRole = roleFilter === 'all' || s.roleName === roleFilter;
        return matchName && matchRole;
    });

    // ── Stats ──
    const totalCashier = filteredStaff.filter(s => s.roleName === 'Cashier').length;
    const totalWarehouse = filteredStaff.filter(s => s.roleName === 'Warehouse').length;
    const totalAssignments = filteredStaff.reduce((acc, s) => {
        if (s.roleName !== 'Cashier') return acc;
        return acc + Object.values(s.schedules || {}).reduce((a, arr) => a + arr.length, 0);
    }, 0);
    const totalHoursAllStaff = filteredStaff.reduce((acc, s) => acc + (s.totalHours || 0), 0);

    const shiftStyles = [
        { bg: '#e0f2fe', text: '#0369a1', border: '#7dd3fc' },
        { bg: '#dcfce7', text: '#15803d', border: '#86efac' },
        { bg: '#fef3c7', text: '#b45309', border: '#fcd34d' },
        { bg: '#fee2e2', text: '#b91c1c', border: '#fca5a5' },
        { bg: '#f3e8ff', text: '#7e22ce', border: '#d8b4fe' },
        { bg: '#f1f5f9', text: '#334155', border: '#cbd5e1' }
    ];

    const getShiftStyle = (shiftId) => shiftStyles[(shiftId - 1) % shiftStyles.length];
    const toggleShift = (shiftId) => {
        setModalMsg('');
        setSelectedShiftIds(prev =>
            prev.includes(shiftId) ? prev.filter(id => id !== shiftId) : [...prev, shiftId]
        );
    };

    // ── Tính ngày hiện tại để highlight ──
    const todayStr = formatDate(new Date());

    return (
        <>
            {/* CSS animation nhúng thẳng */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .ws-add-btn:hover { background: #eff6ff !important; border-color: #93c5fd !important; color: #3b82f6 !important; }
                .ws-remove-btn:hover { background: rgba(239,68,68,0.25) !important; }
                .ws-tbody-row:hover { background: #f8fafc !important; }
                .ws-btn-prev:hover { background: #f1f5f9 !important; }
                .ws-shift-card:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            `}</style>

            <div style={{ display: 'flex', ...styles.page }}>
                <Sidebar />

                <div style={{ flex: 1, ...styles.content }}>

                    {/* ── Page Header ── */}
                    <div style={styles.headerWrap}>
                        <div>
                            <h1 style={styles.pageTitle}>
                                 Lịch Làm Việc
                            </h1>
                            <p style={styles.pageSubtitle}>Quản lý & phân công ca cho nhân viên</p>
                        </div>
                        <div style={styles.weekNav}>
                            <button
                                className="ws-btn-prev"
                                style={styles.btnPrev}
                                onClick={prevWeek}
                            >
                                ◀ Tuần trước
                            </button>
                            <span style={styles.weekLabel}>
                                {weekDates[0].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                &nbsp;—&nbsp;
                                {weekDates[6].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </span>
                            <button
                                style={styles.btnNext}
                                onClick={nextWeek}
                            >
                                Tuần sau ▶
                            </button>
                        </div>
                    </div>

                    {/* ── Stats Row ── */}
                    <div style={styles.statsRow}>
                        <div style={styles.statCard}>
                            <div style={styles.statLabel}>Thu Ngân</div>
                            <div style={styles.statValue}>{totalCashier}</div>
                            <div style={styles.statSub}>nhân viên trong tuần</div>
                        </div>
                        <div style={styles.statCard}>
                            <div style={styles.statLabel}>Nhân Viên Kho</div>
                            <div style={styles.statValue}>{totalWarehouse}</div>
                            <div style={styles.statSub}>làm hành chính</div>
                        </div>
                        <div style={styles.statCard}>
                            <div style={styles.statLabel}>Ca đã phân công</div>
                            <div style={{ ...styles.statValue, color: '#2563eb' }}>{totalAssignments}</div>
                            <div style={styles.statSub}>lượt ca trong tuần</div>
                        </div>
                        <div style={styles.statCard}>
                            <div style={styles.statLabel}>Tổng Giờ Làm</div>
                            <div style={{ ...styles.statValue, color: '#059669' }}>{formatHours(totalHoursAllStaff)}</div>
                            <div style={styles.statSub}>toàn bộ nhân viên</div>
                        </div>
                    </div>

                    {/* ── Main Card ── */}
                    <div style={styles.card}>
                        <div style={styles.cardBody}>

                            {/* ── Filters ── */}
                            <div style={styles.filterRow}>
                                <input
                                    type="text"
                                    style={styles.filterInput}
                                    placeholder="  Tìm tên nhân viên..."
                                    value={searchText}
                                    onChange={e => setSearchText(e.target.value)}
                                />
                                <select
                                    style={styles.filterSelect}
                                    value={filterMode}
                                    onChange={e => setFilterMode(e.target.value)}
                                >
                                    <option value="staff">Xem theo: Nhân Viên</option>
                                    <option value="shift">Xem theo: Ca Làm Việc</option>
                                </select>
                                <select
                                    style={styles.filterSelect}
                                    value={roleFilter}
                                    onChange={e => setRoleFilter(e.target.value)}
                                >
                                    <option value="all">Phòng ban: Tất cả</option>
                                    <option value="Cashier">Thu Ngân</option>
                                    <option value="Warehouse">Nhân Viên Kho</option>
                                </select>
                            </div>

                            {/* ── Table or Loading ── */}
                            {loading ? (
                                <div style={styles.loadingWrap}>
                                    <div style={styles.spinner} />
                                    <span style={{ color: '#64748b', fontWeight: 600 }}>Đang tải dữ liệu...</span>
                                </div>
                            ) : (
                                <div style={styles.tableWrap}>
                                    <table style={styles.table}>
                                        <thead>
                                            <tr style={styles.theadTr}>
                                                <th style={{ ...styles.thFirst, textAlign: 'left', width: '190px' }}>
                                                    {filterMode === 'staff' ? 'NHÂN VIÊN' : 'CA LÀM VIỆC'}
                                                </th>
                                                <th style={{ ...styles.th, width: '80px' }}>
                                                    {filterMode === 'staff' ? 'GIỜ' : 'SL'}
                                                </th>
                                                {weekDates.map((d, i) => {
                                                    const dStr = formatDate(d);
                                                    const isToday = dStr === todayStr;
                                                    return (
                                                        <th key={i} style={{ ...styles.thDay, width: '120px' }}>
                                                            <div style={{ ...styles.dayName, color: isToday ? '#fbbf24' : '#94a3b8' }}>
                                                                {dayLabels[i]}
                                                            </div>
                                                            <span style={{
                                                                ...styles.dayBadge,
                                                                background: isToday ? '#f59e0b' : 'rgba(255,255,255,0.1)',
                                                                color: isToday ? '#1e293b' : '#ffffff',
                                                            }}>
                                                                {d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                                            </span>
                                                        </th>
                                                    );
                                                })}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filterMode === 'staff' ? (
                                                filteredStaff.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={9} style={styles.emptyMsg}>
                                                             Không tìm thấy nhân viên phù hợp.
                                                        </td>
                                                    </tr>
                                                ) : filteredStaff.map(staff => {
                                                    const isCashier = staff.roleName === 'Cashier';
                                                    const isWarehouse = staff.roleName === 'Warehouse';
                                                    return (
                                                        <tr
                                                            key={staff.staffId}
                                                            className="ws-tbody-row"
                                                            style={{
                                                                ...styles.tbodyRow,
                                                                background: isWarehouse ? '#fafaf9' : '#ffffff',
                                                            }}
                                                        >
                                                            {/* ─ Cột nhân viên ─ */}
                                                            <td style={styles.tdFirst}>
                                                                <div style={styles.staffName}>{staff.fullName}</div>
                                                                <span style={{
                                                                    display: 'inline-block',
                                                                    borderRadius: '999px',
                                                                    padding: '0.15rem 0.6rem',
                                                                    fontSize: '0.7rem',
                                                                    fontWeight: 700,
                                                                    letterSpacing: '0.5px',
                                                                    background: isCashier ? '#dbeafe' : '#f1f5f9',
                                                                    color: isCashier ? '#1d4ed8' : '#64748b',
                                                                    border: `1px solid ${isCashier ? '#bfdbfe' : '#e2e8f0'}`,
                                                                }}>
                                                                    {isCashier ? 'THU NGÂN' : 'KHO'}
                                                                </span>
                                                            </td>
                                                            {/* ─ Cột giờ ─ */}
                                                            <td style={styles.tdHours}>
                                                                {isCashier ? (
                                                                    <span style={{ fontWeight: 800, color: '#2563eb', fontSize: '0.88rem' }}>
                                                                        {formatHours(staff.totalHours)}
                                                                    </span>
                                                                ) : (
                                                                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>HC</span>
                                                                )}
                                                            </td>
                                                            {/* ─ Cột từng ngày ─ */}
                                                            {weekDates.map((d, i) => {
                                                                const dateStr = formatDate(d);
                                                                const isToday = dateStr === todayStr;
                                                                const dayShifts = isCashier ? (staff.schedules?.[dateStr] || []) : [];
                                                                return (
                                                                    <td
                                                                        key={i}
                                                                        style={{
                                                                            ...styles.tdDay,
                                                                            background: isToday ? '#fffbeb' : 'transparent',
                                                                        }}
                                                                    >
                                                                        {isWarehouse ? (
                                                                            <div style={styles.warehouseNote}>Hành chính</div>
                                                                        ) : (
                                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                                                                {dayShifts.map(sc => {
                                                                                    const sStyle = getShiftStyle(sc.shiftId);
                                                                                    return (
                                                                                        <div
                                                                                            key={sc.scheduleId}
                                                                                            style={{
                                                                                                ...styles.shiftChip,
                                                                                                backgroundColor: sStyle.bg,
                                                                                                border: `1px solid ${sStyle.border}`,
                                                                                                color: sStyle.text,
                                                                                            }}
                                                                                        >
                                                                                            <span style={styles.shiftChipName}>{sc.shiftName}</span>
                                                                                            <span style={{ ...styles.shiftChipTime, color: sStyle.text }}>
                                                                                                {sc.startTime} – {sc.endTime}
                                                                                            </span>
                                                                                            {canAssign && (
                                                                                                <button
                                                                                                    className="ws-remove-btn"
                                                                                                    style={styles.removeBtn}
                                                                                                    title="Xóa ca này"
                                                                                                    onClick={() => handleRemove(sc.scheduleId)}
                                                                                                >
                                                                                                    ✕
                                                                                                </button>
                                                                                            )}
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                                {canAssign && (
                                                                                    <button
                                                                                        className="ws-add-btn"
                                                                                        style={styles.addShiftBtn}
                                                                                        onClick={() => openAssignModal(staff, dateStr)}
                                                                                    >
                                                                                        + Thêm ca
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    );
                                                })
                                            ) : (
                                                shifts.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={9} style={styles.emptyMsg}>
                                                             Chưa có ca làm việc nào.
                                                        </td>
                                                    </tr>
                                                ) : shifts.map(shift => {
                                                    const sStyle = getShiftStyle(shift.id);
                                                    return (
                                                        <tr key={shift.id} className="ws-tbody-row" style={{ ...styles.tbodyRow, background: '#ffffff' }}>
                                                            <td style={styles.tdFirst}>
                                                                <div style={{ ...styles.staffName, fontSize: '0.95rem' }}>{shift.name}</div>
                                                                <span style={{
                                                                    display: 'inline-block',
                                                                    borderRadius: '999px',
                                                                    padding: '0.15rem 0.6rem',
                                                                    fontSize: '0.72rem',
                                                                    fontWeight: 700,
                                                                    background: sStyle.bg,
                                                                    color: sStyle.text,
                                                                    border: `1px solid ${sStyle.border}`,
                                                                }}>
                                                                    {shift.startTime} → {shift.endTime}
                                                                </span>
                                                            </td>
                                                            <td style={styles.tdHours}>
                                                                {(() => {
                                                                    let count = 0;
                                                                    weekDates.forEach(d => {
                                                                        const dateStr = formatDate(d);
                                                                        filteredStaff.forEach(staff => {
                                                                            if (staff.schedules?.[dateStr]?.some(sc => sc.shiftId === shift.id)) count++;
                                                                        });
                                                                    });
                                                                    return count > 0
                                                                        ? <span style={{ fontWeight: 800, color: '#059669', fontSize: '1rem' }}>{count}</span>
                                                                        : <span style={{ color: '#94a3b8' }}>—</span>;
                                                                })()}
                                                            </td>
                                                            {weekDates.map((d, i) => {
                                                                const dateStr = formatDate(d);
                                                                const isToday = dateStr === todayStr;
                                                                const staffInShift = filteredStaff.filter(staff => {
                                                                    const dayShifts = staff.schedules?.[dateStr] || [];
                                                                    return dayShifts.some(sc => sc.shiftId === shift.id);
                                                                });
                                                                return (
                                                                    <td key={i} style={{
                                                                        ...styles.tdDay,
                                                                        background: isToday ? '#fffbeb' : 'transparent',
                                                                    }}>
                                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                                                            {staffInShift.map(staff => {
                                                                                const entry = staff.schedules[dateStr].find(sc => sc.shiftId === shift.id);
                                                                                return (
                                                                                    <div
                                                                                        key={staff.staffId}
                                                                                        style={{
                                                                                            background: '#f8fafc',
                                                                                            border: '1px solid #e2e8f0',
                                                                                            borderRadius: '8px',
                                                                                            padding: '0.35rem 0.5rem',
                                                                                            position: 'relative',
                                                                                            paddingRight: canAssign ? '30px' : '0.5rem',
                                                                                        }}
                                                                                    >
                                                                                        <div style={{ fontWeight: 600, fontSize: '0.78rem', color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                                            {staff.fullName}
                                                                                        </div>
                                                                                        {canAssign && (
                                                                                            <button
                                                                                                className="ws-remove-btn"
                                                                                                style={styles.removeBtn}
                                                                                                title="Xóa ca này"
                                                                                                onClick={() => handleRemove(entry.scheduleId)}
                                                                                            >
                                                                                                ✕
                                                                                            </button>
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
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Modal Phân Công ── */}
                {showModal && (
                    <div style={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
                        <div style={styles.modalBox}>
                            {/* Header */}
                            <div style={styles.modalHeader}>
                                <h5 style={styles.modalTitle}> Phân Công Ca Làm Việc</h5>
                                <button
                                    style={{ ...styles.btnCancel, background: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: '0.5rem', padding: '0.3rem 0.8rem' }}
                                    onClick={() => setShowModal(false)}
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Body */}
                            <div style={styles.modalBody}>
                                {/* Info box */}
                                <div style={styles.modalInfoBox}>
                                    <div>
                                        <div style={styles.modalInfoLabel}>Nhân viên</div>
                                        <div style={styles.modalInfoValue}>{modalCell?.fullName}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={styles.modalInfoLabel}>Ngày làm việc</div>
                                        <div style={{ ...styles.modalInfoValue, color: '#2563eb', fontSize: '0.95rem' }}>
                                            {new Date(modalCell?.workDate + 'T00:00:00').toLocaleDateString('vi-VN', {
                                                weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Section title */}
                                <div style={styles.modalSectionTitle}>
                                    Chọn ca làm việc
                                    {selectedShiftIds.length > 0 && (
                                        <span style={styles.selectedCount}>{selectedShiftIds.length} đã chọn</span>
                                    )}
                                </div>

                                {/* Shift grid */}
                                <div style={styles.shiftGrid}>
                                    {shifts.map(s => {
                                        const isSelected = selectedShiftIds.includes(s.id);
                                        const sStyle = getShiftStyle(s.id);
                                        return (
                                            <div
                                                key={s.id}
                                                className="ws-shift-card"
                                                style={{
                                                    ...styles.shiftCard,
                                                    backgroundColor: isSelected ? sStyle.bg : '#f8fafc',
                                                    border: `2px solid ${isSelected ? sStyle.border : '#e2e8f0'}`,
                                                    boxShadow: isSelected ? `0 2px 8px rgba(0,0,0,0.1)` : 'none',
                                                }}
                                                onClick={() => toggleShift(s.id)}
                                            >
                                                <div style={styles.shiftCardInfo}>
                                                    <div style={{ ...styles.shiftCardName, color: isSelected ? sStyle.text : '#0f172a' }}>
                                                        {s.name}
                                                    </div>
                                                    <div style={{ ...styles.shiftCardTime, color: isSelected ? sStyle.text : '#64748b' }}>
                                                        {s.startTime} – {s.endTime}
                                                    </div>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    style={styles.checkbox}
                                                    checked={isSelected}
                                                    onChange={() => { }}
                                                    readOnly
                                                />
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Error */}
                                {modalMsg && <div style={styles.modalError}> {modalMsg}</div>}
                            </div>

                            {/* Footer */}
                            <div style={styles.modalFooter}>
                                <button style={styles.btnCancel} onClick={() => setShowModal(false)}>Hủy bỏ</button>
                                <button style={styles.btnConfirm} onClick={handleAssign}>
                                     Xác Nhận Phân Công
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default WorkSchedule;