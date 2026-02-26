import api from "../axiosInstance";

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

/**
 * WAREHOUSE - RECEIVE PURCHASE ORDER
 */
function receivePurchaseOrder(id) {
  return api.patch(
    `/inventory/purchase-orders/receive/${id}`
  );
}

/**
 * GET MONTHLY PURCHASE ORDER REPORT
 * GET /inventory/purchase-orders/report
 */
function getMonthlyPOReport(params = {}) {
  return api.get("/inventory/purchase-orders/report", {
    params
  });
}

const purchaseOrderService = {
  getPurchaseOrders,
  getPurchaseOrderDetail,
  createPurchaseOrder,
  updatePurchaseOrderStatus,
  receivePurchaseOrder,
  getMonthlyPOReport
};

export default purchaseOrderService;