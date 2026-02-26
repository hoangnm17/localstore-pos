import { useState } from 'react';
import BaseModal from '../../../components/common/BaseModal';
import ProductInfoForm from './form/ProductInfoForm';
import ProductComboForm from './form/ProductComboForm';
import useProductDetail from '../../../hooks/product/useProductDetail';
import { addComboItem } from '../../../services/Product/product.service';
import './ProductModal.css';

const defaultForm = {
    code: '', barcode: '', name: '', imageUrl: '',
    baseUnit: 'Combo', salePrice: '', costPrice: '',
    categoryId: '',
    allowDecimalQuantity: 0,
    isCombo: 1, // luôn là 1
};

const validateForm = (form, comboItems) => {
    const errs = {};
    if (!form.code.trim()) errs.code = 'Vui lòng nhập mã sản phẩm';
    if (!form.name.trim()) errs.name = 'Vui lòng nhập tên combo';
    if (!form.baseUnit.trim()) errs.baseUnit = 'Vui lòng nhập đơn vị';
    if (form.salePrice === '' || isNaN(form.salePrice)) errs.salePrice = 'Giá bán không hợp lệ';
    if (form.costPrice === '' || isNaN(form.costPrice)) errs.costPrice = 'Giá vốn không hợp lệ';
    if (comboItems.length === 0) errs.comboItems = 'Combo phải có ít nhất 1 sản phẩm con';
    return errs;
};

const CreateComboModal = ({ onClose, onSuccess, onError }) => {
    const [form, setForm] = useState(defaultForm);
    const [errors, setErrors] = useState({});
    const [activeTab, setActiveTab] = useState('info');
    const [pendingItems, setPendingItems] = useState([]);

    const { handleCreate, saving } = useProductDetail(null);

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, [field]: undefined }));
    };

    const tabs = [
        { key: 'info', label: 'Thông tin combo' },
        { key: 'items', label: 'Sản phẩm trong combo', badge: pendingItems.length },
    ];

    const handleSubmit = async () => {
        const errs = validateForm(form, pendingItems);
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            // Nếu lỗi ở comboItems thì nhảy sang tab items
            if (errs.comboItems && !errs.code && !errs.name && !errs.baseUnit && !errs.salePrice && !errs.costPrice) {
                setActiveTab('items');
            } else {
                setActiveTab('info');
            }
            return;
        }

        const payload = {
            ...form,
            salePrice: parseFloat(form.salePrice),
            costPrice: parseFloat(form.costPrice),
            categoryId: form.categoryId ? parseInt(form.categoryId) : null,
            allowDecimalQuantity: 0,
            isCombo: 1,
        };

        //Tạo sản phẩm combo
        const res = await handleCreate(payload);
        if (!res.success) { onError(res.message); return; }

        const newProductId = res.id;

        //Tạo từng combo item
        const itemResults = await Promise.all(
            pendingItems.map(item =>
                addComboItem(newProductId, {
                    childProductId: item.childProductId,
                    quantity: item.quantity,
                })
            )
        );

        const failed = itemResults.find(r => r.success === false);
        if (failed) {
            onSuccess(`Tạo combo thành công. Lưu ý: một số sản phẩm con chưa được lưu (${failed.message})`);
            return;
        }

        onSuccess('Tạo sản phẩm combo thành công');
    };

    return (
        <BaseModal onClose={onClose} maxWidth="960px">
            <div className="pm-card pm-card--xl">
                <div className="pm-header">
                    <div>
                        <h2 className="pm-title">Tạo sản phẩm combo</h2>
                        <p className="pm-subtitle">Sản phẩm gồm nhiều sản phẩm con đóng gói chung</p>
                    </div>
                    <button className="pm-close" onClick={onClose}>✕</button>
                </div>

                <div className="pm-tabs">
                    {tabs.map(t => (
                        <button
                            key={t.key}
                            className={`pm-tab${activeTab === t.key ? ' pm-tab--active' : ''}${errors.comboItems && t.key === 'items' ? ' pm-tab--error' : ''}`}
                            onClick={() => setActiveTab(t.key)}
                        >
                            {t.label}
                            {t.badge > 0 && <span className="pm-tab-badge">{t.badge}</span>}
                            {errors.comboItems && t.key === 'items' && (
                                <span className="pm-tab-error-dot">!</span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="pm-body">
                    {activeTab === 'info' && (
                        <>
                            <div className="pm-banner pm-banner--info">
                                Sản phẩm combo được bán như 1 đơn vị hoàn chỉnh.
                            </div>
                            <ProductInfoForm
                                form={form}
                                errors={errors}
                                onChange={handleChange}
                                isEdit={false}
                                disableType={true}
                            />
                        </>
                    )}

                    {activeTab === 'items' && (
                        <>
                            {errors.comboItems && (
                                <div className="pm-error">{errors.comboItems}</div>
                            )}
                            <ProductComboForm
                                productId={null}
                                onItemsChange={setPendingItems}
                                onError={onError}
                            />
                        </>
                    )}
                </div>

                <div className="pm-footer">
                    <div className="pm-footer-summary">
                        {pendingItems.length > 0 && (
                            <span className="pm-footer-hint">
                                {pendingItems.length} sản phẩm con trong combo
                            </span>
                        )}
                    </div>
                    <button className="pm-btn pm-btn--ghost" onClick={onClose}>Hủy</button>
                    <button className="pm-btn pm-btn--primary" onClick={handleSubmit} disabled={saving}>
                        {saving ? 'Đang tạo...' : 'Tạo combo'}
                    </button>
                </div>
            </div>
        </BaseModal>
    );
};

export default CreateComboModal;