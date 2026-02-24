import api from "./axiosInstance";

const productStockService = {
  getProductsByCategory(categoryId, search = "", page = 1, limit = 10) {
    return api.get(`/inventory/categories/${categoryId}/products`, {
      params: { search, page, limit }
    });
  },

  getProductsBySupplier(supplierId, search = "", page = 1, limit = 10) {
    return api.get(`/inventory/suppliers/${supplierId}/products`, {
      params: { search, page, limit }
    });
  },

  updateStock(productId, quantity) {
    return api.put(`/inventory/products/stock`, {
      productId,
      quantity
    });
  }
};

export default productStockService;