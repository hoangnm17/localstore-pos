import api from "../axiosInstance";

export function fetchCategoryTree(search = "", page = 1, limit = 10) {
  return api.get("/categories/tree", { params: { search, page, limit } });
}

export function fetchCategoryList(search = "", page = 1, limit = 10) {
  return api.get("/categories", { params: { search, page, limit } });
}

export const getCategories = async (params = {}) => {
  const res = await api.get("/categories", { params });
  return res.data;
};

export const getAllCategories = async () => {
  const res = await api.get("/categories/all")
  return res.data;
}

export function getCategoryById(id) {
  return api.get(`/categories/${id}`);
}

export function createCategory(data) {
  return api.post("/categories", data);
}

export function updateCategory(id, data) {
  return api.put(`/categories/${id}`, data);
}

export function deleteCategory(id) {
  return api.delete(`/categories/${id}`);
}

const categoryService = {
  fetchCategoryTree,
  fetchCategoryList,
  getCategories,
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};

export default categoryService;
