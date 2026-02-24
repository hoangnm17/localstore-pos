import api from "./axiosInstance";

/**
 * GET LIST PURCHASE ORDERS
 * GET /inventory/purchase-orders/list
 */
function getPurchaseOrders(params = {}) {
  return api.get("/inventory/purchase-orders/list", {
    params
  });
}

/**
 * GET PURCHASE ORDER DETAIL
 * GET /inventory/purchase-orders/detail/:id
 */
function getPurchaseOrderDetail(id) {
  return api.get(`/inventory/purchase-orders/detail/${id}`);
}

/**
 * CREATE PURCHASE ORDER
 * POST /inventory/purchase-orders/request
 */
function createPurchaseOrder(data) {
  return api.post("/inventory/purchase-orders/request", data);
}

/**
 * UPDATE PURCHASE ORDER STATUS
 * PATCH /inventory/purchase-orders/status/:id
 */
function updatePurchaseOrderStatus(id, newStatus) {
  return api.patch(
    `/inventory/purchase-orders/status/${id}`,
    { newStatus }
  );
}

export default {
  getPurchaseOrders,
  getPurchaseOrderDetail,
  createPurchaseOrder,
  updatePurchaseOrderStatus
};