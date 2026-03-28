import React from 'react';
import ProductBaseFields from './ProductBaseFields';

function formatMoney(value) {
    return `${Number(value || 0).toLocaleString('vi-VN')} đ`;
}

export default function ComboProductForm({
    form,
    handleChange,
    categories,
    isEdit,
    errors = {},
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
    onRemoveComboRow,
    onUpdateComboRowQty,
    onUpdateComboRowUnit
}) {
    return (
        <>
            <ProductBaseFields
                form={form}
                handleChange={handleChange}
                categories={categories}
                isCombo={true}
                isEdit={isEdit}
                errors={errors}
            />

            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-light fw-bold">
                    1. Thành phần của combo
                </div>

                <div className="card-body">
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

                    <div className="table-responsive mb-3">
                        <table className="table table-hover align-middle">
                            <thead className="pm-thead">
                                <tr>
                                    <th>Chọn</th>
                                    <th>Mã SP</th>
                                    <th>Tên SP</th>
                                    <th>Đơn vị cơ bản</th>
                                    <th>Giá đơn vị cơ bản</th>
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

                    {selectedChildProduct && (
                        <div className="border rounded p-3 bg-light mb-3">
                            <div className="fw-semibold mb-3">
                                Thêm vào combo: {selectedChildProduct.name} ({selectedChildProduct.code})
                            </div>

                            <span className="ms-2 badge bg-secondary">
                                Tồn kho: {Number(selectedChildProduct.stockQuantity || 0).toLocaleString('vi-VN')} {selectedChildProduct.baseUnit}
                            </span>

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
                                            className={`form-control text-center ${selectedChildUnit && childBaseQuantity > Number(selectedChildProduct.stockQuantity || 0)
                                                ? 'is-invalid'
                                                : ''
                                                }`} type="number"
                                            min={childQuantityStep === 1 ? 1 : 0.001}
                                            step={childQuantityStep}
                                            value={childQuantity}
                                            onChange={(e) => setChildQuantity(e.target.value)}
                                        />
                                        <button type="button" className="btn btn-outline-secondary" onClick={onIncreaseQty}>
                                            <i className="bi bi-plus-lg" />
                                        </button>
                                    </div>
                                    {selectedChildUnit && childBaseQuantity > Number(selectedChildProduct.stockQuantity || 0) && (
                                        <div className="text-danger small mt-1">
                                            <i className="bi bi-exclamation-triangle-fill me-1" />
                                            Vượt quá tồn kho! Còn {Number(selectedChildProduct.stockQuantity || 0).toLocaleString('vi-VN')} {selectedChildProduct.baseUnit}
                                        </div>
                                    )}
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
                                        disabled={
                                            !selectedChildUnit ||
                                            (childBaseQuantity > Number(selectedChildProduct.stockQuantity || 0))
                                        }
                                    >
                                        <i className="bi bi-plus-circle me-2" />
                                        Thêm vào combo
                                    </button>
                                </div>
                            </div>

                            <div className="row g-3 mt-1">
                                <div className="col-md-6">
                                    <div className="alert alert-warning mb-0">
                                        <strong>Số lượng quy đổi về đơn vị cơ bản:</strong><br />
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

                    <div className="table-responsive">
                        <table className="table table-bordered align-middle">
                            <thead className="pm-thead">
                                <tr>
                                    <th>Mã SP con</th>
                                    <th>Tên SP con</th>
                                    <th>Đơn vị chọn</th>
                                    <th>Số lượng theo đơn vị chọn</th>
                                    <th>Quy đổi về đơn vị cơ bản</th>
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
                                            <td>{Number(row.quantityDisplay).toLocaleString('vi-VN')}</td><td style={{ minWidth: 160 }}>
                                                {row.units && row.units.length > 1 ? (
                                                    <select
                                                        className="form-select form-select-sm"
                                                        value={row.selectedUnitId}
                                                        onChange={(e) => onUpdateComboRowUnit(row.key, e.target.value)}
                                                    >
                                                        {row.units.map((u) => (
                                                            <option key={u.id} value={u.id}>
                                                                {u.unitName} | x{Number(u.conversionFactor).toLocaleString('vi-VN')} | {Number(u.salePrice).toLocaleString('vi-VN')} đ
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    row.unitName
                                                )}
                                            </td>
                                            <td style={{ minWidth: 110 }}>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm text-center"
                                                    min={row.unitType === 'WEIGHT' ? 0.001 : 1}
                                                    step={row.unitType === 'WEIGHT' ? 0.001 : 1}
                                                    value={row.quantityDisplay}
                                                    onChange={(e) => onUpdateComboRowQty(row.key, e.target.value)}
                                                />
                                            </td>
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
                    {errors.combo && <div className="text-danger small mt-2">{errors.combo}</div>}
                </div>
            </div>

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

                    <div className="row g-3 align-items-end">
                        <div className="col-md-6">
                            <label className="form-label fw-semibold">Giá bán combo *</label>
                            <input
                                className={`form-control ${errors.salePrice ? 'is-invalid' : ''}`}
                                type="number"
                                min="0"
                                value={form.salePrice}
                                onChange={(e) => {
                                    if (form.pricingMode === 'auto') {
                                        handleChange('pricingMode', 'manual');
                                    }
                                    handleChange('salePrice', e.target.value);
                                }}
                            />
                            {errors.salePrice && (
                                <div className="invalid-feedback">{errors.salePrice}</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-light fw-bold">
                    3. Tồn kho combo
                </div>
                <div className="card-body">
                    {isEdit ? (
                        <>
                            <div className="alert alert-info mb-3">
                                Tồn kho hiện tại: <strong>{Number(form.stockQuantity || 0).toLocaleString('vi-VN')}</strong>
                            </div>

                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label className="form-label fw-semibold">Cập nhật tồn kho</label>
                                    <input
                                        className="form-control"
                                        type="number"
                                        min={0}
                                        step={1}
                                        value={form.correctedStock}
                                        onChange={(e) => handleChange('correctedStock', e.target.value)}
                                        placeholder="Nhập số lượng thực tế"
                                    />
                                    <div className="form-text text-muted">
                                        Tồn kho thực tế. Tồn kho SP con sẽ tự điều chỉnh theo chênh lệch.
                                    </div>
                                </div>

                                {/* Preview tác động SP con khi correctedStock thay đổi */}
                                {String(form.correctedStock) !== '' &&
                                    Number(form.correctedStock) !== Number(form.stockQuantity) &&
                                    comboRows.length > 0 && (() => {
                                        const diff = Number(form.correctedStock) - Number(form.stockQuantity);
                                        return (
                                            <div className="col-12 mt-2">
                                                <div className={`alert ${diff > 0 ? 'alert-warning' : 'alert-success'} mb-2`}>
                                                    {diff > 0
                                                        ? `Tồn kho combo tăng ${diff}, sẽ trừ tồn kho SP con`
                                                        : `Tồn kho combo giảm ${Math.abs(diff)}, sẽ hoàn lại tồn kho SP con`
                                                    }
                                                </div>
                                                <div className="table-responsive">
                                                    <table className="table table-sm table-bordered align-middle mb-0">
                                                        <thead className="table-light">
                                                            <tr>
                                                                <th>Sản phẩm con</th>
                                                                <th className="text-center">Qty / combo</th>
                                                                <th className="text-center">{diff > 0 ? 'Sẽ trừ' : 'Sẽ hoàn lại'}</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {comboRows.map(row => {
                                                                const impact = Number(row.quantityBase) * Math.abs(diff);
                                                                return (
                                                                    <tr key={row.key}>
                                                                        <td>
                                                                            {row.productName}
                                                                            <span className="text-muted small ms-1">({row.productCode})</span>
                                                                        </td>
                                                                        <td className="text-center">
                                                                            {Number(row.quantityBase).toLocaleString('vi-VN')} {row.baseUnit}
                                                                        </td>
                                                                        <td className={`text-center fw-semibold ${diff > 0 ? 'text-danger' : 'text-success'}`}>
                                                                            {diff > 0 ? '-' : '+'}{impact.toLocaleString('vi-VN')} {row.baseUnit}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        );
                                    })()}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="alert alert-info mb-3">
                                Nhập số lượng combo. Tồn kho SP con sẽ bị trừ tương ứng và tồn kho combo sẽ được cộng.
                            </div>
                            <div className="row g-3 align-items-end">
                                <div className="col-md-4">
                                    <label className="form-label fw-semibold">Số lượng combo</label>
                                    <input
                                        className="form-control"
                                        type="number"
                                        min={0}
                                        step={1}
                                        value={form.initialStock}
                                        onChange={(e) => handleChange('initialStock', e.target.value)}
                                        style={{ maxWidth: 160 }}
                                    />
                                </div>
                                {Number(form.initialStock) > 0 && comboRows.length > 0 && (
                                    <div className="col-12 mt-3">
                                        <div className="table-responsive">
                                            <table className="table table-sm table-bordered align-middle mb-0">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>Sản phẩm con</th>
                                                        <th className="text-center">Qty / combo</th>
                                                        <th className="text-center">Tổng cần trừ ({Number(form.initialStock).toLocaleString('vi-VN')})</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {comboRows.map(row => (
                                                        <tr key={row.key}>
                                                            <td>{row.productName} <span className="text-muted small">({row.productCode})</span></td>
                                                            <td className="text-center">{Number(row.quantityBase).toLocaleString('vi-VN')} {row.baseUnit}</td>
                                                            <td className="text-center fw-semibold text-danger">
                                                                {(Number(row.quantityBase) * Number(form.initialStock)).toLocaleString('vi-VN')} {row.baseUnit}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
