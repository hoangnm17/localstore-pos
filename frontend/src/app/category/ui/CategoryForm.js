import React, { useState, useEffect } from 'react';
import categoryService from '../../../services/categoryService';

export default function CategoryForm({ form, change, submit, onDone, editId }) {
    const [categories, setCategories] = useState([]);
    const [preview, setPreview] = useState(form.imageUrl || null);

    useEffect(() => {
        categoryService.fetchCategoryTree('', 1, 100).then(res => {
            // Flatten tree để hiển thị trong dropdown
            const flat = [];
            function flatten(items, level = 0) {
                items.forEach(item => {
                    flat.push({ ...item, level });
                    if (item.children?.length) flatten(item.children, level + 1);
                });
            }
            flatten(res.data?.data || res.data || []);
            setCategories(flat);
        });
    }, []);

    async function onSubmit(e) {
        e.preventDefault();
        await submit();
        onDone();
    }

    function handleFileChange(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Tạo preview local
        const url = URL.createObjectURL(file);
        setPreview(url);

        // Nếu backend có endpoint upload ảnh thì gọi ở đây
        // Tạm thời lưu tên file hoặc base64
        const reader = new FileReader();
        reader.onload = () => change('imageUrl', reader.result);
        reader.readAsDataURL(file);
    }

    function handleRemoveImage() {
        setPreview(null);
        change('imageUrl', '');
    }

    return (
        <form onSubmit={onSubmit}>
            {/* Tên danh mục */}
            <div className="mb-3">
                <label className="form-label">Tên danh mục <span className="text-danger">*</span></label>
                <input
                    className="form-control"
                    value={form.name}
                    onChange={e => change('name', e.target.value)}
                    placeholder="Nhập tên danh mục"
                />
            </div>

            {/* Danh mục cha */}
            <div className="mb-3">
                <label className="form-label">
                    Danh mục cha <span className="text-muted small">(không bắt buộc)</span>
                </label>
                <select
                    className="form-select"
                    value={form.parentId || ''}
                    onChange={e => change('parentId', e.target.value ? parseInt(e.target.value) : null)}
                >
                    <option value="">-- Là danh mục gốc --</option>
                    {categories
                        .filter(c => c.id !== editId) // không chọn chính nó làm cha
                        .map(c => (
                            <option key={c.id} value={c.id}>
                                {'　'.repeat(c.level)}{c.level > 0 ? '└ ' : ''}{c.name}
                            </option>
                        ))
                    }
                </select>
            </div>

            {/* Ảnh */}
            <div className="mb-3">
                <label className="form-label">
                    Ảnh danh mục <span className="text-muted small">(không bắt buộc)</span>
                </label>
                {preview && (
                    <div className="mb-2 position-relative d-inline-block">
                        <img
                            src={preview}
                            alt="preview"
                            style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6, border: '1px solid #dee2e6' }}
                        />
                        <button
                            type="button"
                            className="btn btn-sm btn-danger position-absolute top-0 end-0"
                            style={{ padding: '1px 5px', fontSize: 10 }}
                            onClick={handleRemoveImage}
                        >✕</button>
                    </div>
                )}

                {/* Upload file */}
                <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handleFileChange}
                />

                {/* Hoặc nhập URL */}
                <input
                    type="text"
                    className="form-control mt-2"
                    value={form.imageUrl?.startsWith('data:') ? '' : (form.imageUrl || '')}
                    onChange={e => { change('imageUrl', e.target.value); setPreview(e.target.value || null); }}
                    placeholder="Hoặc nhập URL ảnh..."
                />
            </div>

            <div className="d-flex justify-content-end gap-2 mt-3">
                <button type="submit" className="btn btn-primary">Lưu</button>
            </div>
        </form>
    );
}