import api from "../axiosInstance"

export const fetchProduct = () => {
  return api.get("/products")
}