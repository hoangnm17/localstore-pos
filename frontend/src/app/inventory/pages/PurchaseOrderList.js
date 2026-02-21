import { useEffect, useState } from "react";
import purchaseOrderService from "../../../services/purchaseOrder.service";
import { useNavigate } from "react-router-dom";

const PurchaseOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    status: "",
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const fetchData = async (customPage = page) => {
    try {
      setLoading(true);

      const res = await purchaseOrderService.getPurchaseOrders({
        page: customPage,
        from: filters.from || undefined,
        to: filters.to || undefined,
        status: filters.status || undefined,
      });

      const responseData = res?.data;

      setOrders(Array.isArray(responseData?.data) ? responseData.data : []);
      setTotalPages(responseData?.totalPages || 1);
      setPage(responseData?.page || 1);
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const handleFilter = () => {
    setPage(1);
    fetchData(1);
  };

  const handlePrev = () => {
    if (page > 1) fetchData(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) fetchData(page + 1);
  };

  const handleViewDetail = (id) => {
    navigate(`/inventory/purchase-orders/${id}`);
  };

  return (
    <div className="container-fluid py-4 px-3 px-md-4 bg-light min-vh-100">
      <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
        {/* Header */}
        <div className="card-header bg-primary text-white d-flex align-items-center justify-content-between py-3 px-4 px-md-5">
          <div className="d-flex align-items-center">
            <button
              className="btn btn-outline-light me-3 rounded-pill px-4 py-2"
              onClick={() => navigate("/inventory/menu")}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Quay về Menu
            </button>
            <h4 className="mb-0 fw-bold">Danh sách Đơn đặt hàng</h4>
          </div>
        </div>

        {/* Body */}
        <div className="card-body p-4 p-md-5">
          {/* Filter Form */}
          <div className="row g-3 mb-5">
            <div className="col-md-3">
              <label className="form-label fw-semibold text-muted">Từ ngày</label>
              <input
                type="date"
                className="form-control shadow-sm"
                value={filters.from}
                onChange={(e) => setFilters({ ...filters, from: e.target.value })}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold text-muted">Đến ngày</label>
              <input
                type="date"
                className="form-control shadow-sm"
                value={filters.to}
                onChange={(e) => setFilters({ ...filters, to: e.target.value })}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold text-muted">Trạng thái</label>
              <select
                className="form-select shadow-sm"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="Pending">Chờ duyệt</option>
                <option value="Approved">Đã duyệt</option>
                <option value="Received">Đã nhận hàng</option>
              </select>
            </div>

            <div className="col-md-3 d-flex align-items-end">
              <button
                className="btn btn-primary w-100 rounded-pill shadow"
                onClick={handleFilter}
                disabled={loading}
              >
                <i className="bi bi-funnel-fill me-2"></i>
                Áp dụng bộ lọc
              </button>
            </div>
          </div>

          {/* Table Section */}
          {loading ? (
            <div className="text-center py-5 my-5">
              <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-4 text-muted fs-5">Đang tải danh sách đơn đặt hàng...</p>
            </div>
          ) : (
            <>
              <div className="table-responsive rounded-3 border shadow-sm">
                <table className="table table-hover table-striped align-middle mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th scope="col" className="ps-4">Mã đơn</th>
                      <th scope="col">Trạng thái</th>
                      <th scope="col">Nhà cung cấp</th>
                      <th scope="col">Người tạo</th>
                      <th scope="col">Ngày tạo</th>
                      <th scope="col" className="text-center">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-5 text-muted fst-italic fs-5">
                          Không tìm thấy đơn đặt hàng nào phù hợp
                        </td>
                      </tr>
                    ) : (
                      orders.map((po) => (
                        <tr key={po.id} className="align-middle">
                          <td className="ps-4 fw-medium">#{po.id}</td>
                          <td>
                            <span
                              className={`badge fs-6 px-3 py-2 rounded-pill bg-${
                                po.status === "Approved"
                                  ? "success"
                                  : po.status === "Received"
                                  ? "info"
                                  : "warning"
                              }`}
                            >
                              {po.status === "Pending"
                                ? "Chờ duyệt"
                                : po.status === "Approved"
                                ? "Đã duyệt"
                                : "Đã nhận hàng"}
                            </span>
                          </td>
                          <td>{po.supplierName || "—"}</td>
                          <td>{po.createdByName || "—"}</td>
                          <td>
                            {po.createdAt
                              ? new Date(po.createdAt).toLocaleDateString("vi-VN", {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                })
                              : "—"}
                          </td>
                          <td className="text-center">
                            <button
                              className="btn btn-sm btn-outline-primary rounded-pill px-4 py-2"
                              onClick={() => handleViewDetail(po.id)}
                              title="Xem chi tiết đơn hàng"
                            >
                              <i className="bi bi-eye me-1"></i>
                              Chi tiết
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {!loading && orders.length > 0 && totalPages > 1 && (
                <nav className="mt-5" aria-label="Pagination">
                  <ul className="pagination pagination-lg justify-content-center mb-0">
                    <li className={`page-item ${page <= 1 ? "disabled" : ""}`}>
                      <button className="page-link rounded-start-pill px-4" onClick={handlePrev}>
                        <i className="bi bi-chevron-left me-1"></i> Trước
                      </button>
                    </li>
                    <li className="page-item disabled">
                      <span className="page-link px-4 fw-bold">
                        Trang {page} / {totalPages}
                      </span>
                    </li>
                    <li className={`page-item ${page >= totalPages ? "disabled" : ""}`}>
                      <button className="page-link rounded-end-pill px-4" onClick={handleNext}>
                        Sau <i className="bi bi-chevron-right ms-1"></i>
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