import { useEffect, useState } from 'react';
import categoryService from '../../services/Category/category.service';

const EMPTY_FORM = {
    name: '',
    parentId: null,
    imageUrl: ''
};

export default function useCategoryForm(editId, { showNotification } = {}) {
    const [form, setForm] = useState(EMPTY_FORM);

    useEffect(() => {
        if (!editId) {
            setForm(EMPTY_FORM);
            return;
        }

        categoryService.getCategoryById(editId).then(res => {
            setForm({
                name: res.data.data?.name || '',
                parentId: res.data.data?.parentId ?? null,
                imageUrl: res.data.data?.imageUrl || ''
            });
        });
    }, [editId]);

    function change(field, value) {
        setForm(prev => ({ ...prev, [field]: value }));
    }

    function resetForm() {
        setForm(EMPTY_FORM);
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
        submit,
        resetForm
    };
}