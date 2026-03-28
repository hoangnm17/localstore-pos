import api from '../axiosInstance';

export const getMySchedule = async (startDate, endDate) => {
    const res = await api.get('/cashier/schedule', {
        params: { startDate, endDate }
    });
    return res.data;
};

export const getPendingShifts = async (workDate) => {
    const res = await api.get('/cashier/handover/pending', {
        params: { workDate }
    });
    return res.data;
};

export const getSystemCash = async (scheduleId) => {
    const res = await api.get('/cashier/handover/system-cash', {
        params: { scheduleId }
    });
    return res.data;
};

export const submitHandover = async (payload) => {
    try {
        const res = await api.post('/cashier/handover', payload);
        return res.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || 'Lỗi kết nối server!');
    }
};

export const getHandoverReport = async (params) => {
    try {
        const res = await api.get('/cashier/handover/report', { params });
        return res.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || 'Lỗi kết nối server!');
    }
};
export const getDailyAudit = async (workDate) => {
    try {
        const res = await api.get('/cashier/daily-audit', { params: { workDate } });
        return res.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || 'Lỗi kết nối server!');
    }
};
