import api from './axiosInstance';

// ═══════════════════════════════════════════
//  CUSTOMERS
// ═══════════════════════════════════════════

export const getCustomers = async (params) => {
    const res = await api.get('/customers', { params });
    return res.data;
};

export const getCustomerById = async (id) => {
    const res = await api.get(`/customers/${id}`);
    return res.data;
};

export const createCustomer = async (data) => {
    const res = await api.post('/customers', data);
    return res.data;
};

export const updateCustomer = async (id, data) => {
    const res = await api.put(`/customers/${id}`, data);
    return res.data;
};

export const deleteCustomer = async (id) => {
    const res = await api.delete(`/customers/${id}`);
    return res.data;
};

/** UC3: Lịch sử mua hàng của khách */
export const getPurchaseHistory = async (customerId, params = {}) => {
    const res = await api.get(`/customers/${customerId}/purchase-history`, { params });
    return res.data;
};

/** UC4: Lịch sử điểm tích lũy */
export const getPointLogs = async (customerId, params = {}) => {
    const res = await api.get(`/customers/${customerId}/point-logs`, { params });
    return res.data;
};

/** UC4: Điều chỉnh điểm thủ công */
export const adjustPoints = async (customerId, data) => {
    const res = await api.patch(`/customers/${customerId}/points`, data);
    return res.data;
};

// ═══════════════════════════════════════════
//  PROMOTIONS
// ═══════════════════════════════════════════

export const getPromotions = async (params) => {
    const res = await api.get('/promotions', { params });
    return res.data;
};

export const getPromotionById = async (id) => {
    const res = await api.get(`/promotions/${id}`);
    return res.data;
};

export const createPromotion = async (data) => {
    const res = await api.post('/promotions', data);
    return res.data;
};

export const updatePromotion = async (id, data) => {
    const res = await api.put(`/promotions/${id}`, data);
    return res.data;
};

export const deletePromotion = async (id) => {
    const res = await api.delete(`/promotions/${id}`);
    return res.data;
};

/** UC6: Thêm sản phẩm/danh mục vào promotion */
export const addPromotionItem = async (promotionId, data) => {
    const res = await api.post(`/promotions/${promotionId}/items`, data);
    return res.data;
};

/** UC6: Xóa sản phẩm/danh mục khỏi promotion */
export const removePromotionItem = async (promotionId, itemId) => {
    const res = await api.delete(`/promotions/${promotionId}/items/${itemId}`);
    return res.data;
};

/** UC8: Danh sách KM đang hiệu lực */
export const getActivePromotions = async () => {
    const res = await api.get('/promotions/active');
    return res.data;
};

/** UC9: Báo cáo hiệu quả khuyến mãi */
export const getPromotionReport = async (params = {}) => {
    const res = await api.get('/promotions/report', { params });
    return res.data;
};

// ═══════════════════════════════════════════
//  VOUCHERS
// ═══════════════════════════════════════════

export const getVouchers = async (params) => {
    const res = await api.get('/vouchers', { params });
    return res.data;
};

export const getVoucherByCode = async (code) => {
    const res = await api.get(`/vouchers/code/${code}`);
    return res.data;
};

export const createVoucher = async (data) => {
    const res = await api.post('/vouchers', data);
    return res.data;
};

export const updateVoucher = async (id, data) => {
    const res = await api.put(`/vouchers/${id}`, data);
    return res.data;
};

export const deleteVoucher = async (id) => {
    const res = await api.delete(`/vouchers/${id}`);
    return res.data;
};

/** UC8: Validate voucher trước khi áp dụng */
export const validateVoucher = async (data) => {
    const res = await api.post('/vouchers/validate', data);
    return res.data;
};

/** UC10: Báo cáo thống kê sử dụng voucher */
export const getVoucherReport = async (params = {}) => {
    const res = await api.get('/vouchers/report', { params });
    return res.data;
};

// ═══════════════════════════════════════════
//  MARKETING EVENTS
// ═══════════════════════════════════════════

export const getEvents = async (params) => {
    const res = await api.get('/marketing-events', { params });
    return res.data;
};

export const getEventById = async (id) => {
    const res = await api.get(`/marketing-events/${id}`);
    return res.data;
};

export const createEvent = async (data) => {
    const res = await api.post('/marketing-events', data);
    return res.data;
};

export const updateEvent = async (id, data) => {
    const res = await api.put(`/marketing-events/${id}`, data);
    return res.data;
};

export const deleteEvent = async (id) => {
    const res = await api.delete(`/marketing-events/${id}`);
    return res.data;
};

export const getActiveEvents = async () => {
    const res = await api.get('/marketing-events/active');
    return res.data;
};
