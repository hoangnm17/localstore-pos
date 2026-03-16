import React, { useState, useEffect } from 'react';
import categoryService from '../../../services/Category/category.service';
import CategoryModal from '../../category/ui/CategoryModal';
import useCategoryForm from '../../../hooks/category/useCategoryForm';
import { useNotification } from '../../../components/global/Notification/NotificationContext';

export default function CategorySelector({ value, onChange, categories: initialCategories }) {
    const [showModal, setShowModal] = useState(false);
    const [categories, setCategories] = useState(initialCategories || []);
    const { showNotification } = useNotification();
    const categoryForm = useCategoryForm(null, { showNotification });

    // Reload categories sau khi tạo mới
    const reloadCategories = async () => {
        try {
            const res = await categoryService.fetchCategoryTree('', 1, 100);
            const flat = [];
            function flatten(items, level = 0) {
                items.forEach(item => {
                    flat.push({
                        ...item,
                        level,
                        hasChildren: item.children?.length > 0,
                        productCount: item.productCount ?? 0
                    });
                    if (item.children?.length) {
                        flatten(item.children, level + 1);
                    }
                });
            }
            flatten(res.data?.data || res.data || []);
            setCategories(flat);
        } catch (err) {
            console.error('Failed to reload categories:', err);
        }
    };

    useEffect(() => {
        if (initialCategories?.length === 0) {
            reloadCategories();
        }
    }, []);

    const handleDone = async () => {
        await reloadCategories();
        setShowModal(false);
        showNotification('Tạo danh mục thành công.', 'success');
    };

    return (
        <>
            <label className="form-label fw-semibold">Danh mục</label>
            <div className="input-group">
                <select
                    className="form-select"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value ? parseInt(e.target.value) : null)}
                >
                    <option value="">Chọn danh mục</option>
                    {categories.map((category) => {
                        const prefix = '　'.repeat(category.level) + (category.level > 0 ? '└ ' : '');
                        const isDisabled = category.hasChildren;

                        return (
                            <option
                                key={category.id}
                                value={category.id}
                                disabled={isDisabled}
                                style={isDisabled ? { color: '#999', fontStyle: 'italic' } : {}}
                            >
                                {prefix}{category.name}{isDisabled ? ' (có danh mục con)' : ''}
                            </option>
                        );
                    })}
                </select>
                <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => setShowModal(true)}
                    title="Tạo danh mục mới"
                >
                    <i className="bi bi-plus-lg" />
                </button>
            </div>

            {/* Tái sử dụng CategoryModal có sẵn */}
            <CategoryModal
                {...categoryForm}
                open={showModal}
                isEdit={false}
                editId={null}
                onClose={() => setShowModal(false)}
                onDone={handleDone}
            />
        </>
    );
}
