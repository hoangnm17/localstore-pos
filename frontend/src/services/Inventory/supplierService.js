import api from "../axiosInstance";

function getSupplierList(search = "") {
  return api.get("/inventory/suppliers/list", {
    params: { search }
  });
}

function getSupplierById(id) {
  return api.get(`/inventory/suppliers/${id}`);
}

const supplierService = {
  getSupplierList,
  getSupplierById
};

export default supplierService;