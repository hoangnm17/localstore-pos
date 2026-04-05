import api from '../axiosInstance';
export const getSalaryReport = async (params) => {
    try {
        const response = await api.get('/salary', { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getRoleList = async () => {
    try {
        const response = await api.get('/salary/roles');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const getPayrollStatus = async (params) => {
    try {
        const response = await api.get('/salary/payroll-status', { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const confirmPayroll = async (data) => {
    try {
        const response = await api.post('/salary/confirm', data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
