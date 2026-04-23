import api from "../axiosInstance";

/**
 * Lấy cây danh mục (phân trang).
 * @returns {{ data: Category[], pagination: Pagination }}
 */
export async function fetchCategoryTree(search = "", page = 1, limit = 10) {
  const res = await api.get("/categories/tree", { params: { search, page, limit } });
  return res.data;          // { data: [...], pagination: {...} }
}

/**
 * Lấy danh sách danh mục phẳng (phân trang).
 * @returns {{ data: Category[], total, totalPages }}
 */
export async function fetchCategoryList(search = "", page = 1, limit = 10) {
  const res = await api.get("/categories", { params: { search, page, limit } });
  return res.data;          // { data: [...], total, totalPages }
}

/**
 * Lấy tất cả danh mục (không phân trang).
 * @returns {Category[]}
 */
export const getAllCategories = async () => {
  const res = await api.get("/categories/all");
  return res.data?.data || res.data || [];
};

/**
 * Lấy 1 danh mục theo ID.
 * @returns {Category}
 */
export const getCategoryById = async (id) => {
  const res = await api.get(`/categories/${id}`);
  return res.data?.data || res.data;
};

// ── Mutations (trả raw axios response để caller check res.data.success) ─
export const getCategories = async (params = {}) => {
  const res = await api.get("/categories", { params });
  return res.data;
};

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
