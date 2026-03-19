import React from 'react';
import ProductBaseFields from './ProductBaseFields';
export default function RegularProductForm({ form, handleChange, categories, isEdit, errors = {} }) {
    return (
        <>
            {/* Kiểu bán */}
            <div className="mb-4">
                <div className="fw-semibold mb-2">Kiểu bán của sản phẩm</div>
                <div className="row g-2">
                    <div className="col-md-6">
                        <button
                            type="button"
                            className={`btn w-100 text-start ${form.saleMode === 'Số lượng' ? 'btn-warning' : 'btn-outline-warning'}`}
                            onClick={() => handleChange('saleMode', 'piece')}
                        >
                            <i className="bi bi-tag me-2" />
                            Bán theo số lượng
                        </button>
                    </div>

                    <div className="col-md-6">
                        <button
                            type="button"
                            className={`btn w-100 text-start ${form.saleMode === 'Cân nặng' ? 'btn-info' : 'btn-outline-info'}`}
                            onClick={() => handleChange('saleMode', 'weight')}
                        >
                            <i className="bi bi-scale me-2" />
                            Bán theo cân
                        </button>
                    </div>
                </div>
            </div>

            {/* Fields cơ bản */}
            <ProductBaseFields
                form={form}
                handleChange={handleChange}
                categories={categories}
                isCombo={false}
                isEdit={isEdit}
                errors={errors}
            />


            {/* Giá bán + ngưỡng tồn */}
            <div className="row g-3 mb-4">
                <div className="col-md-6">
                    <label className="form-label fw-semibold">Giá bán base đơn vị cơ bản<span className="text-danger">*</span></label>
                    <input
                        className={`form-control ${errors.salePrice ? 'is-invalid' : ''}`}
                        type="number"
                        min="0"
                        value={form.salePrice}
                        onChange={(e) => handleChange('salePrice', e.target.value)}
                    />
                    {errors.salePrice && <div className="text-danger small mt-1">{errors.salePrice}</div>}
                </div>

                <div className="col-md-6">
                    <label className="form-label fw-semibold">Ngưỡng tồn tối thiểu</label>
                    <input
                        className={`form-control ${errors.minThreshold ? 'is-invalid' : ''}`}
                        type="number"
                        min="0"
                        value={form.minThreshold}
                        onChange={(e) => handleChange('minThreshold', e.target.value)}
                    />
                    {errors.minThreshold && <div className="text-danger small mt-1">{errors.minThreshold}</div>}
                </div>
            </div>
        </>
    );
}
