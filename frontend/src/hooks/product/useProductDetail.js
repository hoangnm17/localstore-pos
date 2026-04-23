import { useCallback, useEffect, useRef, useState } from 'react';
import { getComboItems, getProduct } from '../../services/Product/product.service';

function useProductDetail({ showNotification }) {
    const showNotificationRef = useRef(showNotification);
    useEffect(() => { showNotificationRef.current = showNotification; }, [showNotification]);

    const [detailState, setDetailState] = useState({
        open: false,
        product: null,
        comboItems: [],
        loading: false
    });

    const openDetailModal = useCallback(async (productId) => {
        try {
            setDetailState({
                open: true,
                product: null,
                comboItems: [],
                loading: true
            });

            const product = await getProduct(productId);

            let comboItems = [];
            if (product?.isCombo) {
                comboItems = await getComboItems(productId);
            }

            setDetailState({
                open: true,
                product,
                comboItems,
                loading: false
            });
        } catch (error) {
            setDetailState({
                open: false,
                product: null,
                comboItems: [],
                loading: false
            });
            showNotificationRef.current(error.response?.data?.message || 'Không tải được chi tiết sản phẩm.', 'error');
        }
    }, []); // showNotification qua ref — không cần trong deps


    const refreshDetailModal = useCallback(async (productId) => {
        if (!productId) return;
        await openDetailModal(productId);
    }, [openDetailModal]);

    const closeDetailModal = () => {
        setDetailState({
            open: false,
            product: null,
            comboItems: [],
            loading: false
        });
    };

    return {
        detailState,
        setDetailState,
        openDetailModal,
        refreshDetailModal,
        closeDetailModal
    };
}

export default useProductDetail;