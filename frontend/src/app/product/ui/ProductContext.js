import { createContext, useContext, useState, useCallback } from 'react';

const ProductContext = createContext(null);

export const ProductProvider = ({ children }) => {
    const [createModal, setCreateModal] = useState(false);
    const [createComboModal, setCreateComboModal] = useState(false);
    const [editModal, setEditModal] = useState({ open: false, productId: null });
    const [detailModal, setDetailModal] = useState({ open: false, productId: null });
    const [priceHistoryModal, setPriceHistoryModal] = useState({ open: false, productId: null, productName: null });

    const openCreate = useCallback(() => setCreateModal(true), []);
    const closeCreate = useCallback(() => setCreateModal(false), []);

    const openCreateCombo = useCallback(() => setCreateComboModal(true), []);
    const closeCreateCombo = useCallback(() => setCreateComboModal(false), []);

    const openEdit = useCallback((productId) => setEditModal({ open: true, productId }), []);
    const closeEdit = useCallback(() => setEditModal({ open: false, productId: null }), []);

    const openDetail = useCallback((productId) => setDetailModal({ open: true, productId }), []);
    const closeDetail = useCallback(() => setDetailModal({ open: false, productId: null }), []);

    const openPriceHistory = useCallback((productId, productName) =>
        setPriceHistoryModal({ open: true, productId, productName }), []);
    const closePriceHistory = useCallback(() =>
        setPriceHistoryModal({ open: false, productId: null, productName: null }), []);

    return (
        <ProductContext.Provider value={{
            createModal, createComboModal,
            editModal, detailModal, priceHistoryModal,
            openCreate, closeCreate,
            openCreateCombo, closeCreateCombo,
            openEdit, closeEdit,
            openDetail, closeDetail,
            openPriceHistory, closePriceHistory,
        }}>
            {children}
        </ProductContext.Provider>
    );
};

export const useProductContext = () => {
    const ctx = useContext(ProductContext);
    if (!ctx) throw new Error('useProductContext must be used within ProductProvider');
    return ctx;
};

export default ProductContext;