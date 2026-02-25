import api from "../axiosInstance";

export const createPayment = (data) => {
  return api.post("/payment/create", data)
}