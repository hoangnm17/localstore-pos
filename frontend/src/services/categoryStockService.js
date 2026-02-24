import api from "./axiosInstance";

// categoryService
function getCategoryStock(search = "", page = 1, limit = 10) {
  return api.get("/inventory/categories", {
    params: { search, page, limit }
  });
}

// ProblematicReport
function getReports(filters = {}) {
  return api.get("/inventory/reports/list", {
    params: filters
  });
}

function createReport(data) {
  return api.post("/inventory/reports/send", data);
}

export default {
  getCategoryStock,
  getReports,
  createReport
};