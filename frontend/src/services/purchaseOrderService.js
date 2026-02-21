import axios from "axios";

const API_URL = "http://localhost:5000/api";

/**
 * GET LIST PURCHASE ORDERS
 * GET /api/purchase-orders/list
 */
function getPurchaseOrders(params = {}) {
    return axios.get(`${API_URL}/inventory/purchase-orders/list`, {
        params
    });
}

/**
 * GET PURCHASE ORDER DETAIL
 * GET /api/purchase-orders/detail/:id
 */
function getPurchaseOrderDetail(id) {
    return axios.get(`${API_URL}/inventory/purchase-orders/detail/${id}`);
}

/**
 * CREATE PURCHASE ORDER
 * POST /api/purchase-orders/request
 */
function createPurchaseOrder(data) {
    return axios.post(`${API_URL}/inventory/purchase-orders/request`, data, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    });
}

/**
 * UPDATE PURCHASE ORDER STATUS
 * PATCH /api/purchase-orders/status/:id
 */
function updatePurchaseOrderStatus(id, newStatus) {
    return axios.patch(
        `${API_URL}/inventory/purchase-orders/status/${id}`,
        { newStatus },
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        }
    );
}

export default {
    getPurchaseOrders,
    getPurchaseOrderDetail,
    createPurchaseOrder,
    updatePurchaseOrderStatus
};