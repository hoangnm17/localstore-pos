import { useEffect, useState } from 'react';
import * as api from '../../../services/category.service';
export default function useCategories() {
    const [categories, setCategories] = useState([]);

    async function load() {
        const res = await api.fetchCategoryTree({ page: 1, limit: 100 });
        setCategories(res.data.data || []);

    }

    async function remove(id) {
        if (!window.confirm('Xóa category này?')) return;
        await api.deleteCategory(id);
        load();
    }

    useEffect(() => {
        load();
    }, []);

    return {
        categories,
        reload: load,
        deleteCategory: remove
    };
}