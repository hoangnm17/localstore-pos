import { useCallback, useState } from 'react';
import { getComboItems, getProduct } from '../../services/Product/product.service';

function useProductDetail() {
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

            const productResponse = await getProduct(productId);
            const product = productResponse.data?.data;

            let comboItems = [];
            if (product?.isCombo) {
                const comboResponse = await getComboItems(productId);
                comboItems = comboResponse.data?.data || [];
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
            alert(error.response?.data?.message || 'Không tải được chi tiết sản phẩm.');
        }
    }, []);

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