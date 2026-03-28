import api from '../axiosInstance';

export const getWeeklySchedule = async (startDate, endDate) => {
    try {
        const response = await api.get(`/roster?startDate=${startDate}&endDate=${endDate}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const assignShift = async (data) => {
    try {
        const response = await api.post('/roster', data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const removeShift = async (scheduleId) => {
    try {
        const response = await api.delete(`/roster/${scheduleId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const clearSchedule = async (data) => {
    try {
        const response = await api.post('/roster/clear', data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
