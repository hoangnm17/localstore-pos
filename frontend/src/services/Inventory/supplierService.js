import api from "../axiosInstance";

function getSupplierList(search = "") {
  return api.get("/inventory/suppliers/list", {
    params: { search }
  });
}

export default {
  getSupplierList
};