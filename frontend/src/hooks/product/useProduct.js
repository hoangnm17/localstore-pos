import { useState, useEffect, useCallback } from 'react';
import {
    getProducts,
    stopSellingProduct,
    startSellingProduct
} from '../../services/Product/product.service';

const useProduct = () => {
    const [products, setProducts] = useState([]);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [filters, setFilters] = useState({
        search: '',
        categoryId: null,
        status: 'Selling',
        page: 1,
        limit: 10
    });

    /**
     * Lấy danh sách sản phẩm
     */
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await getProducts(filters); // axios response
            const payload = res.data || {};

            const rawProducts = payload.data || [];

            // Chuẩn hoá dữ liệu cho UI
            const mappedProducts = rawProducts.map(p => ({
                ...p,
                isComboUI:
                    p.isCombo === 1 ||
                    p.isCombo === true ||
                    p.isCombo === '1' ||
                    p.type === 'Combo'
            }));

            setProducts(mappedProducts);
            setTotal(payload.total || 0);
            setTotalPages(payload.totalPages || 1);

        } catch (err) {
            setError(
                err?.response?.data?.message ||
                'Không thể tải danh sách sản phẩm'
            );
        } finally {
            setLoading(false);
        }
    }, [filters]);

    /**
     * Tự động load khi filter thay đổi
     */
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    /**
     * Cập nhật filter (reset về trang 1)
     */
    const updateFilters = useCallback((newFilters) => {
        setFilters(prev => ({
            ...prev, ...newFilters, page: 1
        }));
    }, []);

    /**
     * Đổi trang
     */
    const changePage = useCallback((page) => {
        setFilters(prev => ({
            ...prev,
            page
        }));
    }, []);

    /**
     * Ngừng bán sản phẩm
     */
    const handleStopSelling = useCallback(async (id) => {
        try {
            await stopSellingProduct(id);
            await fetchProducts();
            return { success: true };
        } catch (err) {
            return {
                success: false,
                message: err?.response?.data?.message || 'Không thể ngừng bán'
            };
        }
    }, [fetchProducts]);

    /**
     * Bán lại sản phẩm
     */
    const handleStartSelling = useCallback(async (id) => {
        try {
            await startSellingProduct(id);
            await fetchProducts();
            return { success: true };
        } catch (err) {
            return {
                success: false,
                message: err?.response?.data?.message || 'Không thể bán lại'
            };
        }
    }, [fetchProducts]);

    return {
        products,
        total,
        totalPages,
        loading,
        error,
        filters,
        updateFilters,
        changePage,
        handleStopSelling,
        handleStartSelling,
        refetch: fetchProducts
    };
};

export default useProduct;