import axios from "axios";

const API_URL = "http://localhost:5000/api";

// categoryService.js
function getCategoryStock(search = "", page = 1, limit = 10) {
    return axios.get(`${API_URL}/inventory/categories`, {
        params: { search, page, limit }
    });
};

export default {
    getCategoryStock
};