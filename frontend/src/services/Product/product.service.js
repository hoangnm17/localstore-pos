import api from "../axiosInstance"

export const getProducts = async ({ page = 1, limit = 20, search = '', status = 'Selling', categoryId = null } = {}) => {
  const params = { page, limit, status };
  if (search) params.search = search;
  if (categoryId) params.categoryId = categoryId;
  return api.get('/products', {
    params,
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    },
  });
};

export const getBarcodeProducts = async ({ page = 1, limit = 20, search = '', status = 'Selling', categoryId = null } = {}) => {
  const params = { page, limit, status };
  if (search) params.search = search;
  if (categoryId) params.categoryId = categoryId;
  const res = await api.get('/products/pos/barcode', {
    params,
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    },
  });
  return res.data
};

export const getProduct = async (id) => api.get(`/products/${id}`);
export const createProduct = async (payload) => api.post('/products', payload);
export const updateProduct = async (id, payload) => api.put(`/products/${id}`, payload);
export const stopSellingProduct = async (id) => api.delete(`/products/${id}`);
export const startSellingProduct = async (id) => api.patch(`/products/${id}/start-selling`);

// ===== Product Units =====
export const getProductUnits = async (productId) => api.get(`/product-units/product/${productId}`);
export const createProductUnit = async (payload) => api.post('/product-units', payload);
export const updateProductUnit = async (id, payload) => api.put(`/product-units/${id}`, payload);
export const deleteProductUnit = async (id) => api.delete(`/product-units/${id}`);

// ===== Price History =====
export const getAllPriceHistory = async (productId) => api.get(`/price-history/${productId}/all`);
export const getPriceHistory = async (productId) => api.get(`/price-history/${productId}`);

// ===== Combos =====
export const getComboItems = async (productId) => api.get(`/products/${productId}/combos`);
export const addComboItem = async (productId, payload) => api.post(`/products/${productId}/combos`, payload);
export const removeComboItem = async (productId, comboItemId) => api.delete(`/products/${productId}/combos/${comboItemId}`);
export const assembleCombo = async (productId, quantity) => api.post(`/products/${productId}/combos/assemble`, { quantity });
export const updateComboStock = async (productId, quantity) => api.patch(`/products/${productId}/combos/stock`, { quantity });

export const getProductWithBarcode = async (barcode) => {
  const res = await api.get(`/products/barcode/${barcode}`);
  return res.data;
}


export const getAllProducts = async ({ page = 1, limit = 20, search = '', status = 'Selling', categoryId = null } = {}) => {
  const params = { page, limit, status };
  if (search) params.search = search;
  if (categoryId) params.categoryId = categoryId;
  const res = await api.get('/products/pos', {
    params,
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    },
  });
  return res.data;
};

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  console.log('Calling upload API:', api.defaults.baseURL + '/upload/image'); //thêm dòng này
  const res = await api.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

