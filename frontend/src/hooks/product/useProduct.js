import { useState, useEffect, useCallback } from 'react';
import { getProducts, stopSellingProduct, startSellingProduct } from '../../services/Product/productService';

const useProduct = () => {
    const [products, setProducts] = useState([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ search: '', categoryId: null, status: 'Selling', page: 1, limit: 10 });

    const fetchProducts = useCallback(async () => {
        setLoading(true); setError(null);
        const res = await getProducts(filters);
        if (res.success === false) setError(res.message);
        else { setProducts(res.data?.data || []); setTotal(res.data?.total || 0); setTotalPages(res.data?.totalPages || 1); }
        setLoading(false);
    }, [filters]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const updateFilters = useCallback((f) => setFilters(p => ({ ...p, ...f, page: 1 })), []);
    const changePage = useCallback((page) => setFilters(p => ({ ...p, page })), []);

    const handleStopSelling = useCallback(async (id) => {
        const res = await stopSellingProduct(id);
        if (res.success === false) return { success: false, message: res.message };
        await fetchProducts(); return { success: true };
    }, [fetchProducts]);

    const handleStartSelling = useCallback(async (id) => {
        const res = await startSellingProduct(id);
        if (res.success === false) return { success: false, message: res.message };
        await fetchProducts(); return { success: true };
    }, [fetchProducts]);

    return { products, total, totalPages, loading, error, filters, updateFilters, changePage, handleStopSelling, handleStartSelling, refetch: fetchProducts };
};

export default useProduct;