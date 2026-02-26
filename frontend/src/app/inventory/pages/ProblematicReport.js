import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import problematicService from "../../../services/Inventory/categoryStockService";

function ProblematicPage() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [title, setTitle] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // eslint-disable-next-line no-unused-vars
  const [filters, setFilters] = useState({
    status: "",
    createdFrom: "",
    createdTo: "",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
      setReports(Array.isArray(res?.data?.data) ? res.data.data : []);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // eslint-disable-next-line no-unused-vars
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

      {/* Modal Chi Tiết */}
      {showDetailModal && selectedReport && (
        <div className="modal fade show" tabIndex="-1" style={{ display: "block" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">

              {/* Header */}
              <div className="modal-header bg-light border-0 pb-0 pt-4 px-4">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-primary text-white rounded-circle p-3 d-flex align-items-center justify-content-center" style={{ width: "48px", height: "48px" }}>
                    <i className="bi bi-file-earmark-text fs-4"></i>
                  </div>
                  <div>
                    <h5 className="modal-title mb-0 fw-bold text-dark">Chi tiết báo cáo vấn đề</h5>
                    <small className="text-muted">Mã báo cáo: #{selectedReport.id}</small>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDetailModal(false)}
                  aria-label="Close"
                ></button>
              </div>

              {/* Body */}
              <div className="modal-body px-4 pb-4 pt-3">
                <dl className="row g-3 mb-0">
                  <dt className="col-sm-4 col-lg-3 fw-semibold text-muted">Tiêu đề</dt>
                  <dd className="col-sm-8 col-lg-9 mb-0 fw-medium">{selectedReport.title}</dd>

                  <dt className="col-sm-4 col-lg-3 fw-semibold text-muted">Trạng thái</dt>
                  <dd className="col-sm-8 col-lg-9 mb-0">
                    {getStatusBadge(selectedReport.status)}
                  </dd>

                  <dt className="col-sm-4 col-lg-3 fw-semibold text-muted">Người báo cáo</dt>
                  <dd className="col-sm-8 col-lg-9 mb-0">
                    <i className="bi bi-person-fill text-primary me-2"></i>
                    {selectedReport.reportedByName}
                  </dd>

                  <dt className="col-sm-4 col-lg-3 fw-semibold text-muted">Ngày tạo</dt>
                  <dd className="col-sm-8 col-lg-9 mb-0">
                    <i className="bi bi-calendar-event text-primary me-2"></i>
                    {new Date(selectedReport.createdAt).toLocaleString("vi-VN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </dd>

                  <dt className="col-sm-4 col-lg-3 fw-semibold text-muted pt-3">Mô tả vấn đề</dt>
                  <dd className="col-sm-8 col-lg-9 mb-0 pt-3">
                    <div className="p-3 bg-light rounded-3 border">
                      {selectedReport.issueDescription}
                    </div>
                  </dd>
                </dl>

                {/* Có thể thêm phần xử lý / ghi chú ở đây sau này */}
                {selectedReport.note && (
                  <>
                    <hr className="my-4" />
                    <p className="fw-semibold text-muted mb-2">Ghi chú xử lý:</p>
                    <p className="mb-0">{selectedReport.note}</p>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="modal-footer bg-light border-0 px-4 py-3">
                <div className="d-flex gap-2 w-100 justify-content-end flex-wrap">
                  {selectedReport.status === "Chưa xử lý" && (
                    <button
                      type="button"
                      className="btn btn-success px-4"
                      onClick={handleMarkAsProcessed}
                      disabled={selectedReport.status !== "Chưa xử lý"}
                    >
                      <i className="bi bi-check2-circle me-2"></i>
                      Đánh dấu đã xử lý
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn btn-outline-secondary px-4"
                    onClick={() => setShowDetailModal(false)}
                  >
                    <i className="bi bi-x-lg me-2"></i>
                    Đóng
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ProblematicPage;