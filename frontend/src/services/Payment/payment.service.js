import api from "../axiosInstance";

export const payCash = async (id, data) => {
  const res = await api.post(`/payment/${id}/pay-cash`, data);
  return res.data;
};

export const createBankPayment = (invoiceId, payload = {}) => {
  return api.post("/payment/create-qr", {
    invoiceId,
    ...payload,
  });
};

export const cancelPendingPayment = async (invoiceId) => {
  return await api.post(`/payment/${invoiceId}/cancel`);
};