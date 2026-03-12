import { useCallback, useEffect, useMemo, useState } from 'react';
import { getProducts, stopSellingProduct } from '../../services/Product/product.service';

function useProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [bulkLoading, setBulkLoading] = useState(false);

    const [searchInput, setSearchInput] = useState('');
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        search: '',
        status: 'Selling',
        categoryId: ''
    });

    const [pagination, setPagination] = useState({
        total: 0,
        totalPages: 1
    });

    const [selectedIds, setSelectedIds] = useState([]);

    const loadProducts = useCallback(async () => {
        try {
            setLoading(true);

            const response = await getProducts({
                page: filters.page,
                limit: filters.limit,
                search: filters.search,
                status: filters.status,
                categoryId: filters.categoryId || null
            });

            setProducts(response.data?.data || []);
            setPagination({
                total: Number(response.data?.total || 0),
                totalPages: Number(response.data?.totalPages || 1)
            });
            setSelectedIds([]);
        } catch (error) {
            alert(error.response?.data?.message || 'Không tải được danh sách sản phẩm.');
            setProducts([]);
            setPagination({
                total: 0,
                totalPages: 1
            });
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    const allSelected = useMemo(() => {
        if (!products.length) return false;
        return products.every((item) => selectedIds.includes(item.id));
    }, [products, selectedIds]);

    const handleApplySearch = () => {
        setFilters((prev) => ({
            ...prev,
            page: 1,
            search: searchInput.trim()
        }));
    };

    const handlePageChange = (page) => {
        if (page < 1 || page > pagination.totalPages) return;
        setFilters((prev) => ({
            ...prev,
            page
        }));
    };

    const handleCheckAll = () => {
        if (allSelected) {
            setSelectedIds([]);
            return;
        }
        setSelectedIds(products.map((item) => item.id));
    };

    const handleCheckOne = (productId) => {
        setSelectedIds((prev) => {
            if (prev.includes(productId)) {
                return prev.filter((id) => id !== productId);
            }
            return [...prev, productId];
        });
    };

    const handleBulkStopSelling = async () => {
        if (!selectedIds.length) {
            alert('Vui lòng chọn ít nhất 1 sản phẩm.');
            return;
        }

        if (!window.confirm(`Bạn có chắc muốn ngừng bán ${selectedIds.length} sản phẩm đã chọn không?`)) {
            return;
        }

        try {
            setBulkLoading(true);

            const results = await Promise.allSettled(
                selectedIds.map((id) => stopSellingProduct(id))
            );

            const successCount = results.filter((item) => item.status === 'fulfilled').length;
            const failedCount = results.length - successCount;

            await loadProducts();

            if (failedCount > 0) {
                alert(`Đã ngừng bán ${successCount} sản phẩm, thất bại ${failedCount} sản phẩm.`);
            } else {
                alert(`Đã ngừng bán ${successCount} sản phẩm.`);
            }
        } catch (error) {
            alert('Thao tác hàng loạt thất bại.');
        } finally {
            setBulkLoading(false);
        }
    };

    const handleBulkSoftDelete = async () => {
        if (!selectedIds.length) {
            alert('Vui lòng chọn ít nhất 1 sản phẩm.');
            return;
        }

        if (!window.confirm('xóa mềm / ngừng bán. Bạn có chắc muốn tiếp tục không?')) {
            return;
        }

        await handleBulkStopSelling();
    };

    return {
        products,
        loading,
        bulkLoading,
        searchInput,
        setSearchInput,
        filters,
        setFilters,
        pagination,
        selectedIds,
        setSelectedIds,
        allSelected,
        loadProducts,
        handleApplySearch,
        handlePageChange,
        handleCheckAll,
        handleCheckOne,
        handleBulkStopSelling,
        handleBulkSoftDelete
    };
}

export default useProductList;