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
        <div className="card-header bg-primary text-white d-flex align-items-center justify-content-between py-3 px-4">
          <div className="d-flex align-items-center">
            <button
              className="btn btn-outline-light me-3 rounded-pill px-4"
              onClick={() => navigate("/inventory/menu")}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Quay về Menu
            </button>
            <h4 className="mb-0 fw-bold">
              Danh sách Đơn đặt hàng (Purchase Orders)
            </h4>
          </div>
        </div>

        {/* Body */}
        <div className="card-body p-4 p-md-5">
          
          {/* Filter */}
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <label className="form-label fw-semibold">Từ ngày</label>
              <input
                type="date"
                className="form-control"
                value={filters.from}
                onChange={(e) => setFilters({ ...filters, from: e.target.value })}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold">Đến ngày</label>
              <input
                type="date"
                className="form-control"
                value={filters.to}
                onChange={(e) => setFilters({ ...filters, to: e.target.value })}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold">Trạng thái</label>
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="">Tất cả</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Received">Received</option>
              </select>
            </div>

            <div className="col-md-3 d-flex align-items-end">
              <button
                className="btn btn-primary w-100 rounded-pill shadow-sm"
                onClick={handleFilter}
                disabled={loading}
              >
                <i className="bi bi-filter me-2"></i>
                Lọc
              </button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
              <p className="mt-3 text-muted">Đang tải dữ liệu...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover table-striped table-bordered align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>ID</th>
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
                      <td colSpan="6" className="text-center py-4 text-muted fst-italic">
                        Không có dữ liệu đơn đặt hàng nào
                      </td>
                    </tr>
                  ) : (
                    orders.map((po) => (
                      <tr key={po.id}>
                        <td className="fw-medium">#{po.id}</td>
                        <td>
                          <span
                            className={`badge bg-${
                              po.status === "Approved"
                                ? "success"
                                : po.status === "Received"
                                ? "info"
                                : "warning"
                            } px-3 py-2`}
                          >
                            {po.status}
                          </span>
                        </td>
                        <td>{po.supplierName || "—"}</td>
                        <td>{po.createdByName || "—"}</td>
                        <td>
                          {po.createdAt
                            ? new Date(po.createdAt).toLocaleString("vi-VN")
                            : "—"}
                        </td>
                        <td className="text-center">
                          <button
                            className="btn btn-sm btn-outline-primary rounded-pill px-3"
                            onClick={() => handleViewDetail(po.id)}
                          >
                            <i className="bi bi-eye me-1"></i>
                            Xem chi tiết
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && orders.length > 0 && totalPages > 1 && (
            <nav className="mt-4">
              <ul className="pagination justify-content-center mb-0">
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
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderList;