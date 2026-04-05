import React, { useState, useEffect } from 'react';
import categoryService from '../../../services/Category/category.service';
import { uploadImage } from '../../../services/imageUpload.service';
import { getImageUrl } from 'utils/image';
import { flattenTree } from '../../../utils/categoryTree';

export default function CategoryForm({ form, change, submit, onDone, editId }) {
    const [categories, setCategories] = useState([]);
    const [preview, setPreview] = useState(form.imageUrl ? getImageUrl(form.imageUrl) : null);

    useEffect(() => {
        categoryService.fetchCategoryTree('', 1, 100).then(res => {
            setCategories(flattenTree(res.data || []));
        });
    }, []);



    useEffect(() => {
        setPreview(form.imageUrl ? getImageUrl(form.imageUrl) : null);
    }, [form.imageUrl]);

    useEffect(() => {
        return () => {
            if (preview && preview.startsWith('blob:')) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    async function handleSubmit() {
        const success = await submit();
        if (success) {
            onDone();
        }
    }

    async function handleFileChange(e) {
        const file = e.target.files[0];
        if (!file) return;

        const tempUrl = URL.createObjectURL(file);
        setPreview(tempUrl);

        try {
            const data = await uploadImage(file);
            if (data.success) {
                URL.revokeObjectURL(tempUrl);
                change('imageUrl', data.imageUrl);
                setPreview(getImageUrl(data.imageUrl));
            } else {
                URL.revokeObjectURL(tempUrl);
                alert('Upload thất bại: ' + data.message);
            }
        } catch (err) {
            URL.revokeObjectURL(tempUrl);
            alert('Lỗi kết nối khi upload ảnh.');
        }
    }

    function handleUrlChange(e) {
        const url = e.target.value;
        change('imageUrl', url);
        setPreview(url || null);
    }

    function handleRemoveImage() {
        setPreview(null);
        change('imageUrl', '');
    }

    return (
        <div>
            <div className="mb-3">
                <label className="form-label">
                    Tên danh mục <span className="text-danger">*</span>
                </label>
                <input
                    className="form-control"
                    value={form.name}
                    onChange={e => change('name', e.target.value)}
                    placeholder="Nhập tên danh mục"
                />
            </div>

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
                        .filter(c => c.id !== editId)
                        .map(c => {
                            const hasProduct = c.productCount > 0;
                            const prefix = '　'.repeat(c.level) + (c.level > 0 ? '└ ' : '');
                            return (
                                <option
                                    key={c.id}
                                    value={c.id}
                                    disabled={hasProduct}
                                    style={hasProduct ? { color: '#aaa' } : {}}
                                >
                                    {prefix}{c.name}{hasProduct ? ' (đã có sản phẩm)' : ''}
                                </option>
                            );
                        })}
                </select>
            </div>

            <div className="mb-3">
                <label className="form-label">
                    Ảnh danh mục <span className="text-muted small">(không bắt buộc)</span>
                </label>

                {preview && (
                    <div className="mb-2 position-relative d-inline-block">
                        <img
                            src={preview}
                            alt="preview"
                            style={{
                                width: 80,
                                height: 80,
                                objectFit: 'cover',
                                borderRadius: 6,
                                border: '1px solid #dee2e6'
                            }}
                            onError={() => setPreview(null)}
                        />
                        <button
                            type="button"
                            className="btn btn-sm btn-danger position-absolute top-0 end-0"
                            style={{ padding: '1px 5px', fontSize: 10 }}
                            onClick={handleRemoveImage}
                        >
                            ✕
                        </button>
                    </div>
                )}

                <div className="text-muted small mb-1">Chọn file từ máy tính:</div>
                <input
                    type="file"
                    className="form-control mb-2"
                    accept="image/*"
                    onChange={handleFileChange}
                />

                <div className="text-muted small mb-1">Hoặc nhập URL ảnh:</div>
                <input
                    type="text"
                    className="form-control"
                    value={form.imageUrl || ''}
                    onChange={handleUrlChange}
                    placeholder="https://example.com/image.jpg"
                />
            </div>

            <div className="d-flex justify-content-end gap-2 mt-3">
                <button type="button" className="btn btn-primary" onClick={handleSubmit}>
                    Lưu
                </button>
            </div>
        </div>
    );
}