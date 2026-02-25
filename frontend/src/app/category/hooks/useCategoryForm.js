import { useEffect, useState } from 'react';
import * as api from '../../../services/category.service';

export default function useCategoryForm(editId) {
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

        api.getCategoryById(editId).then(res => {
            setForm(res.data.data);
        });
    }, [editId]);

    function change(field, value) {
        setForm(prev => ({ ...prev, [field]: value }));
    }

    async function submit() {
        if (!form.name.trim()) {
            alert('Tên danh mục bắt buộc');
            return;
        }

        if (editId) {
            await api.updateCategory(editId, form);
        } else {
            await api.createCategory(form);
        }
    }

    return { form, change, submit };
}