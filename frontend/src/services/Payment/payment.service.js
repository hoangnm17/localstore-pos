import api from "../axiosInstance";

export const createBankPayment = (invoiceId, payload = {}) => {
  return api.post("/payment/create-qr", {
    invoiceId,
    ...payload,
  });
};