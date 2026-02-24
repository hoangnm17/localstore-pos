import axios from "axios";

const API_URL = "http://localhost:5000/api";

/**
 * GET SUPPLIER LIST
 * GET /api/inventory/suppliers?search=abc
 */
function getSupplierList(search = "") {
    return axios.get(`${API_URL}/inventory/suppliers/list`, {
        params: {
            search
        }
    });
}

export default {
    getSupplierList
};