import api from '../axiosInstance';
export const getShifts = async () => {
    try {
        const response = await api.get('/shifts');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getShiftById = async (id) => {
    try {
        const response = await api.get(`/shifts/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
export const createShift = async (data) => {
    try {
        const response = await api.post('/shifts', data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateShift = async (id, data) => {
    try {
        const response = await api.put(`/shifts/${id}`, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const toggleShiftStatus = async (id) => {
    try {
        const response = await api.patch(`/shifts/${id}/toggle`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
