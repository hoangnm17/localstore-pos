import api from "../axiosInstance";

const productStockService = {
  getProductsByCategory(categoryId, search = "", page = 1, limit = 10) {
    return api.get(`/inventory/categories/${categoryId}/products`, {
      params: { search, page, limit }
    });
  },

  getProductsBySupplier(supplierId, search = "") {
    return api.get(`/inventory/suppliers/${supplierId}/products`, {
      params: { search }
    });
  },

  updateStock(productId, quantity) {
    return api.put(`/inventory/products/stock`, {
      productId,
      quantity
    });
  },

  updateMinThreshold(productId, minThreshold) {
    return api.put(`/inventory/${productId}/min-threshold`, {
      minThreshold
    });
  },

  searchProduct(keyword) {
    return api.get(`/inventory/products/search`, {
      params: { keyword }
  });
  },

  getLowStockProducts() {
    return api.get(`/inventory/products/low-stock`);
  },

  searchProductUnits(keyword) {
    return api.get(`/inventory/product-units/search`, {
      params: { keyword }
    });
  }
};

export default productStockService;