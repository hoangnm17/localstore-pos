import api from "../axiosInstance";

const noCache = { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' };

/**
 * Lấy danh sách sản phẩm (product management, phân trang).
 * @returns {{ data: Product[], total: number, totalPages: number }}
 */
export const getProducts = async ({
  page = 1, limit = 20, search = '', status = 'Selling', categoryId = null
} = {}) => {
  const params = { page, limit, status };
  if (search) params.search = search;
  if (categoryId) params.categoryId = categoryId;
  const res = await api.get('/products', { params, headers: noCache });
  return res.data;   // { data: [...], total, totalPages }
};

/**
 * Lấy 1 sản phẩm theo ID.
 * @returns {Product}
 */
export const getProduct = async (id) => {
  const res = await api.get(`/products/${id}`);
  return res.data?.data;
};

export const createProduct = async (payload) => api.post('/products', payload);
export const updateProduct = async (id, payload) => api.put(`/products/${id}`, payload);
export const stopSellingProduct = async (id) => api.delete(`/products/${id}`);
export const startSellingProduct = async (id) => api.patch(`/products/${id}/start-selling`);

/**
 * Lấy danh sách đơn vị tính của sản phẩm.
 * @returns {ProductUnit[]}
 */
export const getProductUnits = async (productId) => {
  const res = await api.get(`/product-units/product/${productId}`);
  return res.data?.data || [];
};

export const createProductUnit = async (payload) => api.post('/product-units', payload);
export const updateProductUnit = async (id, payload) => api.put(`/product-units/${id}`, payload);
export const deleteProductUnit = async (id) => api.delete(`/product-units/${id}`);

/**
 * Lấy toàn bộ lịch sử giá của sản phẩm.
 * @returns {{ salePriceHistories: [], costPriceHistories: [] }}
 */
export const getAllPriceHistory = async (productId) => {
  const res = await api.get(`/price-history/${productId}/all`);
  return res.data?.data || { salePriceHistories: [], costPriceHistories: [] };
};

export const getPriceHistory = async (productId) => {
  const res = await api.get(`/price-history/${productId}`);
  return res.data?.data || [];
};

/**
 * Lấy danh sách thành phần combo của sản phẩm.
 * @returns {ComboItem[]}
 */
export const getComboItems = async (productId) => {
  const res = await api.get(`/products/${productId}/combos`);
  return res.data?.data || [];
};

export const addComboItem = async (productId, payload) =>
  api.post(`/products/${productId}/combos`, payload);
export const removeComboItem = async (productId, comboItemId) =>
  api.delete(`/products/${productId}/combos/${comboItemId}`);
export const assembleCombo = async (productId, quantity) =>
  api.post(`/products/${productId}/combos/assemble`, { quantity });
export const updateComboStock = async (productId, quantity) =>
  api.patch(`/products/${productId}/combos/stock`, { quantity });


/**
 * Lấy sản phẩm theo barcode (POS).
 * @returns {{ success: boolean, data: Product }}
 */
export const getProductWithBarcode = async (barcode) => {
  const res = await api.get(`/products/barcode/${barcode}`);
  return res.data;
};

/**
 * Lấy danh sách sản phẩm cho màn hình POS.
 * @returns {{ success: boolean, data: Product[], pagination }}
 */
export const getAllProducts = async ({
  page = 1, limit = 20, search = '', status = 'Selling', categoryId = null
} = {}) => {
  const params = { page, limit, status };
  if (search) params.search = search;
  if (categoryId) params.categoryId = categoryId;
  const res = await api.get('/products/pos', { params, headers: noCache });
  return res.data;
};

/**
 * Lấy danh sách sản phẩm theo barcode (POS barcode mode).
 * @returns {{ success: boolean, data: Product[] }}
 */
export const getBarcodeProducts = async ({
  page = 1, limit = 20, search = '', status = 'Selling', categoryId = null
} = {}) => {
  const params = { page, limit, status };
  if (search) params.search = search;
  if (categoryId) params.categoryId = categoryId;
  const res = await api.get('/products/pos/barcode', { params, headers: noCache });
  return res.data;
};

/**
 * Upload ảnh sản phẩm.
 * @returns {{ success: boolean, imageUrl: string }}
 */
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  const res = await api.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};
