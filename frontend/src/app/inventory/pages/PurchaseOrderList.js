import { useEffect, useState, useCallback } from "react";
import purchaseOrderService from "../../../services/Inventory/purchaseOrderService";
import { useNavigate, useSearchParams } from "react-router-dom";

const PurchaseOrderList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Khởi tạo từ URL query params
  const initialFrom = searchParams.get("from") || "";
  const initialTo = searchParams.get("to") || "";
  const initialStatus = searchParams.get("status") || "";
  const initialPage = parseInt(searchParams.get("page") || "1", 10);

  const [filters, setFilters] = useState({
    from: initialFrom,
    to: initialTo,
    status: initialStatus,
  });

  const [page, setPage] = useState(initialPage > 0 ? initialPage : 1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalByStatus, setTotalByStatus] = useState({});

  // Dòng này bị thiếu → gây lỗi ESLint
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(initialStatus);

  const statusConfig = {
    "": { label: "Tất cả", color: "secondary", icon: "bi-list-ul" },
    Pending: { label: "Chờ duyệt", color: "warning", icon: "bi-hourglass-split" },
    Approved: { label: "Đã duyệt", color: "success", icon: "bi-check-circle" },
    WaitingForDelivery: { label: "Chờ giao hàng", color: "primary", icon: "bi-truck" },
    PartiallyReceived: { label: "Nhận một phần", color: "info", icon: "bi-boxes" },
    Received: { label: "Đã nhận hàng", color: "info", icon: "bi-check2-all" },
    CannotDeliver: { label: "Không thể giao", color: "dark", icon: "bi-x-octagon" },
    Rejected: { label: "Từ chối", color: "danger", icon: "bi-x-circle" },
  };

  const fetchData = useCallback(
    async (customPage = page) => {
      try {
        setLoading(true);

        const params = {
          page: customPage,
          ...(filters.from && { from: filters.from }),
          ...(filters.to && { to: filters.to }),
          ...(filters.status && { status: filters.status }),
        };

        const res = await purchaseOrderService.getPurchaseOrders(params);
        const response = res?.data;

        if (!response?.success) {
          setOrders([]);
          return;
        }

        setOrders(Array.isArray(response.data) ? response.data : []);
        setTotalPages(response.pagination?.totalPages || 1);
        setPage(response.pagination?.page || customPage);

        if (response.totalByStatus) {
          setTotalByStatus(response.totalByStatus);
        }
      } catch (err) {
        console.error("Fetch PO error:", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    },
    [filters, page]
  );

  // Fetch khi filters hoặc page thay đổi
  useEffect(() => {
    fetchData(page);
  }, [filters, page, fetchData]);

  // Đồng bộ filters + page → URL
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    if (filters.status) params.set("status", filters.status);
    params.set("page", page.toString());

    setSearchParams(params, { replace: true });
  }, [filters, page, setSearchParams]);

  const handleTabClick = (status) => {
    setActiveTab(status);
    setFilters((prev) => ({ ...prev, status }));
    setPage(1);
  };

  const handlePrev = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };

  const handleViewDetail = (id) => {
    navigate(`/inventory/purchase-orders/${id}`);
  };

  const handleCreatePO = () => {
    navigate("/inventory/purchase-orders/create");
  };

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
        {/* Header */}
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center py-3 px-4">
          <div className="d-flex align-items-center">
            <button
              className="btn btn-outline-light me-3 rounded-pill px-4"
              onClick={() => navigate("/inventory/menu")}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Quay về Menu
            </button>
            <h4 className="mb-0 fw-bold">Danh sách Đơn đặt hàng</h4>
          </div>

          <button
            className="btn btn-warning rounded-pill px-4 fw-semibold shadow"
            onClick={handleCreatePO}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Tạo đơn nhập hàng
          </button>
        </div>

        <div className="card-body p-4">
          {/* Tabs trạng thái */}
          <div className="mb-4">
            <ul className="nav nav-tabs nav-fill flex-nowrap overflow-auto">
              {Object.entries(statusConfig).map(([key, { label, color, icon }]) => (
                <li className="nav-item" key={key}>
                  <button
                    className={`nav-link fw-semibold px-4 py-3 d-flex align-items-center justify-content-center gap-2 border-0 ${
                      activeTab === key ? `active bg-${color} text-white` : `text-${color}`
                    }`}
                    onClick={() => handleTabClick(key)}
                    style={{ minWidth: "140px" }}
                  >
                    <i className={`bi ${icon} fs-5`}></i>
                    {label}
                    {totalByStatus[key] > 0 && (
                      <span className="badge bg-white text-dark ms-1 rounded-pill">
                        {totalByStatus[key]}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Bộ lọc ngày */}
          <div className="row g-3 mb-4">
            <div className="col-md-4 col-lg-3">
              <label className="form-label fw-semibold text-muted">Từ ngày</label>
              <input
                type="date"
                className="form-control"
                value={filters.from}
                onChange={(e) => setFilters({ ...filters, from: e.target.value })}
              />
            </div>
            <div className="col-md-4 col-lg-3">
              <label className="form-label fw-semibold text-muted">Đến ngày</label>
              <input
                type="date"
                className="form-control"
                value={filters.to}
                onChange={(e) => setFilters({ ...filters, to: e.target.value })}
              />
            </div>
            <div className="col-md-4 col-lg-3 d-flex align-items-end">
              <button
                className="btn btn-primary w-100 rounded-pill"
                onClick={() => setPage(1)}
                disabled={loading}
              >
                <i className="bi bi-funnel-fill me-2"></i>
                Lọc theo ngày
              </button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }} />
              <p className="mt-3 text-muted fs-5">Đang tải danh sách đơn đặt hàng...</p>
            </div>
          ) : (
            <>
              <div className="table-responsive rounded-3 border shadow-sm">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th className="ps-4">Mã đơn</th>
                      <th>Trạng thái</th>
                      <th>Nhà cung cấp</th>
                      <th>Người tạo</th>
                      <th>Ngày tạo</th>
                      <th>Tổng tiền</th>
                      <th className="text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-5 text-muted fst-italic fs-5">
                          Không tìm thấy đơn đặt hàng
                        </td>
                      </tr>
                    ) : (
                      orders.map((po) => {
                        const status = statusConfig[po.status] || { label: po.status, color: "secondary" };

                        return (
                          <tr key={po.id} style={{ height: "72px" }}>
                            <td className="ps-4 fw-semibold fs-5">#{po.id}</td>
                            <td>
                              <span className={`badge fs-5 px-3 py-2 rounded-pill bg-${status.color}`}>
                                {status.label}
                              </span>
                            </td>
                            <td className="fs-5">
                              {po.supplierName || po.supplierId || "—"}
                            </td>
                            <td className="fs-5">
                              {po.createdByName || po.createdBy || "—"}
                            </td>
                            <td className="fs-5">
                              {po.createdAt
                                ? new Date(po.createdAt).toLocaleDateString("vi-VN", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  })
                                : "—"}
                            </td>
                            <td className="fs-5 fw-bold text-success">
                              {po.totalAmount?.toLocaleString("vi-VN") || "0"} ₫
                            </td>
                            <td className="text-center">
                              <button
                                className="btn btn-outline-primary rounded-pill px-4 py-2 fw-semibold"
                                onClick={() => handleViewDetail(po.id)}
                              >
                                <i className="bi bi-eye me-1"></i>
                                Chi tiết
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {orders.length > 0 && totalPages > 1 && (
                <nav className="mt-5">
                  <ul className="pagination pagination-lg justify-content-center">
                    <li className={`page-item ${page <= 1 ? "disabled" : ""}`}>
                      <button className="page-link" onClick={handlePrev}>
                        Trước
                      </button>
                    </li>
                    <li className="page-item disabled">
                      <span className="page-link">
                        Trang {page} / {totalPages}
                      </span>
                    </li>
                    <li className={`page-item ${page >= totalPages ? "disabled" : ""}`}>
                      <button className="page-link" onClick={handleNext}>
                        Sau
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderList;