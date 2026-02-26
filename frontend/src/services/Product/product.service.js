import api from "../axiosInstance"

export const fetchProduct = () => {
  return api.get("/products")
}

export const getProducts = async (params = {}) => {
  const res = await axiosClient.get("/products", { params });
  return res.data;
};