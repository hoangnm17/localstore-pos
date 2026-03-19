import { useEffect, useState } from 'react';
import categoryService from '../../services/Category/category.service';

export default function useCategoryForm(editId, { showNotification } = {}) {
    const [form, setForm] = useState({
        name: '',
        parentId: null,
        imageUrl: ''
    });

    useEffect(() => {
        if (!editId) {
            setForm({ name: '', parentId: null, imageUrl: '' });
            return;
        }
        categoryService.getCategoryById(editId).then(res => {
            setForm(res.data.data);
        });
    }, [editId]);

    function change(field, value) {
        setForm(prev => ({ ...prev, [field]: value }));
    }

    async function submit() {
        if (!form.name.trim()) {
            if (showNotification) showNotification('Tên danh mục không được để trống.', 'warning');
            return false;
        }

        try {
            if (editId) {
                await categoryService.updateCategory(editId, form);
            } else {
                await categoryService.createCategory(form);
            }
            return true;
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
            if (showNotification) {
                showNotification(errorMsg, 'error');
            } else {
                alert(errorMsg);
            }
            return false;
        }
    }

    return {
        form,
        change,
        submit
    };
}