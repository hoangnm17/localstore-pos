import React, { useState, useEffect, useCallback } from 'react';
import './CRMPage.css';
import {
    getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer,
    getPurchaseHistory, getPointLogs, adjustPoints,
    getPromotions, getPromotionById, createPromotion, updatePromotion, deletePromotion,
    addPromotionItem, removePromotionItem,
    getVouchers, createVoucher, updateVoucher, deleteVoucher,
    getPromotionReport, getVoucherReport

} from '../../services/crm.service';

import {
    User, Target, Ticket, BarChart3,
    Plus, Edit, Trash2, ClipboardList,
    Search, Save, X, Eye, Star, Cart,
    ShoppingBag, History, FileText, LayoutList
} from 'lucide-react';

// ─── Hằng số ───────────────────────────────────────────────────────────────
const TABS = [
    { key: 'customers', label: <><User size={16} className="me-2" />Khách hàng</> },
    { key: 'promotions', label: <><Target size={16} className="me-2" />Khuyến mãi</> },
    { key: 'vouchers', label: <><Ticket size={16} className="me-2" />Voucher</> },
    { key: 'report', label: <><BarChart3 size={16} className="me-2" />Báo cáo</> },
];
const CUSTOMER_STATUS = ['Active', 'Inactive', 'Blocked'];
const PROMOTION_TYPES = ['Percent', 'Amount', 'BuyXGetY'];
const PAGE_SIZE = 10;

const DEFAULT_CUSTOMER = { name: '', phone: '', status: 'Active' };
const DEFAULT_PROMOTION = { name: '', type: 'Percent', value: '', startDate: '', endDate: '', status: 'Active' };
const DEFAULT_VOUCHER = { code: '', value: '', type: 'Fixed', minOrderValue: 0, maxUsage: 100, startDate: '', expiryDate: '', status: 'Active' };


// ─── Helpers ───────────────────────────────────────────────────────────────
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '—';
const fmtMoney = (n) => n != null ? Number(n).toLocaleString('vi-VN') + ' đ' : '—';
const toInputDate = (d) => d ? new Date(d).toISOString().slice(0, 10) : '';
const statusColor = { Active: 'status-active', Inactive: 'status-inactive', Blocked: 'status-blocked', Expired: 'status-expired', Disabled: 'status-inactive' };
const StatusBadge = ({ s }) => <span className={`status-badge ${statusColor[s] || ''}`}>{s}</span>;
const TypeBadge = ({ t }) => <span className="type-badge">{t}</span>;

// ─── Shared UI ─────────────────────────────────────────────────────────────
function Modal({ title, onClose, onSubmit, loading, wide, children }) {
    return (
        <div className="crm-modal-overlay" onClick={onClose}>
            <div className={`crm-modal${wide ? ' crm-modal--wide' : ''}`} onClick={e => e.stopPropagation()}>
                <div className="crm-modal-header">
                    <h2 className="crm-modal-title">{title}</h2>
                    <button className="crm-modal-close" onClick={onClose}><i className="bi bi-x-lg"></i></button>
                </div>
                <div className="crm-modal-body">{children}</div>
                {onSubmit && (
                    <div className="crm-modal-footer">
                        <button className="btn-ghost" onClick={onClose} disabled={loading}>Hủy</button>
                        <button className="btn-primary" onClick={onSubmit} disabled={loading}>
                            {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-save-fill me-2"></i>}
                            Lưu
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
    return (
        <div className="crm-modal-overlay" onClick={onCancel}>
            <div className="crm-confirm" onClick={e => e.stopPropagation()}>
                <div className="crm-confirm-icon"><i className="bi bi-exclamation-triangle-fill"></i></div>
                <p className="crm-confirm-msg">{message}</p>
                <div className="crm-modal-footer" style={{ justifyContent: 'center' }}>
                    <button className="btn-ghost" onClick={onCancel}>Hủy</button>
                    <button className="btn-danger" onClick={onConfirm}>Xác nhận</button>
                </div>
            </div>
        </div>
    );
}

function AlertModal({ message, onClose }) {
    return (
        <div className="crm-modal-overlay" onClick={onClose}>
            <div className="crm-confirm" style={{ borderTop: '4px solid #f87171' }} onClick={e => e.stopPropagation()}>
                <div className="crm-confirm-icon" style={{ color: '#f87171' }}><i className="bi bi-slash-circle"></i></div>
                <h3 style={{ color: '#1e293b', marginBottom: 8, fontSize: '1.2rem' }}>Thông báo</h3>
                <p className="crm-confirm-msg">{message}</p>
                <div className="crm-modal-footer" style={{ justifyContent: 'center', marginTop: 20 }}>
                    <button className="btn-primary" onClick={onClose} style={{ padding: '8px 30px' }}>Đóng</button>
                </div>
            </div>
        </div>
    );
}

function Pagination({ page, totalPages, onPageChange }) {
    if (!totalPages || totalPages <= 1) return null;
    const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1);
    return (
        <div className="crm-pagination d-flex justify-content-center gap-1 mt-3">
            <button className="page-btn btn btn-sm btn-light border" onClick={() => onPageChange(page - 1)} disabled={page === 1}><i className="bi bi-chevron-left"></i></button>
            {pages.map(p => (
                <button key={p} className={`page-btn btn btn-sm ${p === page ? 'btn-primary' : 'btn-light border'}`} onClick={() => onPageChange(p)}>{p}</button>
            ))}
            <button className="page-btn btn btn-sm btn-light border" onClick={() => onPageChange(page + 1)} disabled={page === totalPages}><i className="bi bi-chevron-right"></i></button>
        </div>
    );
}

function SubTabBar({ tabs, active, onChange }) {
    return (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: 8 }}>
            {tabs.map(t => (
                <button key={t.key} onClick={() => onChange(t.key)} style={{
                    padding: '6px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
                    background: active === t.key ? '#6366f1' : '#f1f5f9',
                    color: active === t.key ? '#fff' : '#1e293b',
                    transition: 'all .2s'
                }}>{t.label}</button>
            ))}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
//  UC3 + UC4: Customer Detail Modal
// ═══════════════════════════════════════════════════════════════════════════
function CustomerDetailModal({ customer: initialCustomer, onClose, onRefresh }) {
    const [customer, setCustomer] = useState(initialCustomer);
    const [subTab, setSubTab] = useState('history');
    const [history, setHistory] = useState([]);
    const [histPage, setHistPage] = useState(1);
    const [histTotal, setHistTotal] = useState(0);
    const [histLoading, setHistLoading] = useState(false);
    const [logs, setLogs] = useState([]);
    const [logsPage, setLogsPage] = useState(1);
    const [logsTotal, setLogsTotal] = useState(0);
    const [logsLoading, setLogsLoading] = useState(false);
    const [adjForm, setAdjForm] = useState({ pointChange: '', reason: '' });
    const [adjSaving, setAdjSaving] = useState(false);
    const [adjMsg, setAdjMsg] = useState('');

    const fetchHistory = useCallback(async () => {
        setHistLoading(true);
        try {
            const res = await getPurchaseHistory(customer.id, { page: histPage, limit: 8 });
            setHistory(res?.data || []);
            setHistTotal(res?.total || 0);
        } catch { } finally { setHistLoading(false); }
    }, [customer.id, histPage]);

    const fetchLogs = useCallback(async () => {
        setLogsLoading(true);
        try {
            const res = await getPointLogs(customer.id, { page: logsPage, limit: 8 });
            setLogs(res?.data || []);
            setLogsTotal(res?.total || 0);
        } catch { } finally { setLogsLoading(false); }
    }, [customer.id, logsPage]);

    const fetchCustomer = useCallback(async () => {
        try {
            const res = await getCustomerById(customer.id);
            if (res?.success) setCustomer(res.data);
        } catch { }
    }, [customer.id]);

    useEffect(() => { if (subTab === 'history') fetchHistory(); }, [subTab, fetchHistory]);
    useEffect(() => { if (subTab === 'points') fetchLogs(); }, [subTab, fetchLogs]);

    const handleAdjust = async () => {
        if (!adjForm.pointChange) return;
        setAdjSaving(true); setAdjMsg('');
        try {
            await adjustPoints(customer.id, { pointChange: parseInt(adjForm.pointChange), reason: adjForm.reason });
            setAdjMsg(<><i className="bi bi-check-lg me-1"></i> Cập nhật điểm thành công!</>);
            setAdjForm({ pointChange: '', reason: '' });
            fetchLogs();
            fetchCustomer();
            if (onRefresh) onRefresh();
        } catch (e) {
            setAdjMsg(<><i className="bi bi-x-circle-fill me-1"></i> {e.response?.data?.message || e.message}</>);
        } finally { setAdjSaving(false); }
    };

    return (
        <Modal title={<><i className="bi bi-person-fill me-2"></i> {customer.name} — {customer.phone}</>} onClose={onClose} wide>
            <div style={{ marginBottom: 12, display: 'flex', gap: 16 }}>
                <span className="status-badge status-active"><i className="bi bi-star-fill me-1"></i> {customer.loyaltyPoints} điểm</span>
                <span className="type-badge">Tổng chi: {fmtMoney(customer.totalSpending)}</span>
                <StatusBadge s={customer.status} />
            </div>
            <SubTabBar tabs={[{ key: 'history', label: <><i className="bi bi-cart-fill me-1"></i> Lịch sử mua hàng</> }, { key: 'points', label: <><i className="bi bi-star-fill me-1"></i> Điểm tích lũy</> }]} active={subTab} onChange={setSubTab} />
            {subTab === 'history' && (
                <div>
                    {histLoading ? <div className="loading-cell"><div className="spinner" /></div> : (
                        <div className="crm-table-container">
                            <table className="crm-table">
                                <thead><tr><th>Mã HĐ</th><th>Ngày</th><th>Số SP</th><th>Thực thanh</th><th>Trạng thái</th></tr></thead>
                                <tbody>
                                    {history.length === 0 ? <tr><td colSpan="5" className="empty-cell">Chưa có hóa đơn nào</td></tr> :
                                        history.map(h => (
                                            <tr key={h.id}>
                                                <td><code className="voucher-code">{h.invoiceCode}</code></td>
                                                <td className="text-muted">{fmtDate(h.createdAt)}</td>
                                                <td>{h.itemCount}</td>
                                                <td style={{ fontWeight: 700, color: '#34d399' }}>{fmtMoney(h.finalAmount)}</td>
                                                <td><StatusBadge s={h.status} /></td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                    )}
                    <Pagination page={histPage} totalPages={Math.ceil(histTotal / 8)} onPageChange={setHistPage} />
                </div>
            )}
            {subTab === 'points' && (
                <div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
                        <h4 style={{ margin: '0 0 12px', color: '#a78bfa' }}><i className="bi bi-lightning-fill me-2"></i> Điều chỉnh điểm thủ công</h4>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                            <div className="form-group" style={{ flex: '1 1 120px' }}><label>Điểm +/-</label><input className="form-input" type="number" value={adjForm.pointChange} onChange={e => setAdjForm({ ...adjForm, pointChange: e.target.value })} /></div>
                            <div className="form-group" style={{ flex: '2 1 200px' }}><label>Lý do</label><input className="form-input" value={adjForm.reason} onChange={e => setAdjForm({ ...adjForm, reason: e.target.value })} /></div>
                            <button className="btn-primary" onClick={handleAdjust} disabled={adjSaving} style={{ height: 42 }}>{adjSaving ? <div className="spinner-border spinner-border-sm" /> : <i className="bi bi-check-lg"></i>}</button>
                        </div>
                        {adjMsg && <p style={{ margin: '8px 0 0', fontSize: 12, color: (adjMsg.props?.children?.some?.(c => c.props?.className?.includes('bi-check-lg')) || String(adjMsg).includes('Thành công')) ? '#34d399' : '#f87171' }}>{adjMsg}</p>}
                    </div>
                    {logsLoading ? <div className="loading-cell"><div className="spinner" /></div> : (
                        <div className="crm-table-container">
                            <table className="crm-table">
                                <thead><tr><th>Thời gian</th><th>Thay đổi</th><th>Lý do</th><th>Hóa đơn</th></tr></thead>
                                <tbody>
                                    {logs.length === 0 ? <tr><td colSpan="4" className="empty-cell">Chưa có lịch sử điểm</td></tr> :
                                        logs.map(l => (
                                            <tr key={l.id}>
                                                <td className="text-muted">{fmtDate(l.createdAt)}</td>
                                                <td style={{ fontWeight: 700, color: l.pointChange > 0 ? '#34d399' : '#f87171' }}>{l.pointChange > 0 ? '+' : ''}{l.pointChange} <i className="bi bi-star-fill small"></i></td>
                                                <td>{l.reason || '—'}</td>
                                                <td>{l.invoiceCode ? <code className="voucher-code">{l.invoiceCode}</code> : '—'}</td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                    )}
                    <Pagination page={logsPage} totalPages={Math.ceil(logsTotal / 8)} onPageChange={setLogsPage} />
                </div>
            )}
        </Modal>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
//  Customers Tab
// ═══════════════════════════════════════════════════════════════════════════
function CustomersTab() {
    const [customers, setCustomers] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState(DEFAULT_CUSTOMER);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [detailTarget, setDetailTarget] = useState(null);
    const [alertMsg, setAlertMsg] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getCustomers({ search, page, limit: PAGE_SIZE });
            setCustomers(res?.data || []);
            setTotal(res?.total || 0);
        } catch { } finally { setLoading(false); }
    }, [search, page]);

    useEffect(() => { fetchData(); }, [fetchData]);
    useEffect(() => {
        const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 400);
        return () => clearTimeout(t);
    }, [searchInput]);

    const handleSave = async () => {
        const VN_PHONE_REGEX = /^(0[3|5|7|8|9])+([0-9]{8})$/;

        if (!VN_PHONE_REGEX.test(form.phone || "")) {
            setAlertMsg("Số điện thoại không đúng định dạng (ví dụ: 0912345678)");
            return;
        }

        setSaving(true);
        try {
            if (editTarget) await updateCustomer(editTarget.id, form);
            else await createCustomer(form);
            setShowModal(false);
            fetchData();
        } catch (e) {
            setAlertMsg(e.response?.data?.message || e.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <div className="glass-panel">
                <div className="toolbar">
                    <div style={{ position: 'relative', width: 260 }}>
                        <i className="bi bi-search" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}></i>
                        <input className="search-input" style={{ paddingLeft: 35 }} placeholder="Tìm tên, SĐT..." value={searchInput} onChange={e => setSearchInput(e.target.value)} />
                    </div>
                    <span className="total-badge">{total} khách hàng</span>
                    <button className="btn-primary" onClick={() => { setForm(DEFAULT_CUSTOMER); setEditTarget(null); setShowModal(true); }}><i className="bi bi-plus-lg me-1"></i> Thêm khách hàng</button>
                </div>
                <div className="crm-table-container">
                    <table className="crm-table">
                        <thead><tr><th>Họ tên</th><th>Số điện thoại</th><th>Điểm</th><th>Tổng chi</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                        <tbody>
                            {loading ? <tr><td colSpan="6" className="loading-cell"><div className="spinner" /></td></tr> :
                                customers.map(c => (
                                    <tr key={c.id}>
                                        <td><strong>{c.name}</strong></td>
                                        <td>{c.phone}</td>
                                        <td><span className="points-badge">{c.loyaltyPoints}</span></td>
                                        <td>{fmtMoney(c.totalSpending)}</td>
                                        <td><StatusBadge s={c.status} /></td>
                                        <td>
                                            <div className="action-btns d-flex gap-2">
                                                <button className="btn btn-sm btn-light border p-1 d-flex align-items-center justify-content-center" title="Xem chi tiết" style={{ width: 32, height: 32 }} onClick={() => setDetailTarget(c)}>
                                                    <Eye size={18} className="text-primary" />
                                                </button>
                                                <button className="btn btn-sm btn-light border p-1 d-flex align-items-center justify-content-center" title="Sửa" style={{ width: 32, height: 32 }} onClick={() => { setForm({ name: c.name, phone: c.phone, status: c.status }); setEditTarget(c); setShowModal(true); }}>
                                                    <Edit size={18} className="text-muted" />
                                                </button>
                                                <button className="btn btn-sm btn-light border p-1 d-flex align-items-center justify-content-center" title="Xóa" style={{ width: 32, height: 32 }} onClick={() => setDeleteTarget(c)}>
                                                    <Trash2 size={18} className="text-danger" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
                <Pagination page={page} totalPages={Math.ceil(total / PAGE_SIZE)} onPageChange={setPage} />
            </div>
            {showModal && (
                <Modal title={editTarget ? <><i className="bi bi-pencil-square me-2"></i> Sửa khách hàng</> : <><i className="bi bi-plus-lg me-2"></i> Thêm khách hàng</>} onClose={() => setShowModal(false)} onSubmit={handleSave} loading={saving}>
                    <div className="form-grid">
                        <div className="form-group"><label>Họ tên *</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                        <div className="form-group"><label>Số điện thoại *</label><input className="form-input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
                        <div className="form-group"><label>Trạng thái</label>
                            <select className="form-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>{CUSTOMER_STATUS.map(s => <option key={s} value={s}>{s}</option>)}</select>
                        </div>
                    </div>
                </Modal>
            )}
            {detailTarget && <CustomerDetailModal customer={detailTarget} onClose={() => setDetailTarget(null)} onRefresh={fetchData} />}
            {deleteTarget && <ConfirmDialog message={`Vô hiệu hóa khách hàng "${deleteTarget.name}"?`} onConfirm={async () => { await deleteCustomer(deleteTarget.id); setDeleteTarget(null); fetchData(); }} onCancel={() => setDeleteTarget(null)} />}
            {alertMsg && <AlertModal message={alertMsg} onClose={() => setAlertMsg('')} />}
        </>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
//  Promotions Tab
// ═══════════════════════════════════════════════════════════════════════════
function PromotionsTab() {
    const [promotions, setPromotions] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState(DEFAULT_PROMOTION);
    const [itemsTarget, setItemsTarget] = useState(null);
    const [alertMsg, setAlertMsg] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getPromotions({ page, limit: PAGE_SIZE });
            setPromotions(res?.data || []);
            setTotal(res?.total || 0);
        } catch { } finally { setLoading(false); }
    }, [page]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSave = async () => {
        if (!form.name || !form.name.trim()) {
            setAlertMsg("Tên chương trình khuyến mãi không được để trống!");
            return;
        }

        if (form.startDate && form.endDate) {
            if (new Date(form.startDate) > new Date(form.endDate)) {
                setAlertMsg("Ngày bắt đầu không được lớn hơn ngày kết thúc!");
                return;
            }
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (form.startDate && new Date(form.startDate) < today) {
            setAlertMsg("Ngày bắt đầu không được ở trong quá khứ!");
            return;
        }
        if (form.endDate && new Date(form.endDate) < today) {
            setAlertMsg("Ngày kết thúc không được ở trong quá khứ!");
            return;
        }

        try {
            if (editTarget) await updatePromotion(editTarget.id, form);
            else await createPromotion(form);
            setShowModal(false);
            fetchData();
        } catch (e) {
            const errorText = e.response?.data?.message || e.message || 'Lỗi không xác định';
            setAlertMsg(errorText);
        }
    };

    return (
        <>
            <div className="glass-panel">
                <div className="toolbar">
                    <span className="total-badge">{total} chương trình</span>
                    <button className="btn-primary" onClick={() => { setForm(DEFAULT_PROMOTION); setEditTarget(null); setShowModal(true); }}><i className="bi bi-plus-lg me-1"></i> Thêm khuyến mãi</button>
                </div>
                <div className="crm-table-container">
                    <table className="crm-table">
                        <thead><tr><th>Tên chương trình</th><th>Loại</th><th>Giá trị</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                        <tbody>
                            {loading ? <tr><td colSpan="5" className="loading-cell"><div className="spinner" /></td></tr> :
                                promotions.map(p => (
                                    <tr key={p.id}>
                                        <td><strong>{p.name}</strong></td>
                                        <td><TypeBadge t={p.type} /></td>
                                        <td className="promo-value-cell">{p.type === 'Percent' ? `${p.value}%` : fmtMoney(p.value)}</td>
                                        <td><StatusBadge s={p.status} /></td>
                                        <td>
                                            <div className="action-btns d-flex gap-2">
                                                <button className="btn btn-sm btn-light border p-1 d-flex align-items-center justify-content-center" title="Sản phẩm áp dụng" style={{ width: 32, height: 32 }} onClick={() => setItemsTarget(p)}>
                                                    <LayoutList size={18} className="text-primary" />
                                                </button>
                                                <button className="btn btn-sm btn-light border p-1 d-flex align-items-center justify-content-center edit" title="Sửa" style={{ width: 32, height: 32 }} onClick={() => { setForm({ ...p, startDate: toInputDate(p.startDate), endDate: toInputDate(p.endDate) }); setEditTarget(p); setShowModal(true); }}>
                                                    <Edit size={18} className="text-muted" />
                                                </button>
                                                <button className="btn btn-sm btn-light border p-1 d-flex align-items-center justify-content-center del" title="Xóa" style={{ width: 32, height: 32 }} onClick={async () => { if (window.confirm('Xóa khuyến mãi này?')) { await deletePromotion(p.id); fetchData(); } }}>
                                                    <Trash2 size={18} className="text-danger" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
                <Pagination page={page} totalPages={Math.ceil(total / PAGE_SIZE)} onPageChange={setPage} />
            </div>
            {showModal && (
                <Modal title={editTarget ? <><i className="bi bi-pencil-square me-2"></i> Sửa KM</> : <><i className="bi bi-plus-lg me-2"></i> Thêm KM</>} onClose={() => setShowModal(false)} onSubmit={handleSave}>
                    <div className="form-grid">
                        <div className="form-group form-full"><label>Tên KM</label><input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                        <div className="form-group"><label>Loại</label><select className="form-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>{PROMOTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                        <div className="form-group"><label>Giá trị</label><input className="form-input" type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} /></div>
                        <div className="form-group"><label>Bắt đầu</label><input className="form-input" type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} /></div>
                        <div className="form-group"><label>Kết thúc</label><input className="form-input" type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} /></div>
                    </div>
                </Modal>
            )}
            {itemsTarget && (
                <Modal title={<><i className="bi bi-journal-list me-2"></i> Sản phẩm áp dụng: {itemsTarget.name}</>} onClose={() => setItemsTarget(null)} wide>
                    <PromotionItemsManager promotionId={itemsTarget.id} />
                </Modal>
            )}
            {alertMsg && <AlertModal message={alertMsg} onClose={() => setAlertMsg('')} />}
        </>
    );
}

function PromotionItemsManager({ promotionId }) {
    const [items, setItems] = useState([]);
    const [form, setForm] = useState({ type: 'product', id: '' });
    const fetch = useCallback(async () => {
        const res = await getPromotionById(promotionId);
        setItems(res?.data?.items || []);
    }, [promotionId]);
    useEffect(() => { fetch(); }, [fetch]);

    const add = async () => {
        const payload = form.type === 'product' ? { productId: parseInt(form.id) } : { categoryId: parseInt(form.id) };
        try {
            await addPromotionItem(promotionId, payload);
            setForm({ ...form, id: '' });
            fetch();
        } catch (e) {
            alert(e.response?.data?.message || e.message);
        }
    };

    return (
        <div className="promotion-items-manager">
            <div className="p-3 mb-3 border rounded bg-light d-flex align-items-end gap-3">
                <div className="flex-grow-1">
                    <label className="form-label mb-1 fw-bold small text-muted">Loại đối tượng</label>
                    <select className="form-select shadow-sm" style={{ fontSize: 13 }} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                        <option value="product">Sản phẩm (ID)</option>
                        <option value="category">Danh mục (ID)</option>
                    </select>
                </div>
                <div className="flex-grow-1">
                    <label className="form-label mb-1 fw-bold small text-muted">Mã định danh (ID)</label>
                    <div className="input-group shadow-sm">
                        <span className="input-group-text bg-white"><Search size={16} className="text-muted" /></span>
                        <input className="form-control" style={{ fontSize: 13 }} placeholder="Nhập ID số..." type="number" value={form.id} onChange={e => setForm({ ...form, id: e.target.value })} />
                    </div>
                </div>
                <button className="btn btn-primary d-flex align-items-center gap-2 px-3 shadow-sm" style={{ height: 38 }} onClick={add}>
                    <Plus size={18} /> Thêm
                </button>
            </div>

            <div className="table-responsive border rounded bg-white">
                <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                        <tr style={{ fontSize: 12 }}>
                            <th className="ps-3 py-3">TÊN SẢN PHẨM / DANH MỤC</th>
                            <th className="text-end pe-4 py-3">THAO TÁC</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr><td colSpan="2" className="text-center py-4 text-muted small">Chưa có sản phẩm nào được áp dụng</td></tr>
                        ) : items.map(item => (
                            <tr key={item.id}>
                                <td className="ps-3 py-2">
                                    {item.productName || item.categoryName ? (
                                        <div className="fw-semibold text-dark">{item.productName || item.categoryName}</div>
                                    ) : (
                                        <span className="badge bg-secondary-subtle text-secondary px-2">Mã ID: {item.productId || item.categoryId}</span>
                                    )}
                                </td>
                                <td className="text-end pe-4 py-2">
                                    <button className="btn btn-link text-danger p-0" title="Gỡ bỏ" onClick={async () => { await removePromotionItem(promotionId, item.id); fetch(); }}>
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
//  Vouchers Tab
// ═══════════════════════════════════════════════════════════════════════════
function VouchersTab() {
    const [vouchers, setVouchers] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState(DEFAULT_VOUCHER);
    const [alertMsg, setAlertMsg] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getVouchers({ page, limit: PAGE_SIZE });
            setVouchers(res?.data || []);
            setTotal(res?.total || 0);
        } catch { } finally { setLoading(false); }
    }, [page]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSave = async () => {
        if (!form.code || !form.code.trim()) {
            setAlertMsg("Mã Voucher không được để trống!");
            return;
        }

        if (form.startDate && form.expiryDate) {
            if (new Date(form.startDate) > new Date(form.expiryDate)) {
                setAlertMsg("Ngày bắt đầu không được lớn hơn ngày hết hạn!");
                return;
            }
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (form.startDate && new Date(form.startDate) < today) {
            setAlertMsg("Ngày bắt đầu không được ở trong quá khứ!");
            return;
        }
        if (form.expiryDate && new Date(form.expiryDate) < today) {
            setAlertMsg("Ngày hết hạn không được ở trong quá khứ!");
            return;
        }

        try {
            if (editTarget) await updateVoucher(editTarget.id, form);
            else await createVoucher(form);
            setShowModal(false);
            fetchData();
        } catch (e) {
            const errorText = e.response?.data?.message || e.message || 'Lỗi không xác định';
            setAlertMsg(errorText);
        }
    };

    return (
        <>
            <div className="glass-panel">
                <div className="toolbar">
                    <span className="total-badge">{total} voucher</span>
                    <button className="btn-primary" onClick={() => { setForm(DEFAULT_VOUCHER); setEditTarget(null); setShowModal(true); }}><i className="bi bi-plus-lg me-1"></i> Thêm voucher</button>
                </div>
                <div className="crm-table-container">
                    <table className="crm-table">
                        <thead><tr><th>Mã</th><th>Giá trị</th><th>Đơn tối thiểu</th><th>Sử dụng</th><th>Hết hạn</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                        <tbody>
                            {loading ? <tr><td colSpan="6" className="loading-cell"><div className="spinner" /></td></tr> :
                                vouchers.map(v => (
                                    <tr key={v.id}>
                                        <td><code className="voucher-code">{v.code}</code></td>
                                        <td className="promo-value-cell">{v.type === 'Percent' ? `${v.value}%` : fmtMoney(v.value)}</td>
                                        <td>{fmtMoney(v.minOrderValue)}</td>
                                        <td>{v.currentUsage}/{v.maxUsage}</td>
                                        <td className="text-muted">{fmtDate(v.expiryDate)}</td>
                                        <td><StatusBadge s={v.status} /></td>
                                        <td>
                                            <div className="action-btns d-flex gap-2">
                                                <button className="btn btn-sm btn-light border p-1 d-flex align-items-center justify-content-center" title="Sửa" style={{ width: 32, height: 32 }} onClick={() => { setForm({ ...v, startDate: toInputDate(v.startDate), expiryDate: toInputDate(v.expiryDate) }); setEditTarget(v); setShowModal(true); }}>
                                                    <Edit size={18} className="text-muted" />
                                                </button>
                                                <button className="btn btn-sm btn-light border p-1 d-flex align-items-center justify-content-center" title="Xóa" style={{ width: 32, height: 32 }} onClick={async () => {
                                                    if (window.confirm('Vô hiệu hóa voucher này?')) {
                                                        try {
                                                            await deleteVoucher(v.id);
                                                            fetchData();
                                                        } catch (e) {
                                                            setAlertMsg(e.response?.data?.message || e.message);
                                                        }
                                                    }
                                                }}>
                                                    <Trash2 size={18} className="text-danger" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
                <Pagination page={page} totalPages={Math.ceil(total / PAGE_SIZE)} onPageChange={setPage} />
            </div>
            {showModal && (
                <Modal title={editTarget ? <><i className="bi bi-pencil-square me-2"></i> Sửa Voucher</> : <><i className="bi bi-plus-lg me-2"></i> Thêm Voucher</>} onClose={() => setShowModal(false)} onSubmit={handleSave}>
                    <div className="form-grid">
                        <div className="form-group"><label>Mã Voucher</label><input className="form-input" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} /></div>
                        <div className="form-group"><label>Giá trị</label><input className="form-input" type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} /></div>
                        <div className="form-group"><label>Đơn tối thiểu</label><input className="form-input" type="number" value={form.minOrderValue} onChange={e => setForm({ ...form, minOrderValue: e.target.value })} /></div>
                        <div className="form-group"><label>Bắt đầu</label><input className="form-input" type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} /></div>
                        <div className="form-group"><label>Ngày hết hạn</label><input className="form-input" type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} /></div>
                        <div className="form-group">
                            <label>Trạng thái</label>
                            <select className="form-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                <option value="Active">Active</option>
                                <option value="Expired">Expired</option>
                                <option value="Disabled">Disabled</option>
                            </select>
                        </div>
                    </div>
                </Modal>
            )}
            {alertMsg && <AlertModal message={alertMsg} onClose={() => setAlertMsg('')} />}
        </>
    );
}



// ═══════════════════════════════════════════════════════════════════════════
//  Report Tab
// ═══════════════════════════════════════════════════════════════════════════
function ReportTab() {
    const [subTab, setSubTab] = useState('promotion');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetch = useCallback(async () => {
        setLoading(true);
        try {
            const res = subTab === 'promotion' ? await getPromotionReport() : await getVoucherReport();
            setData(res?.data || []);
        } catch { } finally { setLoading(false); }
    }, [subTab]);

    useEffect(() => { fetch(); }, [fetch]);

    return (
        <div className="glass-panel">
            <SubTabBar tabs={[{ key: 'promotion', label: <><i className="bi bi-percent me-2"></i> Báo cáo Khuyến mãi</> }, { key: 'voucher', label: <><i className="bi bi-ticket-perforated-fill me-2"></i> Báo cáo Voucher</> }]} active={subTab} onChange={setSubTab} />
            <div className="crm-table-container">
                <table className="crm-table">
                    <thead>
                        {subTab === 'promotion' ?
                            <tr><th>Chương trình</th><th>Lần dùng</th><th>Tổng giảm giá</th><th>Doanh thu sau KM</th></tr> :
                            <tr><th>Mã Voucher</th><th>Lần dùng</th><th>Tổng giảm giá</th><th>Trạng thái</th></tr>
                        }
                    </thead>
                    <tbody>
                        {loading ? <tr><td colSpan="4" className="loading-cell"><div className="spinner" /></td></tr> :
                            data.map((d, i) => (
                                <tr key={i}>
                                    <td><strong>{d.name || d.code}</strong></td>
                                    <td><span className="points-badge">{d.timesUsed}</span></td>
                                    <td style={{ color: '#f87171' }}>{fmtMoney(d.totalDiscountGiven)}</td>
                                    <td>{subTab === 'promotion' ? fmtMoney(d.totalRevenueAfterDiscount) : <StatusBadge s={d.status} />}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
//  Root Component
// ═══════════════════════════════════════════════════════════════════════════
const CRMPage = () => {
    const [activeTab, setActiveTab] = useState('customers');
    return (
        <div className="crm-container">
            <header className="crm-header">
                <h1 className="crm-title">Marketing &amp; Loyalty</h1>
            </header>
            <div className="crm-tabs">
                {TABS.map(tab => (
                    <button key={tab.key} className={`crm-tab ${activeTab === tab.key ? 'active' : ''}`} onClick={() => setActiveTab(tab.key)}>
                        {tab.label}
                    </button>
                ))}
            </div>
            <main className="crm-content">
                {activeTab === 'customers' && <CustomersTab />}
                {activeTab === 'promotions' && <PromotionsTab />}
                {activeTab === 'vouchers' && <VouchersTab />}

                {activeTab === 'report' && <ReportTab />}
            </main>
        </div>
    );
};

export default CRMPage;
