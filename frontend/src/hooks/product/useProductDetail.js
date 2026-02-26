import { useState, useEffect, useCallback } from 'react';
import {
    getProduct,
    createProduct,
    updateProduct,
    getProductUnits,
    createProductUnit,
    updateProductUnit,
    deleteProductUnit,
    getPriceHistory,
} from '../../services/productService';

const useProductDetail = (productId = null) => {
    const [product, setProduct] = useState(null);
    const [units, setUnits] = useState([]);
    const [priceHistory, setPriceHistory] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const fetchProduct = useCallback(async (id) => {
        if (!id) return;
        setLoading(true);
        setError(null);
        const res = await getProduct(id);
        if (res.success === false) {
            setError(res.message);
        } else {
            setProduct(res.data?.data || null);
        }
        setLoading(false);
    }, []);

    const fetchUnits = useCallback(async (id) => {
        if (!id) return;
        const res = await getProductUnits(id);
        if (res.success !== false) {
            setUnits(res.data?.data || []);
        }
    }, []);

    const fetchPriceHistory = useCallback(async (id) => {
        if (!id) return;
        const res = await getPriceHistory(id);
        if (res.success !== false) {
            setPriceHistory(res.data?.data || null);
        }
    }, []);

    useEffect(() => {
        if (productId) {
            fetchProduct(productId);
            fetchUnits(productId);
        }
    }, [productId, fetchProduct, fetchUnits]);

    const loadPriceHistory = useCallback(async () => {
        if (productId) await fetchPriceHistory(productId);
    }, [productId, fetchPriceHistory]);

    const handleCreate = useCallback(async (payload) => {
        setSaving(true);
        const res = await createProduct(payload);
        setSaving(false);
        if (res.success === false) return { success: false, message: res.message };
        return { success: true, id: res.data?.id };
    }, []);

    const handleUpdate = useCallback(async (id, payload) => {
        setSaving(true);
        const res = await updateProduct(id, payload);
        setSaving(false);
        if (res.success === false) return { success: false, message: res.message };
        await fetchProduct(id);
        return { success: true };
    }, [fetchProduct]);

    const handleCreateUnit = useCallback(async (payload) => {
        const res = await createProductUnit(payload);
        if (res.success === false) return { success: false, message: res.message };
        await fetchUnits(productId);
        return { success: true };
    }, [productId, fetchUnits]);

    const handleUpdateUnit = useCallback(async (unitId, payload) => {
        const res = await updateProductUnit(unitId, payload);
        if (res.success === false) return { success: false, message: res.message };
        await fetchUnits(productId);
        return { success: true };
    }, [productId, fetchUnits]);

    const handleDeleteUnit = useCallback(async (unitId) => {
        const res = await deleteProductUnit(unitId);
        if (res.success === false) return { success: false, message: res.message };
        await fetchUnits(productId);
        return { success: true };
    }, [productId, fetchUnits]);

    return {
        product,
        units,
        priceHistory,
        loading,
        saving,
        error,
        handleCreate,
        handleUpdate,
        handleCreateUnit,
        handleUpdateUnit,
        handleDeleteUnit,
        loadPriceHistory,
        refetch: () => {
            fetchProduct(productId);
            fetchUnits(productId);
        },
    };
};

export default useProductDetail;