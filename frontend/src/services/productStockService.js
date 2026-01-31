import axios from "axios";

const API_URL = "http://localhost:5000/api";

const getProductsByCategory = (categoryId, search, page, limit) => {
    return axios.get(
        `${API_URL}/inventory/categories/${categoryId}/products`,
        {
            params: { search, page, limit }
        }
    );
};

export default {
    getProductsByCategory
};
