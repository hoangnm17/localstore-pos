import api from "../axiosInstance";

export const getStaffs = async (params = {}) => {
    const res = await api.get('/staff', { params });
    return res.data;
};

export const getStaffRoles = async () => {
    const res = await api.get('/staff/roles');
    return res.data;
};

export const getStaffDetail = async (id) => {
    const res = await api.get('/staff/detail', { params: { id } });
    return res.data;
};

export const createStaff = async (data) => {
    const res = await api.post('/staff', data);
    return res.data;
};

export const updateStaff = async (data) => {
    const res = await api.put('/staff/update', data);
    return res.data;
};

export const toggleStaffStatus = async (data) => {
    const res = await api.put('/staff/toggle-status', data);
    return res.data;
};

export const resignStaff = async (id) => {
    const res = await api.put('/staff/resign', { id });
    return res.data;
};

export const resetStaffPassword = async (userId) => {
    const res = await api.put('/staff/reset-password', { userId });
    return res.data;
};
export const getMyProfile = async () => {
    const res = await api.get('/staff/my-profile');
    return res.data; 
};
export const changeMyPassword = async (data) => {
    const res = await api.put('/staff/change-password', data);
    return res.data;
};