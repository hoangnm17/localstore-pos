import api from "../axiosInstance";

export const invoiceGetList = async (params = {}) => {
  const res = await api.get("/invoices", { params });
  return res.data !== undefined ? res.data : res;
};

export const invoiceCreate = async (data) => {
  const res = await api.post("/invoices", data);
  return res.data !== undefined ? res.data : res;
};

export const invoiceUpdateItems = async (id, data) => {
  const res = await api.patch(`/invoices/${id}/items`, data);
  return res.data !== undefined ? res.data : res;
};

export const payCash = async (id, data) => {
  const res = await api.post(`/invoices/${id}/pay-cash`, data);
  return res.data !== undefined ? res.data : res;
};

export const payBank = async (id, data) => {
  const res = await api.post(`/invoices/${id}/pay-bank`, data);
  return res.data !== undefined ? res.data : res;
};

export const invoiceCancel = async (id) => {
  const res = await api.post(`/invoices/${id}/cancel`);
  return res.data !== undefined ? res.data : res;
};

export const invoiceGetDrafts = async () => {
  const res = await api.get("/invoices/drafts");
  return res.data !== undefined ? res.data : res;
};

export const invoiceGetDetail = async (id) => {
  const res = await api.get(`/invoices/${id}`);
  return res.data !== undefined ? res.data : res;
};

export const invoiceUpdateCustomer = async (id, data) => {
  const res = await api.patch(`/invoices/customer/${id}`, data);
  return res.data !== undefined ? res.data : res;
};