import api from "../axiosInstance";

export const invoiceCreate = (data) => {
  return api.post("/payment/create", data)
}

// Cập nhật invoice (items, status, payment...)
export const invoiceUpdate = (id, data) => {
  return api.patch(`/invoice/${id}`, data);
};

// (tuỳ chọn nếu cần)
export const invoiceGetById = (id) => {
  return api.get(`/invoice/${id}`);
};