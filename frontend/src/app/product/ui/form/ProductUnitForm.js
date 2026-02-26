import { useState } from 'react';
import '../ProductModal.css';

/**
 * ProductUnitForm
 *
 * Có 2 chế độ:
 *
 * 1. CREATE MODE (productId = null):
 *    - Quản lý units trong local state (pendingUnits)
 *    - Gọi onUnitsChange(units) mỗi khi thêm/sửa/xóa
 *    - Dùng trong CreateProductModal
 *
 * 2. EDIT MODE (productId có giá trị):
 *    - Gọi API trực tiếp qua handleCreateUnit / handleUpdateUnit / handleDeleteUnit
 *    - units được truyền vào từ useProductDetail
 *    - Dùng trong EditProductModal
 *
 * Props:
 *   productId       - string | null
 *   units           - array (edit mode: từ server, create mode: không dùng)
 *   onUnitsChange   - (units) => void  (chỉ dùng khi create mode)
 *   handleCreateUnit - fn (chỉ dùng khi edit mode)
 *   handleUpdateUnit - fn (chỉ dùng khi edit mode)
 *   handleDeleteUnit - fn (chỉ dùng khi edit mode)
 *   onError         - (msg) => void
 */

const defaultUnitForm = { unitName: '', conversionFactor: '', price: '', barcode: '' };

const ProductUnitForm = ({
    productId = null,
    units = [],
    onUnitsChange,
    handleCreateUnit,
    handleUpdateUnit,
    handleDeleteUnit,
    onError,
}) => {
    const isCreateMode = !productId;

    // Create mode: quản lý local state
    const [pendingUnits, setPendingUnits] = useState([]);

    // Form state
    const [unitForm, setUnitForm] = useState(defaultUnitForm);
    const [editingIndex, setEditingIndex] = useState(null); // create mode dùng index
    const [editingUnitId, setEditingUnitId] = useState(null); // edit mode dùng id
    const [showForm, setShowForm] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const displayUnits = isCreateMode ? pendingUnits : units;

    const validateUnitForm = () => {
        const errs = {};
        if (!unitForm.unitName.trim()) errs.unitName = 'Nhập tên đơn vị';
        if (!unitForm.conversionFactor || isNaN(unitForm.conversionFactor) || Number(unitForm.conversionFactor) < 1)
            errs.conversionFactor = 'Quy đổi phải ≥ 1';
        if (!unitForm.price || isNaN(unitForm.price) || Number(unitForm.price) < 0)
            errs.price = 'Giá không hợp lệ';
        setFormErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleStartAdd = () => {
        setUnitForm(defaultUnitForm);
        setEditingIndex(null);
        setEditingUnitId(null);
        setFormErrors({});
        setShowForm(true);
    };

    const handleStartEdit = (unit, index) => {
        setUnitForm({
            unitName: unit.unitName,
            conversionFactor: String(unit.conversionFactor),
            price: String(unit.price),
            barcode: unit.barcode || '',
        });
        setFormErrors({});
        if (isCreateMode) {
            setEditingIndex(index);
        } else {
            setEditingUnitId(unit.id);
        }
        setShowForm(true);
    };

    const handleCancel = () => {
        setUnitForm(defaultUnitForm);
        setEditingIndex(null);
        setEditingUnitId(null);
        setFormErrors({});
        setShowForm(false);
    };

    const handleSubmit = async () => {
        if (!validateUnitForm()) return;

        const payload = {
            unitName: unitForm.unitName.trim(),
            unitType: 'PIECE',
            conversionFactor: parseFloat(unitForm.conversionFactor),
            price: parseFloat(unitForm.price),
            barcode: unitForm.barcode.trim() || null,
        };

        if (isCreateMode) {
            // Lưu vào local state, chưa gọi API
            let newUnits;
            if (editingIndex !== null) {
                newUnits = pendingUnits.map((u, i) => i === editingIndex ? payload : u);
            } else {
                newUnits = [...pendingUnits, payload];
            }
            setPendingUnits(newUnits);
            onUnitsChange?.(newUnits);
            handleCancel();
        } else {
            // Gọi API trực tiếp
            const res = editingUnitId
                ? await handleUpdateUnit(editingUnitId, { ...payload, productId })
                : await handleCreateUnit({ ...payload, productId });

            if (res.success) handleCancel();
            else onError?.(res.message);
        }
    };

    const handleDelete = async (unit, index) => {
        if (isCreateMode) {
            const newUnits = pendingUnits.filter((_, i) => i !== index);
            setPendingUnits(newUnits);
            onUnitsChange?.(newUnits);
        } else {
            const res = await handleDeleteUnit(unit.id);
            if (!res.success) onError?.(res.message);
        }
    };

    const fmt = (val) => val != null ? Number(val).toLocaleString('vi-VN') + 'đ' : '—';

    return (
        <div>
            <div className="pm-banner pm-banner--info">
                ℹ️ Chỉ áp dụng cho sản phẩm <strong>PIECE</strong>. Ví dụ: Coca Cola thêm đơn vị <em>Lốc</em> (x6), <em>Thùng</em> (x24) với giá riêng.
            </div>

            {/* Bảng units */}
            {displayUnits.length > 0 && (
                <table className="pm-table" style={{ marginBottom: 16 }}>
                    <thead>
                        <tr>
                            <th>Tên ĐVT</th>
                            <th>Quy đổi</th>
                            <th>Giá bán</th>
                            <th>Barcode</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayUnits.map((u, idx) => (
                            <tr key={isCreateMode ? idx : u.id}>
                                <td className="pm-cell--name">{u.unitName}</td>
                                <td>x{u.conversionFactor}</td>
                                <td className="pm-cell--price">{fmt(u.price)}</td>
                                <td>{u.barcode || '—'}</td>
                                <td>
                                    <div className="pm-action-group">
                                        <button
                                            className="pm-action-btn pm-action-btn--edit"
                                            onClick={() => handleStartEdit(u, idx)}
                                            title="Sửa"
                                        >✏️</button>
                                        <button
                                            className="pm-action-btn pm-action-btn--delete"
                                            onClick={() => handleDelete(u, idx)}
                                            title="Xóa"
                                        >🗑</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* Nút thêm */}
            {!showForm && (
                <button className="pm-btn pm-btn--ghost" onClick={handleStartAdd}>
                    + Thêm đơn vị tính
                </button>
            )}

            {/* Form thêm/sửa unit */}
            {showForm && (
                <div className="pm-unit-form">
                    <h4 className="pm-unit-form__title">
                        {(isCreateMode ? editingIndex : editingUnitId) !== null
                            ? 'Chỉnh sửa đơn vị tính'
                            : 'Thêm đơn vị tính mới'}
                    </h4>
                    <div className="pm-form-grid pm-form-grid--compact">
                        <div className="pm-field">
                            <label className="pm-label">Tên ĐVT <span className="pm-required">*</span></label>
                            <input
                                className={`pm-input${formErrors.unitName ? ' pm-input--error' : ''}`}
                                value={unitForm.unitName}
                                onChange={e => setUnitForm(p => ({ ...p, unitName: e.target.value }))}
                                placeholder="VD: Thùng, Lốc, Hộp..."
                                autoFocus
                            />
                            {formErrors.unitName && <span className="pm-field-error">{formErrors.unitName}</span>}
                        </div>

                        <div className="pm-field">
                            <label className="pm-label">Quy đổi <span className="pm-required">*</span></label>
                            <input
                                className={`pm-input${formErrors.conversionFactor ? ' pm-input--error' : ''}`}
                                type="number" min="1"
                                value={unitForm.conversionFactor}
                                onChange={e => setUnitForm(p => ({ ...p, conversionFactor: e.target.value }))}
                                placeholder="VD: 24 (1 thùng = 24 lon)"
                            />
                            {formErrors.conversionFactor && <span className="pm-field-error">{formErrors.conversionFactor}</span>}
                        </div>

                        <div className="pm-field">
                            <label className="pm-label">Giá bán <span className="pm-required">*</span></label>
                            <input
                                className={`pm-input${formErrors.price ? ' pm-input--error' : ''}`}
                                type="number" min="0"
                                value={unitForm.price}
                                onChange={e => setUnitForm(p => ({ ...p, price: e.target.value }))}
                                placeholder="0"
                            />
                            {formErrors.price && <span className="pm-field-error">{formErrors.price}</span>}
                        </div>

                        <div className="pm-field">
                            <label className="pm-label">Barcode</label>
                            <input
                                className="pm-input"
                                value={unitForm.barcode}
                                onChange={e => setUnitForm(p => ({ ...p, barcode: e.target.value }))}
                                placeholder="Barcode riêng cho đơn vị này"
                            />
                        </div>
                    </div>

                    <div className="pm-unit-form__footer">
                        <button className="pm-btn pm-btn--ghost" onClick={handleCancel}>Hủy</button>
                        <button className="pm-btn pm-btn--primary" onClick={handleSubmit}>
                            {(isCreateMode ? editingIndex : editingUnitId) !== null ? 'Cập nhật' : 'Thêm'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductUnitForm;