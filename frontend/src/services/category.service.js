import axios from 'axios';

const API = 'http://localhost:5000/api/categories';

export function fetchCategoryTree(params) {
    return axios.get(`${API}/tree`, { params });
}

export function createCategory(data) {
    return axios.post(API, data);
}

export function updateCategory(id, data) {
    return axios.put(`${API}/${id}`, data);
}

export function deleteCategory(id) {
    return axios.delete(`${API}/${id}`);
}

export function getCategoryById(id) {
    return axios.get(`${API}/${id}`);
}