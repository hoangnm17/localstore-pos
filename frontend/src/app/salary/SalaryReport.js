import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../services/axiosInstance';
import { useNotification } from '../../components/global/Notification/NotificationContext';
import useDebounce from '../../hooks/common/useDebounce';
import Pagination from '../../components/Pagination/Pagination';

import SalaryHeader from './components/SalaryHeader';
import SalaryDetailModal from './modals/SalaryDetailModal';

const PAGE_SIZE = 4;

const formatVND = (num) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);
const formatVNDRaw = (num) => Math.round(num || 0).toString();

const formatHours = (decimalHours) => {
    if (!decimalHours) return '0h 00m';
    const h = Math.floor(decimalHours);
    const m = Math.round((decimalHours - h) * 60);
    return `${h}h ${String(m).padStart(2, '0')}m`;
};

const exportToCSV = (data, month, year) => {
    if (!data || data.length === 0) return;

    const headers = ['STT', 'Họ và tên', 'Vai trò', 'Hình thức lương', 'Tổng công / Giờ', 'Mức lương cơ sở (VND)', 'Khấu trừ (VND)', 'Thực lĩnh (VND)', 'Ghi chú'];

    const rows = data.map((row, idx) => {
        const isHourly = row.salaryType === 'hourly';
        const congGio = isHourly
            ? `${Math.floor(row.totalHours)}h${String(Math.round((row.totalHours - Math.floor(row.totalHours)) * 60)).padStart(2, '0')}m`
            : `${row.workingDays}/${row.totalDaysInMonth} ngay`;

        return [
            idx + 1,
            row.fullName,
            row.roleName || '',
            isHourly ? 'Luong gio' : 'Luong co dinh',
            congGio,
            formatVNDRaw(row.baseSalary),
            formatVNDRaw(row.deductions),
            formatVNDRaw(row.netSalary),
            row.note || '',
        ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
    });

    const BOM = '\uFEFF';
    const csvContent = BOM + [headers.join(','), ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BaoCaoLuong_T${String(month).padStart(2, '0')}_${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
};

const SalaryReport = () => {
    const { showNotification } = useNotification();
    const now = new Date();

    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [role, setRole] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const searchTerm = useDebounce(searchInput, 400);

    const [roleList, setRoleList] = useState([]);
    const [report, setReport] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [selectedRow, setSelectedRow] = useState(null);

    useEffect(() => {
        api.get('/salary/roles')
            .then(res => { if (res.data?.success) setRoleList(res.data.data); })
            .catch(err => console.error('Lỗi tải roles', err));
    }, []);

    const fetchReport = useCallback(async () => {
        setLoading(true);
        try {
            const params = { month, year };
            if (role) params.role = role;

            const res = await api.get('/salary', { params });
            const isSuccess = res.data?.success ?? res.success;

            if (isSuccess) {
                setReport(res.data.data);
                setSummary(res.data.summary);
            } else {
                showNotification(res.data?.message || 'Lỗi tải báo cáo!', 'error');
                setReport([]);
            }
        } catch (err) {
            showNotification(err.response?.data?.message || 'Lỗi kết nối server!', 'error');
            setReport([]);
        } finally {
            setLoading(false);
        }
    }, [month, year, role, showNotification]);

    useEffect(() => { fetchReport(); }, [fetchReport]);
    useEffect(() => { setPage(1); }, [searchTerm, role, month, year]);

    const filteredReport = useMemo(() => {
        return report.filter(r => r.fullName.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [report, searchTerm]);

    const totalPages = Math.ceil(filteredReport.length / PAGE_SIZE) || 1;
    const paginated = filteredReport.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const years = [];
    for (let y = 2023; y <= now.getFullYear() + 1; y++) years.push(y);

    return (
        <div className="d-flex" style={{ background: '#f0f2f5', minHeight: '100vh' }}>
            <div className=" flex-grow-1 p-4" style={{ background: '#f0f2f5', maxHeight: '100vh' }}>
                <SalaryHeader summary={summary} />
                <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
                    <div className="row g-3 align-items-end">
                        <div className="col-md-3">
                            <label className="small fw-bold text-secondary mb-1">Tháng / Năm</label>
                            <div className="d-flex gap-2">
                                <select className="form-select border-0 bg-light fw-bold" style={{ borderRadius: '12px' }}
                                    value={month} onChange={e => setMonth(Number(e.target.value))}>
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                                    ))}
                                </select>
                                <select className="form-select border-0 bg-light fw-bold" style={{ borderRadius: '12px' }}
                                    value={year} onChange={e => setYear(Number(e.target.value))}>
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <label className="small fw-bold text-secondary mb-1">Tìm kiếm nhân viên</label>
                            <div className="position-relative">
                                <i className="bi bi-search position-absolute"
                                    style={{ left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                                <input type="text" className="form-control ps-5 border-0 bg-light"
                                    style={{ borderRadius: '12px' }}
                                    placeholder="Nhập tên nhân viên..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)} />
                            </div>
                        </div>

                        <div className="col-md-2">
                            <label className="small fw-bold text-secondary mb-1">Lọc vai trò</label>
                            <select className="form-select border-0 bg-light" style={{ borderRadius: '12px' }}
                                value={role} onChange={e => setRole(e.target.value)}>
                                <option value="">Tất cả vai trò</option>
                                {roleList.map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-3 d-flex gap-2 justify-content-end align-items-end">
                            <span className="badge bg-primary rounded-pill px-3 py-2 fs-6 me-1" title="Số lượng kết quả">
                                {filteredReport.length} NV
                            </span>
                            <button
                                className="btn btn-success fw-bold px-3"
                                style={{ borderRadius: '10px', fontSize: '0.875rem' }}
                                onClick={() => exportToCSV(filteredReport, month, year)}
                                disabled={loading || filteredReport.length === 0}
                                title="Xuất file CSV (mở bằng Excel)"
                            >
                                <i className="bi bi-file-earmark-spreadsheet-fill me-1" />CSV
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bảng dữ liệu */}
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} />
                            <p className="mt-3 text-secondary">Đang tổng hợp dữ liệu...</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead style={{ background: '#f8faff' }}>
                                    <tr className="text-center small fw-bold text-secondary text-uppercase"
                                        style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                                        <th className="py-3" style={{ width: '50px' }}>#</th>
                                        <th className="text-start py-3">Nhân viên</th>
                                        <th className="py-3">Hình thức</th>
                                        <th className="py-3 text-end">Tổng công / giờ</th>
                                        <th className="py-3 text-end">Khấu trừ</th>
                                        <th className="py-3 text-end">Thực lĩnh</th>
                                        <th className="py-3">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginated.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-5 text-secondary">
                                                <i className="bi bi-inbox fs-2 d-block mb-2" />
                                                Không có dữ liệu cho khoảng thời gian này
                                            </td>
                                        </tr>
                                    ) : paginated.map((row, idx) => {
                                        const isHourly = row.salaryType === 'hourly';
                                        return (
                                            <tr key={row.staffId} className="border-top">
                                                <td className="text-center text-secondary small">
                                                    {(page - 1) * PAGE_SIZE + idx + 1}
                                                </td>
                                                <td>
                                                    <div className="fw-bold" style={{ color: '#1e293b' }}>{row.fullName}</div>
                                                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>{row.roleName}</div>
                                                </td>
                                                <td className="text-center">
                                                    <span className={`badge px-3 py-1 rounded-pill ${isHourly
                                                        ? 'bg-primary-subtle text-primary border border-primary'
                                                        : 'bg-success-subtle text-success border border-success'}`}>
                                                        {isHourly ? 'Giờ' : 'Cố định'}
                                                    </span>
                                                </td>
                                                <td className="text-end fw-semibold">
                                                    {isHourly
                                                        ? <span className="text-primary">{formatHours(row.totalHours)}</span>
                                                        : <span className="text-success">Cả tháng</span>}
                                                </td>
                                                <td className="text-end">
                                                    <span className={row.deductions > 0 ? 'text-danger fw-bold' : 'text-muted'}>
                                                        {row.deductions > 0 ? `- ${formatVND(row.deductions)}` : '0'}
                                                    </span>
                                                </td>
                                                <td className="text-end fw-bold text-success fs-6">
                                                    {formatVND(row.netSalary)}
                                                </td>
                                                <td className="text-center">
                                                    <button className="btn btn-sm btn-outline-info fw-bold px-3 rounded-pill"
                                                        onClick={() => setSelectedRow(row)}>
                                                        Chi tiết
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {!loading && filteredReport.length > 0 && (
                        <div className="px-4 py-3 border-top">
                            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                        </div>
                    )}
                </div>
            </div>

            {selectedRow && (
                <SalaryDetailModal
                    row={selectedRow}
                    month={month}
                    year={year}
                    onClose={() => setSelectedRow(null)}
                />
            )}
        </div>
    );
};

export default SalaryReport;