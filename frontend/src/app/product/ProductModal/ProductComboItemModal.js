import React, { useEffect, useMemo, useState } from 'react';
import {
    getProduct,
    getProducts,
    getProductUnits
} from '../../../services/Product/product.service';
import ModalShell from './ModalShell';

function formatMoney(value) {
    return `${Number(value || 0).toLocaleString('vi-VN')} đ`;
}

function roundNumber(value, digits = 3) {
    const factor = 10 ** digits;
    return Math.round(Number(value || 0) * factor) / factor;
}

function ProductComboItemModal({
    open,
    parentProduct,
    existingComboItems = [],
    submitting,
    onClose,
    onSubmit
}) {
    const [keyword, setKeyword] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState(null);

    const [unitsLoading, setUnitsLoading] = useState(false);
    const [unitOptions, setUnitOptions] = useState([]);
    const [selectedUnitId, setSelectedUnitId] = useState('');

    const [quantity, setQuantity] = useState(1);
    const [existingEstimatedTotal, setExistingEstimatedTotal] = useState(0);
    const [existingTotalLoading, setExistingTotalLoading] = useState(false);

    const [error, setError] = useState('');

    const searchProducts = async (searchText) => {
        try {
            setLoading(true);

            const response = await getProducts({
                page: 1,
                limit: 20,
                search: searchText || '',
                status: 'Selling'
            });

            const list = response.data?.data || [];
            const filtered = list.filter(
                (item) => String(item.id) !== String(parentProduct?.id)
            );

            setResults(filtered);
        } catch (error) {
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const loadExistingEstimatedTotal = async () => {
        if (!existingComboItems.length) {
            setExistingEstimatedTotal(0);
            return;
        }

        try {
            setExistingTotalLoading(true);

            const details = await Promise.all(
                existingComboItems.map(async (item) => {
                    const response = await getProduct(item.childProductId);
                    const childProduct = response.data?.data || null;
                    const baseSalePrice = Number(childProduct?.salePrice || 0);
                    const baseQuantity = Number(item.quantity || 0);

                    return baseSalePrice * baseQuantity;
                })
            );

            const total = details.reduce((sum, value) => sum + value, 0);
            setExistingEstimatedTotal(total);
        } catch (error) {
            setExistingEstimatedTotal(0);
        } finally {
            setExistingTotalLoading(false);
        }
    };

    const loadUnitsForSelectedProduct = async (productId) => {
        try {
            setUnitsLoading(true);
            setUnitOptions([]);
            setSelectedUnitId('');

            const response = await getProductUnits(productId);
            const units = response.data?.data || [];

            setUnitOptions(units);

            const baseUnit =
                units.find((item) => Number(item.conversionFactor) === 1) || units[0];

            if (baseUnit) {
                setSelectedUnitId(String(baseUnit.id));
            }
        } catch (error) {
            setUnitOptions([]);
            setSelectedUnitId('');
        } finally {
            setUnitsLoading(false);
        }
    };

    useEffect(() => {
        if (!open) return;

        setKeyword('');
        setResults([]);
        setSelectedProduct(null);
        setUnitOptions([]);
        setSelectedUnitId('');
        setQuantity(1);
        setError('');
        setExistingEstimatedTotal(0);

        searchProducts('');
        loadExistingEstimatedTotal();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    useEffect(() => {
        if (!selectedProduct?.id) return;
        loadUnitsForSelectedProduct(selectedProduct.id);
    }, [selectedProduct]);

    const selectedUnit = useMemo(() => {
        return unitOptions.find((item) => String(item.id) === String(selectedUnitId)) || null;
    }, [unitOptions, selectedUnitId]);

    const quantityStep = useMemo(() => {
        if (!selectedUnit) return 1;
        return selectedUnit.unitType === 'WEIGHT';
    }, [selectedUnit]);

    const convertedBaseQuantity = useMemo(() => {
        if (!selectedUnit) return 0;
        return roundNumber(Number(quantity || 0) * Number(selectedUnit.conversionFactor || 1), 3);
    }, [quantity, selectedUnit]);

    const currentLineAmount = useMemo(() => {
        if (!selectedUnit) return 0;
        return Number(quantity || 0) * Number(selectedUnit.salePrice || 0);
    }, [quantity, selectedUnit]);

    const suggestedComboPrice = useMemo(() => {
        return existingEstimatedTotal + currentLineAmount;
    }, [existingEstimatedTotal, currentLineAmount]);

    const handleDecrease = () => {
        const current = Number(quantity || 0);
        const next = current - quantityStep;

        if (next <= 0) return;

        if (quantityStep === 1) {
            setQuantity(Math.max(1, Math.round(next)));
            return;
        }

        setQuantity(roundNumber(next, 3));
    };

    const handleIncrease = () => {
        const current = Number(quantity || 0);
        const next = current + quantityStep;

        if (quantityStep === 1) {
            setQuantity(Math.max(1, Math.round(next)));
            return;
        }

        setQuantity(roundNumber(next, 3));
    };

    const handleSubmit = () => {
        if (!selectedProduct) {
            setError('Vui lòng chọn 1 sản phẩm con.');
            return;
        }

        if (!selectedUnit) {
            setError('Vui lòng chọn đơn vị tính của sản phẩm con.');
            return;
        }

        const qty = Number(quantity);
        if (Number.isNaN(qty) || qty <= 0) {
            setError('Số lượng phải lớn hơn 0.');
            return;
        }

        const baseQty = Number(convertedBaseQuantity);
        if (Number.isNaN(baseQty) || baseQty <= 0) {
            setError('Số lượng quy đổi không hợp lệ.');
            return;
        }

        setError('');

        onSubmit({
            childProductId: selectedProduct.id,
            quantity: baseQty
        });
    };

    return (
        <ModalShell
            open={open}
            title="Thêm thành phần combo"
            subtitle={parentProduct ? `Combo cha: ${parentProduct.name}` : ''}
            width="1100px"
            onClose={onClose}
            footer={
                <>
                    <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                        Hủy
                    </button>

                    <button
                        type="button"
                        className="btn btn-success"
                        disabled={submitting}
                        onClick={handleSubmit}
                    >
                        <i className="bi bi-plus-circle me-2" />
                        {submitting ? 'Đang thêm...' : 'Thêm vào combo'}
                    </button>
                </>
            }
        >
            <div className="alert alert-info">
                Bạn có thể chọn <strong>đơn vị cơ bản</strong> hoặc <strong>unit phụ</strong>.
                <br />
            </div>

            <div className="row g-3 align-items-end mb-3">
                <div className="col-md-7">
                    <label className="form-label fw-semibold">Tìm sản phẩm con</label>
                    <div className="input-group">
                        <span className="input-group-text">
                            <i className="bi bi-search" />
                        </span>
                        <input
                            className="form-control"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    searchProducts(keyword);
                                }
                            }}
                            placeholder="Tên sản phẩm, mã SP, barcode..."
                        />
                    </div>
                </div>

                <div className="col-md-3">
                    <label className="form-label fw-semibold">Tổng giá bán</label>
                    <input
                        className="form-control fw-semibold"
                        disabled
                        value={
                            existingTotalLoading
                                ? 'Đang tính...'
                                : formatMoney(suggestedComboPrice)
                        }
                    />
                </div>

                <div className="col-md-2">
                    <button
                        type="button"
                        className="btn btn-dark w-100"
                        onClick={() => searchProducts(keyword)}
                    >
                        Tìm kiếm
                    </button>
                </div>
            </div>

            <div className="table-responsive mb-4">
                <table className="table table-hover align-middle">
                    <thead className="table-light">
                        <tr>
                            <th>Chọn</th>
                            <th>Mã SP</th>
                            <th>Tên sản phẩm</th>
                            <th>Loại</th>
                            <th>Kiểu bán</th>
                            <th>Đơn vị cơ bản</th>
                            <th>Giá base</th>
                            <th>Tồn kho</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="8" className="text-center py-4">
                                    Đang tìm sản phẩm...
                                </td>
                            </tr>
                        ) : results.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center py-4">
                                    Không tìm thấy sản phẩm phù hợp.
                                </td>
                            </tr>
                        ) : (
                            results.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <input
                                            type="radio"
                                            checked={selectedProduct?.id === item.id}
                                            onChange={() => setSelectedProduct(item)}
                                        />
                                    </td>
                                    <td>{item.code}</td>
                                    <td className="fw-semibold">{item.name}</td>
                                    <td>
                                        {item.isCombo ? (
                                            <span className="badge bg-success">Combo</span>
                                        ) : (
                                            <span className="badge bg-primary">Thường</span>
                                        )}
                                    </td>
                                    <td>
                                        {item.allowDecimalQuantity ? (
                                            <span className="badge bg-info text-dark">Cân</span>
                                        ) : (
                                            <span className="badge bg-warning text-dark">Piece</span>
                                        )}
                                    </td>
                                    <td>{item.baseUnit}</td>
                                    <td>{formatMoney(item.salePrice)}</td>
                                    <td>{Number(item.stockQuantity || 0).toLocaleString('vi-VN')}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {selectedProduct ? (
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-light fw-bold">
                        Thành phần combo cho: {selectedProduct.name}
                    </div>

                    <div className="card-body">
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label fw-semibold">Chọn đơn vị tính</label>
                                <select
                                    className="form-select"
                                    value={selectedUnitId}
                                    onChange={(e) => setSelectedUnitId(e.target.value)}
                                    disabled={unitsLoading}
                                >
                                    <option value="">Chọn đơn vị tính</option>
                                    {unitOptions.map((unit) => (
                                        <option key={unit.id} value={unit.id}>
                                            {unit.unitName} | Quy đổi: {Number(unit.conversionFactor).toLocaleString('vi-VN')} | Giá bán: {Number(unit.salePrice).toLocaleString('vi-VN')} đ
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-4">
                                <label className="form-label fw-semibold">Số lượng theo đơn vị đã chọn</label>
                                <div className="input-group">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={handleDecrease}
                                    >
                                        <i className="bi bi-dash-lg" />
                                    </button>

                                    <input
                                        className="form-control text-center"
                                        type="number"
                                        min={quantityStep === 1 ? 1 : 0.001}
                                        step={quantityStep}
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                    />

                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary"
                                        onClick={handleIncrease}
                                    >
                                        <i className="bi bi-plus-lg" />
                                    </button>
                                </div>
                            </div>

                            <div className="col-md-4">
                                <label className="form-label fw-semibold">Thành tiền:</label>
                                <input
                                    className="form-control fw-semibold"
                                    disabled
                                    value={selectedUnit ? formatMoney(currentLineAmount) : '0 đ'}
                                />
                            </div>
                        </div>

                        <div className="row g-3 mt-1">
                            <div className="col-md-4">
                                <div className="alert alert-secondary mb-0">
                                    <strong>Đơn vị đang chọn:</strong><br />
                                    {selectedUnit
                                        ? `${selectedUnit.unitName} (${selectedUnit.unitType})`
                                        : 'Chưa chọn'}
                                </div>
                            </div>

                            <div className="col-md-4">
                                <div className="alert alert-warning mb-0">
                                    <strong>Số lượng quy đổi về base unit:</strong><br />
                                    {selectedUnit
                                        ? `${convertedBaseQuantity.toLocaleString('vi-VN')} ${selectedProduct.baseUnit}`
                                        : '—'}
                                </div>
                            </div>

                            <div className="col-md-4">
                                <div className="alert alert-success mb-0">
                                    <strong>Giá combo sau khi thêm:</strong><br />
                                    {formatMoney(suggestedComboPrice)}
                                </div>
                            </div>
                        </div>

                        {selectedUnit ? (
                            <div className="small text-muted mt-3">
                                Khi lưu: {Number(quantity || 0).toLocaleString('vi-VN')} {selectedUnit.unitName}
                                {' → '}
                                {convertedBaseQuantity.toLocaleString('vi-VN')} {selectedProduct.baseUnit}.
                                Lưu theo <strong>đơn vị cơ bản</strong>.
                            </div>
                        ) : null}
                    </div>
                </div>
            ) : null}

            {error ? (
                <div className="alert alert-danger mt-3 mb-0">{error}</div>
            ) : null}
        </ModalShell>
    );
}

export default ProductComboItemModal;