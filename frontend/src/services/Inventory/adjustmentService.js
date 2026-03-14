import api from "../axiosInstance";

function getAdjustments(params = {}) {
  return api.get("/inventory/adjustments/list", {
    params
  });
}

function getAdjustmentDetail(id) {
  return api.get(`/inventory/adjustments/detail/${id}`);
}

function createAdjustment(data) {
  return api.post("/inventory/adjustments", data);
}

function updateAdjustmentStatus(id, status) {
  return api.patch(
    `/inventory/adjustments/${id}/status`,
    { status }
  );
}

const adjustmentService = {
  getAdjustments,
  getAdjustmentDetail,
  createAdjustment,
  updateAdjustmentStatus
};

export default adjustmentService;