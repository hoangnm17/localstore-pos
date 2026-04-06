import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNotification } from '../../components/global/Notification/NotificationContext';
import useDebounce from '../../hooks/common/useDebounce';
import Pagination from '../../components/Pagination/Pagination';
import SalaryHeader from './components/SalaryHeader';
import SalaryDetailModal from './modals/SalaryDetailModal';
import ConfirmPayrollModal from './modals/ConfirmPayrollModal';
import { getSalaryReport, getRoleList, getPayrollStatus, confirmPayroll } from '../../services/Salary/salary.service';
import useTitle from "hooks/common/useTitle";

const PAGE_SIZE = 8;
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
    const headers = ['STT', 'Họ và tên', 'Vai trò', 'Hình thức', 'Tổng công/Giờ', 'Mức lương', 'Phạt', 'Thực lĩnh', 'Ghi chú', 'Chi tiết vi phạm'];
    const rows = data.map((row, idx) => {
        const isHourly = row.salaryType === 'hourly';
        let congGioDisplay = isHourly ? formatHours(row.totalHours) : `${row.workingDays || 0}/26 công`;
        return [
            idx + 1, row.fullName, row.roleName || '',
            isHourly ? 'Lương giờ' : 'Lương tháng',
            congGioDisplay, formatVNDRaw(row.baseSalary), formatVNDRaw(row.deductions),
            formatVNDRaw(row.netSalary), row.note || '', row.penaltyDetails || '',
        ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
    });
    const BOM = '\uFEFF';
    const csvContent = BOM + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `BaoCaoLuong_T${String(month).padStart(2, '0')}_${year}.csv`; a.click(); URL.revokeObjectURL(url);
};

const SalaryReport = () => {
    const { showNotification } = useNotification();
    const now = useMemo(() => new Date(), []);
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [role, setRole] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchInput, 500);
    const [report, setReport] = useState([]);
    const [roleList, setRoleList] = useState([]);
    const [summary, setSummary] = useState({ totalStaff: 0, totalGross: 0, totalDeductions: 0, totalNet: 0 });
    const [payrollStatus, setPayrollStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [confirming, setConfirming] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [page, setPage] = useState(1);
    const [selectedRow, setSelectedRow] = useState(null);
    const [printRow, setPrintRow] = useState(null);
    useTitle("Báo Cáo lương")
    useEffect(() => { setSearchTerm(debouncedSearch); }, [debouncedSearch]);
    useEffect(() => { setPage(1); }, [searchTerm, role, month, year]);

    const fetchReport = useCallback(async () => {
        setLoading(true);
        try {
            const [reportRes, rolesRes, statusRes] = await Promise.all([
                getSalaryReport({ month, year, role }),
                getRoleList(),
                getPayrollStatus({ month, year })
            ]);

            if (reportRes?.success) {
                setReport(reportRes.data);
                setSummary(reportRes.summary);
            }
            if (rolesRes?.success) setRoleList(rolesRes.data);
            if (statusRes?.success) setPayrollStatus(statusRes.data);

        } catch (err) {
            showNotification(err.message || 'Lỗi tải báo cáo lương!', 'error');
        } finally {
            setLoading(false);
        }
    }, [month, year, role, showNotification]);

    const handleConfirm = () => {
        setShowConfirmModal(true);
    };

    const confirmPayrollAction = async () => {
        setShowConfirmModal(false);
        setConfirming(true);
        try {
            const res = await confirmPayroll({ month, year });
            if (res?.success) {
                showNotification(res.message, 'success');
                fetchReport();
            }
        } catch (err) {
            showNotification(err.message || 'Lỗi chốt lương!', 'error');
        } finally {
            setConfirming(false);
        }
    };

    const ROLE_NAME_MAP = {
        'Manager': 'Quản lý',
        'Cashier': 'Thu ngân',
        'Warehouse': 'Thủ kho'
    };

    const handleReset = () => {
        setSearchInput('');
        setSearchTerm('');
        setRole('');
        setMonth(now.getMonth() + 1);
        setYear(now.getFullYear());
        fetchReport();
    };

    useEffect(() => { fetchReport(); }, [fetchReport]);
    useEffect(() => { setPage(1); }, [searchTerm, role, month, year]);

    const filteredReport = useMemo(() => {
        return report.filter(r => r.fullName.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [report, searchTerm]);

    const totalPages = Math.ceil(filteredReport.length / PAGE_SIZE) || 1;
    const paginated = filteredReport.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const years = [];
    for (let y = 2023; y <= now.getFullYear(); y++) years.push(y);

    const availableMonths = useMemo(() => {
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        if (year < currentYear) return Array.from({ length: 12 }, (_, i) => i + 1);
        return Array.from({ length: currentMonth }, (_, i) => i + 1);
    }, [year, now]);

    useEffect(() => {
        if (year === now.getFullYear() && month > now.getMonth() + 1) {
            setMonth(now.getMonth() + 1);
        }
    }, [year, month, now]);

    return (
        <div className="p-4" style={{ background: '#f0f2f5', minHeight: '100%' }}>
            <SalaryHeader summary={summary} />
            <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
                <div className="row g-3 align-items-end">
                    <div className="col-lg-2 col-md-4">
                        <label className="small fw-bold text-secondary mb-1">Tháng / Năm</label>
                        <div className="d-flex gap-1">
                            <select className="form-select border-0 bg-light fw-bold px-3" style={{ borderRadius: '10px', minWidth: '105px' }}
                                value={month} onChange={e => setMonth(Number(e.target.value))}>
                                {availableMonths.map(m => (
                                    <option key={m} value={m}>Tháng {m}</option>
                                ))}
                            </select>
                            <select className="form-select border-0 bg-light fw-bold px-2" style={{ borderRadius: '10px' }}
                                value={year} onChange={e => setYear(Number(e.target.value))}>
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="col-lg-3 col-md-5">
                        <label className="small fw-bold text-secondary mb-1">Tìm kiếm nhân viên</label>
                        <div className="position-relative">
                            <i className="bi bi-search position-absolute"
                                style={{ left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                            <input type="text" className="form-control ps-5 border-0 bg-light"
                                style={{ borderRadius: '10px' }}
                                placeholder="Nhập tên..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)} />
                        </div>
                    </div>

                    <div className="col-lg-2 col-md-3">
                        <label className="small fw-bold text-secondary mb-1">Lọc vai trò</label>
                        <select className="form-select border-0 bg-light" style={{ borderRadius: '10px' }}
                            value={role} onChange={e => setRole(e.target.value)}>
                            <option value="">Tất cả</option>
                            {roleList.map(r => (
                                <option key={r} value={r}>{ROLE_NAME_MAP[r] || r}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-lg-5 col-md-12 d-flex gap-2 justify-content-end align-items-end">
                        <button className="btn btn-outline-secondary fw-bold px-3 d-flex align-items-center gap-1"
                            style={{ borderRadius: '10px', fontSize: '0.85rem', height: '38px' }}
                            onClick={handleReset}>
                            <i className="bi bi-arrow-counterclockwise" /> Làm mới
                        </button>

                        <button className="btn btn-success fw-bold px-3 d-flex align-items-center gap-1"
                            style={{ borderRadius: '10px', fontSize: '0.875rem', height: '38px' }}
                            onClick={() => exportToCSV(filteredReport, month, year)}
                            disabled={loading || filteredReport.length === 0}>
                            <i className="bi bi-file-earmark-spreadsheet-fill" /> CSV
                        </button>

                        {payrollStatus?.isPaid ? (
                            <div className="bg-success text-white px-3 d-flex align-items-center justify-content-center fw-bold"
                                style={{ borderRadius: '10px', fontSize: '0.8rem', minWidth: '120px', height: '38px' }}>
                                <i className="bi bi-check-circle-fill me-1" /> ĐÃ CHỐT
                            </div>
                        ) : (
                            <button className="btn btn-warning fw-bold px-3 d-flex align-items-center justify-content-center gap-1"
                                style={{ borderRadius: '10px', fontSize: '0.875rem', minWidth: '130px', height: '38px' }}
                                onClick={handleConfirm}
                                disabled={confirming || loading || filteredReport.length === 0}>
                                {confirming ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-lock-fill" />}
                                Chốt Lương
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" />
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead style={{ background: '#f8faff' }}>
                                <tr className="text-center small fw-bold text-secondary text-uppercase" style={{ fontSize: '0.75rem' }}>
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
                                {paginated.map((row, idx) => {
                                    const isHourly = row.salaryType === 'hourly';
                                    const isManager = row.roleName === 'Manager';
                                    return (
                                        <tr key={row.staffId} className="border-top">
                                            <td className="text-center text-secondary small">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                                            <td>
                                                <div className="fw-bold">{row.fullName}</div>
                                                <div className="text-muted small">{ROLE_NAME_MAP[row.roleName] || row.roleName}</div>
                                            </td>
                                            <td className="text-center">
                                                <span className={`badge px-3 py-1 rounded-pill ${isHourly ? 'bg-primary-subtle text-primary border border-primary' : 'bg-success-subtle text-success border border-success'}`}>
                                                    {isHourly ? 'Giờ' : 'Cố định'}
                                                </span>
                                            </td>
                                            <td className="text-end fw-semibold">
                                                {isHourly
                                                    ? <span className="text-primary">{formatHours(row.totalHours)}</span>
                                                    : isManager
                                                        ? <span className="text-success">Toàn tháng</span>
                                                        : <span className="text-success">{row.workingDays}/26 công</span>
                                                }
                                            </td>
                                            <td className="text-end text-danger fw-bold">{row.deductions > 0 ? `-${formatVND(row.deductions)}` : '0'}</td>
                                            <td className="text-end fw-bold text-success">{formatVND(row.netSalary)}</td>
                                            <td className="text-center">
                                                <div className="d-flex gap-1 justify-content-center">
                                                    <button className="btn btn-sm btn-outline-info rounded-pill px-3 fw-bold"
                                                        onClick={() => setSelectedRow(row)} title="Xem chi tiết">
                                                        Chi tiết
                                                    </button>
                                                    <button className="btn btn-sm btn-outline-secondary rounded-pill px-2"
                                                        onClick={() => setPrintRow(row)} title="In nhanh phiếu lương">
                                                        <i className="bi bi-printer-fill"></i>
                                                    </button>
                                                </div>
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

            {
                selectedRow && (
                    <SalaryDetailModal row={selectedRow} month={month} year={year} onClose={() => setSelectedRow(null)} />
                )
            }

            {
                printRow && (
                    <SalaryDetailModal row={printRow} month={month} year={year} onClose={() => setPrintRow(null)} autoPrint={true} />
                )
            }

            {
                showConfirmModal && (
                    <ConfirmPayrollModal
                        month={month}
                        year={year}
                        onConfirm={confirmPayrollAction}
                        onClose={() => setShowConfirmModal(false)}
                        loading={confirming}
                    />
                )
            }
        </div>
    );
};

export default SalaryReport;