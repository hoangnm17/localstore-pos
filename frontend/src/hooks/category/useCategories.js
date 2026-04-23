import { useEffect, useState } from 'react';
import categoryService from '../../services/Category/category.service';

export default function useCategories({ showNotification, onConfirm, search, page, limit }) {
    const [categories, setCategories] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalRoots: 0 });
    async function load(search, page, limit) {
        try {
            const res = await categoryService.fetchCategoryTree(search, page, limit);
            setCategories(res?.data || []);
            setPagination(res?.pagination || { page: 1, totalPages: 1, totalRoots: 0 });
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
        load(search, page, limit);
    }, [search, page, limit]);

    return {
        categories,
        pagination,
        reload: load,
        deleteCategory: remove
    };
}