import api from "../axiosInstance";

function getSupplierList(search = "") {
  return api.get("/inventory/suppliers/list", {
    params: { search }
  });
}

function getSupplierById(id) {
  return api.get(`/inventory/suppliers/${id}`);
}

function getProductsBySupplier(id, page = 1, limit = 10) {
  return api.get(`/inventory/suppliers/${id}/products`, {
    params: { page, limit }
  });
}

function getAvailableProducts(id, search = "") {
  return api.get(`/inventory/suppliers/${id}/products/available`, {
    params: { search }
  });
}

function addProductToSupplier(id, data) {
  return api.post(`/inventory/suppliers/${id}/products`, data);
}

function createSupplier(data) {
  return api.post("/inventory/create/supplier", data);
}

const supplierService = {
  getSupplierList,
  getSupplierById,
  getProductsBySupplier,
  getAvailableProducts,
  addProductToSupplier,
  createSupplier
};

export default supplierService;