import React, { useState } from 'react';
import { getImageUrl } from 'utils/image';
import { uploadImage } from '../../../services/imageUpload.service';
export default function ProductBaseFields({ form, handleChange, categories, isCombo, isEdit }) {
    const [preview, setPreview] = useState(form.imageUrl ? getImageUrl(form.imageUrl) : null);

    async function handleFileChange(e) {
        const file = e.target.files[0];
        if (!file) return;

        setPreview(URL.createObjectURL(file));

        try {
            const data = await uploadImage(file);
            if (data.success) {
                handleChange('imageUrl', data.imageUrl);
            } else {
                alert('Upload thất bại: ' + data.message);
            }
        } catch (err) {
            alert('Lỗi kết nối khi upload ảnh.');
        }
    }

    function handleUrlChange(e) {
        const url = e.target.value;
        handleChange('imageUrl', url);
        setPreview(url || null);
    }

    function handleRemoveImage() {
        setPreview(null);
        handleChange('imageUrl', '');
    }

    return (
        <div className="row g-3 mb-4">
            <div className="col-md-6">
                <label className="form-label fw-semibold">Mã sản phẩm<span className="text-danger">*</span></label>
                <input
                    className="form-control"
                    value={form.code}
                    disabled={isEdit}
                    onChange={(e) => handleChange('code', e.target.value)}
                />
            </div>

            <div className="col-md-6">
                <label className="form-label fw-semibold">Tên sản phẩm<span className="text-danger">*</span></label>
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
                <label className="form-label fw-semibold">Đơn vị cơ bản<span className="text-danger">*</span></label>
                <input
                    className="form-control"
                    value={form.baseUnit}
                    onChange={(e) => handleChange('baseUnit', e.target.value)}
                    placeholder={isCombo ? 'Combo' : form.saleMode === 'weight' ? 'Kg' : 'Cái'}
                />
            </div>

            <div className="col-md-6">
                <label className="form-label fw-semibold">Barcode đơn vị cơ bản</label>
                <input
                    className="form-control"
                    value={form.barcode}
                    onChange={(e) => handleChange('barcode', e.target.value)}
                />
            </div>

            <div className="col-12">
                <label className="form-label fw-semibold">Ảnh sản phẩm</label>

                {/* Preview */}
                {preview && (
                    <div className="mb-2 position-relative d-inline-block">
                        <img
                            src={preview}
                            alt="preview"
                            style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6, border: '1px solid #dee2e6' }}
                            onError={() => setPreview(null)}
                        />
                        <button
                            type="button"
                            className="btn btn-sm btn-danger position-absolute top-0 end-0"
                            style={{ padding: '1px 5px', fontSize: 10 }}
                            onClick={handleRemoveImage}
                        >✕</button>
                    </div>
                )}

                {/* Chọn file */}
                <div className="text-muted small mb-1">Chọn file từ máy tính:</div>
                <input
                    type="file"
                    className="form-control mb-2"
                    accept="image/*"
                    onChange={handleFileChange}
                />

                {/* Nhập URL */}
                <div className="text-muted small mb-1">Hoặc nhập URL ảnh:</div>
                <input
                    type="text"
                    className="form-control"
                    value={form.imageUrl || ''}
                    onChange={handleUrlChange}
                    placeholder="https://example.com/image.jpg"
                />
            </div>
        </div>
    );
}
