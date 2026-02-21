import axios from "axios";

const API_URL = "http://localhost:5000/api";

// categoryService.js
function getCategoryStock(search = "", page = 1, limit = 10) {
    return axios.get(`${API_URL}/inventory/categories`, {
        params: { search, page, limit }
    });
};


// ProblematicReport.js
const getReports = (filters = {}) => {
    return axios.get(`${API_URL}/inventory/reports/list`, {
        params: filters,
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    });
};

const createReport = (data) => {
    return axios.post(`${API_URL}/inventory/reports/send`, data, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    });
};

export default {
    getCategoryStock,
    getReports,
    createReport
};  