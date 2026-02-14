import { useEffect, useState } from "react";
import problematicService from "../../../services/categoryStockService";

function ProblematicPage() {
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

  // Mock data - chỉ dùng 2 trạng thái: Chưa xử lý / Đã xử lý
  const mockReports = [
    {
      id: 1,
      title: "Hàng bị bóp méo",
      issueDescription: "Thùng hàng bị vỡ trong quá trình vận chuyển từ nhà cung cấp A",
      reportedBy: 101,
      reportedByName: "Nguyễn Văn A",
      status: "Chưa xử lý",
      createdAt: "2026-02-10T10:00:00Z",
    },
    {
      id: 2,
      title: "Sai số lượng nhập kho",
      issueDescription: "Hệ thống ghi nhận sai 5 sản phẩm (mã SP-45678)",
      reportedBy: 102,
      reportedByName: "Trần Thị B",
      status: "Đã xử lý",
      createdAt: "2026-02-11T09:30:00Z",
    },
    {
      id: 3,
      title: "Sản phẩm lỗi kỹ thuật",
      issueDescription: "Máy không hoạt động sau khi khởi động, có tiếng kêu lạ",
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
    } catch (err) {
      console.log("Đang sử dụng dữ liệu mẫu...");

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
        filtered = filtered.filter((r) => new Date(r.createdAt) <= toDate);
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
    } catch (err) {
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

    // Cập nhật mock data
    const updatedReports = reports.map((r) =>
      r.id === selectedReport.id ? { ...r, status: "Đã xử lý" } : r
    );
    setReports(updatedReports);

    // Cập nhật modal ngay lập tức
    setSelectedReport({ ...selectedReport, status: "Đã xử lý" });

    // Thực tế: gọi API update
    // await problematicService.updateReportStatus(selectedReport.id, "Đã xử lý");
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
        <h2 className="mb-0 fw-semibold">Hàng hóa có vấn đề</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          <i className="bi bi-plus-lg me-1"></i> Tạo báo cáo mới
        </button>
      </div>

      {/* Bộ lọc - chỉ còn 2 trạng thái */}
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

      {/* Bảng danh sách */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-striped align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col" className="ps-4">Mã</th>
                  <th scope="col">Tiêu đề</th>
                  <th scope="col">Trạng thái</th>
                  <th scope="col">Ngày tạo</th>
                  <th scope="col" className="text-center">Hành động</th>
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
                        {new Date(r.createdAt).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
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

      {/* Modal Tạo báo cáo mới */}
      {showCreateModal && (
        <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Tạo báo cáo mới</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowCreateModal(false)}
                ></button>
              </div>

              <form onSubmit={handleCreate}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label fw-medium">
                      Tiêu đề <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="title"
                      placeholder="Nhập tiêu đề báo cáo"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label fw-medium">
                      Mô tả vấn đề <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="form-control"
                      id="description"
                      rows="4"
                      placeholder="Mô tả chi tiết vấn đề gặp phải..."
                      value={issueDescription}
                      onChange={(e) => setIssueDescription(e.target.value)}
                      required
                    ></textarea>
                  </div>
                </div>

                <div className="modal-footer border-0">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Hủy
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Gửi báo cáo
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Chi tiết báo cáo */}
      {showDetailModal && selectedReport && (
        <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-info text-white">
                <h5 className="modal-title">Chi tiết báo cáo #{selectedReport.id}</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowDetailModal(false)}
                ></button>
              </div>

              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-12">
                    <h6 className="fw-bold">Tiêu đề:</h6>
                    <p className="mb-1">{selectedReport.title}</p>
                  </div>

                  <div className="col-12">
                    <h6 className="fw-bold">Mô tả vấn đề:</h6>
                    <p className="mb-1 pre-wrap">
                      {selectedReport.issueDescription || "Không có mô tả chi tiết"}
                    </p>
                  </div>

                  <div className="col-md-6">
                    <h6 className="fw-bold">Trạng thái:</h6>
                    <p className="mb-1">{getStatusBadge(selectedReport.status)}</p>
                  </div>

                  <div className="col-md-6">
                    <h6 className="fw-bold">Ngày tạo:</h6>
                    <p className="mb-1">
                      {new Date(selectedReport.createdAt).toLocaleString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div className="col-12">
                    <h6 className="fw-bold">Người báo cáo:</h6>
                    <p className="mb-1">
                      {selectedReport.reportedByName || "Chưa xác định"}{" "}
                      <small className="text-muted ms-2">
                        (Mã nhân viên: {selectedReport.reportedBy})
                      </small>
                    </p>
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0">
                {selectedReport.status === "Chưa xử lý" && (
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={handleMarkAsProcessed}
                  >
                    <i className="bi bi-check-circle me-1"></i> Đánh dấu đã xử lý
                  </button>
                )}

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDetailModal(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {(showCreateModal || showDetailModal) && (
        <div className="modal-backdrop fade show"></div>
      )}
    </div>
  );
}

export default ProblematicPage;