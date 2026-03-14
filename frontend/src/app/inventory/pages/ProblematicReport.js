import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import problematicService from "../../../services/Inventory/problematicService";
import ProblematicDetailModal from "../InventoryModal/ProblematicDetailModal";
import ProblematicCreateModal from "../InventoryModal/ProblematicCreateModal";

function ProblematicPage() {
  const user = JSON.parse(localStorage.getItem("user"));
  const hasProcessPermission =
    user?.features?.includes("PROCESS_PROBLEMATIC") || false;

  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [filters, setFilters] = useState({
    status: "",
    createdFrom: "",
    createdTo: "",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    setPage(1);
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    try {
      const cleanedFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "")
      );

      const res = await problematicService.getReports(cleanedFilters);

      const data = Array.isArray(res?.data?.data) ? res.data.data : [];

      const normalized = data.map((r) => ({
        ...r,
        status: r.status?.toUpperCase().trim(),
      }));

      setReports(normalized);
    } catch (error) {
      console.error("Fetch reports error:", error);
      setReports([]);
    }
  };

  const handleCreate = async (data) => {
    await problematicService.createReport(data);
    await fetchReports();
    setShowCreateModal(false);
  };

  const handleViewDetail = (report) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  const handleMarkAsProcessed = async () => {
    if (!selectedReport || selectedReport.status !== "OPEN") return;

    await problematicService.updateReportStatus(
      selectedReport.id,
      "PROCESSED"
    );

    await fetchReports();
    setShowDetailModal(false);
  };

  const getStatusBadge = (status) => {
    const base = "badge rounded-pill px-3 py-2 fw-semibold fs-6";
    switch (status) {
      case "OPEN":
        return <span className={`${base} bg-warning text-dark`}>Chưa xử lý</span>;
      case "PROCESSED":
        return <span className={`${base} bg-success text-white`}>Đã xử lý</span>;
      default:
        return <span className={`${base} bg-secondary text-white`}>Không xác định</span>;
    }
  };

  const totalPages = Math.ceil(reports.length / pageSize);
  const startIndex = (page - 1) * pageSize;
  const currentReports = reports.slice(startIndex, startIndex + pageSize);

  return (
    <div className="container-fluid py-4 px-md-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn btn-outline-secondary btn-lg rounded-pill shadow-sm"
            onClick={() => navigate("/inventory/menu")}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Quay lại
          </button>

          <h2 className="mb-0 fw-bold text-primary fs-3">
            Hàng hóa có vấn đề
          </h2>
        </div>

        <button
          className="btn btn-primary btn-lg rounded-pill shadow shadow-lg-hover d-flex align-items-center gap-2"
          onClick={() => setShowCreateModal(true)}
        >
          <i className="bi bi-plus-lg fs-4"></i>
          Tạo báo cáo mới
        </button>
      </div>

      <div className="card border-0 shadow-lg rounded-4 mb-4 overflow-hidden">
        <div className="card-body p-4">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-sm-6 col-md-3">
              <label className="form-label fw-semibold text-muted small mb-1">
                Trạng thái
              </label>
              <select
                className="form-select form-select-lg rounded-3 border-secondary-subtle shadow-sm"
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
              >
                <option value="">Tất cả trạng thái</option>
                <option value="OPEN">Chưa xử lý</option>
                <option value="PROCESSED">Đã xử lý</option>
              </select>
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <label className="form-label fw-semibold text-muted small mb-1">
                Từ ngày
              </label>
              <input
                type="date"
                className="form-control form-control-lg rounded-3 border-secondary-subtle shadow-sm"
                value={filters.createdFrom}
                onChange={(e) =>
                  setFilters({ ...filters, createdFrom: e.target.value })
                }
              />
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <label className="form-label fw-semibold text-muted small mb-1">
                Đến ngày
              </label>
              <input
                type="date"
                className="form-control form-control-lg rounded-3 border-secondary-subtle shadow-sm"
                value={filters.createdTo}
                onChange={(e) =>
                  setFilters({ ...filters, createdTo: e.target.value })
                }
              />
            </div>

            <div className="col-12 col-sm-6 col-md-3">
              <button
                className="btn btn-outline-secondary btn-lg w-100 rounded-3 shadow-sm mt-4 mt-md-0"
                onClick={() =>
                  setFilters({
                    status: "",
                    createdFrom: "",
                    createdTo: "",
                  })
                }
              >
                <i className="bi bi-arrow-repeat me-2"></i>
                Reset bộ lọc
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
        <div className="card-header bg-gradient-primary text-white py-3">
          <h5 className="mb-0 fw-semibold">Danh sách báo cáo</h5>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-striped mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4 py-4 fw-semibold text-uppercase small">Mã</th>
                  <th className="py-4 fw-semibold text-uppercase small">Tiêu đề</th>
                  <th className="py-4 fw-semibold text-uppercase small">Trạng thái</th>
                  <th className="py-4 fw-semibold text-uppercase small">Ngày tạo</th>
                  <th className="py-4 text-center fw-semibold text-uppercase small">
                    Hành động
                  </th>
                </tr>
              </thead>

              <tbody className="text-muted">
                {currentReports.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5 fs-5 text-secondary">
                      <i className="bi bi-exclamation-circle me-2 fs-4"></i>
                      Không tìm thấy báo cáo nào
                    </td>
                  </tr>
                ) : (
                  currentReports.map((r) => (
                    <tr key={r.id}>
                      <td className="ps-4 py-3 fw-medium text-dark fs-5 align-middle">
                        {r.id}
                      </td>
                      <td className="py-3 fw-medium fs-5 align-middle">
                        {r.title}
                      </td>
                      <td className="py-3 align-middle">
                        {getStatusBadge(r.status)}
                      </td>
                      <td className="py-3 fs-5 align-middle">
                        {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="text-center py-3 align-middle">
                        <button
                          className="btn btn-outline-primary btn-sm rounded-pill px-4 py-2 shadow-sm"
                          onClick={() => handleViewDetail(r)}
                        >
                          <i className="bi bi-eye me-1"></i> Xem
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center p-3">
            <div className="text-muted">
              Trang {page} / {totalPages || 1}
            </div>

            <div className="btn-group">
              <button
                className="btn btn-outline-secondary"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                ← Trước
              </button>

              <button
                className="btn btn-outline-secondary"
                disabled={page === totalPages || totalPages === 0}
                onClick={() => setPage(page + 1)}
              >
                Sau →
              </button>
            </div>
          </div>
        </div>
      </div>

      <ProblematicDetailModal
        show={showDetailModal}
        report={selectedReport}
        onClose={() => setShowDetailModal(false)}
        onMarkAsProcessed={handleMarkAsProcessed}
        getStatusBadge={getStatusBadge}
        hasProcessPermission={hasProcessPermission}
      />

      <ProblematicCreateModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}

export default ProblematicPage;