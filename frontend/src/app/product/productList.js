import React, { useState } from 'react';
import './pm-theme.css';
import { useNotification } from '../../components/global/Notification/NotificationContext';
import ProductFormModal from './ProductModal/ProductFormModal';
import ProductDetailModal from './ProductModal/ProductDetailModal';
import ProductUnitModal from './ProductModal/ProductUnitModal';
import ProductStatusModal from './ProductModal/ProductStatusModal';
import ProductPriceHistoryModal from './ProductModal/ProductPriceHistoryModal';
import ProductComboItemModal from './ProductModal/ProductComboItemModal';

import useProductCategories from '../../hooks/product/useProductCategories';
import useProductList from '../../hooks/product/useProductList';
import useProductModals from '../../hooks/product/useProductModals';
import useProductDetail from '../../hooks/product/useProductDetail';
import useProductPriceHistory from '../../hooks/product/useProductPriceHistory';
import useProductActions from '../../hooks/product/useProductActions';

function formatMoney(value) {
    return `${Number(value || 0).toLocaleString('vi-VN')} đ`;
}

function formatQuantity(value, allowDecimalQuantity) {
    const num = Number(value || 0);
    if (allowDecimalQuantity) {
        return num.toLocaleString('vi-VN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 3
        });
    }
    return Math.round(num).toLocaleString('vi-VN');
}

function ProductList() {
    const { showNotification } = useNotification();
    const [confirmState, setConfirmState] = useState({ open: false, message: '', onOk: null });
    const onConfirm = ({ message, onOk }) => setConfirmState({ open: true, message, onOk });
    const handleConfirmOk = () => { confirmState.onOk?.(); setConfirmState({ open: false, message: '', onOk: null }); };
    const handleConfirmCancel = () => setConfirmState({ open: false, message: '', onOk: null });

    const { categories } = useProductCategories();

    const {
        products,
        loading,
        bulkLoading,
        searchInput,
        setSearchInput,
        filters,
        setFilters,
        pagination,
        selectedIds,
        allSelected,
        loadProducts,
        handleApplySearch,
        handlePageChange,
        handleCheckAll,
        handleCheckOne,
        handleBulkSoftDelete
    } = useProductList({ showNotification, onConfirm });

    const {
        productFormState,
        setProductFormState,
        openCreateProductModal,
        closeProductFormModal,

        unitModalState,
        openUnitCreateModal,
        openUnitEditModal,
        closeUnitModal,

        statusModalState,
        openStatusModal,
        closeStatusModal,

        comboModalState,
        openComboModal,
        closeComboModal
    } = useProductModals();

    const {
        detailState,
        openDetailModal,
        refreshDetailModal,
        closeDetailModal
    } = useProductDetail({ showNotification });

    const {
        priceHistoryState,
        openPriceHistoryModal,
        closePriceHistoryModal
    } = useProductPriceHistory({ showNotification });

    const {
        submitLoading,
        openEditProductModal,
        handleSaveProduct,
        handleChangeProductStatus,
        handleSaveUnit,
        handleDeleteUnit,
        handleAddComboItem,
        handleRemoveComboItem
    } = useProductActions({
        productFormState,
        setProductFormState,
        closeProductFormModal,

        unitModalState,
        closeUnitModal,

        closeStatusModal,

        comboModalState,
        closeComboModal,

        detailState,
        loadProducts,
        openDetailModal,
        refreshDetailModal,

        showNotification,
        onConfirm
    });

    return (
        <div className="pm-page">
            <div className="d-flex flex-wrap justify-content-end align-items-start gap-3 mb-4">
                <div className="d-flex flex-wrap gap-2">
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => openCreateProductModal('regular')}
                    >
                        <i className="bi bi-plus-circle me-2" />
                        Tạo sản phẩm mới
                    </button>
                </div>
            </div>

            <div className="pm-card card">
                <div className="card-body">
                    <div className="row g-3 align-items-end mb-3">
                        <div className="col-12 col-lg-5">
                            <label className="form-label fw-semibold">Tìm kiếm</label>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="bi bi-search" />
                                </span>
                                <input
                                    className="form-control"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleApplySearch();
                                    }}
                                    placeholder="Tên sản phẩm, mã SP, barcode..."
                                />
                            </div>
                        </div>

                        <div className="col-12 col-md-4 col-lg-2">
                            <label className="form-label fw-semibold">Trạng thái</label>
                            <select
                                className="form-select"
                                value={filters.status}
                                onChange={(e) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        page: 1,
                                        status: e.target.value
                                    }))
                                }
                            >
                                <option value="All">Tất cả</option>
                                <option value="Selling">Đang bán</option>
                                <option value="StopSelling">Ngừng bán</option>
                            </select>
                        </div>

                        <div className="col-12 col-md-4 col-lg-2">
                            <label className="form-label fw-semibold">Danh mục</label>
                            <select
                                className="form-select"
                                value={filters.categoryId}
                                onChange={(e) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        page: 1,
                                        categoryId: e.target.value
                                    }))
                                }
                            >
                                <option value="">Tất cả</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-6 col-md-2 col-lg-1">
                            <label className="form-label fw-semibold">Hiển thị</label>
                            <select
                                className="form-select"
                                value={filters.limit}
                                onChange={(e) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        page: 1,
                                        limit: Number(e.target.value)
                                    }))
                                }
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                            </select>
                        </div>

                        <div className="col-6 col-md-2">
                            <div className="d-grid">
                                <button type="button" className="btn btn-primary" onClick={handleApplySearch}>
                                    <i className="bi bi-funnel me-2" />
                                    Lọc
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="pm-action-bar">
                        <div className="fw-semibold">
                            <i className="bi bi-check2-square me-2" />
                            Đã chọn: {selectedIds.length} sản phẩm
                        </div>

                        <div className="d-flex flex-wrap gap-2">

                            <button
                                type="button"
                                className="btn btn-danger"
                                disabled={!selectedIds.length || bulkLoading}
                                onClick={handleBulkSoftDelete}
                            >
                                <i className="bi bi-trash me-2" />
                                Ngừng bán
                            </button>

                            <button type="button" className="btn btn-outline-secondary" onClick={loadProducts}>
                                <i className="bi bi-arrow-clockwise me-2" />
                                Tải lại
                            </button>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover align-middle table-bordered">
                            <thead className="pm-thead">
                                <tr>
                                    <th style={{ width: 50 }}>
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            onChange={handleCheckAll}
                                        />
                                    </th>
                                    <th>Mã SP</th>
                                    <th>Tên sản phẩm</th>
                                    <th>Danh mục</th>
                                    <th>Loại</th>
                                    <th>Kiểu bán</th>
                                    <th>Đơn vị cơ bản</th>
                                    <th>Barcode</th>
                                    <th>Giá bán</th>
                                    <th>Giá nhập</th>
                                    <th>Tồn kho</th>
                                    <th>Trạng thái</th>
                                    <th style={{ minWidth: 220 }}>Thao tác</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="13" className="text-center py-4">
                                            Đang tải dữ liệu...
                                        </td>
                                    </tr>
                                ) : products.length === 0 ? (
                                    <tr>
                                        <td colSpan="13" className="text-center py-4">
                                            Không có dữ liệu sản phẩm.
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((product) => (
                                        <tr key={product.id}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(product.id)}
                                                    onChange={() => handleCheckOne(product.id)}
                                                />
                                            </td>
                                            <td>{product.code}</td>
                                            <td className="fw-semibold">{product.name}</td>
                                            <td>{product.categoryName || 'Chưa có'}</td>
                                            <td>
                                                {product.isCombo ? (
                                                    <span className="badge bg-success">
                                                        <i className="bi bi-boxes me-1" />
                                                        Combo
                                                    </span>
                                                ) : (
                                                    <span className="badge bg-primary">
                                                        <i className="bi bi-box-seam me-1" />
                                                        Thường
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                {product.isCombo ? (
                                                    <span className="badge bg-secondary">Combo</span>
                                                ) : product.allowDecimalQuantity ? (
                                                    <span className="badge bg-info text-dark">
                                                        <i className="bi bi-scale me-1" />
                                                        Cân
                                                    </span>
                                                ) : (
                                                    <span className="badge bg-warning text-dark">
                                                        <i className="bi bi-tag me-1" />
                                                        Số lượng
                                                    </span>
                                                )}
                                            </td>
                                            <td>{product.baseUnit}</td>
                                            <td>{product.barcode || '—'}</td>
                                            <td>{formatMoney(product.salePrice)}</td>
                                            <td>{formatMoney(product.costPrice)}</td>
                                            <td>{formatQuantity(product.stockQuantity, product.allowDecimalQuantity)}</td>
                                            <td>
                                                {product.status === 'Selling' ? (
                                                    <span className="badge bg-success">Đang bán</span>
                                                ) : (
                                                    <span className="badge bg-danger">Ngừng bán</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="dropdown">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-primary dropdown-toggle"
                                                        data-bs-toggle="dropdown"
                                                        aria-expanded="false"
                                                    >
                                                        <i className="bi bi-gear me-1" />
                                                        Thao tác
                                                    </button>

                                                    <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                                                        <li>
                                                            <button
                                                                type="button"
                                                                className="dropdown-item"
                                                                onClick={() => openDetailModal(product.id)}
                                                            >
                                                                <i className="bi bi-eye me-2" />
                                                                Xem chi tiết
                                                            </button>
                                                        </li>

                                                        <li>
                                                            <button
                                                                type="button"
                                                                className="dropdown-item"
                                                                onClick={() => openEditProductModal(product.id)}
                                                            >
                                                                <i className="bi bi-pencil-square me-2" />
                                                                Sửa
                                                            </button>
                                                        </li>

                                                        <li>
                                                            <button
                                                                type="button"
                                                                className="dropdown-item"
                                                                onClick={() => openPriceHistoryModal(product)}
                                                            >
                                                                <i className="bi bi-clock-history me-2" />
                                                                Lịch sử giá
                                                            </button>
                                                        </li>

                                                        <li>
                                                            <button
                                                                type="button"
                                                                className="dropdown-item"
                                                                onClick={() => openStatusModal(product)}
                                                            >
                                                                <i className="bi bi-power me-2" />
                                                                Trạng thái
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mt-3">
                        <div className="text-muted">
                            Tổng: <strong>{pagination.total}</strong> sản phẩm
                        </div>

                        <div className="d-flex align-items-center gap-2">
                            <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm"
                                disabled={filters.page <= 1}
                                onClick={() => handlePageChange(filters.page - 1)}
                            >
                                Trước
                            </button>

                            <span className="fw-semibold">
                                Trang {filters.page} / {pagination.totalPages}
                            </span>

                            <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm"
                                disabled={filters.page >= pagination.totalPages}
                                onClick={() => handlePageChange(filters.page + 1)}
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <ProductFormModal
                open={productFormState.open}
                mode={productFormState.mode}
                productType={productFormState.productType}
                initialData={productFormState.product}
                categories={categories}
                submitting={submitLoading}
                onClose={closeProductFormModal}
                onSubmit={handleSaveProduct}
            />

            <ProductDetailModal
                open={detailState.open}
                loading={detailState.loading}
                product={detailState.product}
                comboItems={detailState.comboItems}
                submitting={submitLoading}
                onClose={closeDetailModal}
                onEditProduct={(product) => openEditProductModal(product.id)}
                onOpenStatus={(product) => openStatusModal(product)}
                onOpenPriceHistory={(product) => openPriceHistoryModal(product)}
                onOpenCreateUnit={() => openUnitCreateModal(detailState.product)}
                onOpenEditUnit={(unit) => openUnitEditModal(detailState.product, unit)}
                onDeleteUnit={handleDeleteUnit}
                onOpenAddComboItem={(product) => openComboModal(product)}
                onRemoveComboItem={handleRemoveComboItem}
                onRefresh={() => refreshDetailModal(detailState.product?.id)}
            />

            <ProductUnitModal
                open={unitModalState.open}
                mode={unitModalState.mode}
                product={unitModalState.product}
                unit={unitModalState.unit}
                submitting={submitLoading}
                onClose={closeUnitModal}
                onSubmit={handleSaveUnit}
            />

            <ProductStatusModal
                open={statusModalState.open}
                product={statusModalState.product}
                submitting={submitLoading}
                onClose={closeStatusModal}
                onConfirm={handleChangeProductStatus}
            />

            <ProductPriceHistoryModal
                open={priceHistoryState.open}
                loading={priceHistoryState.loading}
                product={priceHistoryState.product}
                histories={priceHistoryState.histories}
                onClose={closePriceHistoryModal}
            />

            <ProductComboItemModal
                open={comboModalState.open}
                parentProduct={comboModalState.product}
                existingComboItems={detailState.comboItems}
                submitting={submitLoading}
                onClose={closeComboModal}
                onSubmit={handleAddComboItem}
            />

            {/* ── Confirm Dialog ── */}
            {confirmState.open && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,21,41,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
                }}>
                    <div style={{
                        background: '#fff', borderRadius: 12, padding: '28px 32px',
                        minWidth: 340, maxWidth: 480, boxShadow: '0 8px 40px rgba(0,21,41,0.25)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                            <i className="bi bi-exclamation-triangle-fill" style={{ color: '#faad14', fontSize: '1.5rem' }} />
                            <strong style={{ fontSize: '1rem' }}>Xác nhận</strong>
                        </div>
                        <p style={{ margin: '0 0 24px', color: '#334155' }}>{confirmState.message}</p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                            <button className="btn btn-light" onClick={handleConfirmCancel}>Hủy</button>
                            <button className="btn btn-primary" onClick={handleConfirmOk}>Xác nhận</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductList;