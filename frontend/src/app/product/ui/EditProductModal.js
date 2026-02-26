import { useState, useEffect } from 'react';
import BaseModal from '../../../components/common/BaseModal';
import ProductInfoForm from './form/ProductInfoForm';
import ProductUnitForm from './form/ProductUnitForm';
import ProductComboForm from './form/ProductComboForm';
import useProductDetail from '../../../hooks/product/useProductDetail';
import './ProductModal.css';

const validateForm = (form) => {
    const errs = {};
    if (!form.code.trim()) errs.code = 'Vui lòng nhập mã sản phẩm';
    if (!form.name.trim()) errs.name = 'Vui lòng nhập tên sản phẩm';
    if (!form.baseUnit.trim()) errs.baseUnit = 'Vui lòng nhập đơn vị cơ bản';
    if (form.salePrice === '' || isNaN(form.salePrice)) errs.salePrice = 'Giá bán không hợp lệ';
    if (form.costPrice === '' || isNaN(form.costPrice)) errs.costPrice = 'Giá vốn không hợp lệ';
    return errs;
};

const EditProductModal = ({ productId, onClose, onSuccess, onError }) => {
    const {
        product, units, comboItems,
        loading, saving, error,
        handleUpdate,
        handleCreateUnit, handleUpdateUnit, handleDeleteUnit,
        handleAddComboItem, handleRemoveComboItem,
        loadComboItems,
    } = useProductDetail(productId);

    const [form, setForm] = useState(null);
    const [errors, setErrors] = useState({});
    const [activeTab, setActiveTab] = useState('info');

    useEffect(() => {
        if (product) {
            setForm({
                code: product.code || '',
                barcode: product.barcode || '',
                name: product.name || '',
                imageUrl: product.imageUrl || '',
                baseUnit: product.baseUnit || '',
                salePrice: String(product.salePrice ?? ''),
                costPrice: String(product.costPrice ?? ''),
                categoryId: String(product.categoryId ?? ''),
                allowDecimalQuantity: product.allowDecimalQuantity ?? 0,
                isCombo: product.isCombo ?? 0,
                status: product.status || 'Selling',
            });
        }
    }, [product]);

    useEffect(() => {
        if (activeTab === 'combo') loadComboItems();
    }, [activeTab, loadComboItems]);

    if (loading || !form) {
        return (
            <BaseModal onClose={onClose} maxWidth="860px">
                <div className="pm-card pm-card--xl">
                    <div className="pm-header">
                        <h2 className="pm-title">Chỉnh sửa sản phẩm</h2>
                        <button className="pm-close" onClick={onClose}>✕</button>
                    </div>
                    <div className="pm-body">
                        <div className="pm-loading">Đang tải...</div>
                    </div>
                </div>
            </BaseModal>
        );
    }

    const isWeight = !!form.allowDecimalQuantity;
    const isCombo = !!form.isCombo;

    const tabs = [
        { key: 'info', label: 'Thông tin' },
        ...(!isWeight && !isCombo ? [{ key: 'units', label: 'Đơn vị tính', badge: units.length }] : []),
        ...(isCombo ? [{ key: 'combo', label: 'Thành phần combo', badge: comboItems.length }] : []),
    ];

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, [field]: undefined }));
    };

    const handleSubmit = async () => {
        const errs = validateForm(form);
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            setActiveTab('info');
            return;
        }

        const payload = {
            ...form,
            salePrice: parseFloat(form.salePrice),
            costPrice: parseFloat(form.costPrice),
            categoryId: form.categoryId ? parseInt(form.categoryId) : null,
            allowDecimalQuantity: Number(form.allowDecimalQuantity),
            isCombo: Number(form.isCombo),
        };

        const res = await handleUpdate(productId, payload);
        if (res.success) onSuccess('Cập nhật sản phẩm thành công');
        else onError(res.message);
    };

    return (
        <BaseModal onClose={onClose} maxWidth="860px">
            <div className="pm-card pm-card--xl">
                <div className="pm-header">
                    <div>
                        <h2 className="pm-title">Chỉnh sửa sản phẩm</h2>
                        <p className="pm-subtitle">{product?.code} — {product?.name}</p>
                    </div>
                    <button className="pm-close" onClick={onClose}>✕</button>
                </div>

                {/* Tabs */}
                {tabs.length > 1 && (
                    <div className="pm-tabs">
                        {tabs.map(t => (
                            <button
                                key={t.key}
                                className={`pm-tab${activeTab === t.key ? ' pm-tab--active' : ''}`}
                                onClick={() => setActiveTab(t.key)}
                            >
                                {t.label}
                                {t.badge > 0 && <span className="pm-tab-badge">{t.badge}</span>}
                            </button>
                        ))}
                    </div>
                )}

                <div className="pm-body">
                    {error && <div className="pm-error">{error}</div>}

                    {/* Tab: Thông tin */}
                    {activeTab === 'info' && (
                        <ProductInfoForm
                            form={form}
                            errors={errors}
                            onChange={handleChange}
                            isEdit={true}
                        />
                    )}

                    {/* Tab: Đơn vị tính */}
                    {activeTab === 'units' && (
                        isWeight ? (
                            <div className="pm-banner pm-banner--warning">
                                ⚠️ Sản phẩm bán theo cân không hỗ trợ đơn vị tính.
                            </div>
                        ) : (
                            <ProductUnitForm
                                productId={productId}
                                units={units}
                                handleCreateUnit={handleCreateUnit}
                                handleUpdateUnit={handleUpdateUnit}
                                handleDeleteUnit={handleDeleteUnit}
                                onError={onError}
                            />
                        )
                    )}

                    {/* Tab: Combo */}
                    {activeTab === 'combo' && (
                        <ProductComboForm
                            productId={productId}
                            comboItems={comboItems}
                            handleAddComboItem={handleAddComboItem}
                            handleRemoveComboItem={handleRemoveComboItem}
                            onError={onError}
                        />
                    )}
                </div>

                {/* Footer */}
                {activeTab === 'info' && (
                    <div className="pm-footer">
                        <button className="pm-btn pm-btn--ghost" onClick={onClose}>Hủy</button>
                        <button className="pm-btn pm-btn--primary" onClick={handleSubmit} disabled={saving}>
                            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                    </div>
                )}
            </div>
        </BaseModal>
    );
};

export default EditProductModal;