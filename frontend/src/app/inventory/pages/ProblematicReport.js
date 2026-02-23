import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import problematicService from "../../../services/categoryStockService";

function ProblematicPage() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [title, setTitle] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const [filters, setFilters] = useState({
    status: "",
    createdFrom: "",
    createdTo: "",
  });

  // Scroll lên đầu trang khi load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Mock data
  const mockReports = [
    {
      id: 1,
      title: "Hàng bị bóp méo",
      issueDescription:
        "Thùng hàng bị vỡ trong quá trình vận chuyển từ nhà cung cấp A",
      reportedBy: 101,
      reportedByName: "Nguyễn Văn A",
      status: "Chưa xử lý",
      createdAt: "2026-02-10T10:00:00Z",
    },
    {
      id: 2,
      title: "Sai số lượng nhập kho",
      issueDescription:
        "Hệ thống ghi nhận sai 5 sản phẩm (mã SP-45678)",
      reportedBy: 102,
      reportedByName: "Trần Thị B",
      status: "Đã xử lý",
      createdAt: "2026-02-11T09:30:00Z",
    },
    {
      id: 3,
      title: "Sản phẩm lỗi kỹ thuật",
      issueDescription:
        "Máy không hoạt động sau khi khởi động, có tiếng kêu lạ",
      reportedBy: 103,
      reportedByName: "Lê Văn C",
      status: "Đã xử lý",
      createdAt: "2026-02-12T14:15:00Z",
    },
  ];

  const fetchReports = async () => {
    try {
      const res = await problematicService.getReports(filters);
      setReports(res.data);
    } catch {
      let filtered = [...mockReports];

      if (filters.status) {
        filtered = filtered.filter((r) => r.status === filters.status);
      }

      if (filters.createdFrom) {
        filtered = filtered.filter(
          (r) => new Date(r.createdAt) >= new Date(filters.createdFrom)
        );
      }

      if (filters.createdTo) {
        const toDate = new Date(filters.createdTo);
        toDate.setHours(23, 59, 59, 999);
        filtered = filtered.filter(
          (r) => new Date(r.createdAt) <= toDate
        );
      }

      setReports(filtered);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      await problematicService.createReport({
        title,
        issueDescription,
      });
      fetchReports();
    } catch {
      const newMock = {
        id: reports.length + 1,
        title,
        issueDescription,
        reportedBy: 999,
        reportedByName: "Người dùng hiện tại",
        status: "Chưa xử lý",
        createdAt: new Date().toISOString(),
      };

      setReports([newMock, ...reports]);
    }

    setTitle("");
    setIssueDescription("");
    setShowCreateModal(false);
  };

  const handleViewDetail = (report) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  const handleMarkAsProcessed = () => {
    if (!selectedReport || selectedReport.status !== "Chưa xử lý") return;

    const updatedReports = reports.map((r) =>
      r.id === selectedReport.id ? { ...r, status: "Đã xử lý" } : r
    );

    setReports(updatedReports);
    setSelectedReport({ ...selectedReport, status: "Đã xử lý" });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Chưa xử lý":
        return <span className="badge bg-warning text-dark">Chưa xử lý</span>;
      case "Đã xử lý":
        return <span className="badge bg-success">Đã xử lý</span>;
      default:
        return <span className="badge bg-secondary">Không xác định</span>;
    }
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate("/inventory/menu")}
          >
            <i className="bi bi-arrow-left me-1"></i> Quay lại
          </button>

          <h2 className="mb-0 fw-semibold">Hàng hóa có vấn đề</h2>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <i className="bi bi-plus-lg me-1"></i> Tạo báo cáo mới
        </button>
      </div>

      {/* Filter */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4 col-sm-12">
              <label className="form-label fw-medium">Trạng thái</label>
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
              >
                <option value="">Tất cả trạng thái</option>
                <option value="Chưa xử lý">Chưa xử lý</option>
                <option value="Đã xử lý">Đã xử lý</option>
              </select>
            </div>

            <div className="col-md-4 col-sm-6">
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

            <div className="col-md-4 col-sm-6">
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
          </div>
        </div>
      </div>

      {/* Table */}
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

      {(showCreateModal || showDetailModal) && (
        <div className="modal-backdrop fade show"></div>
      )}
    </div>
  );
}

export default ProblematicPage;