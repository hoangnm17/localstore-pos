import api from "../axiosInstance";

export const invoiceCreate = (data) => {
  return api.post("/invoices", data)
}