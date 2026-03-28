import React, { useEffect, useMemo, useState } from 'react';
import ModalShell from './ModalShell';
import RegularProductForm from './RegularProductForm';
import ComboProductForm from './ComboProductForm';
import {
    getProduct,
    getProducts,
    getProductUnits
} from '../../../services/Product/product.service';

// function toNumber(value, fallback = 0) {
//     const num = Number(value);
//     return Number.isNaN(num) ? fallback : num;
// }

function roundNumber(value, digits = 3) {
    const factor = 10 ** digits;
    return Math.round(Number(value || 0) * factor) / factor;
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
            pricingMode: 'manual',
            initialStock: 0,
            correctedStock: initialData.stockQuantity ?? 0,
            stockQuantity: initialData.stockQuantity ?? 0
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
        pricingMode: productType === 'combo' ? 'auto' : 'manual',
        initialStock: 0,
        correctedStock: '',
        stockQuantity: 0
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

    // ── Combo child-product search state ─────────────────────────────
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

    const comboRetailTotal = useMemo(() =>
        comboRows.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0),
        [comboRows]
    );

    const comboPriceDifference = useMemo(() =>
        isCombo ? roundNumber(comboRetailTotal - Number(form.salePrice || 0), 2) : 0,
        [comboRetailTotal, form.salePrice, isCombo]
    );

    // Reset state khi mở modal
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

    // Hydrate combo rows khi edit combo, hoặc load danh sách sản phẩm con ban đầu
    useEffect(() => {
        if (!open || form.productType !== 'combo') return;

        if (isEdit && initialData?.comboItems?.length) {
            (async () => {
                try {
                    setComboLoading(true);
                    const hydrated = await Promise.all(
                        initialData.comboItems.map(async (item, index) => {
                            let productDetail = null;
                            let units = [];
                            try { productDetail = (await getProduct(item.childProductId)).data?.data; } catch (_) { }
                            try { units = (await getProductUnits(item.childProductId)).data?.data || []; } catch (_) { }

                            const baseUnit = units.find((u) => Number(u.conversionFactor) === 1) || {
                                id: `base-${item.childProductId}`,
                                unitName: item.baseUnit || productDetail?.baseUnit || 'Base',
                                unitType: productDetail?.allowDecimalQuantity ? 'WEIGHT' : 'PIECE',
                                conversionFactor: 1,
                                salePrice: productDetail?.salePrice || 0
                            };

                            const quantityBase = Number(item.quantity || 0);
                            const quantityDisplay = roundNumber(quantityBase / Number(baseUnit.conversionFactor || 1), 3);
                            const unitSalePrice = Number(baseUnit.salePrice || productDetail?.salePrice || 0);

                            return {
                                key: `${item.childProductId}-${index}`,
                                comboItemId: item.id,
                                childProductId: item.childProductId,
                                productName: item.childProductName || productDetail?.name || '',
                                productCode: item.childProductCode || productDetail?.code || '',
                                baseUnit: productDetail?.baseUnit || item.baseUnit || '',
                                units,
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
                    setComboRows(hydrated);
                } catch (e) {
                    console.error('Hydrate combo rows failed:', e);
                    setComboRows([]);
                } finally {
                    setComboLoading(false);
                }
            })();
            return;
        }
    }, [open, isEdit, initialData, form.productType]); // eslint-disable-line

    // Tự update giá combo theo mode auto
    useEffect(() => {
        if (!open || !isCombo || form.pricingMode !== 'auto') return;
        setForm((prev) => ({ ...prev, salePrice: comboRetailTotal }));
    }, [comboRetailTotal, form.pricingMode, isCombo, open]);

    // ── Handlers ────────────────────────────────────────────────────
    const handleChange = (field, value) => {
        setForm((prev) => {
            const next = { ...prev, [field]: value };

            if (field === 'productType' && value === 'combo') {
                next.saleMode = 'piece';
                next.baseUnit = 'Combo';
                next.minThreshold = 0;
                next.pricingMode = 'auto';
            }

            if (field === 'productType' && value === 'regular') {
                next.pricingMode = 'manual';

                // Nếu trước đó đang là combo thì xóa chữ "Combo"
                if (prev.productType === 'combo' && prev.baseUnit === 'Combo') {
                    next.baseUnit = '';
                }

                setComboRows([]);
                setSelectedChildProduct(null);
                setChildUnits([]);
                setSelectedChildUnitId('');
                setChildQuantity(1);
                setSearchKeyword('');
                setSearchResults([]);
            }

            return next;
        });
    };

    const searchChildProducts = async (keyword = '') => {
        try {
            setSearchingProducts(true);
            const response = await getProducts({ page: 1, limit: 20, search: keyword, status: 'Selling' });
            const rows = (response.data?.data || []).filter(
                (item) => String(item.id) !== String(initialData?.id) && !item.isCombo
            );
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
            const units = (await getProductUnits(product.id)).data?.data || [];
            setChildUnits(units);
            const defaultUnit = units.find((u) => Number(u.conversionFactor) === 1) || units[0];
            if (defaultUnit) setSelectedChildUnitId(String(defaultUnit.id));
        } catch (e) {
            console.error(e);
            setChildUnits([]);
            setSelectedChildUnitId('');
        } finally {
            setLoadingChildUnits(false);
        }
    };

    const selectedChildUnit = useMemo(
        () => childUnits.find((u) => String(u.id) === String(selectedChildUnitId)) || null,
        [childUnits, selectedChildUnitId]
    );

    const childQuantityStep = useMemo(
        () => (!selectedChildUnit ? 1 : selectedChildUnit.unitType === 'WEIGHT' ? 0.001 : 1),
        [selectedChildUnit]
    );

    const childLineTotal = useMemo(
        () => roundNumber(Number(childQuantity || 0) * Number(selectedChildUnit?.salePrice || 0), 2),
        [childQuantity, selectedChildUnit]
    );

    const childBaseQuantity = useMemo(
        () => roundNumber(Number(childQuantity || 0) * Number(selectedChildUnit?.conversionFactor || 1), 3),
        [childQuantity, selectedChildUnit]
    );

    const handleSelectChildProduct = async (product) => {
        setSelectedChildProduct(product);
        await loadChildUnits(product);
    };

    const handleIncreaseChildQuantity = () => {
        const next = Number(childQuantity || 0) + childQuantityStep;
        setChildQuantity(childQuantityStep === 1 ? Math.max(1, Math.round(next)) : roundNumber(next, 3));
    };

    const handleDecreaseChildQuantity = () => {
        const next = Number(childQuantity || 0) - childQuantityStep;
        if (next <= 0) return;
        setChildQuantity(childQuantityStep === 1 ? Math.max(1, Math.round(next)) : roundNumber(next, 3));
    };

    const handleAddComboRow = () => {
        if (!selectedChildProduct) { setError('Vui lòng chọn sản phẩm con cho combo.'); return; }
        if (!selectedChildUnit) { setError('Vui lòng chọn đơn vị tính của sản phẩm con.'); return; }
        const qty = Number(childQuantity || 0);
        if (Number.isNaN(qty) || qty <= 0) { setError('Số lượng sản phẩm con phải lớn hơn 0.'); return; }
        if (comboRows.some((r) => String(r.childProductId) === String(selectedChildProduct.id))) {
            setError('Mỗi sản phẩm con chỉ nên xuất hiện 1 lần trong combo.');
            return;
        }
        const stock = Number(selectedChildProduct.stockQuantity || 0);
        if (childBaseQuantity > stock) {
            setError(
                `Số lượng vượt quá tồn kho! "${selectedChildProduct.name}" chỉ còn ` +
                `${stock.toLocaleString('vi-VN')} ${selectedChildProduct.baseUnit} trong kho ` +
                `(bạn đang nhập ${childBaseQuantity.toLocaleString('vi-VN')} ${selectedChildProduct.baseUnit}).`
            );
            return;
        }

        setComboRows((prev) => [...prev, {
            key: `${selectedChildProduct.id}-${Date.now()}`,
            comboItemId: null,
            childProductId: selectedChildProduct.id,
            productName: selectedChildProduct.name,
            productCode: selectedChildProduct.code,
            baseUnit: selectedChildProduct.baseUnit,
            units: childUnits,
            selectedUnitId: String(selectedChildUnit.id),
            unitName: selectedChildUnit.unitName,
            unitType: selectedChildUnit.unitType,
            conversionFactor: Number(selectedChildUnit.conversionFactor || 1),
            unitSalePrice: Number(selectedChildUnit.salePrice || 0),
            quantityDisplay: qty,
            quantityBase: childBaseQuantity,
            lineTotal: childLineTotal
        }]);
        setError('');
        setSelectedChildProduct(null);
        setChildUnits([]);
        setSelectedChildUnitId('');
        setChildQuantity(1);
    };

    const handleRemoveComboRow = (rowKey) => setComboRows((prev) => prev.filter((r) => r.key !== rowKey));

    const handleUpdateComboRowQty = (rowKey, newQtyDisplay) => {
        const qty = Number(newQtyDisplay);
        if (Number.isNaN(qty) || qty <= 0) return;
        setComboRows((prev) => prev.map((r) => {
            if (r.key !== rowKey) return r;
            const quantityBase = roundNumber(qty * r.conversionFactor, 3);
            const lineTotal = roundNumber(qty * r.unitSalePrice, 2);
            return { ...r, quantityDisplay: qty, quantityBase, lineTotal };
        }));
    };

    const handleUpdateComboRowUnit = (rowKey, newUnitId) => {
        setComboRows((prev) => prev.map((r) => {
            if (r.key !== rowKey) return r;
            const unit = (r.units || []).find((u) => String(u.id) === String(newUnitId));
            if (!unit) return r;
            const conversionFactor = Number(unit.conversionFactor || 1);
            const unitSalePrice = Number(unit.salePrice || 0);
            const quantityBase = roundNumber(r.quantityDisplay * conversionFactor, 3);
            const lineTotal = roundNumber(r.quantityDisplay * unitSalePrice, 2);
            return {
                ...r,
                selectedUnitId: String(unit.id),
                unitName: unit.unitName,
                unitType: unit.unitType,
                conversionFactor,
                unitSalePrice,
                quantityBase,
                lineTotal
            };
        }));
    };

    const validate = () => {
        const errors = {};
        if (!String(form.code).trim()) errors.code = 'Vui lòng nhập mã sản phẩm.';
        if (!String(form.name).trim()) errors.name = 'Vui lòng nhập tên sản phẩm.';
        if (!String(form.baseUnit).trim()) errors.baseUnit = 'Vui lòng nhập đơn vị cơ bản.';
        const sp = Number(form.salePrice);
        if (Number.isNaN(sp) || sp < 0) errors.salePrice = 'Giá bán không hợp lệ.';
        const mt = Number(form.minThreshold || 0);
        if (Number.isNaN(mt) || mt < 0) errors.minThreshold = 'Ngưỡng tồn kho tối thiểu không hợp lệ.';
        if (isCombo) {
            if (comboRows.length === 0) {
                errors.combo = 'Sản phẩm combo phải có ít nhất 1 sản phẩm con.';
            }
            // Kiểm tra nếu đã chọn sản phẩm con nhưng chưa thêm vào combo
            if (selectedChildProduct) {
                errors.combo = 'Bạn đã chọn sản phẩm con nhưng chưa nhấn "Thêm vào combo". Vui lòng thêm hoặc bỏ chọn sản phẩm.';
            }
        }
        return errors;
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        const errors = validate();
        if (Object.keys(errors).length > 0) {
            setError(errors);
            return;
        }
        setError({});
        if (submitting) return;
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
                ? comboRows.map((r) => ({ childProductId: r.childProductId, quantity: r.quantityBase }))
                : [],
            initialStock: isCombo ? Number(form.initialStock || 0) : 0,
            correctedStock: isCombo &&
                String(form.correctedStock).trim() !== '' &&
                Number(form.correctedStock) !== Number(form.stockQuantity)
                ? Number(form.correctedStock)
                : null
        });
    };

    return (
        <ModalShell
            open={open}
            title={modalTitle}
            subtitle={
                isCombo
                    ? 'Chọn sản phẩm con trước, hệ thống tự tính tổng giá lẻ rồi mới ra giá combo.'
                    : 'Đơn vị cơ bản được tạo cùng lúc với sản phẩm. Đơn vị phụ sẽ thêm ở chi tiết sản phẩm.'
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
                {/* ── Chọn loại sản phẩm ── */}
                {!isEdit && (
                    <div className="mb-4">
                        <div className="fw-semibold mb-2">Loại sản phẩm</div>
                        <div className="row g-2">
                            <div className="col-md-6">
                                <button
                                    type="button"
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
                                    className={`btn w-100 text-start ${form.productType === 'combo' ? 'btn-success' : 'btn-outline-success'}`}
                                    onClick={() => handleChange('productType', 'combo')}
                                >
                                    <i className="bi bi-boxes me-2" />
                                    Sản phẩm combo
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Form theo loại sản phẩm ── */}
                {!isCombo ? (
                    <RegularProductForm
                        form={form}
                        handleChange={handleChange}
                        categories={categories}
                        isEdit={isEdit}
                        errors={error}
                    />
                ) : (
                    <ComboProductForm
                        form={form}
                        handleChange={handleChange}
                        categories={categories}
                        isEdit={isEdit}
                        errors={error}
                        comboRows={comboRows}
                        comboLoading={comboLoading}
                        comboRetailTotal={comboRetailTotal}
                        comboPriceDifference={comboPriceDifference}
                        searchKeyword={searchKeyword}
                        setSearchKeyword={setSearchKeyword}
                        searchingProducts={searchingProducts}
                        searchResults={searchResults}
                        selectedChildProduct={selectedChildProduct}
                        childUnits={childUnits}
                        loadingChildUnits={loadingChildUnits}
                        selectedChildUnitId={selectedChildUnitId}
                        setSelectedChildUnitId={setSelectedChildUnitId}
                        childQuantity={childQuantity}
                        setChildQuantity={setChildQuantity}
                        childQuantityStep={childQuantityStep}
                        childLineTotal={childLineTotal}
                        childBaseQuantity={childBaseQuantity}
                        selectedChildUnit={selectedChildUnit}
                        onSearchChildProducts={searchChildProducts}
                        onSelectChildProduct={handleSelectChildProduct}
                        onIncreaseQty={handleIncreaseChildQuantity}
                        onDecreaseQty={handleDecreaseChildQuantity}
                        onAddComboRow={handleAddComboRow}
                        onRemoveComboRow={handleRemoveComboRow}
                        onUpdateComboRowQty={handleUpdateComboRowQty}
                        onUpdateComboRowUnit={handleUpdateComboRowUnit}
                    />
                )}
            </form>
        </ModalShell>
    );
} export default ProductFormModal;