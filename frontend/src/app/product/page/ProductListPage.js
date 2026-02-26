import { useState, useEffect, useRef } from 'react';
import useProduct from '../../../hooks/product/useProduct';
import { useProductContext } from '../ui/ProductContext';
import CreateProductModal from '../ui/CreateProductModal';
import CreateComboModal from '../ui/CreateComboModal';
import EditProductModal from '../ui/EditProductModal';
import ProductDetailModal from '../ui/ProductDetailModal';
import PriceHistoryModal from '../ui/PriceHistoryModal';
import categoryService from '../../../services/categoryService';
import './ProductListPage.css';

// Flatten nested tree [{id, name, parentId, children:[]}] thành mảng phẳng
function flattenTree(nodes) {
    const result = [];
    for (const node of nodes) {
        result.push({ id: node.id, name: node.name, parentId: node.parentId || null });
        if (node.children?.length) result.push(...flattenTree(node.children));
    }
    return result;
}

const STATUS_OPTIONS = [
    { value: 'Selling', label: 'Đang bán' },
    { value: 'StopSelling', label: 'Ngừng bán' },
];

const STATUS_BADGE = {
    Selling: { label: 'Đang bán', cls: 'plp-badge plp-badge--selling' },
    StopSelling: { label: 'Ngừng bán', cls: 'plp-badge plp-badge--stop' },
};

const ProductListPage = () => {
    const {
        products, total, totalPages, loading, error,
        filters, updateFilters, changePage,
        handleStopSelling, handleStartSelling, refetch,
    } = useProduct();

    const {
        createModal, createComboModal, editModal, detailModal, priceHistoryModal,
        openCreate, closeCreate,
        openCreateCombo, closeCreateCombo,
        openEdit, closeEdit,
        openDetail, closeDetail,
        openPriceHistory, closePriceHistory,
    } = useProductContext();

    const [searchInput, setSearchInput] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const [confirmModal, setConfirmModal] = useState({ open: false, productId: null, action: null });
    const [toast, setToast] = useState(null);
    const [addDropdown, setAddDropdown] = useState(false);

    const [categories, setCategories] = useState([]);
    const [categoryOpen, setCategoryOpen] = useState(false);
    const categoryRef = useRef(null);
    const addDropdownRef = useRef(null);

    useEffect(() => {
        categoryService.fetchCategoryTree('', 1, 999).then(res => {
            if (res.success !== false) {
                const tree = res.data?.data || [];
                setCategories(flattenTree(tree));
            }
        });
    }, []);

    useEffect(() => {
        const handler = (e) => {
            if (categoryRef.current && !categoryRef.current.contains(e.target)) setCategoryOpen(false);
            if (addDropdownRef.current && !addDropdownRef.current.contains(e.target)) setAddDropdown(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3500);
    };

    const selectedCategory = categories.find(c => c.id === filters.categoryId);

    const handleSearch = (e) => {
        if (e.key === 'Enter' || e.type === 'click') updateFilters({ search: searchInput });
    };

    const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    const toggleSelectAll = () => setSelectedIds(selectedIds.length === products.length ? [] : products.map(p => p.id));

    const confirmAction = (productId, action) => setConfirmModal({ open: true, productId, action });

    const executeAction = async () => {
        const { productId, action } = confirmModal;
        setConfirmModal({ open: false, productId: null, action: null });
        const res = action === 'stop'
            ? await handleStopSelling(productId)
            : await handleStartSelling(productId);
        showToast(
            res.success ? 'success' : 'error',
            res.success
                ? (action === 'stop' ? 'Đã ngừng bán sản phẩm' : 'Đã bật bán lại sản phẩm')
                : res.message
        );
    };

    const fmt = (val) => val != null ? Number(val).toLocaleString('vi-VN') + 'đ' : '—';

    return (
        <div className="plp">
            {/* Header */}
            <div className="plp__header">
                <h1 className="plp__title">Danh sách sản phẩm</h1>

                {/* Dropdown thêm sản phẩm */}
                <div className="plp-add-dropdown" ref={addDropdownRef}>
                    <button
                        className="plp-btn plp-btn--primary plp-add-btn"
                        onClick={() => setAddDropdown(p => !p)}
                    >
                        + Thêm sản phẩm ▾
                    </button>
                    {addDropdown && (
                        <div className="plp-add-menu">
                            <button className="plp-add-menu__item" onClick={() => { openCreate(); setAddDropdown(false); }}>
                                <span className="plp-add-menu__icon">📦</span>
                                <div>
                                    <div className="plp-add-menu__label">Sản phẩm thường</div>
                                    <div className="plp-add-menu__hint">Sản phẩm đơn lẻ hoặc bán theo cân</div>
                                </div>
                            </button>
                            <button className="plp-add-menu__item" onClick={() => { openCreateCombo(); setAddDropdown(false); }}>
                                <span className="plp-add-menu__icon">🎁</span>
                                <div>
                                    <div className="plp-add-menu__label">Sản phẩm combo</div>
                                    <div className="plp-add-menu__hint">Gồm nhiều sản phẩm con đóng gói chung</div>
                                </div>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Toolbar */}
            <div className="plp__toolbar">
                <div className="plp-search">
                    <span className="plp-search__icon">🔍</span>
                    <input className="plp-search__input"
                        placeholder="Mã, tên, barcode..."
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                    <button className="plp-search__btn" onClick={handleSearch}>Tìm</button>
                </div>

                {/* Category */}
                <div className="plp-cat" ref={categoryRef}>
                    <button
                        className={`plp-cat__btn${filters.categoryId ? ' plp-cat__btn--active' : ''}`}
                        onClick={() => setCategoryOpen(p => !p)}
                    >
                        📂 {selectedCategory ? selectedCategory.name : 'Danh mục'} {categoryOpen ? '▲' : '▼'}
                    </button>
                    {categoryOpen && (
                        <div className="plp-cat__dropdown">
                            <div
                                className={`plp-cat__item${!filters.categoryId ? ' plp-cat__item--active' : ''}`}
                                onClick={() => { updateFilters({ categoryId: null }); setCategoryOpen(false); }}
                            >
                                Tất cả danh mục
                            </div>
                            {/* Nhóm cha → con */}
                            {categories.filter(c => !c.parentId).map(parent => {
                                const children = categories.filter(c => c.parentId === parent.id);
                                return (
                                    <div key={parent.id}>
                                        {/* Tên danh mục cha: không click được, chỉ là header */}
                                        <div className="plp-cat__group-header">
                                            📂 {parent.name}
                                        </div>
                                        {children.length === 0 ? (
                                            <div className="plp-cat__item plp-cat__item--empty">Chưa có danh mục con</div>
                                        ) : children.map(child => (
                                            <div key={child.id}
                                                className={`plp-cat__item plp-cat__item--child${filters.categoryId === child.id ? ' plp-cat__item--active' : ''}`}
                                                onClick={() => { updateFilters({ categoryId: child.id }); setCategoryOpen(false); }}
                                            >
                                                └ {child.name}
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Status tabs */}
                <div className="plp-status-tabs">
                    {STATUS_OPTIONS.map(o => (
                        <button key={o.value}
                            className={`plp-status-tab${filters.status === o.value ? ' plp-status-tab--active' : ''}`}
                            onClick={() => updateFilters({ status: o.value })}
                        >
                            {o.label}
                        </button>
                    ))}
                </div>

                {(filters.categoryId || filters.search) && (
                    <button className="plp-clear-btn"
                        onClick={() => { updateFilters({ categoryId: null, search: '' }); setSearchInput(''); }}>
                        ✕ Xóa bộ lọc
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="plp__table-wrap">
                {error && <div className="plp-error">{error}</div>}
                <table className="plp-table">
                    <thead>
                        <tr>
                            <th>
                                <input type="checkbox"
                                    checked={selectedIds.length === products.length && products.length > 0}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th>#</th>
                            <th>Mã SP</th>
                            <th>Tên sản phẩm</th>
                            <th>Danh mục</th>
                            <th>Giá vốn</th>
                            <th>Giá bán</th>
                            <th>Tồn kho</th>
                            <th>Đơn vị</th>
                            <th>Loại</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={12} className="plp-table__state">Đang tải...</td></tr>
                        ) : products.length === 0 ? (
                            <tr><td colSpan={12} className="plp-table__state">Không có sản phẩm nào</td></tr>
                        ) : products.map((p, idx) => (
                            <tr key={p.id} className={selectedIds.includes(p.id) ? 'plp-table__row--selected' : ''}>
                                <td>
                                    <input type="checkbox"
                                        checked={selectedIds.includes(p.id)}
                                        onChange={() => toggleSelect(p.id)}
                                    />
                                </td>
                                <td>{(filters.page - 1) * filters.limit + idx + 1}</td>
                                <td className="plp-cell--code">{p.code}</td>
                                <td className="plp-cell--name">{p.name}</td>
                                <td>{p.categoryName || '—'}</td>
                                <td className="plp-cell--price">{fmt(p.costPrice)}</td>
                                <td className="plp-cell--price">{fmt(p.salePrice)}</td>
                                <td>{p.stockQuantity ?? 0}</td>
                                <td>{p.baseUnit}</td>
                                <td>
                                    {p.isCombo
                                        ? <span className="plp-type-badge plp-type-badge--combo">🎁 Combo</span>
                                        : p.allowDecimalQuantity
                                            ? <span className="plp-type-badge plp-type-badge--weight">⚖️ Cân</span>
                                            : <span className="plp-type-badge">📦 Thường</span>
                                    }
                                </td>
                                <td>
                                    <span className={STATUS_BADGE[p.status]?.cls || 'plp-badge'}>
                                        {STATUS_BADGE[p.status]?.label || p.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="plp-actions">
                                        <button className="plp-action plp-action--view" title="Chi tiết" onClick={() => openDetail(p.id)}>👁</button>
                                        <button className="plp-action plp-action--history" title="Lịch sử giá" onClick={() => openPriceHistory(p.id, p.name)}>📋</button>
                                        <button className="plp-action plp-action--edit" title="Chỉnh sửa" onClick={() => openEdit(p.id)}>✏️</button>

                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="plp__footer">
                <span className="plp__total">Tổng: <strong>{total}</strong> sản phẩm</span>
                <div className="plp-pagination">
                    <button className="plp-page-btn" onClick={() => changePage(filters.page - 1)} disabled={filters.page === 1}>‹</button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                        <button key={n}
                            className={`plp-page-btn${filters.page === n ? ' plp-page-btn--active' : ''}`}
                            onClick={() => changePage(n)}
                        >{n}</button>
                    ))}
                    <button className="plp-page-btn" onClick={() => changePage(filters.page + 1)} disabled={filters.page >= totalPages || totalPages === 0}>›</button>
                </div>
            </div>

            {/* Confirm */}
            {confirmModal.open && (
                <div className="plp-overlay" onClick={() => setConfirmModal({ open: false, productId: null, action: null })}>
                    <div className="plp-confirm" onClick={e => e.stopPropagation()}>
                        <p className="plp-confirm__text">
                            {confirmModal.action === 'stop'
                                ? 'Bạn có chắc muốn ngừng bán sản phẩm này?'
                                : 'Bạn có chắc muốn bán lại sản phẩm này?'}
                        </p>
                        <div className="plp-confirm__btns">
                            <button className="plp-btn plp-btn--ghost"
                                onClick={() => setConfirmModal({ open: false, productId: null, action: null })}>Hủy</button>
                            <button className="plp-btn plp-btn--danger" onClick={executeAction}>Xác nhận</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
            {createModal && (
                <CreateProductModal
                    onClose={closeCreate}
                    onSuccess={(msg) => { closeCreate(); refetch(); showToast('success', msg); }}
                    onError={(msg) => showToast('error', msg)}
                />
            )}
            {createComboModal && (
                <CreateComboModal
                    onClose={closeCreateCombo}
                    onSuccess={(msg) => { closeCreateCombo(); refetch(); showToast('success', msg); }}
                    onError={(msg) => showToast('error', msg)}
                />
            )}
            {editModal.open && (
                <EditProductModal
                    productId={editModal.productId}
                    onClose={closeEdit}
                    onSuccess={(msg) => { closeEdit(); refetch(); showToast('success', msg); }}
                    onError={(msg) => showToast('error', msg)}
                />
            )}
            {detailModal.open && (
                <ProductDetailModal
                    productId={detailModal.productId}
                    onClose={closeDetail}
                    onEdit={() => { closeDetail(); openEdit(detailModal.productId); }}
                />
            )}
            {priceHistoryModal.open && (
                <PriceHistoryModal
                    productId={priceHistoryModal.productId}
                    productName={priceHistoryModal.productName}
                    onClose={closePriceHistory}
                />
            )}

            {/* Toast */}
            {toast && (
                <div className={`plp-toast plp-toast--${toast.type}`}>
                    {toast.type === 'success' ? '✅' : '❌'} {toast.message}
                </div>
            )}
        </div>
    );
};

export default ProductListPage;