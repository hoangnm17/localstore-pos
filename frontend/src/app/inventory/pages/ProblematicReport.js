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

  // ✅ FILTER STATE
  const [filters, setFilters] = useState({
    status: "",
    createdFrom: "",
    createdTo: "",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchReports();
  }, [filters]);

  // ✅ FETCH WITH CLEAN FILTERS
  const fetchReports = async () => {
    try {
      const cleanedFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v)
      );

      const res = await problematicService.getReports(cleanedFilters);

      const data = Array.isArray(res?.data?.data)
        ? res.data.data
        : [];

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
    switch (status) {
      case "OPEN":
        return (
          <span className="badge bg-warning text-dark">
            Chưa xử lý
          </span>
        );
      case "PROCESSED":
        return (
          <span className="badge bg-success">
            Đã xử lý
          </span>
        );
      default:
        return (
          <span className="badge bg-secondary">
            Không xác định
          </span>
        );
    }
  };

  return (
    <div className="container py-4">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate("/inventory/menu")}
          >
            <i className="bi bi-arrow-left me-1"></i> Quay lại
          </button>

          <h2 className="mb-0 fw-semibold">
            Hàng hóa có vấn đề
          </h2>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <i className="bi bi-plus-lg me-1"></i>
          Tạo báo cáo mới
        </button>
      </div>

      {/* ✅ FILTER CARD */}
      <div className="card mb-3 shadow-sm border-0">
        <div className="card-body">
          <div className="row g-3 align-items-end">

            {/* Status */}
            <div className="col-md-3">
              <label className="form-label fw-medium">Trạng thái</label>
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
              >
                <option value="">Tất cả</option>
                <option value="OPEN">Chưa xử lý</option>
                <option value="PROCESSED">Đã xử lý</option>
              </select>
            </div>

            {/* From Date */}
            <div className="col-md-3">
              <label className="form-label fw-medium">Từ ngày</label>
              <input
                type="date"
                className="form-control"
                value={filters.createdFrom}
                onChange={(e) =>
                  setFilters({ ...filters, createdFrom: e.target.value })
                }
              />
            </div>

            {/* To Date */}
            <div className="col-md-3">
              <label className="form-label fw-medium">Đến ngày</label>
              <input
                type="date"
                className="form-control"
                value={filters.createdTo}
                onChange={(e) =>
                  setFilters({ ...filters, createdTo: e.target.value })
                }
              />
            </div>

            {/* Reset */}
            <div className="col-md-3">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() =>
                  setFilters({
                    status: "",
                    createdFrom: "",
                    createdTo: "",
                  })
                }
              >
                Reset bộ lọc
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-striped align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">Mã</th>
                  <th>Tiêu đề</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th className="text-center">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">
                      Không tìm thấy báo cáo nào
                    </td>
                  </tr>
                ) : (
                  reports.map((r) => (
                    <tr key={r.id}>
                      <td className="ps-4 fw-medium">{r.id}</td>
                      <td>{r.title}</td>
                      <td>{getStatusBadge(r.status)}</td>
                      <td>
                        {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm btn-outline-primary"
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
        </div>
      </div>

      {/* MODALS */}
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