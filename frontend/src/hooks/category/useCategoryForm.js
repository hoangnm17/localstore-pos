import { useEffect, useState } from 'react';
import categoryService from '../../services/categoryService';

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
            return;
        }

        if (editId) {
            await categoryService.updateCategory(editId, form);
        } else {
            await categoryService.createCategory(form);
        }
    }

    return { form, change, submit };
}