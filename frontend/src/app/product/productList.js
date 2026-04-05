import React, { useState } from 'react';
import './pm-theme.css';
import { useNotification } from '../../components/global/Notification/NotificationContext';
import ProductFormModal from './ProductModal/ProductFormModal';
import ProductDetailModal from './ProductModal/ProductDetailModal';
import ProductUnitModal from './ProductModal/ProductUnitModal';
import ProductStatusModal from './ProductModal/ProductStatusModal';
import ProductPriceHistoryModal from './ProductModal/ProductPriceHistoryModal';
import ProductComboItemModal from './ProductModal/ProductComboItemModal';
import BarcodePrintModal from './ProductModal/BarcodePrintModal';
import ConfirmModal from '../../components/common/ConfirmModal';
import { useAuth } from '../../hooks/useAuth';
import { formatMoney, formatQuantity } from '../../utils/formatters';

import useProductCategories from '../../hooks/product/useProductCategories';
import useProductList from '../../hooks/product/useProductList';
import useProductModals from '../../hooks/product/useProductModals';
import useProductDetail from '../../hooks/product/useProductDetail';
import useProductPriceHistory from '../../hooks/product/useProductPriceHistory';
import useProductActions from '../../hooks/product/useProductActions';

function getPrintableUnit(product) {
    if (!product?.units?.length) return null;
    return product.units.find(u => u.isBaseUnit) || product.units[0];
}

function ProductList() {
    const { showNotification } = useNotification();
    const { hasFeature } = useAuth();
    const [confirmState, setConfirmState] = useState({ open: false, message: '', onOk: null });
    const onConfirm = ({ message, onOk }) => setConfirmState({ open: true, message, onOk });
    const handleConfirmOk = () => { confirmState.onOk?.(); setConfirmState({ open: false, message: '', onOk: null }); };
    const handleConfirmCancel = () => setConfirmState({ open: false, message: '', onOk: null });

    const canCreateProduct = hasFeature('CREATE_PRODUCT');
    const canEditProduct = hasFeature('UPDATE_PRODUCT');
    const canDeleteProduct = hasFeature('DELETE_PRODUCT');

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
        closeComboModal,

        printModalState,
        openPrintModal,
        closePrintModal
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
            {/* <div className="d-flex flex-wrap justify-content-end align-items-start gap-3 mb-4">
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
            </div> */}

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

                        {canCreateProduct && (
                            <div className="col-6 col-md-2">
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
                        )}

                    </div>

                    {(canEditProduct || canDeleteProduct) && (
                        <div className="pm-action-bar">
                            <div className="fw-semibold">
                                <i className="bi bi-check2-square me-2" />
                                Đã chọn: {selectedIds.length} sản phẩm
                            </div>


                            <div className="d-flex flex-wrap gap-2">
                                {canDeleteProduct && (
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        disabled={!selectedIds.length || bulkLoading}
                                        onClick={handleBulkSoftDelete}
                                    >
                                        <i className="bi bi-trash me-2" />
                                        Ngừng bán
                                    </button>
                                )}


                                <button type="button" className="btn btn-outline-secondary" onClick={loadProducts}>
                                    <i className="bi bi-arrow-clockwise me-2" />
                                    Tải lại
                                </button>
                            </div>

                        </div>
                    )}


                    <div className="table-responsive">
                        <table className="table table-hover align-middle table-bordered">
                            <thead className="pm-thead">
                                <tr>
                                    {(canEditProduct || canDeleteProduct) && (
                                        <th style={{ width: 50 }}>
                                            <input
                                                type="checkbox"
                                                checked={allSelected}
                                                onChange={handleCheckAll}
                                            />
                                        </th>
                                    )}

                                    <th>Mã SP</th>
                                    <th>Tên sản phẩm</th>
                                    <th>Danh mục</th>
                                    <th>Loại</th>
                                    <th>Kiểu bán</th>
                                    <th>Đơn vị cơ bản</th>
                                    <th>Barcode</th>
                                    <th>Giá nhập</th>
                                    <th>Giá bán</th>
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
                                            {(canEditProduct || canDeleteProduct) && (
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(product.id)}
                                                        onChange={() => handleCheckOne(product.id)}
                                                    />
                                                </td>
                                            )}

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
                                            <td>{formatMoney(product.costPrice)}</td>
                                            <td>{formatMoney(product.salePrice)}</td>
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

                                                        {canEditProduct && (
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
                                                        )}


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

                                                        {canEditProduct && (
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
                                                        )}



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
                onOpenPrintUnit={(unit) => openPrintModal(detailState.product, unit)}
                onOpenPrintCombo={() => {
                    const printableUnit = getPrintableUnit(detailState.product);
                    if (!printableUnit) return;
                    openPrintModal(detailState.product, printableUnit);
                }}
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

            <BarcodePrintModal
                open={printModalState.open}
                product={printModalState.product}
                unit={printModalState.unit}
                onClose={closePrintModal}
            />

            {/* ── Confirm Dialog ── */}
            {confirmState.open && (
                <ConfirmModal
                    message={confirmState.message}
                    onConfirm={handleConfirmOk}
                    onCancel={handleConfirmCancel}
                />
            )}
        </div>
    );
} export default ProductList;