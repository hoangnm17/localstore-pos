import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import api from '../../services/axiosInstance';
import { useNotification } from '../../components/global/Notification/NotificationContext';
import useDebounce from '../../hooks/common/useDebounce';
import Pagination from '../../components/Pagination/Pagination';

import SalaryHeader from './components/SalaryHeader';
import SalaryFilter from './components/SalaryFilter';
import SalaryDetailModal from './modals/SalaryDetailModal';

const PAGE_SIZE = 4;

const formatVND = (num) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);

const formatHours = (decimalHours) => {
    if (!decimalHours) return '0h 00m';
    const h = Math.floor(decimalHours);
    const m = Math.round((decimalHours - h) * 60);
    return `${h}h ${String(m).padStart(2, '0')}m`;
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
            <Sidebar />
            <div className="flex-grow-1 p-4">

                <SalaryHeader summary={summary} />

                <SalaryFilter
                    month={month} setMonth={setMonth}
                    year={year} setYear={setYear}
                    role={role} setRole={setRole} roleList={roleList}
                    searchInput={searchInput} setSearchInput={setSearchInput}
                    totalCount={filteredReport.length} years={years}
                />

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
                                    <tr className="text-center small fw-bold text-secondary text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
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
                                                    <span className={`badge px-3 py-1 rounded-pill ${isHourly ? 'bg-primary-subtle text-primary border border-primary' : 'bg-success-subtle text-success border border-success'}`}>
                                                        {isHourly ? 'Giờ' : 'Cố định'}
                                                    </span>
                                                </td>
                                                <td className="text-end fw-semibold">
                                                    {isHourly
                                                        ? <span className="text-primary">{formatHours(row.totalHours)}</span>
                                                        : `${row.workingDays}/${row.totalDaysInMonth} ngày`}
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

                    {/* Phân trang */}
                    {!loading && filteredReport.length > 0 && (
                        <div className="px-4 py-3 border-top">
                            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                        </div>
                    )}
                </div>
            </div>

            {/* Modal*/}
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