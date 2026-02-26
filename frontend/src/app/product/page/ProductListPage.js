import { useState, useEffect, useRef } from 'react';
import useProducts from '../../../hooks/product/useProduct';
import { useProductContext } from '../ui/ProductContext';
import ProductFormModal from '../ui/ProductFormModal';
import ProductDetailModal from '../ui/ProductDetailModal';
import PriceHistoryModal from '../ui/PriceHistoryModal';
import Toast from '../../../components/common/Toast';
import categoryService from '../../../services/categoryService';
import './ProductListPage.css';

const STATUS_OPTIONS = [
    { value: 'Selling', label: 'Đang bán' },
    { value: 'StopSelling', label: 'Ngừng bán' },
    { value: 'Suspended', label: 'Tạm khóa' },
];

const STATUS_BADGE = {
    Selling: { label: 'Đang bán', className: 'badge badge--selling' },
    StopSelling: { label: 'Ngừng bán', className: 'badge badge--stop' },
    Suspended: { label: 'Tạm khóa', className: 'badge badge--suspended' },
};

const ProductListPage = () => {
    const {
        products, total, totalPages, loading, error,
        filters, updateFilters, changePage,
        handleStopSelling, handleStartSelling,
    } = useProducts();

    const {
        detailModal, formModal, priceHistoryModal, toast,
        openDetail, closeDetail,
        openForm, closeForm,
        openPriceHistory, closePriceHistory,
        showToast,
    } = useProductContext();

    const [searchInput, setSearchInput] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const [confirmModal, setConfirmModal] = useState({ open: false, productId: null, action: null });

    // Category filter
    const [categories, setCategories] = useState([]);
    const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
    const categoryDropdownRef = useRef(null);

    useEffect(() => {
        const loadCategories = async () => {
            const res = await categoryService.fetchCategoryList('', 1, 100);
            if (res.success !== false) {
                setCategories(res.data?.data || []);
            }
        };
        loadCategories();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target)) {
                setCategoryDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedCategory = categories.find(c => c.id === filters.categoryId);

    const handleCategorySelect = (categoryId) => {
        updateFilters({ categoryId: categoryId || null });
        setCategoryDropdownOpen(false);
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter' || e.type === 'click') {
            updateFilters({ search: searchInput });
        }
    };

    const handleStatusFilter = (status) => {
        updateFilters({ status });
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === products.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(products.map(p => p.id));
        }
    };

    const confirmAction = (productId, action) => {
        setConfirmModal({ open: true, productId, action });
    };

    const executeAction = async () => {
        const { productId, action } = confirmModal;
        setConfirmModal({ open: false, productId: null, action: null });
        let res;
        if (action === 'stop') {
            res = await handleStopSelling(productId);
            if (res.success) showToast('success', 'Đã ngừng bán sản phẩm');
            else showToast('error', res.message);
        } else if (action === 'start') {
            res = await handleStartSelling(productId);
            if (res.success) showToast('success', 'Đã bật bán sản phẩm');
            else showToast('error', res.message);
        }
    };

    const formatPrice = (val) =>
        val != null ? Number(val).toLocaleString('vi-VN') + 'đ' : '—';

    const renderPagination = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <button
                    key={i}
                    className={`page-btn${filters.page === i ? ' page-btn--active' : ''}`}
                    onClick={() => changePage(i)}
                >
                    {i}
                </button>
            );
        }
        return (
            <div className="pagination">
                <button className="page-btn" onClick={() => changePage(Math.max(1, filters.page - 1))} disabled={filters.page === 1}>‹</button>
                {pages}
                <button className="page-btn" onClick={() => changePage(Math.min(totalPages, filters.page + 1))} disabled={filters.page === totalPages}>›</button>
            </div>
        );
    };

    return (
        <div className="product-page">
            {/* Header */}
            <div className="product-page__header">
                <h1 className="product-page__title">Danh sách sản phẩm</h1>
                <button className="btn btn--primary" onClick={() => openForm(null)}>
                    + Thêm sản phẩm
                </button>
            </div>

            {/* Toolbar */}
            <div className="product-page__toolbar">
                {/* Search */}
                <div className="search-box">
                    <span className="search-box__icon">🔍</span>
                    <input
                        className="search-box__input"
                        placeholder="Theo mã, tên sản phẩm, barcode..."
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                    <button className="search-box__btn" onClick={handleSearch}>Tìm</button>
                </div>

                {/* Category dropdown */}
                <div className="category-filter" ref={categoryDropdownRef}>
                    <button
                        className={`category-filter__btn${filters.categoryId ? ' category-filter__btn--active' : ''}`}
                        onClick={() => setCategoryDropdownOpen(prev => !prev)}
                    >
                        <span>📂</span>
                        <span className="category-filter__label">
                            {selectedCategory ? selectedCategory.name : 'Danh mục'}
                        </span>
                        <span className="category-filter__arrow">{categoryDropdownOpen ? '▲' : '▼'}</span>
                    </button>

                    {categoryDropdownOpen && (
                        <div className="category-dropdown">
                            <div
                                className={`category-dropdown__item${!filters.categoryId ? ' category-dropdown__item--active' : ''}`}
                                onClick={() => handleCategorySelect(null)}
                            >
                                Tất cả danh mục
                            </div>
                            {categories.map(cat => (
                                <div
                                    key={cat.id}
                                    className={`category-dropdown__item${filters.categoryId === cat.id ? ' category-dropdown__item--active' : ''}${cat.parentId ? ' category-dropdown__item--child' : ''}`}
                                    onClick={() => handleCategorySelect(cat.id)}
                                >
                                    {cat.parentId ? '└ ' : ''}{cat.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Status tabs */}
                <div className="status-tabs">
                    {STATUS_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            className={`status-tab${filters.status === opt.value ? ' status-tab--active' : ''}`}
                            onClick={() => handleStatusFilter(opt.value)}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* Clear filters */}
                {(filters.categoryId || filters.search) && (
                    <button
                        className="btn-clear-filters"
                        onClick={() => { updateFilters({ categoryId: null, search: '' }); setSearchInput(''); }}
                    >
                        ✕ Xóa bộ lọc
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="product-table-wrap">
                {error && <div className="error-msg">{error}</div>}
                <table className="product-table">
                    <thead>
                        <tr>
                            <th>
                                <input
                                    type="checkbox"
                                    checked={selectedIds.length === products.length && products.length > 0}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th>#</th>
                            <th>Mã SP</th>
                            <th>Barcode</th>
                            <th>Tên sản phẩm</th>
                            <th>Danh mục</th>
                            <th>Giá vốn</th>
                            <th>Giá bán</th>
                            <th>Tồn kho</th>
                            <th>Đơn vị</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={12} className="table-loading">Đang tải...</td></tr>
                        ) : products.length === 0 ? (
                            <tr><td colSpan={12} className="table-empty">Không có sản phẩm nào</td></tr>
                        ) : products.map((p, idx) => (
                            <tr key={p.id} className={selectedIds.includes(p.id) ? 'row--selected' : ''}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(p.id)}
                                        onChange={() => toggleSelect(p.id)}
                                    />
                                </td>
                                <td>{(filters.page - 1) * filters.limit + idx + 1}</td>
                                <td className="cell--code">{p.code}</td>
                                <td>{p.barcode || '—'}</td>
                                <td className="cell--name">{p.name}</td>
                                <td>{p.categoryName || '—'}</td>
                                <td className="cell--price">{formatPrice(p.costPrice)}</td>
                                <td className="cell--price">{formatPrice(p.salePrice)}</td>
                                <td>{p.stockQuantity ?? 0}</td>
                                <td>{p.baseUnit}</td>
                                <td>
                                    <span className={STATUS_BADGE[p.status]?.className || 'badge'}>
                                        {STATUS_BADGE[p.status]?.label || p.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-btns">
                                        <button className="action-btn action-btn--view" title="Chi tiết" onClick={() => openDetail(p.id)}>👁</button>
                                        <button className="action-btn action-btn--history" title="Lịch sử giá" onClick={() => openPriceHistory(p.id)}>📋</button>
                                        <button className="action-btn action-btn--edit" title="Chỉnh sửa" onClick={() => openForm(p.id)}>✏️</button>
                                        {p.status === 'Selling' ? (
                                            <button className="action-btn action-btn--stop" title="Ngừng bán" onClick={() => confirmAction(p.id, 'stop')}>🚫</button>
                                        ) : (
                                            <button className="action-btn action-btn--start" title="Bán lại" onClick={() => confirmAction(p.id, 'start')}>✅</button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="product-page__footer">
                <span className="total-label">Tổng: <strong>{total}</strong> sản phẩm</span>
                {renderPagination()}
            </div>

            {/* Confirm Modal */}
            {confirmModal.open && (
                <div className="modal-overlay" onClick={() => setConfirmModal({ open: false, productId: null, action: null })}>
                    <div className="confirm-modal" onClick={e => e.stopPropagation()}>
                        <p className="confirm-modal__text">
                            {confirmModal.action === 'stop'
                                ? 'Bạn có chắc muốn ngừng bán sản phẩm này?'
                                : 'Bạn có chắc muốn bán lại sản phẩm này?'}
                        </p>
                        <div className="confirm-modal__btns">
                            <button className="btn btn--ghost" onClick={() => setConfirmModal({ open: false, productId: null, action: null })}>Hủy</button>
                            <button className="btn btn--danger" onClick={executeAction}>Xác nhận</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals */}
            {detailModal.open && (
                <ProductDetailModal
                    productId={detailModal.productId}
                    onClose={closeDetail}
                    onEdit={() => { closeDetail(); openForm(detailModal.productId); }}
                />
            )}
            {formModal.open && (
                <ProductFormModal
                    productId={formModal.productId}
                    onClose={closeForm}
                    onSuccess={(msg) => { closeForm(); showToast('success', msg); }}
                    onError={(msg) => showToast('error', msg)}
                />
            )}
            {priceHistoryModal.open && (
                <PriceHistoryModal
                    productId={priceHistoryModal.productId}
                    onClose={closePriceHistory}
                />
            )}

            {toast && <Toast type={toast.type} message={toast.message} />}
        </div>
    );
};

export default ProductListPage;