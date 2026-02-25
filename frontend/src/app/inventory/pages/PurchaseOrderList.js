import { useEffect, useState, useCallback } from "react";
import purchaseOrderService from "../../../services/purchaseOrderService";
import { useNavigate } from "react-router-dom";

const PurchaseOrderList = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    from: "",
    to: "",
    status: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const statusConfig = {
    Pending: { label: "Chờ duyệt", color: "warning" },
    Approved: { label: "Đã duyệt", color: "success" },
    WaitingForDelivery: { label: "Chờ giao hàng", color: "primary" },
    Received: { label: "Đã nhận hàng", color: "info" },
    CannotDeliver: { label: "Không thể giao", color: "dark" },
    Rejected: { label: "Từ chối", color: "danger" },
  };

  /* ================= FETCH DATA ================= */

  const fetchData = useCallback(
    async (customPage = page) => {
      try {
        setLoading(true);

        const res = await purchaseOrderService.getPurchaseOrders({
          page: customPage,
          from: filters.from || undefined,
          to: filters.to || undefined,
          status: filters.status || undefined,
        });

        // Vì interceptor đã return response.data
        setOrders(Array.isArray(res?.data) ? res.data : []);
        setTotalPages(res?.totalPages || 1);
        setPage(res?.page || customPage);
      } catch (err) {
        console.error("Fetch PO error:", err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    },
    [filters, page]
  );

  /* ================= EFFECT ================= */

  useEffect(() => {
    fetchData(page);
  }, [page, filters, fetchData]);

  /* ================= HANDLERS ================= */

  const handleFilter = () => {
    // Nếu đang ở page 1 thì gọi luôn API
    if (page === 1) {
      fetchData(1);
    } else {
      setPage(1);
    }
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

  /* ================= UI ================= */

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
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
          {/* FILTER */}
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <label className="form-label fw-semibold text-muted">
                Từ ngày
              </label>
              <input
                type="date"
                className="form-control"
                value={filters.from}
                onChange={(e) =>
                  setFilters({ ...filters, from: e.target.value })
                }
              />
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold text-muted">
                Đến ngày
              </label>
              <input
                type="date"
                className="form-control"
                value={filters.to}
                onChange={(e) =>
                  setFilters({ ...filters, to: e.target.value })
                }
              />
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold text-muted">
                Trạng thái
              </label>
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
              >
                <option value="">Tất cả trạng thái</option>
                {Object.keys(statusConfig).map((key) => (
                  <option key={key} value={key}>
                    {statusConfig[key].label}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-3 d-flex align-items-end">
              <button
                className="btn btn-primary w-100 rounded-pill"
                onClick={handleFilter}
                disabled={loading}
              >
                <i className="bi bi-funnel-fill me-2"></i>
                Áp dụng bộ lọc
              </button>
            </div>
          </div>

          {/* TABLE */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" />
              <p className="mt-3 text-muted">
                Đang tải danh sách đơn đặt hàng...
              </p>
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
                      <th className="text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="text-center py-4 text-muted fst-italic"
                        >
                          Không tìm thấy đơn đặt hàng
                        </td>
                      </tr>
                    ) : (
                      orders.map((po) => {
                        const status = statusConfig[po.status];

                        return (
                          <tr key={po.id}>
                            <td className="ps-4 fw-medium">#{po.id}</td>
                            <td>
                              <span
                                className={`badge rounded-pill bg-${
                                  status?.color || "secondary"
                                }`}
                              >
                                {status?.label || po.status}
                              </span>
                            </td>
                            <td>{po.supplierName || "—"}</td>
                            <td>{po.createdByName || "—"}</td>
                            <td>
                              {po.createdAt
                                ? new Date(po.createdAt).toLocaleDateString(
                                    "vi-VN"
                                  )
                                : "—"}
                            </td>
                            <td className="text-center">
                              <button
                                className="btn btn-sm btn-outline-primary rounded-pill px-3"
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
                <nav className="mt-4">
                  <ul className="pagination justify-content-center">
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

                    <li
                      className={`page-item ${
                        page >= totalPages ? "disabled" : ""
                      }`}
                    >
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