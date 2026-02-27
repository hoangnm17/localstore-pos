import { useEffect, useState, useRef } from 'react';
import categoryService from '../../../../services/categoryService';
import '../ProductModal.css';

/**
 * Flatten nested tree [{id, name, parentId, children:[...]}]
 * thành mảng phẳng [{id, name, parentId}]
 */
function flattenTree(nodes, parentId = null) {
    const result = [];
    for (const node of nodes) {
        result.push({ id: node.id, name: node.name, parentId: node.parentId || parentId });
        if (node.children?.length) {
            result.push(...flattenTree(node.children, node.id));
        }
    }
    return result;
}

/* ─── Inline Create Category Mini-Form ─── */
const InlineCategoryCreate = ({ parentCategories, onCreated, onCancel }) => {
    const [name, setName] = useState('');
    const [parentId, setParentId] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef(null);

    useEffect(() => { inputRef.current?.focus(); }, []);

    const handleSave = async () => {
        if (!name.trim()) { setError('Vui lòng nhập tên danh mục'); return; }
        if (!parentId) { setError('Vui lòng chọn danh mục cha'); return; }
        setSaving(true); setError('');
        const res = await categoryService.createCategory({ name: name.trim(), parentId: parseInt(parentId) });
        setSaving(false);
        if (res.success === false) { setError(res.message || 'Tạo danh mục thất bại'); return; }
        // Backend trả về { success: true, id: <number> }
        const newId = res.data?.id ?? res.id;
        onCreated({ id: newId, name: name.trim(), parentId: parseInt(parentId) });
    };

    return (
        <div className="pm-inline-cat">
            <div className="pm-inline-cat__title">➕ Tạo danh mục mới</div>
            {error && <div className="pm-inline-cat__error">{error}</div>}
            <div className="pm-inline-cat__row">
                <div className="pm-inline-cat__field">
                    <label className="pm-label">Danh mục cha <span className="pm-required">*</span></label>
                    <select
                        className="pm-select"
                        value={parentId}
                        onChange={e => setParentId(e.target.value)}
                    >
                        <option value="">-- Chọn danh mục cha --</option>
                        {parentCategories.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
                <div className="pm-inline-cat__field">
                    <label className="pm-label">Tên danh mục con <span className="pm-required">*</span></label>
                    <input
                        ref={inputRef}
                        className="pm-input"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onCancel(); }}
                        placeholder="VD: Nước ngọt, Bánh kẹo..."
                    />
                </div>
            </div>
            <div className="pm-inline-cat__actions">
                <button className="pm-btn pm-btn--ghost pm-btn--sm" onClick={onCancel} disabled={saving}>Hủy</button>
                <button className="pm-btn pm-btn--primary pm-btn--sm" onClick={handleSave} disabled={saving}>
                    {saving ? 'Đang tạo...' : 'Tạo danh mục'}
                </button>
            </div>
        </div>
    );
};

/* ─── Main Form ─── */
const ProductInfoForm = ({ form, errors, onChange, isEdit = false, disableType = false }) => {
    const [allCategories, setAllCategories] = useState([]);  // flat list {id, name, parentId}
    const [showCreate, setShowCreate] = useState(false);

    const fetchCategories = () => {
        // Dùng /categories/tree để lấy cả cha lẫn con, rồi flatten
        categoryService.fetchCategoryTree('', 1, 999).then(res => {
            if (res.success !== false) {
                const tree = res.data?.data || [];
                setAllCategories(flattenTree(tree));
            }
        });
    };

    useEffect(() => { fetchCategories(); }, []);

    const isWeight = !!form.allowDecimalQuantity;

    // Tách cha / con từ flat list
    const parentCategories = allCategories.filter(c => !c.parentId);
    const childCategories = allCategories.filter(c => !!c.parentId);

    const handleCategoryCreated = (newCat) => {
        setAllCategories(prev => [...prev, newCat]);
        onChange('categoryId', String(newCat.id));
        setShowCreate(false);
    };

    return (
        <div className="pm-form-grid">
            <div className="pm-field">
                <label className="pm-label">Mã sản phẩm <span className="pm-required">*</span></label>
                <input
                    className={`pm-input${errors.code ? ' pm-input--error' : ''}`}
                    value={form.code}
                    onChange={e => onChange('code', e.target.value)}
                    placeholder="VD: SP001"
                />
                {errors.code && <span className="pm-field-error">{errors.code}</span>}
            </div>

            <div className="pm-field">
                <label className="pm-label">Barcode</label>
                <input
                    className="pm-input"
                    value={form.barcode}
                    onChange={e => onChange('barcode', e.target.value)}
                    placeholder="VD: 8935235..."
                />
            </div>

            <div className="pm-field pm-field--full">
                <label className="pm-label">Tên sản phẩm <span className="pm-required">*</span></label>
                <input
                    className={`pm-input${errors.name ? ' pm-input--error' : ''}`}
                    value={form.name}
                    onChange={e => onChange('name', e.target.value)}
                    placeholder="Nhập tên sản phẩm..."
                />
                {errors.name && <span className="pm-field-error">{errors.name}</span>}
            </div>

            <div className="pm-field">
                <label className="pm-label">Đơn vị cơ bản <span className="pm-required">*</span></label>
                <input
                    className={`pm-input${errors.baseUnit ? ' pm-input--error' : ''}`}
                    value={form.baseUnit}
                    onChange={e => onChange('baseUnit', e.target.value)}
                    placeholder="VD: Cái, Kg, Lon..."
                />
                {errors.baseUnit && <span className="pm-field-error">{errors.baseUnit}</span>}
            </div>

            {/* ── Danh mục: chỉ hiện danh mục con, nhóm theo optgroup cha ── */}
            <div className="pm-field">
                <div className="pm-cat-label-row">
                    <label className="pm-label">Danh mục</label>
                    {!showCreate && (
                        <button
                            type="button"
                            className="pm-cat-create-btn"
                            onClick={() => setShowCreate(true)}
                            title="Tạo danh mục mới ngay tại đây"
                        >
                            ＋ Tạo mới
                        </button>
                    )}
                </div>
                <select
                    className="pm-select"
                    value={form.categoryId}
                    onChange={e => onChange('categoryId', e.target.value)}
                    disabled={showCreate}
                >
                    <option value="">-- Chọn danh mục --</option>
                    {parentCategories.map(parent => {
                        const children = childCategories.filter(c => c.parentId === parent.id);
                        if (children.length === 0) return null;
                        return (
                            <optgroup key={parent.id} label={`📂 ${parent.name}`}>
                                {children.map(child => (
                                    <option key={child.id} value={child.id}>{child.name}</option>
                                ))}
                            </optgroup>
                        );
                    })}
                </select>
            </div>

            <div className="pm-field">
                <label className="pm-label">Giá vốn <span className="pm-required">*</span></label>
                <input
                    className={`pm-input${errors.costPrice ? ' pm-input--error' : ''}`}
                    type="number" min="0"
                    value={form.costPrice}
                    onChange={e => onChange('costPrice', e.target.value)}
                    placeholder="0"
                />
                {errors.costPrice && <span className="pm-field-error">{errors.costPrice}</span>}
            </div>

            <div className="pm-field">
                <label className="pm-label">Giá bán <span className="pm-required">*</span></label>
                <input
                    className={`pm-input${errors.salePrice ? ' pm-input--error' : ''}`}
                    type="number" min="0"
                    value={form.salePrice}
                    onChange={e => onChange('salePrice', e.target.value)}
                    placeholder="0"
                />
                {errors.salePrice && <span className="pm-field-error">{errors.salePrice}</span>}
            </div>

            <div className="pm-field pm-field--full">
                <label className="pm-label">Hình ảnh</label>

                {/* Preview */}
                {form.imageUrl && (
                    <div className="pm-img-preview">
                        <img
                            src={form.imageUrl}
                            alt="preview"
                            className="pm-img-preview__thumb"
                        />
                        <button
                            type="button"
                            className="pm-img-preview__remove"
                            onClick={() => { onChange('imageUrl', ''); }}
                            title="Xóa ảnh"
                        >✕</button>
                    </div>
                )}

                {/* Upload file */}
                <input
                    type="file"
                    accept="image/*"
                    className="pm-input pm-input--file"
                    onChange={e => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => onChange('imageUrl', reader.result);
                        reader.readAsDataURL(file);
                        e.target.value = '';   // reset để chọn cùng file lại được
                    }}
                />

                {/* Hoặc nhập URL thủ công */}
                <input
                    className="pm-input"
                    value={form.imageUrl?.startsWith('data:') ? '' : (form.imageUrl || '')}
                    onChange={e => onChange('imageUrl', e.target.value)}
                    placeholder="Hoặc nhập URL ảnh (https://...)"
                />
            </div>


            {/* Inline tạo danh mục mới */}
            {showCreate && (
                <div className="pm-field pm-field--full">
                    <InlineCategoryCreate
                        parentCategories={parentCategories}
                        onCreated={handleCategoryCreated}
                        onCancel={() => setShowCreate(false)}
                    />
                </div>
            )}

            {/* Loại sản phẩm */}
            {!disableType && (
                <div className="pm-field pm-field--full">
                    <label className="pm-label">Loại sản phẩm</label>
                    <div className="pm-toggle-row">
                        <label className="pm-toggle">
                            <input
                                type="checkbox"
                                checked={isWeight}
                                onChange={e => {
                                    onChange('allowDecimalQuantity', e.target.checked ? 1 : 0);
                                    if (e.target.checked) onChange('isCombo', 0);
                                }}
                            />
                            <span className="pm-toggle__box"></span>
                            <span>Bán theo cân / số lẻ</span>
                            <span className="pm-toggle__hint">(cho phép nhập số lẻ)</span>
                        </label>
                    </div>
                </div>
            )}

            {isEdit && (
                <div className="pm-field">
                    <label className="pm-label">Trạng thái</label>
                    <select
                        className="pm-select"
                        value={form.status}
                        onChange={e => onChange('status', e.target.value)}
                    >
                        <option value="Selling">Đang bán</option>
                        <option value="StopSelling">Ngừng bán</option>
                    </select>
                </div>
            )}
        </div>
    );
};

export default ProductInfoForm;