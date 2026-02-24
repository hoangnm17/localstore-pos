import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// ─── CUSTOMERS ────────────────────────────────────────────────
export const getCustomers = async (params) => {
    const response = await axios.get(`${API_URL}/customers`, { params });
    return response.data;
};

export const getCustomerById = async (id) => {
    const response = await axios.get(`${API_URL}/customers/${id}`);
    return response.data;
};

export const createCustomer = async (data) => {
    const response = await axios.post(`${API_URL}/customers`, data);
    return response.data;
};

export const updateCustomer = async (id, data) => {
    const response = await axios.put(`${API_URL}/customers/${id}`, data);
    return response.data;
};

export const deleteCustomer = async (id) => {
    const response = await axios.delete(`${API_URL}/customers/${id}`);
    return response.data;
};

// ─── PROMOTIONS ───────────────────────────────────────────────
export const getPromotions = async (params) => {
    const response = await axios.get(`${API_URL}/promotions`, { params });
    return response.data;
};

export const getPromotionById = async (id) => {
    const response = await axios.get(`${API_URL}/promotions/${id}`);
    return response.data;
};

export const createPromotion = async (data) => {
    const response = await axios.post(`${API_URL}/promotions`, data);
    return response.data;
};

export const updatePromotion = async (id, data) => {
    const response = await axios.put(`${API_URL}/promotions/${id}`, data);
    return response.data;
};

export const deletePromotion = async (id) => {
    const response = await axios.delete(`${API_URL}/promotions/${id}`);
    return response.data;
};

// ─── VOUCHERS ─────────────────────────────────────────────────
export const getVouchers = async (params) => {
    const response = await axios.get(`${API_URL}/vouchers`, { params });
    return response.data;
};

export const getVoucherByCode = async (code) => {
    const response = await axios.get(`${API_URL}/vouchers/code/${code}`);
    return response.data;
};

export const createVoucher = async (data) => {
    const response = await axios.post(`${API_URL}/vouchers`, data);
    return response.data;
};

export const updateVoucher = async (id, data) => {
    const response = await axios.put(`${API_URL}/vouchers/${id}`, data);
    return response.data;
};

export const deleteVoucher = async (id) => {
    const response = await axios.delete(`${API_URL}/vouchers/${id}`);
    return response.data;
};
