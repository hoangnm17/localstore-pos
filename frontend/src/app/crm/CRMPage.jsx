import React, { useState, useEffect, useCallback } from 'react';
import './CRMPage.css';
import {
    getCustomers, createCustomer, updateCustomer, deleteCustomer,
    getPromotions, createPromotion, updatePromotion, deletePromotion,
    getVouchers, createVoucher, updateVoucher, deleteVoucher,
} from '../../services/crm.service';

// ─── Hằng số ───────────────────────────────────────────────────
const TABS = [
    { key: 'customers', label: '👤 Khách hàng' },
    { key: 'promotions', label: '🎯 Khuyến mãi' },
    { key: 'vouchers', label: '🎟️ Voucher' },
];

const CUSTOMER_STATUS = ['Active', 'Inactive', 'Blocked'];
const PROMOTION_TYPES = ['Percent', 'Amount', 'BuyXGetY'];
const PROMOTION_STATUS = ['Active', 'Expired', 'Disabled'];
const VOUCHER_TYPES = ['Percent', 'Fixed'];
const VOUCHER_STATUS = ['Active', 'Expired', 'Disabled'];

const PAGE_SIZE = 10;

// ─── Giá trị mặc định form ─────────────────────────────────────
const DEFAULT_CUSTOMER = { name: '', phone: '', status: 'Active' };
const DEFAULT_PROMOTION = { name: '', type: 'Percent', value: '', startDate: '', endDate: '', status: 'Active' };
const DEFAULT_VOUCHER = { code: '', value: '', type: 'Fixed', minOrderValue: 0, maxUsage: 100, startDate: '', expiryDate: '', status: 'Active' };

// ─── Helper ────────────────────────────────────────────────────
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';
const fmtMoney = (n) => n != null ? Number(n).toLocaleString('vi-VN') + ' đ' : '—';
const toInputDate = (d) => d ? new Date(d).toISOString().slice(0, 10) : '';

// ─── Component Modal chung ─────────────────────────────────────
function Modal({ title, onClose, onSubmit, loading, children }) {
    return (
        <div className="crm-modal-overlay" onClick={onClose}>
            <div className="crm-modal" onClick={(e) => e.stopPropagation()}>
                <div className="crm-modal-header">
                    <h2 className="crm-modal-title">{title}</h2>
                    <button className="crm-modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="crm-modal-body">{children}</div>
                <div className="crm-modal-footer">
                    <button className="btn-ghost" onClick={onClose} disabled={loading}>Hủy</button>
                    <button className="btn-primary" onClick={onSubmit} disabled={loading}>
                        {loading ? '⏳ Đang lưu...' : '💾 Lưu'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Dialog xác nhận xóa ──────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel }) {
    return (
        <div className="crm-modal-overlay" onClick={onCancel}>
            <div className="crm-confirm" onClick={(e) => e.stopPropagation()}>
                <div className="crm-confirm-icon">⚠️</div>
                <p className="crm-confirm-msg">{message}</p>
                <div className="crm-modal-footer">
                    <button className="btn-ghost" onClick={onCancel}>Hủy</button>
                    <button className="btn-danger" onClick={onConfirm}>Xác nhận xóa</button>
                </div>
            </div>
        </div>
    );
}

// ─── Phân trang ──────────────────────────────────────────────
function Pagination({ page, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;
    return (
        <div className="crm-pagination">
            <button className="page-btn" onClick={() => onPageChange(page - 1)} disabled={page === 1}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                    key={p}
                    className={`page-btn ${p === page ? 'active' : ''}`}
                    onClick={() => onPageChange(p)}
                >{p}</button>
            ))}
            <button className="page-btn" onClick={() => onPageChange(page + 1)} disabled={page === totalPages}>›</button>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
//  Tab: CUSTOMERS
// ═══════════════════════════════════════════════════════════════
function CustomersTab() {
    const [customers, setCustomers] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const totalPages = Math.ceil(total / PAGE_SIZE);

    // Modal
    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState(DEFAULT_CUSTOMER);
    const [saving, setSaving] = useState(false);

    // Confirm
    const [deleteTarget, setDeleteTarget] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getCustomers({ search, status: statusFilter, page, limit: PAGE_SIZE });
            setCustomers(res.data || []);
            setTotal(res.total || 0);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter, page]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Debounce search
    const [searchInput, setSearchInput] = useState('');
    useEffect(() => {
        const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
        return () => clearTimeout(t);
    }, [searchInput]);

    const openCreate = () => { setForm(DEFAULT_CUSTOMER); setEditTarget(null); setShowModal(true); };
    const openEdit = (c) => { setForm({ name: c.name, phone: c.phone, status: c.status }); setEditTarget(c); setShowModal(true); };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editTarget) await updateCustomer(editTarget.id, form);
            else await createCustomer(form);
            setShowModal(false);
            fetchData();
        } catch (e) {
            alert('Lỗi: ' + (e.response?.data?.message || e.message));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteCustomer(deleteTarget.id);
            setDeleteTarget(null);
            fetchData();
        } catch (e) {
            alert('Lỗi: ' + (e.response?.data?.message || e.message));
        }
    };

    const statusBadge = (s) => {
        const map = { Active: 'status-active', Inactive: 'status-inactive', Blocked: 'status-blocked' };
        return <span className={`status-badge ${map[s] || ''}`}>{s}</span>;
    };

    return (
        <>
            <div className="glass-panel">
                {/* Toolbar */}
                <div className="toolbar">
                    <input
                        className="search-input"
                        placeholder="🔍 Tìm theo tên, SĐT..."
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                    />
                    <select
                        className="filter-select"
                        value={statusFilter}
                        onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                    >
                        <option value="">Tất cả trạng thái</option>
                        {CUSTOMER_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <span className="total-badge">{total} khách hàng</span>
                    <button className="btn-primary" onClick={openCreate}>
                        ＋ Thêm khách hàng
                    </button>
                </div>

                {/* Table */}
                <div className="crm-table-container">
                    <table className="crm-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Họ tên</th>
                                <th>Số điện thoại</th>
                                <th>Điểm tích lũy</th>
                                <th>Tổng chi tiêu</th>
                                <th>Trạng thái</th>
                                <th>Ngày tạo</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="8" className="loading-cell"><div className="spinner" /></td></tr>
                            ) : customers.length === 0 ? (
                                <tr><td colSpan="8" className="empty-cell">Không có dữ liệu</td></tr>
                            ) : customers.map((c, i) => (
                                <tr key={c.id}>
                                    <td className="text-muted">{(page - 1) * PAGE_SIZE + i + 1}</td>
                                    <td><strong>{c.name}</strong></td>
                                    <td>{c.phone}</td>
                                    <td><span className="points-badge">⭐ {c.loyaltyPoints}</span></td>
                                    <td>{fmtMoney(c.totalSpending)}</td>
                                    <td>{statusBadge(c.status)}</td>
                                    <td className="text-muted">{fmtDate(c.createdAt)}</td>
                                    <td>
                                        <div className="action-btns">
                                            <button className="btn-icon edit" onClick={() => openEdit(c)} title="Sửa">✏️</button>
                                            <button className="btn-icon del" onClick={() => setDeleteTarget(c)} title="Xóa">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>

            {/* Modal Tạo/Sửa */}
            {showModal && (
                <Modal
                    title={editTarget ? '✏️ Sửa khách hàng' : '➕ Thêm khách hàng mới'}
                    onClose={() => setShowModal(false)}
                    onSubmit={handleSave}
                    loading={saving}
                >
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Họ tên <span className="required">*</span></label>
                            <input className="form-input" placeholder="Nguyễn Văn A" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Số điện thoại <span className="required">*</span></label>
                            <input className="form-input" placeholder="09xxxxxxxx" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Trạng thái</label>
                            <select className="form-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                {CUSTOMER_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Confirm Delete */}
            {deleteTarget && (
                <ConfirmDialog
                    message={`Vô hiệu hóa khách hàng "${deleteTarget.name}"?`}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </>
    );
}

// ═══════════════════════════════════════════════════════════════
//  Tab: PROMOTIONS
// ═══════════════════════════════════════════════════════════════
function PromotionsTab() {
    const [promotions, setPromotions] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [page, setPage] = useState(1);
    const totalPages = Math.ceil(total / PAGE_SIZE);

    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState(DEFAULT_PROMOTION);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getPromotions({ search, status: statusFilter, type: typeFilter, page, limit: PAGE_SIZE });
            setPromotions(res.data || []);
            setTotal(res.total || 0);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter, typeFilter, page]);

    useEffect(() => { fetchData(); }, [fetchData]);
    useEffect(() => {
        const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
        return () => clearTimeout(t);
    }, [searchInput]);

    const openCreate = () => { setForm(DEFAULT_PROMOTION); setEditTarget(null); setShowModal(true); };
    const openEdit = (p) => {
        setForm({
            name: p.name, type: p.type, value: p.value,
            startDate: toInputDate(p.startDate), endDate: toInputDate(p.endDate), status: p.status
        });
        setEditTarget(p);
        setShowModal(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editTarget) await updatePromotion(editTarget.id, form);
            else await createPromotion(form);
            setShowModal(false);
            fetchData();
        } catch (e) {
            alert('Lỗi: ' + (e.response?.data?.message || e.message));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await deletePromotion(deleteTarget.id);
            setDeleteTarget(null);
            fetchData();
        } catch (e) {
            alert('Lỗi: ' + (e.response?.data?.message || e.message));
        }
    };

    const statusBadge = (s) => {
        const map = { Active: 'status-active', Expired: 'status-expired', Disabled: 'status-inactive' };
        return <span className={`status-badge ${map[s] || ''}`}>{s}</span>;
    };

    const fmtPromoValue = (p) => {
        if (p.type === 'Percent') return `${p.value}% OFF`;
        if (p.type === 'Amount') return `-${fmtMoney(p.value)}`;
        return 'Mua X Tặng Y';
    };

    return (
        <>
            <div className="glass-panel">
                <div className="toolbar">
                    <input
                        className="search-input"
                        placeholder="🔍 Tìm tên chương trình..."
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                    />
                    <select className="filter-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
                        <option value="">Tất cả trạng thái</option>
                        {PROMOTION_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select className="filter-select" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}>
                        <option value="">Tất cả loại</option>
                        {PROMOTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <span className="total-badge">{total} chương trình</span>
                    <button className="btn-primary" onClick={openCreate}>＋ Thêm KM</button>
                </div>

                <div className="crm-table-container">
                    <table className="crm-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Tên chương trình</th>
                                <th>Loại</th>
                                <th>Giá trị</th>
                                <th>Bắt đầu</th>
                                <th>Kết thúc</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="8" className="loading-cell"><div className="spinner" /></td></tr>
                            ) : promotions.length === 0 ? (
                                <tr><td colSpan="8" className="empty-cell">Không có dữ liệu</td></tr>
                            ) : promotions.map((p, i) => (
                                <tr key={p.id}>
                                    <td className="text-muted">{(page - 1) * PAGE_SIZE + i + 1}</td>
                                    <td><strong>{p.name}</strong></td>
                                    <td><span className="type-badge">{p.type}</span></td>
                                    <td className="promo-value-cell">{fmtPromoValue(p)}</td>
                                    <td className="text-muted">{fmtDate(p.startDate)}</td>
                                    <td className="text-muted">{fmtDate(p.endDate)}</td>
                                    <td>{statusBadge(p.status)}</td>
                                    <td>
                                        <div className="action-btns">
                                            <button className="btn-icon edit" onClick={() => openEdit(p)} title="Sửa">✏️</button>
                                            <button className="btn-icon del" onClick={() => setDeleteTarget(p)} title="Vô hiệu">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>

            {showModal && (
                <Modal
                    title={editTarget ? '✏️ Sửa khuyến mãi' : '➕ Thêm khuyến mãi mới'}
                    onClose={() => setShowModal(false)}
                    onSubmit={handleSave}
                    loading={saving}
                >
                    <div className="form-grid">
                        <div className="form-group form-full">
                            <label>Tên chương trình <span className="required">*</span></label>
                            <input className="form-input" placeholder="VD: Giảm 20% cuối tuần" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Loại KM</label>
                            <select className="form-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                {PROMOTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Giá trị ({form.type === 'Percent' ? '%' : 'VNĐ'})</label>
                            <input className="form-input" type="number" placeholder="VD: 20" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Ngày bắt đầu</label>
                            <input className="form-input" type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Ngày kết thúc</label>
                            <input className="form-input" type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Trạng thái</label>
                            <select className="form-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                {PROMOTION_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                </Modal>
            )}

            {deleteTarget && (
                <ConfirmDialog
                    message={`Vô hiệu hóa chương trình "${deleteTarget.name}"?`}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </>
    );
}

// ═══════════════════════════════════════════════════════════════
//  Tab: VOUCHERS
// ═══════════════════════════════════════════════════════════════
function VouchersTab() {
    const [vouchers, setVouchers] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const totalPages = Math.ceil(total / PAGE_SIZE);

    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState(DEFAULT_VOUCHER);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getVouchers({ search, status: statusFilter, page, limit: PAGE_SIZE });
            setVouchers(res.data || []);
            setTotal(res.total || res.data?.length || 0);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter, page]);

    useEffect(() => { fetchData(); }, [fetchData]);
    useEffect(() => {
        const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
        return () => clearTimeout(t);
    }, [searchInput]);

    const openCreate = () => { setForm(DEFAULT_VOUCHER); setEditTarget(null); setShowModal(true); };
    const openEdit = (v) => {
        setForm({
            code: v.code, value: v.value, type: v.type,
            minOrderValue: v.minOrderValue, maxUsage: v.maxUsage,
            startDate: toInputDate(v.startDate), expiryDate: toInputDate(v.expiryDate),
            status: v.status
        });
        setEditTarget(v);
        setShowModal(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            if (editTarget) await updateVoucher(editTarget.id, form);
            else await createVoucher(form);
            setShowModal(false);
            fetchData();
        } catch (e) {
            alert('Lỗi: ' + (e.response?.data?.message || e.message));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteVoucher(deleteTarget.id);
            setDeleteTarget(null);
            fetchData();
        } catch (e) {
            alert('Lỗi: ' + (e.response?.data?.message || e.message));
        }
    };

    const statusBadge = (s) => {
        const map = { Active: 'status-active', Expired: 'status-expired', Disabled: 'status-inactive' };
        return <span className={`status-badge ${map[s] || ''}`}>{s}</span>;
    };

    return (
        <>
            <div className="glass-panel">
                <div className="toolbar">
                    <input
                        className="search-input"
                        placeholder="🔍 Tìm mã voucher..."
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                    />
                    <select className="filter-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
                        <option value="">Tất cả trạng thái</option>
                        {VOUCHER_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <span className="total-badge">{total} voucher</span>
                    <button className="btn-primary" onClick={openCreate}>＋ Thêm voucher</button>
                </div>

                <div className="crm-table-container">
                    <table className="crm-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Mã voucher</th>
                                <th>Loại</th>
                                <th>Giá trị</th>
                                <th>Đơn tối thiểu</th>
                                <th>Đã dùng</th>
                                <th>Hết hạn</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="9" className="loading-cell"><div className="spinner" /></td></tr>
                            ) : vouchers.length === 0 ? (
                                <tr><td colSpan="9" className="empty-cell">Không có dữ liệu</td></tr>
                            ) : vouchers.map((v, i) => (
                                <tr key={v.id}>
                                    <td className="text-muted">{(page - 1) * PAGE_SIZE + i + 1}</td>
                                    <td><code className="voucher-code">{v.code}</code></td>
                                    <td><span className="type-badge">{v.type}</span></td>
                                    <td className="promo-value-cell">{v.type === 'Percent' ? `${v.value}%` : fmtMoney(v.value)}</td>
                                    <td className="text-muted">{fmtMoney(v.minOrderValue)}</td>
                                    <td>
                                        <div className="usage-bar-wrap">
                                            <div className="usage-bar" style={{ width: `${Math.min((v.currentUsage / v.maxUsage) * 100, 100)}%` }} />
                                            <span className="usage-text">{v.currentUsage}/{v.maxUsage}</span>
                                        </div>
                                    </td>
                                    <td className="text-muted">{fmtDate(v.expiryDate)}</td>
                                    <td>{statusBadge(v.status)}</td>
                                    <td>
                                        <div className="action-btns">
                                            <button className="btn-icon edit" onClick={() => openEdit(v)} title="Sửa">✏️</button>
                                            <button className="btn-icon del" onClick={() => setDeleteTarget(v)} title="Xóa">🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>

            {showModal && (
                <Modal
                    title={editTarget ? '✏️ Sửa voucher' : '➕ Thêm voucher mới'}
                    onClose={() => setShowModal(false)}
                    onSubmit={handleSave}
                    loading={saving}
                >
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Mã voucher <span className="required">*</span></label>
                            <input className="form-input" placeholder="VD: SALE50K" value={form.code}
                                disabled={!!editTarget}
                                onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} />
                        </div>
                        <div className="form-group">
                            <label>Loại</label>
                            <select className="form-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                {VOUCHER_TYPES.map(t => <option key={t} value={t}>{t === 'Percent' ? 'Phần trăm (%)' : 'Số tiền cố định'}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Giá trị ({form.type === 'Percent' ? '%' : 'VNĐ'}) <span className="required">*</span></label>
                            <input className="form-input" type="number" placeholder="VD: 50000" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Đơn hàng tối thiểu (VNĐ)</label>
                            <input className="form-input" type="number" placeholder="VD: 200000" value={form.minOrderValue} onChange={e => setForm({ ...form, minOrderValue: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Số lần dùng tối đa</label>
                            <input className="form-input" type="number" placeholder="VD: 100" value={form.maxUsage} onChange={e => setForm({ ...form, maxUsage: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Trạng thái</label>
                            <select className="form-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                {VOUCHER_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Ngày bắt đầu</label>
                            <input className="form-input" type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Ngày hết hạn</label>
                            <input className="form-input" type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} />
                        </div>
                    </div>
                </Modal>
            )}

            {deleteTarget && (
                <ConfirmDialog
                    message={`Vô hiệu voucher "${deleteTarget.code}"?`}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </>
    );
}

// ═══════════════════════════════════════════════════════════════
//  CRMPage — Root
// ═══════════════════════════════════════════════════════════════
const CRMPage = () => {
    const [activeTab, setActiveTab] = useState('customers');

    return (
        <div className="crm-container">
            <header className="crm-header">
                <h1 className="crm-title">Marketing &amp; Loyalty</h1>
            </header>

            <div className="crm-tabs">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        className={`crm-tab ${activeTab === tab.key ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.key)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <main className="crm-content">
                {activeTab === 'customers' && <CustomersTab />}
                {activeTab === 'promotions' && <PromotionsTab />}
                {activeTab === 'vouchers' && <VouchersTab />}
            </main>
        </div>
    );
};

export default CRMPage;
