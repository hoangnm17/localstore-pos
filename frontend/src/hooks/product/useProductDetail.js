import { useState, useEffect, useCallback } from 'react';
import {
    getProduct, createProduct, updateProduct,
    getProductUnits, createProductUnit, updateProductUnit, deleteProductUnit,
    getAllPriceHistory,
    getComboItems, addComboItem, removeComboItem,
} from '../../services/Product/product.service';

const useProductDetail = (productId = null) => {
    const [product, setProduct] = useState(null);
    const [units, setUnits] = useState([]);
    const [allPriceHistory, setAllPriceHistory] = useState([]);
    const [comboItems, setComboItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const fetchProduct = useCallback(async (id) => {
        if (!id) return; setLoading(true); setError(null);
        const res = await getProduct(id);
        if (res.success === false) setError(res.message); else setProduct(res.data?.data || null);
        setLoading(false);
    }, []);

    const fetchUnits = useCallback(async (id) => {
        if (!id) return;
        const res = await getProductUnits(id);
        if (res.success !== false) setUnits(res.data?.data || []);
    }, []);

    const fetchAllPriceHistory = useCallback(async (id) => {
        if (!id) return;
        const res = await getAllPriceHistory(id);
        if (res.success !== false) setAllPriceHistory(res.data?.data || []);
    }, []);

    const fetchComboItems = useCallback(async (id) => {
        if (!id) return;
        const res = await getComboItems(id);
        if (res.success !== false) setComboItems(res.data?.data || []);
    }, []);

    useEffect(() => {
        if (productId) { fetchProduct(productId); fetchUnits(productId); }
    }, [productId, fetchProduct, fetchUnits]);

    const loadAllPriceHistory = useCallback(() => fetchAllPriceHistory(productId), [productId, fetchAllPriceHistory]);
    const loadComboItems = useCallback(() => fetchComboItems(productId), [productId, fetchComboItems]);

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
        await fetchProduct(id); return { success: true };
    }, [fetchProduct]);

    const handleCreateUnit = useCallback(async (payload) => {
        const res = await createProductUnit(payload);
        if (res.success === false) return { success: false, message: res.message };
        await fetchUnits(productId); return { success: true };
    }, [productId, fetchUnits]);

    const handleUpdateUnit = useCallback(async (unitId, payload) => {
        const res = await updateProductUnit(unitId, payload);
        if (res.success === false) return { success: false, message: res.message };
        await fetchUnits(productId); return { success: true };
    }, [productId, fetchUnits]);

    const handleDeleteUnit = useCallback(async (unitId) => {
        const res = await deleteProductUnit(unitId);
        if (res.success === false) return { success: false, message: res.message };
        await fetchUnits(productId); return { success: true };
    }, [productId, fetchUnits]);

    const handleAddComboItem = useCallback(async (payload) => {
        const res = await addComboItem(productId, payload);
        if (res.success === false) return { success: false, message: res.message };
        await fetchComboItems(productId); return { success: true };
    }, [productId, fetchComboItems]);

    const handleRemoveComboItem = useCallback(async (comboItemId) => {
        const res = await removeComboItem(productId, comboItemId);
        if (res.success === false) return { success: false, message: res.message };
        await fetchComboItems(productId); return { success: true };
    }, [productId, fetchComboItems]);

    return {
        product, units, allPriceHistory, comboItems,
        loading, saving, error,
        handleCreate, handleUpdate,
        handleCreateUnit, handleUpdateUnit, handleDeleteUnit,
        handleAddComboItem, handleRemoveComboItem,
        loadAllPriceHistory, loadComboItems,
        refetch: () => { fetchProduct(productId); fetchUnits(productId); },
    };
};

export default useProductDetail;