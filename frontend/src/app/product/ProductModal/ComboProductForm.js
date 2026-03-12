import React from 'react';
import ProductBaseFields from './ProductBaseFields';

function formatMoney(value) {
    return `${Number(value || 0).toLocaleString('vi-VN')} đ`;
}

/**
 * Form dành riêng cho sản phẩm combo.
 * Props:
 *   form, handleChange, categories, isEdit
 *   comboRows, comboLoading, comboRetailTotal, comboPriceDifference
 *   searchKeyword, setSearchKeyword, searchingProducts, searchResults
 *   selectedChildProduct, childUnits, loadingChildUnits, selectedChildUnitId, setSelectedChildUnitId
 *   childQuantity, setChildQuantity, childQuantityStep, childLineTotal, childBaseQuantity
 *   selectedChildUnit
 *   onSearchChildProducts, onSelectChildProduct, onIncreaseQty, onDecreaseQty
 *   onAddComboRow, onRemoveComboRow
 */
export default function ComboProductForm({
    form,
    handleChange,
    categories,
    isEdit,
    comboRows,
    comboLoading,
    comboRetailTotal,
    comboPriceDifference,
    searchKeyword,
    setSearchKeyword,
    searchingProducts,
    searchResults,
    selectedChildProduct,
    childUnits,
    loadingChildUnits,
    selectedChildUnitId,
    setSelectedChildUnitId,
    childQuantity,
    setChildQuantity,
    childQuantityStep,
    childLineTotal,
    childBaseQuantity,
    selectedChildUnit,
    onSearchChildProducts,
    onSelectChildProduct,
    onIncreaseQty,
    onDecreaseQty,
    onAddComboRow,
    onRemoveComboRow
}) {
    return (
        <>
            {/* Fields cơ bản dùng chung */}
            <ProductBaseFields
                form={form}
                handleChange={handleChange}
                categories={categories}
                isCombo={true}
                isEdit={isEdit}
            />

            {/* ── 1. Thành phần combo ── */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-light fw-bold">
                    1. Thành phần của combo
                </div>

                <div className="card-body">
                    {/* Search sản phẩm con */}
                    <div className="row g-3 align-items-end mb-3">
                        <div className="col-md-7">
                            <label className="form-label fw-semibold">Tìm sản phẩm con</label>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <i className="bi bi-search" />
                                </span>
                                <input
                                    className="form-control"
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            onSearchChildProducts(searchKeyword);
                                        }
                                    }}
                                    placeholder="Tên sản phẩm, mã sản phẩm, barcode..."
                                />
                            </div>
                        </div>

                        <div className="col-md-2">
                            <button
                                type="button"
                                className="btn btn-primary w-100"
                                onClick={() => onSearchChildProducts(searchKeyword)}
                            >
                                Tìm kiếm
                            </button>
                        </div>

                        <div className="col-md-3">
                            <div className="alert alert-primary mb-0 py-2">
                                <strong>Tổng giá lẻ hiện tại:</strong><br />
                                {formatMoney(comboRetailTotal)}
                            </div>
                        </div>
                    </div>

                    {/* Danh sách kết quả tìm */}
                    <div className="table-responsive mb-3">
                        <table className="table table-hover align-middle">
                            <thead className="pm-thead">
                                <tr>
                                    <th>Chọn</th>
                                    <th>Mã SP</th>
                                    <th>Tên SP</th>
                                    <th>Base unit</th>
                                    <th>Giá base</th>
                                    <th>Tồn kho</th>
                                </tr>
                            </thead>
                            <tbody>
                                {searchingProducts ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4">Đang tìm sản phẩm...</td>
                                    </tr>
                                ) : searchResults.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-4 text-muted">Không có sản phẩm phù hợp.</td>
                                    </tr>
                                ) : (
                                    searchResults.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                <button
                                                    type="button"
                                                    className={`btn btn-sm ${selectedChildProduct?.id === item.id ? 'btn-primary' : 'btn-outline-primary'}`}
                                                    onClick={() => onSelectChildProduct(item)}
                                                >
                                                    Chọn
                                                </button>
                                            </td>
                                            <td>{item.code}</td>
                                            <td className="fw-semibold">{item.name}</td>
                                            <td>{item.baseUnit}</td>
                                            <td>{formatMoney(item.salePrice)}</td>
                                            <td>{Number(item.stockQuantity || 0).toLocaleString('vi-VN')}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Chi tiết sản phẩm con được chọn */}
                    {selectedChildProduct && (
                        <div className="border rounded p-3 bg-light mb-3">
                            <div className="fw-semibold mb-3">
                                Thêm vào combo: {selectedChildProduct.name} ({selectedChildProduct.code})
                            </div>

                            <div className="row g-3 align-items-end">
                                <div className="col-md-4">
                                    <label className="form-label fw-semibold">Đơn vị tính</label>
                                    <select
                                        className="form-select"
                                        value={selectedChildUnitId}
                                        onChange={(e) => setSelectedChildUnitId(e.target.value)}
                                        disabled={loadingChildUnits}
                                    >
                                        <option value="">Chọn đơn vị tính</option>
                                        {childUnits.map((unit) => (
                                            <option key={unit.id} value={unit.id}>
                                                {unit.unitName} | Quy đổi: {Number(unit.conversionFactor).toLocaleString('vi-VN')} | Giá: {Number(unit.salePrice).toLocaleString('vi-VN')} đ
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label fw-semibold">Số lượng</label>
                                    <div className="input-group">
                                        <button type="button" className="btn btn-outline-secondary" onClick={onDecreaseQty}>
                                            <i className="bi bi-dash-lg" />
                                        </button>
                                        <input
                                            className="form-control text-center"
                                            type="number"
                                            min={childQuantityStep === 1 ? 1 : 0.001}
                                            step={childQuantityStep}
                                            value={childQuantity}
                                            onChange={(e) => setChildQuantity(e.target.value)}
                                        />
                                        <button type="button" className="btn btn-outline-secondary" onClick={onIncreaseQty}>
                                            <i className="bi bi-plus-lg" />
                                        </button>
                                    </div>
                                </div>

                                <div className="col-md-2">
                                    <label className="form-label fw-semibold">Thành tiền</label>
                                    <input
                                        className="form-control fw-semibold"
                                        disabled
                                        value={selectedChildUnit ? formatMoney(childLineTotal) : '0 đ'}
                                    />
                                </div>

                                <div className="col-md-2">
                                    <button
                                        type="button"
                                        className="btn btn-success w-100"
                                        onClick={onAddComboRow}
                                    >
                                        <i className="bi bi-plus-circle me-2" />
                                        Thêm vào combo
                                    </button>
                                </div>
                            </div>

                            <div className="row g-3 mt-1">
                                <div className="col-md-6">
                                    <div className="alert alert-warning mb-0">
                                        <strong>Số lượng quy đổi về base unit:</strong><br />
                                        {selectedChildUnit
                                            ? `${childBaseQuantity.toLocaleString('vi-VN')} ${selectedChildProduct.baseUnit}`
                                            : '—'}
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="alert alert-secondary mb-0">
                                        <strong>Đơn vị đang chọn:</strong><br />
                                        {selectedChildUnit
                                            ? `${selectedChildUnit.unitName} (${selectedChildUnit.unitType})`
                                            : 'Chưa chọn'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bảng thành phần đã chọn */}
                    <div className="table-responsive">
                        <table className="table table-bordered align-middle">
                            <thead className="pm-thead">
                                <tr>
                                    <th>Mã SP con</th>
                                    <th>Tên SP con</th>
                                    <th>Đơn vị chọn</th>
                                    <th>Số lượng theo đơn vị chọn</th>
                                    <th>Quy đổi base unit</th>
                                    <th>Giá bán đơn vị</th>
                                    <th>Thành tiền</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comboLoading ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-4">Đang tải thành phần combo...</td>
                                    </tr>
                                ) : comboRows.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-4 text-muted">Chưa có sản phẩm con nào trong combo.</td>
                                    </tr>
                                ) : (
                                    comboRows.map((row) => (
                                        <tr key={row.key}>
                                            <td>{row.productCode}</td>
                                            <td className="fw-semibold">{row.productName}</td>
                                            <td>{row.unitName}</td>
                                            <td>{Number(row.quantityDisplay).toLocaleString('vi-VN')}</td>
                                            <td>{Number(row.quantityBase).toLocaleString('vi-VN')} {row.baseUnit}</td>
                                            <td>{formatMoney(row.unitSalePrice)}</td>
                                            <td className="fw-semibold">{formatMoney(row.lineTotal)}</td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => onRemoveComboRow(row.key)}
                                                >
                                                    <i className="bi bi-trash me-1" />
                                                    Xóa
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── 2. Giá bán combo ── */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-light fw-bold">
                    2. Giá bán combo
                </div>

                <div className="card-body">
                    <div className="row g-3 mb-3">
                        <div className="col-md-4">
                            <div className="alert alert-primary mb-0">
                                <strong>Tổng giá lẻ của các sản phẩm con:</strong><br />
                                {formatMoney(comboRetailTotal)}
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="alert alert-success mb-0">
                                <strong>Giá combo hiện tại:</strong><br />
                                {formatMoney(form.salePrice)}
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className={`alert mb-0 ${comboPriceDifference >= 0 ? 'alert-warning' : 'alert-secondary'}`}>
                                <strong>Chênh lệch so với bán lẻ:</strong><br />
                                {comboPriceDifference >= 0
                                    ? `Giảm ${formatMoney(comboPriceDifference)}`
                                    : `Tăng ${formatMoney(Math.abs(comboPriceDifference))}`}
                            </div>
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-semibold">Cách xác định giá combo</label>
                        <div className="d-flex flex-wrap gap-2">
                            <button
                                type="button"
                                className={`btn ${form.pricingMode === 'auto' ? 'btn-success' : 'btn-outline-success'}`}
                                onClick={() => handleChange('pricingMode', 'auto')}
                            >
                                <i className="bi bi-magic me-2" />
                                Tự lấy theo tổng giá lẻ
                            </button>

                            <button
                                type="button"
                                className={`btn ${form.pricingMode === 'manual' ? 'btn-warning' : 'btn-outline-warning'}`}
                                onClick={() => handleChange('pricingMode', 'manual')}
                            >
                                <i className="bi bi-pencil-square me-2" />
                                Nhập giá combo thủ công
                            </button>
                        </div>
                    </div>

                    <div className="row g-3 align-items-end">
                        <div className="col-md-6">
                            <label className="form-label fw-semibold">Giá bán combo *</label>
                            <input
                                className="form-control"
                                type="number"
                                min="0"
                                disabled={form.pricingMode === 'auto'}
                                value={form.salePrice}
                                onChange={(e) => handleChange('salePrice', e.target.value)}
                            />
                        </div>

                        <div className="col-md-6">
                            <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={() =>
                                    handleChange('salePrice', comboRetailTotal)
                                }
                            >
                                <i className="bi bi-arrow-repeat me-2" />
                                Áp dụng tổng giá lẻ làm giá combo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
