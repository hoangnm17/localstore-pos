import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import api from '../../services/axiosInstance';

const formatVND = (num) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num || 0);

const formatSalaryType = (type) => (type === 'hourly' ? 'Giờ' : 'Tháng');

const formatWorkSummary = (row) =>
    row.salaryType === 'hourly'
        ? `${row.totalHours} giờ`
        : `${row.workingDays}/${row.totalDaysInMonth} công`;

const formatBaseSalary = (row) =>
    row.salaryType === 'hourly'
        ? `${formatVND(row.baseSalary)}/giờ`
        : formatVND(row.baseSalary);

const S = {
    page: { display: 'flex', minHeight: '100vh', background: '#f0f4f8', fontFamily: "'Inter','Segoe UI',sans-serif" },
    content: { flex: 1, padding: '2rem 2.5rem' },
    headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' },
    pageTitle: { fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 },
    pageSub: { color: '#64748b', fontSize: '0.9rem', marginTop: '0.2rem' },

    statsRow: { display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
    statCard: (color) => ({
        flex: '1 1 160px', background: '#fff', borderRadius: '1rem',
        padding: '1rem 1.4rem', border: '1px solid #e2e8f0',
        borderLeft: `4px solid ${color}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
    }),
    statLabel: { fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.7px' },
    statValue: (color) => ({ fontSize: '1.45rem', fontWeight: 800, color, marginTop: '0.2rem' }),

    card: { background: '#fff', borderRadius: '1.25rem', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', overflow: 'hidden' },
    filterBar: { display: 'flex', gap: '0.75rem', padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap', alignItems: 'center' },

    select: { border: '1.5px solid #e2e8f0', borderRadius: '0.65rem', padding: '0.5rem 0.9rem', fontSize: '0.88rem', fontWeight: 500, color: '#334155', background: '#f8fafc', outline: 'none', cursor: 'pointer' },
    searchBox: { border: '1.5px solid #e2e8f0', borderRadius: '0.65rem', padding: '0.5rem 0.9rem 0.5rem 2.2rem', fontSize: '0.88rem', fontWeight: 500, color: '#334155', background: '#f8fafc', outline: 'none', minWidth: '200px' },
    searchWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
    searchIcon: { position: 'absolute', left: '0.65rem', color: '#94a3b8', pointerEvents: 'none', fontSize: '0.9rem' },

    table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' },
    th: { padding: '0.8rem 1rem', background: 'linear-gradient(90deg,#1e293b,#0f172a)', color: '#e2e8f0', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.6px', textAlign: 'left', whiteSpace: 'nowrap' },
    thC: { padding: '0.8rem 1rem', background: 'linear-gradient(90deg,#1e293b,#0f172a)', color: '#e2e8f0', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.6px', textAlign: 'center', whiteSpace: 'nowrap' },
    td: { padding: '0.85rem 1rem', borderBottom: '1px solid #f1f5f9', color: '#334155', verticalAlign: 'middle' },
    tdC: { padding: '0.85rem 1rem', borderBottom: '1px solid #f1f5f9', color: '#334155', verticalAlign: 'middle', textAlign: 'center' },

    badge: (bg, color, border) => ({
        display: 'inline-block', background: bg, color, border: `1px solid ${border}`,
        borderRadius: '999px', padding: '0.15rem 0.65rem', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.3px'
    }),

    detailBtn: {
        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none',
        borderRadius: '0.5rem', padding: '0.3rem 0.75rem', color: '#fff',
        fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', whiteSpace: 'nowrap'
    },
    refreshBtn: {
        background: 'linear-gradient(135deg,#0ea5e9,#3b82f6)', border: 'none',
        borderRadius: '0.65rem', padding: '0.5rem 1.4rem', color: '#fff',
        fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer'
    },

    loadSpinner: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem', color: '#64748b', fontWeight: 600, gap: '0.75rem' },
    emptyRow: { textAlign: 'center', padding: '3.5rem', color: '#94a3b8', fontWeight: 600 },
    netSalary: { fontWeight: 800, color: '#059669', fontSize: '0.95rem' },
    deduction: { fontWeight: 700, color: '#dc2626' },

    paginationRow: { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '1rem 1.5rem', gap: '0.4rem' },
    pageBtn: (active) => ({
        width: '34px', height: '34px', borderRadius: '8px', border: '1.5px solid #e2e8f0',
        background: active ? 'linear-gradient(135deg,#0ea5e9,#3b82f6)' : '#fff',
        color: active ? '#fff' : '#475569', fontWeight: 700, fontSize: '0.85rem',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
    }),

    overlay: {
        position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, backdropFilter: 'blur(3px)'
    },
    modal: {
        background: '#fff', borderRadius: '1.5rem', width: '540px', maxWidth: '96vw',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden', animation: 'fadeInUp 0.2s ease'
    },
    modalHeader: {
        background: 'linear-gradient(135deg,#1e293b,#0f172a)', padding: '1.4rem 1.8rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    },
    modalTitle: { color: '#f8fafc', fontWeight: 800, fontSize: '1.1rem', margin: 0 },
    modalClose: {
        background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: '50%',
        width: '32px', height: '32px', color: '#fff', fontSize: '1.1rem',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
    modalBody: { padding: '1.6rem 1.8rem' },
    detailRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.55rem 0', borderBottom: '1px solid #f1f5f9' },
    detailLabel: { fontSize: '0.85rem', color: '#64748b', fontWeight: 500 },
    detailValue: { fontSize: '0.9rem', color: '#0f172a', fontWeight: 700 },
    divider: { borderTop: '2px solid #e2e8f0', margin: '0.75rem 0' },
};

const PAGE_SIZE = 10;

const DetailModal = ({ row, month, year, onClose }) => {
    if (!row) return null;

    const isHourly = row.salaryType === 'hourly';

    return (
        <div style={S.overlay} onClick={onClose}>
            <div style={S.modal} onClick={e => e.stopPropagation()}>
                <div style={S.modalHeader}>
                    <h2 style={S.modalTitle}>Chi tiết lương – Tháng {month}/{year}</h2>
                    <button style={S.modalClose} onClick={onClose}>✕</button>
                </div>

                <div style={S.modalBody}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.2rem' }}>
                        <div style={{
                            width: '52px', height: '52px', borderRadius: '50%',
                            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontWeight: 800, fontSize: '1.3rem', flexShrink: 0
                        }}>
                            {row.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>{row.fullName}</div>
                            <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.15rem' }}>
                                {row.roleName} &nbsp;·&nbsp;
                                <span style={
                                    isHourly
                                        ? S.badge('#dbeafe', '#1d4ed8', '#bfdbfe')
                                        : S.badge('#dcfce7', '#15803d', '#86efac')
                                }>
                                    Lương {isHourly ? 'Giờ' : 'Tháng'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div style={S.divider} />

                    <div style={S.detailRow}>
                        <span style={S.detailLabel}>Lương cơ bản</span>
                        <span style={S.detailValue}>{formatBaseSalary(row)}</span>
                    </div>

                    {isHourly ? (
                        <div style={S.detailRow}>
                            <span style={S.detailLabel}>Tổng giờ làm việc</span>
                            <span style={S.detailValue}>{row.totalHours} giờ</span>
                        </div>
                    ) : (
                        <>
                            <div style={S.detailRow}>
                                <span style={S.detailLabel}>Số ngày có mặt</span>
                                <span style={S.detailValue}>{row.workingDays} ngày</span>
                            </div>
                            <div style={S.detailRow}>
                                <span style={S.detailLabel}>Tổng ngày trong tháng</span>
                                <span style={S.detailValue}>{row.totalDaysInMonth} ngày</span>
                            </div>
                        </>
                    )}

                    <div style={S.detailRow}>
                        <span style={S.detailLabel}>Lương gộp (trước khấu trừ)</span>
                        <span style={{ ...S.detailValue, color: '#059669' }}>{formatVND(row.grossSalary)}</span>
                    </div>

                    <div style={S.detailRow}>
                        <span style={S.detailLabel}>Phạt / Khấu trừ</span>
                        <span style={{ ...S.detailValue, color: row.deductions > 0 ? '#dc2626' : '#94a3b8' }}>
                            {row.deductions > 0 ? `- ${formatVND(row.deductions)}` : '0'}
                        </span>
                    </div>

                    <div style={S.divider} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>Thực lĩnh</span>
                        <span style={{ fontWeight: 900, fontSize: '1.3rem', color: '#059669' }}>{formatVND(row.netSalary)}</span>
                    </div>

                    {row.note && (
                        <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '0.65rem', border: '1px solid #e2e8f0', fontSize: '0.83rem', color: '#475569' }}>
                            <strong>Ghi chú:</strong> {row.note}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


const SalaryReport = () => {
    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());
    const [role, setRole] = useState('');   
    const [search, setSearch] = useState('');   

    const [roleList, setRoleList] = useState([]);
    const [report, setReport] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState(null);  

    useEffect(() => {
        api.get('/salary/roles')
            .then(res => { if (res.data?.success) setRoleList(res.data.data); })
            .catch(err => console.error(err));
    }, []);

    // Fetch báo cáo
    const fetchReport = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = { month, year };
            if (role) params.role = role;

            const res = await api.get('/salary', { params });
            if (res.data?.success) {
                setReport(res.data.data);
                setSummary(res.data.summary);
                setPage(1);
            } else {
                setError(res.data?.message || 'Lỗi tải báo cáo!');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi kết nối server!');
        } finally {
            setLoading(false);
        }
    }, [month, year, role]);

    useEffect(() => { fetchReport(); }, [fetchReport]);

    const filtered = report.filter(r =>
        r.fullName.toLowerCase().includes(search.toLowerCase().trim())
    );

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const years = [];
    for (let y = 2023; y <= now.getFullYear() + 1; y++) years.push(y);

    // Reset page khi search thay đổi
    const handleSearch = (v) => { setSearch(v); setPage(1); };
    const handleRole = (v) => { setRole(v); setPage(1); };

    return (
        <div style={S.page}>
            <Sidebar />
            <div style={S.content}>

                <div style={S.headerRow}>
                    <div>
                        <h1 style={S.pageTitle}>Báo Cáo Lương</h1>
                        <p style={S.pageSub}>Tổng hợp lương nhân viên theo tháng</p>
                    </div>
                </div>

                {summary && (
                    <div style={S.statsRow}>
                        <div style={S.statCard('#3b82f6')}>
                            <div style={S.statLabel}>Tổng nhân viên</div>
                            <div style={S.statValue('#3b82f6')}>{summary.totalStaff}</div>
                        </div>
                        <div style={S.statCard('#059669')}>
                            <div style={S.statLabel}>Tổng lương gộp</div>
                            <div style={S.statValue('#059669')}>{formatVND(summary.totalGross)}</div>
                        </div>
                        <div style={S.statCard('#dc2626')}>
                            <div style={S.statLabel}>Tổng phạt/trừ</div>
                            <div style={S.statValue('#dc2626')}>{formatVND(summary.totalDeductions)}</div>
                        </div>
                        <div style={S.statCard('#7c3aed')}>
                            <div style={S.statLabel}>Thực lĩnh</div>
                            <div style={S.statValue('#7c3aed')}>{formatVND(summary.totalNet)}</div>
                        </div>
                    </div>
                )}

                <div style={S.card}>

                    <div style={S.filterBar}>

                        <select style={S.select} value={month} onChange={e => setMonth(Number(e.target.value))}>
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
                            ))}
                        </select>

                        <select style={S.select} value={year} onChange={e => setYear(Number(e.target.value))}>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>

                        <select
                            style={{ ...S.select, minWidth: '160px' }}
                            value={role}
                            onChange={e => handleRole(e.target.value)}
                        >
                            <option value="">-- Tất cả vai trò --</option>
                            {roleList.map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>

                        <div style={S.searchWrap}>
                            <span style={S.searchIcon}></span>
                            <input
                                style={S.searchBox}
                                placeholder="Tìm tên nhân viên..."
                                value={search}
                                onChange={e => handleSearch(e.target.value)}
                            />
                        </div>

                        <button onClick={fetchReport} style={S.refreshBtn}>Làm Mới</button>

                        <span style={{ marginLeft: 'auto', color: '#64748b', fontSize: '0.82rem', fontWeight: 600 }}>
                            Tháng {month}/{year}
                            {role && <> · <span style={{ color: '#6366f1' }}>{role}</span></>}
                            {search && <> · <span style={{ color: '#0ea5e9' }}>"{search}"</span></>}
                        </span>
                    </div>

                    {error && (
                        <div style={{ margin: '1rem 1.5rem', padding: '0.75rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.65rem', color: '#b91c1c', fontWeight: 600, fontSize: '0.88rem' }}>
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div style={S.loadSpinner}>
                            <div style={{ width: '36px', height: '36px', border: '4px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                            Đang tính toán lương...
                        </div>
                    ) : (
                        <>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={S.table}>
                                    <thead>
                                        <tr>
                                            <th style={S.th}>#</th>
                                            <th style={S.th}>Tên nhân viên</th>
                                            <th style={S.thC}>Loại lương</th>
                                            <th style={S.thC}>Tổng giờ/công</th>
                                            <th style={S.thC}>Lương cơ bản</th>
                                            <th style={S.thC}>Phạt/trừ</th>
                                            <th style={S.thC}>Thực lĩnh</th>
                                            <th style={S.thC}>Chi tiết</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginated.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} style={S.emptyRow}>
                                                    {search
                                                        ? `Không tìm thấy nhân viên "${search}"`
                                                        : `Không có dữ liệu lương cho tháng ${month}/${year}`}
                                                </td>
                                            </tr>
                                        ) : paginated.map((row, idx) => (
                                            <tr key={row.staffId} style={{ background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                                                <td style={{ ...S.td, color: '#94a3b8', fontWeight: 700 }}>
                                                    {(page - 1) * PAGE_SIZE + idx + 1}
                                                </td>
                                                <td style={S.td}>
                                                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{row.fullName}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{row.roleName}</div>
                                                </td>
                                                <td style={S.tdC}>
                                                    <span style={
                                                        row.salaryType === 'hourly'
                                                            ? S.badge('#dbeafe', '#1d4ed8', '#bfdbfe')
                                                            : S.badge('#dcfce7', '#15803d', '#86efac')
                                                    }>
                                                        {formatSalaryType(row.salaryType)}
                                                    </span>
                                                </td>
                                                <td style={S.tdC}>
                                                    <span style={{ fontWeight: 600 }}>{formatWorkSummary(row)}</span>
                                                </td>
                                                <td style={S.tdC}>
                                                    <span style={{ fontWeight: 600 }}>{formatBaseSalary(row)}</span>
                                                </td>
                                                <td style={S.tdC}>
                                                    {row.deductions > 0
                                                        ? <span style={S.deduction}>{formatVND(row.deductions)}</span>
                                                        : <span style={{ color: '#94a3b8' }}>0</span>}
                                                </td>
                                                <td style={S.tdC}>
                                                    <span style={{ fontWeight: 800, color: '#059669', fontSize: '0.95rem' }}>
                                                        {formatVND(row.netSalary)}
                                                    </span>
                                                </td>
                                                <td style={S.tdC}>
                                                    <button
                                                        style={S.detailBtn}
                                                        onClick={() => setSelected(row)}
                                                    >
                                                        Xem chi tiết
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {totalPages > 1 && (
                                <div style={S.paginationRow}>
                                    <button style={S.pageBtn(false)} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                        <button key={p} style={S.pageBtn(p === page)} onClick={() => setPage(p)}>{p}</button>
                                    ))}
                                    <button style={S.pageBtn(false)} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>›</button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {selected && (
                <DetailModal
                    row={selected}
                    month={month}
                    year={year}
                    onClose={() => setSelected(null)}
                />
            )}

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default SalaryReport;
