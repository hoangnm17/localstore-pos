import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // Adjust port if needed

// --- CUSTOMERS ---
export const getCustomers = async (params) => {
    try {
        const response = await axios.get(`${API_URL}/customers`, { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching customers", error);
        throw error;
    }
};

export const createCustomer = async (data) => {
    return await axios.post(`${API_URL}/customers`, data);
};

// --- PROMOTIONS ---
export const getPromotions = async (params) => {
    return await axios.get(`${API_URL}/promotions`, { params });
};

export const createPromotion = async (data) => {
    return await axios.post(`${API_URL}/promotions`, data);
};

// --- VOUCHERS ---
export const getVouchers = async (params) => {
    return await axios.get(`${API_URL}/vouchers`, { params });
};

export const createVoucher = async (data) => {
    return await axios.post(`${API_URL}/vouchers`, data);
};
