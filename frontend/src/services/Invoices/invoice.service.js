import api from "../axiosInstance";

export const invoiceGetList = async (params = {}) => {
  const res = await api.get("/invoices", { params });
  return res.data;
};

export const invoiceCreate = async (data) => {
  const res = await api.post("/invoices", data);
  return res.data;
};

export const invoiceUpdate = async (id, data) => {
  const res = await api.patch(`/invoices/${id}`, data);
  return res.data;
};

export const invoiceGetDrafts = async () => {
  const res = await api.get("/invoices/drafts");
  return res.data;
};

export const invoiceGetDetail = async (id) => {
  const res = await api.get(`/invoices/${id}`);
  return res.data;
};