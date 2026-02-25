import api from "../axiosInstance";

export const loginAPI = (data) => {
  return api.post("/auth/login", data);
};
export const logout = () => {
  localStorage.clear();
  window.location.href = "/login";
};