import React, { useEffect, useMemo, useState } from 'react';
import ModalShell from './ModalShell';
import {
    getProduct,
    getProducts,
    getProductUnits
} from '../../../services/Product/product.service';

function toNumber(value, fallback = 0) {
    const num = Number(value);
    return Number.isNaN(num) ? fallback : num;
}

function roundNumber(value, digits = 3) {
    const factor = 10 ** digits;
    return Math.round(Number(value || 0) * factor) / factor;
}

function formatMoney(value) {
    return `${Number(value || 0).toLocaleString('vi-VN')} đ`;
}

function buildInitialState(initialData, productType) {
    if (initialData) {
        return {
            code: initialData.code || '',
            name: initialData.name || '',
            imageUrl: initialData.imageUrl || '',
            categoryId: initialData.categoryId || '',
            baseUnit: initialData.baseUnit || '',
            salePrice: initialData.salePrice ?? 0,
            barcode: initialData.barcode || '',
            minThreshold: initialData.minThreshold ?? 0,
            status: initialData.status || 'Selling',
            productType: initialData.isCombo ? 'combo' : 'regular',
            saleMode: initialData.allowDecimalQuantity ? 'weight' : 'piece',
            pricingMode: initialData.isCombo ? 'manual' : 'manual'
        };
    }

    return {
        code: '',
        name: '',
        imageUrl: '',
        categoryId: '',
        baseUnit: productType === 'combo' ? 'Combo' : '',
        salePrice: 0,
        barcode: '',
        minThreshold: 0,
        status: 'Selling',
        productType,
        saleMode: 'piece',
        pricingMode: productType === 'combo' ? 'auto' : 'manual'
    };
}

function ProductFormModal({
    open,
    mode,
    productType,
    initialData,
    categories,
    submitting,
    onClose,
    onSubmit
}) {
    const [form, setForm] = useState(buildInitialState(initialData, productType));
    const [error, setError] = useState('');
    const [comboRows, setComboRows] = useState([]);
    const [comboLoading, setComboLoading] = useState(false);

    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchingProducts, setSearchingProducts] = useState(false);
    const [searchResults, setSearchResults] = useState([]);

    const [selectedChildProduct, setSelectedChildProduct] = useState(null);
    const [childUnits, setChildUnits] = useState([]);
    const [loadingChildUnits, setLoadingChildUnits] = useState(false);
    const [selectedChildUnitId, setSelectedChildUnitId] = useState('');
    const [childQuantity, setChildQuantity] = useState(1);

    const isEdit = mode === 'edit';
    const isCombo = form.productType === 'combo';

    const modalTitle = useMemo(() => {
        if (isEdit) return 'Cập nhật sản phẩm';
        return isCombo ? 'Tạo sản phẩm combo' : 'Tạo sản phẩm thường';
    }, [isEdit, isCombo]);

    const comboRetailTotal = useMemo(() => {
        return comboRows.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0);
    }, [comboRows]);

    const comboPriceDifference = useMemo(() => {
        if (!isCombo) return 0;
        return roundNumber(comboRetailTotal - Number(form.salePrice || 0), 2);
    }, [comboRetailTotal, form.salePrice, isCombo]);

    useEffect(() => {
        if (!open) return;
        setError('');
        setForm(buildInitialState(initialData, productType));
        setComboRows([]);
        setComboLoading(false);

        setSearchKeyword('');
        setSearchResults([]);
        setSearchingProducts(false);
        setSelectedChildProduct(null);
        setChildUnits([]);
        setLoadingChildUnits(false);
        setSelectedChildUnitId('');
        setChildQuantity(1);
    }, [open, initialData, productType]);

    useEffect(() => {
        if (!open) return;
        if (form.productType !== 'combo') return;

        if (isEdit && initialData?.comboItems?.length) {
            const hydrateComboRows = async () => {
                try {
                    setComboLoading(true);

                    const hydratedRows = await Promise.all(
                        initialData.comboItems.map(async (item, index) => {
                            let productDetail = null;
                            let units = [];

                            try {
                                const productResponse = await getProduct(item.childProductId);
                                productDetail = productResponse.data?.data || null;
                            } catch (_) {
                                productDetail = null;
                            }

                            try {
                                const unitsResponse = await getProductUnits(item.childProductId);
                                units = unitsResponse.data?.data || [];
                            } catch (_) {
                                units = [];
                            }

                            const baseUnit =
                                units.find((unit) => Number(unit.conversionFactor) === 1) ||
                                {
                                    id: `base-${item.childProductId}`,
                                    unitName: item.baseUnit || productDetail?.baseUnit || 'Base',
                                    unitType: productDetail?.allowDecimalQuantity ? 'WEIGHT' : 'PIECE',
                                    conversionFactor: 1,
                                    salePrice: productDetail?.salePrice || 0
                                };

                            const quantityBase = Number(item.quantity || 0);
                            const quantityDisplay = roundNumber(
                                quantityBase / Number(baseUnit.conversionFactor || 1),
                                3
                            );
                            const unitSalePrice = Number(baseUnit.salePrice || productDetail?.salePrice || 0);

                            return {
                                key: `${item.childProductId}-${index}`,
                                comboItemId: item.id,
                                childProductId: item.childProductId,
                                productName: item.childProductName || productDetail?.name || '',
                                productCode: item.childProductCode || productDetail?.code || '',
                                baseUnit: productDetail?.baseUnit || item.baseUnit || '',
                                selectedUnitId: String(baseUnit.id),
                                unitName: baseUnit.unitName,
                                unitType: baseUnit.unitType,
                                conversionFactor: Number(baseUnit.conversionFactor || 1),
                                unitSalePrice,
                                quantityDisplay,
                                quantityBase,
                                lineTotal: roundNumber(quantityDisplay * unitSalePrice, 2)
                            };
                        })
                    );

                    setComboRows(hydratedRows);
                } catch (e) {
                    console.error('Hydrate combo rows failed:', e);
                    setComboRows([]);
                } finally {
                    setComboLoading(false);
                }
            };

            hydrateComboRows();
            return;
        }

        if (!isEdit) {
            searchChildProducts('');
        }
    }, [open, isEdit, initialData, form.productType]);

    useEffect(() => {
        if (!open) return;
        if (!isCombo) return;
        if (form.pricingMode !== 'auto') return;

        setForm((prev) => ({
            ...prev,
            salePrice: comboRetailTotal
        }));
    }, [comboRetailTotal, form.pricingMode, isCombo, open]);

    const handleChange = (field, value) => {
        setForm((prev) => {
            const next = { ...prev, [field]: value };

            if (field === 'productType' && value === 'combo') {
                next.saleMode = 'piece';
                next.baseUnit = prev.baseUnit || 'Combo';
                next.minThreshold = 0;
                next.pricingMode = 'auto';
            }
            if (field === 'productType' && value === 'regular') {
                next.pricingMode = 'manual';
                setComboRows([]);
            }
            return next;
        });
    };

    const searchChildProducts = async (keyword = '') => {
        try {
            setSearchingProducts(true);

            const response = await getProducts({
                page: 1,
                limit: 20,
                search: keyword,
                status: 'Selling'
            });

            const rows = (response.data?.data || []).filter((item) => {
                if (String(item.id) === String(initialData?.id)) return false;
                return !item.isCombo;
            });

            setSearchResults(rows);
        } catch (e) {
            console.error(e);
            setSearchResults([]);
        } finally {
            setSearchingProducts(false);
        }
    };

    const loadChildUnits = async (product) => {
        try {
            setLoadingChildUnits(true);
            setChildUnits([]);
            setSelectedChildUnitId('');
            setChildQuantity(1);

            const response = await getProductUnits(product.id);
            const units = response.data?.data || [];

            setChildUnits(units);

            const defaultUnit =
                units.find((item) => Number(item.conversionFactor) === 1) || units[0];

            if (defaultUnit) {
                setSelectedChildUnitId(String(defaultUnit.id));
            }
        } catch (e) {
            console.error(e);
            setChildUnits([]);
            setSelectedChildUnitId('');
        } finally {
            setLoadingChildUnits(false);
        }
    };

    const selectedChildUnit = useMemo(() => {
        return childUnits.find((item) => String(item.id) === String(selectedChildUnitId)) || null;
    }, [childUnits, selectedChildUnitId]);

    const childQuantityStep = useMemo(() => {
        if (!selectedChildUnit) return 1;
        return selectedChildUnit.unitType === 'WEIGHT' ? 0.001 : 1;
    }, [selectedChildUnit]);

    const childLineTotal = useMemo(() => {
        if (!selectedChildUnit) return 0;
        return roundNumber(
            Number(childQuantity || 0) * Number(selectedChildUnit.salePrice || 0),
            2
        );
    }, [childQuantity, selectedChildUnit]);

    const childBaseQuantity = useMemo(() => {
        if (!selectedChildUnit) return 0;
        return roundNumber(
            Number(childQuantity || 0) * Number(selectedChildUnit.conversionFactor || 1),
            3
        );
    }, [childQuantity, selectedChildUnit]);

    const handleSelectChildProduct = async (product) => {
        setSelectedChildProduct(product);
        await loadChildUnits(product);
    };

    const handleIncreaseChildQuantity = () => {
        const next = Number(childQuantity || 0) + childQuantityStep;
        if (childQuantityStep === 1) {
            setChildQuantity(Math.max(1, Math.round(next)));
            return;
        }
        setChildQuantity(roundNumber(next, 3));
    };

    const handleDecreaseChildQuantity = () => {
        const next = Number(childQuantity || 0) - childQuantityStep;
        if (next <= 0) return;

        if (childQuantityStep === 1) {
            setChildQuantity(Math.max(1, Math.round(next)));
            return;
        }
        setChildQuantity(roundNumber(next, 3));
    };

    const handleAddComboRow = () => {
        if (!selectedChildProduct) {
            setError('Vui lòng chọn sản phẩm con cho combo.');
            return;
        }

        if (!selectedChildUnit) {
            setError('Vui lòng chọn đơn vị tính của sản phẩm con.');
            return;
        }

        const quantityDisplay = Number(childQuantity || 0);
        if (Number.isNaN(quantityDisplay) || quantityDisplay <= 0) {
            setError('Số lượng sản phẩm con phải lớn hơn 0.');
            return;
        }

        const duplicated = comboRows.some(
            (item) => String(item.childProductId) === String(selectedChildProduct.id)
        );

        if (duplicated) {
            setError('Mỗi sản phẩm con chỉ nên xuất hiện 1 lần trong combo. Muốn đổi số lượng, hãy xóa dòng cũ rồi thêm lại.');
            return;
        }

        const newRow = {
            key: `${selectedChildProduct.id}-${Date.now()}`,
            comboItemId: null,
            childProductId: selectedChildProduct.id,
            productName: selectedChildProduct.name,
            productCode: selectedChildProduct.code,
            baseUnit: selectedChildProduct.baseUnit,
            selectedUnitId: String(selectedChildUnit.id),
            unitName: selectedChildUnit.unitName,
            unitType: selectedChildUnit.unitType,
            conversionFactor: Number(selectedChildUnit.conversionFactor || 1),
            unitSalePrice: Number(selectedChildUnit.salePrice || 0),
            quantityDisplay: quantityDisplay,
            quantityBase: childBaseQuantity,
            lineTotal: childLineTotal
        };

        setComboRows((prev) => [...prev, newRow]);
        setError('');
        setSelectedChildProduct(null);
        setChildUnits([]);
        setSelectedChildUnitId('');
        setChildQuantity(1);
    };

    const handleRemoveComboRow = (rowKey) => {
        setComboRows((prev) => prev.filter((item) => item.key !== rowKey));
    };

    const validate = () => {
        if (!String(form.code).trim()) return 'Vui lòng nhập mã sản phẩm.';
        if (!String(form.name).trim()) return 'Vui lòng nhập tên sản phẩm.';
        if (!String(form.baseUnit).trim()) return 'Vui lòng nhập đơn vị cơ bản.';

        const salePrice = Number(form.salePrice);
        if (Number.isNaN(salePrice) || salePrice < 0) return 'Giá bán không hợp lệ.';

        const minThreshold = Number(form.minThreshold || 0);
        if (Number.isNaN(minThreshold) || minThreshold < 0) {
            return 'Ngưỡng tồn kho tối thiểu không hợp lệ.';
        }

        if (isCombo && comboRows.length === 0) {
            return 'Sản phẩm combo phải có ít nhất 1 sản phẩm con.';
        }

        return '';
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault();

        const validationMessage = validate();
        if (validationMessage) {
            setError(validationMessage);
            return;
        }

        setError('');

        onSubmit({
            code: String(form.code).trim(),
            name: String(form.name).trim(),
            imageUrl: String(form.imageUrl || '').trim() || null,
            categoryId: form.categoryId ? Number(form.categoryId) : null,
            baseUnit: String(form.baseUnit).trim(),
            salePrice: Number(form.salePrice || 0),
            barcode: String(form.barcode || '').trim() || null,
            minThreshold: isCombo ? 0 : Number(form.minThreshold || 0),
            status: form.status,
            isCombo,
            allowDecimalQuantity: isCombo ? false : form.saleMode === 'weight',
            comboItems: isCombo
                ? comboRows.map((item) => ({
                    childProductId: item.childProductId,
                    quantity: item.quantityBase
                }))
                : []
        });
    };

    return (
        <ModalShell
            open={open}
            title={modalTitle}
            subtitle={
                isCombo
                    ? 'Tạo/sửa combo theo đúng nghiệp vụ: chọn sản phẩm con trước, hệ thống tự tính tổng giá lẻ rồi mới ra giá combo.'
                    : 'Base unit được tạo cùng lúc với sản phẩm. Unit phụ sẽ thêm ở popup chi tiết.'
            }
            width="1150px"
            onClose={onClose}
            footer={
                <>
                    <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                        Hủy
                    </button>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={submitting || comboLoading}
                    >
                        <i className="bi bi-floppy me-2" />
                        {submitting ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
                    </button>
                </>
            }
        >
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <div className="fw-semibold mb-2">Loại sản phẩm</div>
                    <div className="row g-2">
                        <div className="col-md-6">
                            <button
                                type="button"
                                disabled={isEdit}
                                className={`btn w-100 text-start ${form.productType === 'regular' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => handleChange('productType', 'regular')}
                            >
                                <i className="bi bi-box-seam me-2" />
                                Sản phẩm thường
                            </button>
                        </div>

                        <div className="col-md-6">
                            <button
                                type="button"
                                disabled={isEdit}
                                className={`btn w-100 text-start ${form.productType === 'combo' ? 'btn-success' : 'btn-outline-success'}`}
                                onClick={() => handleChange('productType', 'combo')}
                            >
                                <i className="bi bi-boxes me-2" />
                                Sản phẩm combo
                            </button>
                        </div>
                    </div>
                </div>

                {!isCombo ? (
                    <div className="mb-4">
                        <div className="fw-semibold mb-2">Kiểu bán của sản phẩm thường</div>
                        <div className="row g-2">
                            <div className="col-md-6">
                                <button
                                    type="button"
                                    className={`btn w-100 text-start ${form.saleMode === 'piece' ? 'btn-warning' : 'btn-outline-warning'}`}
                                    onClick={() => handleChange('saleMode', 'piece')}
                                >
                                    <i className="bi bi-tag me-2" />
                                    Bán theo piece
                                </button>
                            </div>

                            <div className="col-md-6">
                                <button
                                    type="button"
                                    className={`btn w-100 text-start ${form.saleMode === 'weight' ? 'btn-info' : 'btn-outline-info'}`}
                                    onClick={() => handleChange('saleMode', 'weight')}
                                >
                                    <i className="bi bi-scale me-2" />
                                    Bán theo cân
                                </button>
                            </div>
                        </div>
                    </div>
                ) : null}

                <div className="row g-3 mb-4">
                    <div className="col-md-6">
                        <label className="form-label fw-semibold">Mã sản phẩm *</label>
                        <input
                            className="form-control"
                            value={form.code}
                            onChange={(e) => handleChange('code', e.target.value)}
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label fw-semibold">Tên sản phẩm *</label>
                        <input
                            className="form-control"
                            value={form.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label fw-semibold">Danh mục</label>
                        <select
                            className="form-select"
                            value={form.categoryId}
                            onChange={(e) => handleChange('categoryId', e.target.value)}
                        >
                            <option value="">Chọn danh mục</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-6">
                        <label className="form-label fw-semibold">Trạng thái</label>
                        <select
                            className="form-select"
                            value={form.status}
                            onChange={(e) => handleChange('status', e.target.value)}
                        >
                            <option value="Selling">Đang bán</option>
                            <option value="StopSelling">Ngừng bán</option>
                        </select>
                    </div>

                    <div className="col-md-6">
                        <label className="form-label fw-semibold">Base unit *</label>
                        <input
                            className="form-control"
                            value={form.baseUnit}
                            onChange={(e) => handleChange('baseUnit', e.target.value)}
                            placeholder={isCombo ? 'Combo' : form.saleMode === 'weight' ? 'Kg' : 'Cái'}
                        />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label fw-semibold">Barcode base unit</label>
                        <input
                            className="form-control"
                            value={form.barcode}
                            onChange={(e) => handleChange('barcode', e.target.value)}
                        />
                    </div>

                    {!isCombo ? (
                        <>
                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Giá bán base unit *</label>
                                <input
                                    className="form-control"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={form.salePrice}
                                    onChange={(e) => handleChange('salePrice', e.target.value)}
                                />
                            </div>

                            <div className="col-md-6">
                                <label className="form-label fw-semibold">Ngưỡng tồn tối thiểu</label>
                                <input
                                    className="form-control"
                                    type="number"
                                    min="0"
                                    value={form.minThreshold}
                                    onChange={(e) => handleChange('minThreshold', e.target.value)}
                                />
                            </div>
                        </>
                    ) : null}

                    <div className="col-12">
                        <label className="form-label fw-semibold">Ảnh sản phẩm (URL)</label>
                        <input
                            className="form-control"
                            value={form.imageUrl}
                            onChange={(e) => handleChange('imageUrl', e.target.value)}
                        />
                    </div>
                </div>

                {isCombo ? (
                    <>
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
                                                        searchChildProducts(searchKeyword);
                                                    }
                                                }}
                                                placeholder="Tên sản phẩm, mã sản phẩm, barcode..."
                                            />
                                        </div>
                                    </div>

                                    <div className="col-md-2">
                                        <button
                                            type="button"
                                            className="btn btn-dark w-100"
                                            onClick={() => searchChildProducts(searchKeyword)}
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
                                        <thead className="table-light">
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
                                                    <td colSpan="6" className="text-center py-4">
                                                        Đang tìm sản phẩm...
                                                    </td>
                                                </tr>
                                            ) : searchResults.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" className="text-center py-4">
                                                        Không có sản phẩm phù hợp.
                                                    </td>
                                                </tr>
                                            ) : (
                                                searchResults.map((item) => (
                                                    <tr key={item.id}>
                                                        <td>
                                                            <button
                                                                type="button"
                                                                className={`btn btn-sm ${selectedChildProduct?.id === item.id ? 'btn-primary' : 'btn-outline-primary'}`}
                                                                onClick={() => handleSelectChildProduct(item)}
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

                                {selectedChildProduct ? (
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
                                                            {unit.unitName} | Quy đổi: {Number(unit.conversionFactor).toLocaleString('vi-VN')} | Giá bán: {Number(unit.salePrice).toLocaleString('vi-VN')} đ
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="col-md-4">
                                                <label className="form-label fw-semibold">Số lượng</label>
                                                <div className="input-group">
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-secondary"
                                                        onClick={handleDecreaseChildQuantity}
                                                    >
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

                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-secondary"
                                                        onClick={handleIncreaseChildQuantity}
                                                    >
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
                                                    onClick={handleAddComboRow}
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
                                ) : null}

                                <div className="table-responsive">
                                    <table className="table table-bordered align-middle">
                                        <thead className="table-light">
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
                                                    <td colSpan="8" className="text-center py-4">
                                                        Đang tải thành phần combo...
                                                    </td>
                                                </tr>
                                            ) : comboRows.length === 0 ? (
                                                <tr>
                                                    <td colSpan="8" className="text-center py-4">
                                                        Chưa có sản phẩm con nào trong combo.
                                                    </td>
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
                                                                onClick={() => handleRemoveComboRow(row.key)}
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
                                                setForm((prev) => ({
                                                    ...prev,
                                                    salePrice: comboRetailTotal,
                                                    pricingMode: 'manual'
                                                }))
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
                ) : null}

                {error ? (
                    <div className="alert alert-danger mb-0">{error}</div>
                ) : null}
            </form>
        </ModalShell>
    );
}

export default ProductFormModal;