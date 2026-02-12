import axios from "axios";

const API_URL = "http://localhost:5000/api/inventory";

const productStockService = {
    getProductsByCategory(categoryId, search, page, limit) {
        return axios.get(
            `${API_URL}/categories/${categoryId}/products`,
            {
                params: { search, page, limit }
            }
        );
    },

    updateStock(productId, quantity) {
        return axios.put(
            `${API_URL}/products/stock`,
            {
                productId,
                quantity
            }
        );
    }
};

export default productStockService;