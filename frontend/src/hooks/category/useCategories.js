import { useEffect, useState } from 'react';
import categoryService from '../../services/categoryService';

export default function useCategories({ showNotification, onConfirm }) {
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

    async function doDelete(id) {
        try {
            await categoryService.deleteCategory(id);
            showNotification('Xóa danh mục thành công.', 'success');
            load();
        } catch (err) {
            showNotification(err.response?.data?.message || 'Xóa danh mục thất bại.', 'error');
        }
    }

    function remove(id) {
        onConfirm({
            message: 'Bạn có chắc muốn xóa danh mục này không?',
            onOk: () => doDelete(id)
        });
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