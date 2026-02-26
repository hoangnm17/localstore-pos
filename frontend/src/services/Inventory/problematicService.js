import api from "../axiosInstance";

function getReports(filters = {}) {
  return api.get("/inventory/reports/list", {
    params: filters
  });
}

function createReport(data) {
  return api.post("/inventory/reports/send", data);
}

function updateReportStatus(reportId, status) {
  return api.put(`/inventory/reports/${reportId}/status`, {
    status
  });
}

const problematicService = {
  getReports,
  createReport,
  updateReportStatus
};

export default problematicService;