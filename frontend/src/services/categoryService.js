import api from "./axiosInstance";

function fetchCategoryTree(search = "", page = 1, limit = 10) {
    return api.get("/categories/tree", {
        params: { search, page, limit }
    });
}

function fetchCategoryList(search = "", page = 1, limit = 10) {
    return api.get("/categories", {
        params: { search, page, limit }
    });
}

function createCategory(data) {
    return api.post("/categories", data);
}

function updateCategory(id, data) {
    return api.put(`/categories/${id}`, data);
}

function deleteCategory(id) {
    return api.delete(`/categories/${id}`);
}

function getCategoryById(id) {
    return api.get(`/categories/${id}`);
}

const categoryService = {
    fetchCategoryTree,
    fetchCategoryList,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById
};

export default categoryService;