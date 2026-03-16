import { useCallback, useEffect, useState } from 'react';
import { getAllCategories } from '../../services/Category/category.service';

function useProductCategories() {
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);

    const loadCategories = useCallback(async () => {
        try {
            setLoadingCategories(true);

            const response = await getAllCategories();

            const list =
                response.data?.data?.data ||
                response.data?.data ||
                response.data?.items ||
                response.data ||
                [];

            setCategories(Array.isArray(list) ? list : []);
        } catch (error) {
            console.error('Load categories failed:', error);
            setCategories([]);
        } finally {
            setLoadingCategories(false);
        }
    }, []);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    return {
        categories,
        loadingCategories,
        loadCategories
    };
}

export default useProductCategories;