import api from './axiosInstance';

export const getProducts = async ({ page = 1, limit = 20, search = '', status = 'Selling', categoryId = null } = {}) => {
    const params = { page, limit, status };
    if (search) params.search = search;
    if (categoryId) params.categoryId = categoryId;
    return api.get('/products', { params });
};

export const getProduct = async (id) => {
    return api.get(`/products/${id}`);
};

export const getProductDetail = async (id) => {
    return api.get(`/products/${id}`);
};

export const createProduct = async (payload) => {
    return api.post('/products', payload);
};

export const updateProduct = async (id, payload) => {
    return api.put(`/products/${id}`, payload);
};

export const stopSellingProduct = async (id) => {
    return api.delete(`/products/${id}`);
};

export const startSellingProduct = async (id) => {
    return api.patch(`/products/${id}/start-selling`);
};

// Product Units
export const getProductUnits = async (productId) => {
    return api.get(`/product-units/product/${productId}`);
};

export const createProductUnit = async (payload) => {
    return api.post('/product-units', payload);
};

export const updateProductUnit = async (id, payload) => {
    return api.put(`/product-units/${id}`, payload);
};

export const deleteProductUnit = async (id) => {
    return api.delete(`/product-units/${id}`);
};

// Price History
export const getPriceHistory = async (productId) => {
    return api.get(`/price-history/${productId}`);
};