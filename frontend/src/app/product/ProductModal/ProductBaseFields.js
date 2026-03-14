import React from 'react';
export default function ProductBaseFields({ form, handleChange, categories, isCombo, isEdit }) {
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
                <label className="form-label fw-semibold">Ảnh sản phẩm (URL)</label>
                <input
                    className="form-control"
                    value={form.imageUrl}
                    onChange={(e) => handleChange('imageUrl', e.target.value)}
                />
            </div>
        </div>
    );
}
