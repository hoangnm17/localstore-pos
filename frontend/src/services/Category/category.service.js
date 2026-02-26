import api from "../axiosInstance";

export const getCategories = async (params = {}) => {
  const res = await api.get("/categories", { params });
  return res.data;
};

export const getAllCategories = async () => {
    const res = await api.get("/categories/all")
    return res.data;
}