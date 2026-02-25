import api from './axiosInstance';

export const getProducts = async ({ page = 1, limit = 20, search = '', categoryId = null } = {}) => {
    const params = { page, limit };
    if (search) params.search = search;
    if (categoryId) params.categoryId = categoryId;

    return api.get('/products', { params });
};

export const getProduct = async (id) => {
    return api.get(`/products/${id}`);
};

export const createProduct = async (payload) => {
    return api.post('/products', payload);
};

export const updateProduct = async (id, payload) => {
    return api.put(`/products/${id}`, payload);
};

export const deleteProduct = async (id) => {
    return api.delete(`/products/${id}`);
};

