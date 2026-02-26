import { createContext, useContext, useState, useCallback } from 'react';

const ProductContext = createContext(null);

export const ProductProvider = ({ children }) => {
    const [detailModal, setDetailModal] = useState({ open: false, productId: null });
    const [formModal, setFormModal] = useState({ open: false, productId: null });
    const [priceHistoryModal, setPriceHistoryModal] = useState({ open: false, productId: null });
    const [toast, setToast] = useState(null);

    const openDetail = useCallback((productId) => {
        setDetailModal({ open: true, productId });
    }, []);

    const closeDetail = useCallback(() => {
        setDetailModal({ open: false, productId: null });
    }, []);

    const openForm = useCallback((productId = null) => {
        setFormModal({ open: true, productId });
    }, []);

    const closeForm = useCallback(() => {
        setFormModal({ open: false, productId: null });
    }, []);

    const openPriceHistory = useCallback((productId) => {
        setPriceHistoryModal({ open: true, productId });
    }, []);

    const closePriceHistory = useCallback(() => {
        setPriceHistoryModal({ open: false, productId: null });
    }, []);

    const showToast = useCallback((type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    }, []);

    return (
        <ProductContext.Provider value={{
            detailModal,
            formModal,
            priceHistoryModal,
            toast,
            openDetail,
            closeDetail,
            openForm,
            closeForm,
            openPriceHistory,
            closePriceHistory,
            showToast,
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