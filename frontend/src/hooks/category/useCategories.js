import { useEffect, useState } from 'react';
import categoryService from '../../services/categoryService';
export default function useCategories() {
    const [categories, setCategories] = useState([]);

    async function load() {
        try {
            const res = await categoryService.fetchCategoryTree('', 1, 10);
            setCategories(res?.data?.data || []);
        } catch (err) {
            console.error('Lỗi tải danh mục:', err);
            setCategories([]);
        }
    }

    async function remove(id) {
        if (!window.confirm('Xóa category này?')) return;
        await categoryService.deleteCategory(id);
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