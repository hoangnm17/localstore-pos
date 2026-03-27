import React, { useEffect, useState } from 'react';
import ModalShell from './ModalShell';

function buildInitialState(product, unit) {
    if (unit) {
        return {
            productId: unit.productId,
            unitName: unit.unitName || '',
            unitType: unit.unitType || 'PIECE',
            conversionFactor: unit.conversionFactor ?? '',
            salePrice: unit.salePrice ?? 0,
            barcode: unit.barcode || ''
        };
    }

    return {
        productId: product?.id || '',
        unitName: '',
        unitType: product?.allowDecimalQuantity ? 'WEIGHT' : 'PIECE',
        conversionFactor: '',
        salePrice: 0,
        barcode: ''
    };
}

function ProductUnitModal({
    open,
    mode,
    product,
    unit,
    submitting,
    onClose,
    onSubmit
}) {
    const [form, setForm] = useState(buildInitialState(product, unit));
    const [error, setError] = useState('');

    useEffect(() => {
        if (!open) return;
        setError('');
        setForm(buildInitialState(product, unit));
    }, [open, product, unit]);

    const isEdit = mode === 'edit';

    const validate = () => {
        if (!product) return 'Không xác định được sản phẩm.';
        if (!String(form.unitName).trim()) return 'Vui lòng nhập tên đơn vị tính.';

        const isBaseUnit = unit?.conversionFactor === 1;

        if (!isBaseUnit) {
            const conversionFactor = Number(form.conversionFactor);
            if (Number.isNaN(conversionFactor) || conversionFactor <= 1) {
                return 'Hệ số quy đổi của unit phụ phải lớn hơn 1.';
            }
        }

        const salePrice = Number(form.salePrice);
        if (Number.isNaN(salePrice) || salePrice <= 0) {
            return 'Giá bán không được để trống và phải lớn hơn 0.';
        }

        if (!isBaseUnit && salePrice <= Number(product.salePrice)) {
            return `Giá bán đơn vị phụ phải lớn hơn giá base unit (${product.salePrice}).`;
        }

        if (!['PIECE', 'WEIGHT'].includes(form.unitType)) {
            return 'Loại đơn vị tính không hợp lệ.';
        }

        return '';
    };

    const handleSubmit = () => {
        const message = validate();
        if (message) {
            setError(message);
            return;
        }

        setError('');

        onSubmit({
            productId: product.id,
            unitName: String(form.unitName).trim(),
            unitType: form.unitType,
            conversionFactor: Number(form.conversionFactor),
            salePrice: Number(form.salePrice),
            barcode: String(form.barcode || '').trim() || null
        });
    };

    return (
        <ModalShell
            open={open}
            title={isEdit ? 'Cập nhật đơn vị tính' : 'Tạo đơn vị tính mới'}
            subtitle={`Sản phẩm: ${product?.name || ''}`}
            width="720px"
            onClose={onClose}
            footer={
                <>
                    <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                        Hủy
                    </button>
                    <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                        <i className="bi bi-floppy me-2" />
                        {submitting ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Tạo đơn vị tính'}
                    </button>
                </>
            }
        >
            <div className="alert alert-info">
                {unit?.conversionFactor === 1
                    ? 'Đang sửa đơn vị cơ bản. Bạn có thể cập nhật giá bán ở đây.'
                    : 'Đơn vị cơ bản được quản lý ở trang sản phẩm. Trang này chỉ dùng cho đơn vị phụ.'}
            </div>

            <div className="row g-3">
                <div className="col-md-6">
                    <label className="form-label fw-semibold">Tên đơn vị tính *</label>
                    <input
                        className="form-control"
                        value={form.unitName}
                        onChange={(e) => setForm((prev) => ({ ...prev, unitName: e.target.value }))}
                        disabled={unit?.conversionFactor === 1}
                    />
                </div>

                <div className="col-md-6">
                    <label className="form-label fw-semibold">Loại đơn vị *</label>
                    <select
                        className="form-select"
                        value={form.unitType}
                        onChange={(e) => setForm((prev) => ({ ...prev, unitType: e.target.value }))}
                        disabled={unit?.conversionFactor === 1}
                    >
                        <option value="PIECE">Chiếc, cái, chai, lon,...</option>
                        <option value="WEIGHT">Cân nặng</option>
                    </select>
                </div>

                <div className="col-md-6">
                    <label className="form-label fw-semibold">Hệ số quy đổi *</label>
                    <input
                        className="form-control"
                        type="number"
                        min="1.001"
                        step="0.001"
                        value={form.conversionFactor}
                        onChange={(e) => setForm((prev) => ({ ...prev, conversionFactor: e.target.value }))}
                        disabled={unit?.conversionFactor === 1}
                    />
                </div>

                <div className="col-md-6">
                    <label className="form-label fw-semibold">Giá bán *</label>
                    <input
                        className="form-control"
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.salePrice}
                        onChange={(e) => setForm((prev) => ({ ...prev, salePrice: e.target.value }))}
                    />
                </div>

                <div className="col-12">
                    <label className="form-label fw-semibold">Barcode</label>
                    <input
                        className="form-control"
                        value={form.barcode}
                        onChange={(e) => setForm((prev) => ({ ...prev, barcode: e.target.value }))}
                        disabled={unit?.conversionFactor === 1}
                    />
                </div>
            </div>

            {error ? <div className="alert alert-danger mt-3 mb-0">{error}</div> : null}
        </ModalShell>
    );
}

export default ProductUnitModal;