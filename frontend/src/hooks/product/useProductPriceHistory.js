import { useState } from 'react';
import { getAllPriceHistory } from '../../services/Product/product.service';

function useProductPriceHistory() {
    const [priceHistoryState, setPriceHistoryState] = useState({
        open: false,
        product: null,
        loading: false,
        histories: {
            salePriceHistories: [],
            costPriceHistories: []
        }
    });

    const openPriceHistoryModal = async (product) => {
        try {
            setPriceHistoryState({
                open: true,
                product,
                loading: true,
                histories: {
                    salePriceHistories: [],
                    costPriceHistories: []
                }
            });

            const response = await getAllPriceHistory(product.id);

            setPriceHistoryState({
                open: true,
                product,
                loading: false,
                histories: response.data?.data || {
                    salePriceHistories: [],
                    costPriceHistories: []
                }
            });
        } catch (error) {
            alert(error.response?.data?.message || 'Không tải được lịch sử giá.');
            setPriceHistoryState({
                open: false,
                product: null,
                loading: false,
                histories: {
                    salePriceHistories: [],
                    costPriceHistories: []
                }
            });
        }
    };

    const closePriceHistoryModal = () => {
        setPriceHistoryState({
            open: false,
            product: null,
            loading: false,
            histories: {
                salePriceHistories: [],
                costPriceHistories: []
            }
        });
    };

    return {
        priceHistoryState,
        setPriceHistoryState,
        openPriceHistoryModal,
        closePriceHistoryModal
    };
}

export default useProductPriceHistory;