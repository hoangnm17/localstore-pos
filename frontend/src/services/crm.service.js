import axios from 'axios';

const API = 'http://localhost:5000/api';

// ═══════════════════════════════════════════
//  CUSTOMERS
// ═══════════════════════════════════════════

export const getCustomers = async (params) => {
    const res = await axios.get(`${API}/customers`, { params });
    return res.data;
};

export const getCustomerById = async (id) => {
    const res = await axios.get(`${API}/customers/${id}`);
    return res.data;
};

export const createCustomer = async (data) => {
    const res = await axios.post(`${API}/customers`, data);
    return res.data;
};

export const updateCustomer = async (id, data) => {
    const res = await axios.put(`${API}/customers/${id}`, data);
    return res.data;
};

export const deleteCustomer = async (id) => {
    const res = await axios.delete(`${API}/customers/${id}`);
    return res.data;
};

/** UC3: Lịch sử mua hàng của khách */
export const getPurchaseHistory = async (customerId, params = {}) => {
    const res = await axios.get(`${API}/customers/${customerId}/purchase-history`, { params });
    return res.data;
};

/** UC4: Lịch sử điểm tích lũy */
export const getPointLogs = async (customerId, params = {}) => {
    const res = await axios.get(`${API}/customers/${customerId}/point-logs`, { params });
    return res.data;
};

/** UC4: Điều chỉnh điểm thủ công */
export const adjustPoints = async (customerId, data) => {
    const res = await axios.patch(`${API}/customers/${customerId}/points`, data);
    return res.data;
};

// ═══════════════════════════════════════════
//  PROMOTIONS
// ═══════════════════════════════════════════

export const getPromotions = async (params) => {
    const res = await axios.get(`${API}/promotions`, { params });
    return res.data;
};

export const getPromotionById = async (id) => {
    const res = await axios.get(`${API}/promotions/${id}`);
    return res.data;
};

export const createPromotion = async (data) => {
    const res = await axios.post(`${API}/promotions`, data);
    return res.data;
};

export const updatePromotion = async (id, data) => {
    const res = await axios.put(`${API}/promotions/${id}`, data);
    return res.data;
};

export const deletePromotion = async (id) => {
    const res = await axios.delete(`${API}/promotions/${id}`);
    return res.data;
};

/** UC6: Thêm sản phẩm/danh mục vào promotion */
export const addPromotionItem = async (promotionId, data) => {
    const res = await axios.post(`${API}/promotions/${promotionId}/items`, data);
    return res.data;
};

/** UC6: Xóa sản phẩm/danh mục khỏi promotion */
export const removePromotionItem = async (promotionId, itemId) => {
    const res = await axios.delete(`${API}/promotions/${promotionId}/items/${itemId}`);
    return res.data;
};

/** UC8: Danh sách KM đang hiệu lực */
export const getActivePromotions = async () => {
    const res = await axios.get(`${API}/promotions/active`);
    return res.data;
};

/** UC9: Báo cáo hiệu quả khuyến mãi */
export const getPromotionReport = async (params = {}) => {
    const res = await axios.get(`${API}/promotions/report`, { params });
    return res.data;
};

// ═══════════════════════════════════════════
//  VOUCHERS
// ═══════════════════════════════════════════

export const getVouchers = async (params) => {
    const res = await axios.get(`${API}/vouchers`, { params });
    return res.data;
};

export const getVoucherByCode = async (code) => {
    const res = await axios.get(`${API}/vouchers/code/${code}`);
    return res.data;
};

export const createVoucher = async (data) => {
    const res = await axios.post(`${API}/vouchers`, data);
    return res.data;
};

export const updateVoucher = async (id, data) => {
    const res = await axios.put(`${API}/vouchers/${id}`, data);
    return res.data;
};

export const deleteVoucher = async (id) => {
    const res = await axios.delete(`${API}/vouchers/${id}`);
    return res.data;
};

/** UC8: Validate voucher trước khi áp dụng */
export const validateVoucher = async (data) => {
    const res = await axios.post(`${API}/vouchers/validate`, data);
    return res.data;
};

/** UC10: Báo cáo thống kê sử dụng voucher */
export const getVoucherReport = async (params = {}) => {
    const res = await axios.get(`${API}/vouchers/report`, { params });
    return res.data;
};
