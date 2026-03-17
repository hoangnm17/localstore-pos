import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/axiosInstance';
import Pagination from '../../components/Pagination/Pagination';
import { useNotification } from '../../components/global/Notification/NotificationContext';
import HandoverDetailModal from './modals/HandoverDetailModal';

const formatVND = (num) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);

const fmtLocalDate = (d) => {
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const dy = String(d.getDate()).padStart(2, '0');
    return `${y}-${mo}-${dy}`;
};

const fmtTime = (str) => {
    if (!str) return '—';
    const d = new Date(str);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const fmtDate = (str) => {
    if (!str) return '—';
    const d = new Date(str);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const PAGE_SIZE = 10;

const ROLE_OPTIONS = [
    { value: '', label: 'Tất cả vai trò' },
    { value: 'Cashier', label: 'Thu Ngân' },
    { value: 'Manager', label: 'Quản Lý' },
];

const diffColor = (d) => {
    const n = Number(d);
    if (!n || n === 0) return '#16a34a';
    return n < 0 ? '#dc2626' : '#d97706';
};

const HandoverReport = () => {
    const { showNotification } = useNotification();
    const today = fmtLocalDate(new Date());
    const firstOfMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`;

    const [fromDate, setFromDate] = useState(firstOfMonth);
    const [toDate, setToDate] = useState(today);
    const [roleFilter, setRoleFilter] = useState('');
    const [searchName, setSearchName] = useState('');
    const [searchShift, setSearchShift] = useState('');
    const [counterId, setCounterId] = useState('');
    const [page, setPage] = useState(1);

    const [data, setData] = useState([]);
    const [summary, setSummary] = useState(null);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(false);
    const [counters, setCounters] = useState([]);
    const [selectedRow, setSelectedRow] = useState(null);

    useEffect(() => {
        api.get('/roster/counters').then(res => {
            if (res.data?.success) setCounters(res.data.data);
        }).catch(() => { });
    }, []);

    const fetchReport = useCallback(async () => {
        setLoading(true);
        try {
            const params = { fromDate, toDate, page, pageSize: PAGE_SIZE };
            if (counterId) params.counterId = counterId;
            if (roleFilter) params.role = roleFilter;
            if (searchName) params.staffName = searchName;
            if (searchShift) params.shiftName = searchShift;

            const res = await api.get('/cashier/handover/report', { params });
            if (res.data?.success) {
                setData(res.data.data || []);
                setSummary(res.data.summary || null);
                setPagination(res.data.pagination || null);
            } else {
                showNotification(res.data?.message || 'Lỗi tải báo cáo!', 'error');
            }
        } catch (err) {
            showNotification(err.response?.data?.message || 'Lỗi kết nối!', 'error');
        } finally {
            setLoading(false);
        }
    }, [fromDate, toDate, counterId, roleFilter, searchName, searchShift, page, showNotification]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchName, searchShift]);

    useEffect(() => { setPage(1); }, [fromDate, toDate, counterId, roleFilter]);
    useEffect(() => { fetchReport(); }, [fetchReport]);

    return (
        <div className="d-flex" style={{ background: '#f0f2f5', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            <div className="flex-grow-1 p-4" style={{ background: '#f0f2f5', maxHeight: '100vh' }}>

                {/* ── HEADER BANNER ── */}
                <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h3 className="fw-bold m-0 text-dark">
                                Báo Cáo Bàn Giao Tiền Mặt
                            </h3>
                            <p className="m-0 mt-2 text-secondary">Tổng hợp kết ca và kiểm kê tiền mặt toàn bộ nhân viên.</p>
                        </div>
                    </div>

                    {/* Summary tiles */}
                    <div className="row g-3">
                        {[
                            { label: 'Số ca bàn giao', value: summary?.totalSessions ?? '—', icon: 'bi-calendar-check-fill', textClass: 'text-primary', bgClass: 'bg-primary-subtle' },
                            { label: 'Tổng Hệ Thống thu được', value: summary ? formatVND(summary.totalSystemCash) : '—', icon: 'bi-cash-stack', textClass: 'text-info', bgClass: 'bg-info-subtle' },
                            { label: 'Tổng thực đếm', value: summary ? formatVND(summary.totalActualCash) : '—', icon: 'bi-safe2-fill', textClass: 'text-success', bgClass: 'bg-success-subtle' },
                            { label: 'Tổng chênh lệch', value: summary ? formatVND(summary.totalDifference) : '—', icon: 'bi-clipboard2-data-fill', textClass: 'text-danger', bgClass: 'bg-danger-subtle' },
                        ].map(({ label, value, icon, textClass, bgClass }) => (
                            <div key={label} className="col-12 col-sm-6 col-md-3">
                                <div className="card border-0 shadow-sm rounded-4 h-100 p-3">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className={`d-flex align-items-center justify-content-center rounded-3 ${bgClass} ${textClass}`} style={{ width: '48px', height: '48px' }}>
                                            <i className={`bi ${icon} fs-4`} />
                                        </div>
                                        <div>
                                            <div className="fw-bold fs-5 lh-1 text-dark mb-1">{value}</div>
                                            <small className="text-secondary fw-medium" style={{ fontSize: '0.8rem' }}>{label}</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── FILTER CARD ── */}
                <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
                    <div className="row g-3 align-items-end">
                        <div className="col-md-2">
                            <label className="small fw-bold text-secondary mb-1">Từ ngày</label>
                            <input type="date" className="form-control border-0 bg-light" style={{ borderRadius: '10px' }}
                                value={fromDate} onChange={e => setFromDate(e.target.value)} />
                        </div>
                        <div className="col-md-2">
                            <label className="small fw-bold text-secondary mb-1">Đến ngày</label>
                            <input type="date" className="form-control border-0 bg-light" style={{ borderRadius: '10px' }}
                                value={toDate} onChange={e => setToDate(e.target.value)} />
                        </div>
                        {/* Vai trò */}
                        <div className="col-md-2">
                            <label className="small fw-bold text-secondary mb-1">Vai trò</label>
                            <select className="form-select border-0 bg-light" style={{ borderRadius: '10px' }}
                                value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                                {ROLE_OPTIONS.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>
                        {/* Quầy */}
                        <div className="col-md-2">
                            <label className="small fw-bold text-secondary mb-1">Quầy</label>
                            <select className="form-select border-0 bg-light" style={{ borderRadius: '10px' }}
                                value={counterId} onChange={e => setCounterId(e.target.value)}>
                                <option value="">Tất cả quầy</option>
                                {counters.map(c => (
                                    <option key={c.id} value={c.id}>{c.counterName}</option>
                                ))}
                            </select>
                        </div>
                        {/* Tìm tên nhân viên */}
                        <div className="col-md-2">
                            <label className="small fw-bold text-secondary mb-1">Tìm nhân viên</label>
                            <div className="position-relative">
                                <input type="text" className="form-control ps-3 border-0 bg-light" style={{ borderRadius: '10px', fontSize: '0.875rem' }}
                                    placeholder="Nhập tên..."
                                    value={searchName} onChange={e => setSearchName(e.target.value)} />
                            </div>
                        </div>
                        {/* Tìm tên ca */}
                        <div className="col-md-2">
                            <label className="small fw-bold text-secondary mb-1">Tìm ca làm</label>
                            <div className="position-relative">
                                <input type="text" className="form-control ps-3 border-0 bg-light" style={{ borderRadius: '10px', fontSize: '0.875rem' }}
                                    placeholder="Nhập tên ca..."
                                    value={searchShift} onChange={e => setSearchShift(e.target.value)} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── TABLE ── */}
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} />
                            <p className="mt-3 text-secondary">Đang tải dữ liệu...</p>
                        </div>
                    ) : (
                        <>
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.875rem' }}>
                                    <thead style={{ background: '#f8faff' }}>
                                        <tr>
                                            {[
                                                { label: 'Thời Gian', width: '110px' },
                                                { label: 'Nhân Viên', width: '160px' },
                                                { label: 'Ca Làm', width: '130px' },
                                                { label: 'Quầy', width: '100px' },
                                                { label: 'Tiền Đầu Ca', width: '110px', align: 'right' },
                                                { label: 'HT Thu (TM)', width: '120px', align: 'right' },
                                                { label: 'Thực Đếm', width: '110px', align: 'right' },
                                                { label: 'Chênh Lệch', width: '110px', align: 'right' },
                                                { label: 'Ghi Chú', width: '120px' },
                                                { label: 'Thao Tác', width: '60px', align: 'center' },
                                            ].map(({ label, width, align }) => (
                                                <th key={label} className="py-3 px-3 fw-bold text-secondary"
                                                    style={{
                                                        fontSize: '0.75rem', textTransform: 'uppercase',
                                                        letterSpacing: '0.5px', whiteSpace: 'nowrap',
                                                        width, textAlign: align || 'left'
                                                    }}>
                                                    {label}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.length === 0 ? (
                                            <tr>
                                                <td colSpan={10} className="text-center py-5 text-secondary">
                                                    <i className="bi bi-inbox fs-2 d-block mb-2" />
                                                    Không có dữ liệu bàn giao trong khoảng thời gian này
                                                </td>
                                            </tr>
                                        ) : data.map(row => {
                                            const diff = Number(row.difference);
                                            return (
                                                <tr key={row.handoverId} className="border-top">
                                                    <td className="px-3 py-3" style={{ width: '110px' }}>
                                                        <div className="fw-bold" style={{ color: '#0f172a', fontSize: '0.95rem', lineHeight: 1.2 }}>
                                                            {fmtTime(row.handoverTime.replace('Z', ''))}
                                                        </div>
                                                        <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '2px' }}>
                                                            {fmtDate(row.handoverTime)}
                                                        </div>
                                                    </td>
                                                    {/* Nhân Viên */}
                                                    <td className="px-3" style={{ width: '160px' }}>
                                                        <div className="fw-bold" style={{ color: '#0f172a', fontSize: '0.875rem' }}>{row.cashierName}</div>
                                                        <span className={`badge rounded-pill mt-1 ${row.roleName === 'Manager'
                                                            ? 'bg-info-subtle text-info border border-info'
                                                            : 'bg-primary-subtle text-primary border border-primary'}`}
                                                            style={{ fontSize: '0.65rem' }}>
                                                            {row.roleName === 'Manager' ? 'Quản Lý' : 'Thu Ngân'}
                                                        </span>
                                                    </td>
                                                    {/* Ca Làm */}
                                                    <td className="px-3" style={{ width: '130px' }}>
                                                        <div className="fw-semibold" style={{ fontSize: '0.82rem', color: '#0f172a' }}>
                                                            {row.shiftName || '—'}
                                                        </div>
                                                        <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: '2px' }}>
                                                            {row.shiftStart} – {row.shiftEnd}
                                                        </div>
                                                    </td>
                                                    {/* Quầy */}
                                                    <td className="px-3" style={{ width: '100px' }}>
                                                        {row.counterName ? (
                                                            <span className="badge bg-secondary-subtle text-secondary border"
                                                                style={{ fontSize: '0.75rem' }}>
                                                                <i className="bi bi-shop me-1" />{row.counterName}
                                                            </span>
                                                        ) : <span className="text-muted">—</span>}
                                                    </td>
                                                    {/* Tiền đầu ca */}
                                                    <td className="px-3 text-end" style={{ width: '110px', color: '#475569', fontWeight: 600 }}>
                                                        {formatVND(row.openingCash)}
                                                    </td>
                                                    {/* HT Thu */}
                                                    <td className="px-3 text-end" style={{ width: '120px', color: '#2563eb', fontWeight: 700 }}>
                                                        {formatVND(row.systemCash)}
                                                    </td>
                                                    {/* Thực đếm */}
                                                    <td className="px-3 text-end" style={{ width: '110px', color: '#16a34a', fontWeight: 700 }}>
                                                        {formatVND(row.actualCash)}
                                                    </td>
                                                    {/* Chênh lệch */}
                                                    <td className="px-3 text-end" style={{ width: '110px', color: diffColor(diff), fontWeight: 700 }}>
                                                        {diff > 0 ? '+' : ''}{formatVND(diff)}
                                                        {diff !== 0 && (
                                                            <i className={`bi ${diff < 0 ? 'bi-arrow-down-circle-fill' : 'bi-arrow-up-circle-fill'} ms-1`}
                                                                style={{ fontSize: '0.75rem' }} />
                                                        )}
                                                    </td>
                                                    {/* Ghi chú */}
                                                    <td className="px-3" style={{ width: '120px', maxWidth: '120px' }}>
                                                        <span className="text-muted" style={{
                                                            fontSize: '0.78rem', display: 'block',
                                                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '110px'
                                                        }}
                                                            title={row.note || ''}>
                                                            {row.note || '—'}
                                                        </span>
                                                    </td>
                                                    {/* Thao tác */}
                                                    <td className="px-2 text-center" style={{ width: '60px' }}>
                                                        <button className="btn btn-sm btn-outline-info rounded-pill px-2"
                                                            style={{ fontSize: '0.75rem' }}
                                                            title="Xem chi tiết"
                                                            onClick={() => setSelectedRow(row)}>
                                                            <i className="bi bi-eye-fill" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {pagination && pagination.totalPages > 1 && (
                                <div className="px-4 py-3 border-top">
                                    <Pagination
                                        currentPage={pagination.page}
                                        totalPages={pagination.totalPages}
                                        onPageChange={setPage}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {selectedRow && (
                <HandoverDetailModal
                    row={selectedRow}
                    onClose={() => setSelectedRow(null)}
                />
            )}
        </div>
    );
};

export default HandoverReport;