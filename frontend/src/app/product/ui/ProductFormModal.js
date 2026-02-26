import { useState, useEffect } from 'react';
import useProductDetail from '../../../hooks/product/useProductDetail';
import './ProductModal.css';

const UNIT_TYPES = ['PIECE', 'WEIGHT'];

const defaultForm = {
    code: '',
    barcode: '',
    name: '',
    imageUrl: '',
    baseUnit: '',
    salePrice: '',
    costPrice: '',
    categoryId: '',
    status: 'Selling',
};

const defaultUnitForm = {
    unitName: '',
    unitType: 'PIECE',
    conversionFactor: '',
    price: '',
    barcode: '',
};

const ProductFormModal = ({ productId, onClose, onSuccess, onError }) => {
    const isEdit = !!productId;
    const {
        product, units, loading, saving,
        handleCreate, handleUpdate,
        handleCreateUnit, handleUpdateUnit, handleDeleteUnit,
    } = useProductDetail(productId);

    const [form, setForm] = useState(defaultForm);
    const [unitForm, setUnitForm] = useState(defaultUnitForm);
    const [editingUnitId, setEditingUnitId] = useState(null);
    const [showUnitForm, setShowUnitForm] = useState(false);
    const [activeTab, setActiveTab] = useState('info');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isEdit && product) {
            setForm({
                code: product.code || '',
                barcode: product.barcode || '',
                name: product.name || '',
                imageUrl: product.imageUrl || '',
                baseUnit: product.baseUnit || '',
                salePrice: product.salePrice ?? '',
                costPrice: product.costPrice ?? '',
                categoryId: product.categoryId ?? '',
                status: product.status || 'Selling',
            });
        }
    }, [product, isEdit]);

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, [field]: undefined }));
    };

    const validate = () => {
        const errs = {};
        if (!form.code.trim()) errs.code = 'Vui lòng nhập mã sản phẩm';
        if (!form.name.trim()) errs.name = 'Vui lòng nhập tên sản phẩm';
        if (!form.baseUnit.trim()) errs.baseUnit = 'Vui lòng nhập đơn vị cơ bản';
        if (form.salePrice === '' || isNaN(form.salePrice)) errs.salePrice = 'Giá bán không hợp lệ';
        if (form.costPrice === '' || isNaN(form.costPrice)) errs.costPrice = 'Giá vốn không hợp lệ';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        const payload = {
            ...form,
            salePrice: parseFloat(form.salePrice),
            costPrice: parseFloat(form.costPrice),
            categoryId: form.categoryId ? parseInt(form.categoryId) : null,
        };
        let res;
        if (isEdit) {
            res = await handleUpdate(productId, payload);
            if (res.success) onSuccess('Cập nhật sản phẩm thành công');
            else onError(res.message);
        } else {
            res = await handleCreate(payload);
            if (res.success) onSuccess('Tạo sản phẩm thành công');
            else onError(res.message);
        }
    };

    // Unit form
    const handleUnitChange = (field, value) => {
        setUnitForm(prev => ({ ...prev, [field]: value }));
    };

    const handleEditUnit = (unit) => {
        setEditingUnitId(unit.id);
        setUnitForm({
            unitName: unit.unitName,
            unitType: unit.unitType,
            conversionFactor: unit.conversionFactor,
            price: unit.price,
            barcode: unit.barcode || '',
        });
        setShowUnitForm(true);
    };

    const handleSubmitUnit = async () => {
        if (!unitForm.unitName || !unitForm.conversionFactor || !unitForm.price) return;
        const payload = {
            ...unitForm,
            productId: productId,
            conversionFactor: parseFloat(unitForm.conversionFactor),
            price: parseFloat(unitForm.price),
        };
        const res = editingUnitId
            ? await handleUpdateUnit(editingUnitId, payload)
            : await handleCreateUnit(payload);

        if (res.success) {
            setUnitForm(defaultUnitForm);
            setEditingUnitId(null);
            setShowUnitForm(false);
        } else {
            onError(res.message);
        }
    };

    const handleRemoveUnit = async (unitId) => {
        const res = await handleDeleteUnit(unitId);
        if (!res.success) onError(res.message);
    };

    const cancelUnitForm = () => {
        setUnitForm(defaultUnitForm);
        setEditingUnitId(null);
        setShowUnitForm(false);
    };

    const formatPrice = (val) =>
        val != null ? Number(val).toLocaleString('vi-VN') + 'đ' : '—';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal modal--lg" onClick={e => e.stopPropagation()}>
                <div className="modal__header">
                    <h2 className="modal__title">
                        {isEdit ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                    </h2>
                    <button className="modal__close" onClick={onClose}>✕</button>
                </div>

                {isEdit && (
                    <div className="modal__tabs">
                        <button
                            className={`modal__tab${activeTab === 'info' ? ' modal__tab--active' : ''}`}
                            onClick={() => setActiveTab('info')}
                        >
                            Thông tin
                        </button>
                        <button
                            className={`modal__tab${activeTab === 'units' ? ' modal__tab--active' : ''}`}
                            onClick={() => setActiveTab('units')}
                        >
                            Đơn vị tính
                            {units.length > 0 && <span className="tab-badge">{units.length}</span>}
                        </button>
                    </div>
                )}

                <div className="modal__body">
                    {loading ? (
                        <div className="modal-loading">Đang tải...</div>
                    ) : (
                        <>
                            {/* Tab: Thông tin */}
                            {(activeTab === 'info' || !isEdit) && (
                                <div className="form-grid">
                                    <div className="form-field">
                                        <label className="form-label">Mã sản phẩm <span className="required">*</span></label>
                                        <input
                                            className={`form-input${errors.code ? ' form-input--error' : ''}`}
                                            value={form.code}
                                            onChange={e => handleChange('code', e.target.value)}
                                            placeholder="VD: SP001"
                                        />
                                        {errors.code && <span className="form-error">{errors.code}</span>}
                                    </div>

                                    <div className="form-field">
                                        <label className="form-label">Barcode</label>
                                        <input
                                            className="form-input"
                                            value={form.barcode}
                                            onChange={e => handleChange('barcode', e.target.value)}
                                            placeholder="VD: 8935235..."
                                        />
                                    </div>

                                    <div className="form-field form-field--full">
                                        <label className="form-label">Tên sản phẩm <span className="required">*</span></label>
                                        <input
                                            className={`form-input${errors.name ? ' form-input--error' : ''}`}
                                            value={form.name}
                                            onChange={e => handleChange('name', e.target.value)}
                                            placeholder="Nhập tên sản phẩm..."
                                        />
                                        {errors.name && <span className="form-error">{errors.name}</span>}
                                    </div>

                                    <div className="form-field">
                                        <label className="form-label">Đơn vị cơ bản <span className="required">*</span></label>
                                        <input
                                            className={`form-input${errors.baseUnit ? ' form-input--error' : ''}`}
                                            value={form.baseUnit}
                                            onChange={e => handleChange('baseUnit', e.target.value)}
                                            placeholder="VD: Cái, Kg, Lon..."
                                        />
                                        {errors.baseUnit && <span className="form-error">{errors.baseUnit}</span>}
                                    </div>

                                    <div className="form-field">
                                        <label className="form-label">Danh mục</label>
                                        <input
                                            className="form-input"
                                            type="number"
                                            value={form.categoryId}
                                            onChange={e => handleChange('categoryId', e.target.value)}
                                            placeholder="ID danh mục"
                                        />
                                    </div>

                                    <div className="form-field">
                                        <label className="form-label">Giá vốn <span className="required">*</span></label>
                                        <input
                                            className={`form-input${errors.costPrice ? ' form-input--error' : ''}`}
                                            type="number"
                                            value={form.costPrice}
                                            onChange={e => handleChange('costPrice', e.target.value)}
                                            placeholder="0"
                                            min="0"
                                        />
                                        {errors.costPrice && <span className="form-error">{errors.costPrice}</span>}
                                    </div>

                                    <div className="form-field">
                                        <label className="form-label">Giá bán <span className="required">*</span></label>
                                        <input
                                            className={`form-input${errors.salePrice ? ' form-input--error' : ''}`}
                                            type="number"
                                            value={form.salePrice}
                                            onChange={e => handleChange('salePrice', e.target.value)}
                                            placeholder="0"
                                            min="0"
                                        />
                                        {errors.salePrice && <span className="form-error">{errors.salePrice}</span>}
                                    </div>

                                    <div className="form-field form-field--full">
                                        <label className="form-label">URL hình ảnh</label>
                                        <input
                                            className="form-input"
                                            value={form.imageUrl}
                                            onChange={e => handleChange('imageUrl', e.target.value)}
                                            placeholder="https://..."
                                        />
                                    </div>

                                    {isEdit && (
                                        <div className="form-field">
                                            <label className="form-label">Trạng thái</label>
                                            <select
                                                className="form-input"
                                                value={form.status}
                                                onChange={e => handleChange('status', e.target.value)}
                                            >
                                                <option value="Selling">Đang bán</option>
                                                <option value="StopSelling">Ngừng bán</option>
                                                <option value="Suspended">Tạm khóa</option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Tab: Đơn vị tính */}
                            {activeTab === 'units' && isEdit && (
                                <div className="units-tab">
                                    {units.length > 0 && (
                                        <table className="detail-table">
                                            <thead>
                                                <tr>
                                                    <th>Tên ĐVT</th>
                                                    <th>Loại</th>
                                                    <th>Quy đổi</th>
                                                    <th>Giá bán</th>
                                                    <th>Barcode</th>
                                                    <th></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {units.map(u => (
                                                    <tr key={u.id}>
                                                        <td>{u.unitName}</td>
                                                        <td>{u.unitType}</td>
                                                        <td>{u.conversionFactor}</td>
                                                        <td className="cell--price">{formatPrice(u.price)}</td>
                                                        <td>{u.barcode || '—'}</td>
                                                        <td>
                                                            <div className="action-btns">
                                                                <button className="action-btn action-btn--edit" onClick={() => handleEditUnit(u)} title="Sửa">✏️</button>
                                                                <button className="action-btn action-btn--stop" onClick={() => handleRemoveUnit(u.id)} title="Xóa">🗑</button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}

                                    {!showUnitForm && (
                                        <button className="btn btn--ghost btn--add-unit" onClick={() => setShowUnitForm(true)}>
                                            + Thêm đơn vị tính
                                        </button>
                                    )}

                                    {showUnitForm && (
                                        <div className="unit-form">
                                            <h4 className="unit-form__title">
                                                {editingUnitId ? 'Chỉnh sửa đơn vị' : 'Thêm đơn vị tính'}
                                            </h4>
                                            <div className="form-grid form-grid--compact">
                                                <div className="form-field">
                                                    <label className="form-label">Tên ĐVT <span className="required">*</span></label>
                                                    <input className="form-input" value={unitForm.unitName} onChange={e => handleUnitChange('unitName', e.target.value)} placeholder="VD: Thùng, Lốc..." />
                                                </div>
                                                <div className="form-field">
                                                    <label className="form-label">Loại</label>
                                                    <select className="form-input" value={unitForm.unitType} onChange={e => handleUnitChange('unitType', e.target.value)}>
                                                        {UNIT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                                    </select>
                                                </div>
                                                <div className="form-field">
                                                    <label className="form-label">Quy đổi <span className="required">*</span></label>
                                                    <input className="form-input" type="number" value={unitForm.conversionFactor} onChange={e => handleUnitChange('conversionFactor', e.target.value)} placeholder="VD: 24" min="0" />
                                                </div>
                                                <div className="form-field">
                                                    <label className="form-label">Giá bán <span className="required">*</span></label>
                                                    <input className="form-input" type="number" value={unitForm.price} onChange={e => handleUnitChange('price', e.target.value)} placeholder="0" min="0" />
                                                </div>
                                                <div className="form-field">
                                                    <label className="form-label">Barcode</label>
                                                    <input className="form-input" value={unitForm.barcode} onChange={e => handleUnitChange('barcode', e.target.value)} placeholder="Barcode đơn vị này" />
                                                </div>
                                            </div>
                                            <div className="unit-form__btns">
                                                <button className="btn btn--ghost" onClick={cancelUnitForm}>Hủy</button>
                                                <button className="btn btn--primary" onClick={handleSubmitUnit}>
                                                    {editingUnitId ? 'Cập nhật' : 'Thêm'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {(activeTab === 'info' || !isEdit) && (
                    <div className="modal__footer">
                        <button className="btn btn--ghost" onClick={onClose}>Hủy</button>
                        <button className="btn btn--primary" onClick={handleSubmit} disabled={saving}>
                            {saving ? 'Đang lưu...' : (isEdit ? 'Lưu thay đổi' : 'Tạo sản phẩm')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductFormModal;