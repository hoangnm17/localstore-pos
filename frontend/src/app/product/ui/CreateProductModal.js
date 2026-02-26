import { useState } from 'react';
import BaseModal from '../../../components/common/BaseModal';
import ProductInfoForm from './form/ProductInfoForm';
import ProductUnitForm from './form/ProductUnitForm';
import useProductDetail from '../../../hooks/product/useProductDetail';
import './ProductModal.css';

const defaultForm = {
    code: '', barcode: '', name: '', imageUrl: '',
    baseUnit: '', salePrice: '', costPrice: '',
    categoryId: '', allowDecimalQuantity: 0, isCombo: 0,
};

const validateForm = (form) => {
    const errs = {};
    if (!form.code.trim()) errs.code = 'Vui lòng nhập mã sản phẩm';
    if (form.code.trim() === form.barcode.trim()) errs.barcode = 'Mã vạch trùng với mã sản phẩm';
    if (form.code.trim() === form.name.trim()) errs.name = 'Sản phẩm đã tồn tại';
    if (!form.name.trim()) errs.name = 'Vui lòng nhập tên sản phẩm';
    if (!form.baseUnit.trim()) errs.baseUnit = 'Vui lòng nhập đơn vị cơ bản';
    if (form.salePrice === '' || isNaN(form.salePrice)) errs.salePrice = 'Giá bán không hợp lệ';
    if (form.costPrice === '' || isNaN(form.costPrice)) errs.costPrice = 'Giá vốn không hợp lệ';
    return errs;
};

const CreateProductModal = ({ onClose, onSuccess, onError }) => {
    const [form, setForm] = useState(defaultForm);
    const [errors, setErrors] = useState({});
    const [activeTab, setActiveTab] = useState('info');
    const [pendingUnits, setPendingUnits] = useState([]);

    // Dùng useProductDetail không có productId để lấy handleCreate
    const { handleCreate, saving } = useProductDetail(null);

    const isWeight = !!form.allowDecimalQuantity;
    const isCombo = !!form.isCombo;

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, [field]: undefined }));
    };

    const tabs = [
        { key: 'info', label: 'Thông tin' },
        // Tab units chỉ hiện khi không phải weight và không phải combo
        ...(!isWeight && !isCombo ? [{ key: 'units', label: 'Đơn vị tính', badge: pendingUnits.length }] : []),
    ];

    const handleSubmit = async () => {
        const errs = validateForm(form);
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            setActiveTab('info'); // Nhảy về tab info nếu có lỗi
            return;
        }

        const payload = {
            ...form,
            salePrice: parseFloat(form.salePrice),
            costPrice: parseFloat(form.costPrice),
            categoryId: form.categoryId ? parseInt(form.categoryId) : null,
            allowDecimalQuantity: Number(form.allowDecimalQuantity),
            isCombo: 0,
        };

        //Tạo sản phẩm
        const res = await handleCreate(payload);
        if (!res.success) { onError(res.message); return; }

        const newProductId = res.id;

        //Tạo units nếu có (chỉ khi PIECE)
        if (!isWeight && pendingUnits.length > 0) {
            const { createProductUnit } = await import('../../../services/Product/product.service');
            const unitResults = await Promise.all(
                pendingUnits.map(u => createProductUnit({ ...u, productId: newProductId }))
            );
            const failed = unitResults.find(r => r.success === false);
            if (failed) {
                // Sản phẩm đã tạo thành công nhưng 1 vài unit lỗi
                onSuccess(`Tạo sản phẩm thành công. Lưu ý: một số đơn vị tính chưa được lưu (${failed.message})`);
                return;
            }
        }

        onSuccess('Tạo sản phẩm thành công');
    };

    return (
        <BaseModal onClose={onClose} maxWidth="860px">
            <div className="pm-card pm-card--xl">
                <div className="pm-header">
                    <div>
                        <h2 className="pm-title">Thêm sản phẩm mới</h2>
                        <p className="pm-subtitle">Điền thông tin sản phẩm bên dưới</p>
                    </div>
                    <button className="pm-close" onClick={onClose}>✕</button>
                </div>

                {/* Tabs - chỉ hiện khi có hơn 1 tab */}
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
                    {activeTab === 'info' && (
                        <ProductInfoForm
                            form={form}
                            errors={errors}
                            onChange={handleChange}
                            isEdit={false}
                        />
                    )}

                    {activeTab === 'units' && (
                        <ProductUnitForm
                            productId={null}
                            onUnitsChange={setPendingUnits}
                            onError={onError}
                        />
                    )}
                </div>

                <div className="pm-footer">
                    {activeTab === 'units' && pendingUnits.length > 0 && (
                        <span className="pm-footer-hint">
                            {pendingUnits.length} đơn vị tính
                        </span>
                    )}
                    <button className="pm-btn pm-btn--ghost" onClick={onClose}>Hủy</button>
                    <button className="pm-btn pm-btn--primary" onClick={handleSubmit} disabled={saving}>
                        {saving ? 'Đang tạo...' : 'Tạo sản phẩm'}
                    </button>
                </div>
            </div>
        </BaseModal>
    );
};

export default CreateProductModal;