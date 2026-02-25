import api from "../axiosInstance";

export const loginAPI = (data) => {
  return api.post("/auth/login", data);
};