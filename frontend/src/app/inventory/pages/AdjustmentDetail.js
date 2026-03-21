import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import adjustmentService from "../../../services/Inventory/adjustmentService";

function AdjustmentDetail() {
  const user = JSON.parse(localStorage.getItem("user"));
  const canProcess = user?.features?.includes("PROCESS_ADJUST");

  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showRedirectButton, setShowRedirectButton] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await adjustmentService.getAdjustmentDetail(id);

      if (!res?.data?.success) {
        alert(res?.data?.message || "Có lỗi xảy ra khi tải chi tiết");
        return;
      }

      setData(res.data.data);
    } catch (error) {
      alert(error.message || "Không thể tải thông tin phiếu");
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (newStatus) => {
    const confirmText =
      newStatus === "Approved"
        ? "Bạn có chắc muốn **duyệt** đơn điều chỉnh này?"
        : "Bạn có chắc muốn **từ chối** đơn điều chỉnh này?";

    if (!window.confirm(confirmText)) return;

    setProcessing(true);

    try {
      const res = await adjustmentService.updateAdjustmentStatus(data.id, newStatus);

      if (!res?.data?.success) {
        alert(res?.data?.message || "Có lỗi xảy ra");
        return;
      }

      // Cập nhật state cục bộ
      setData((prev) => ({
        ...prev,
        status: newStatus,
        processedAt: new Date().toISOString(),
        processedByName: user?.fullName || "Bạn",
      }));

      setShowRedirectButton(true);
    } catch (error) {
      alert(error.message || "Lỗi khi xử lý phiếu");
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatQuantityWithUnit = (largest, remainder, unitName = "Đơn vị", baseUnit) => {
    if (largest == null && remainder == null) return "—";

    const parts = [];
    if (Number(largest) > 0) {
      parts.push(`${Number(largest).toLocaleString("vi-VN")} ${unitName}`);
    }
    if (Number(remainder) > 0 || (Number(largest) === 0 && Number(remainder) >= 0)) {
      parts.push(`${Number(remainder).toLocaleString("vi-VN")} ${baseUnit}`);
    }
    return parts.length === 0 ? "0" : parts.join(" + ");
  };

  const formatDifference = (diff) => {
    if (diff > 0) return `+${diff.toLocaleString("vi-VN")}`;
    if (diff < 0) return diff.toLocaleString("vi-VN");
    return "0";
  };

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center min-vh-75 py-5">
        <div className="spinner-border text-primary mb-3" style={{ width: "3.5rem", height: "3.5rem" }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted fs-4 fw-light">Đang tải thông tin phiếu điều chỉnh kho...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger shadow border-0 rounded-4 p-5">
          <h3 className="mb-4 text-danger">Không tìm thấy phiếu điều chỉnh</h3>
          <button className="btn btn-primary btn-lg px-5" onClick={() => navigate(-1)}>
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 px-3 px-md-4 px-lg-5">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 pb-3 border-bottom">
        <div className="mb-3 mb-md-0">
          <h1 className="fw-bold text-dark mb-2" style={{ fontSize: "2.1rem" }}>
            Phiếu điều chỉnh kho #{data.id}
          </h1>
          <StatusBadge status={data.status} />
        </div>

        <button
          className="btn btn-outline-secondary d-flex align-items-center gap-2 px-4 py-2"
          onClick={() => navigate(`/inventory/requests/adjust?status=${data.status}`)}
        >
          <i className="bi bi-arrow-left"></i>
          Quay lại danh sách
        </button>
      </div>

      {/* Thông tin phiếu */}
      <div className="card border-0 shadow rounded-4 overflow-hidden mb-5">
        <div className="card-header bg-gradient bg-primary-subtle border-0 py-4">
          <h5 className="mb-0 fw-semibold text-dark d-flex align-items-center gap-3">
            <i className="bi bi-info-circle-fill fs-4 text-primary"></i>
            Thông tin phiếu điều chỉnh
          </h5>
        </div>

        <div className="card-body p-4 p-md-5">
          <div className="row g-5">
            <div className="col-12 col-lg-5">
              <div>
                <small className="text-uppercase fw-semibold text-muted d-block mb-2 fs-6">
                  Lý do điều chỉnh
                </small>
                <p className="fs-4 fw-medium text-dark mb-0 lh-base">
                  {data.reason || "Không có lý do cụ thể"}
                </p>
              </div>
            </div>

            <div className="col-12 col-lg-7">
              <div className="row g-4">
                {[
                  { icon: "bi-person", label: "Người tạo", value: data.createdByName || "—" },
                  { icon: "bi-calendar-event", label: "Ngày tạo", value: formatDate(data.createdAt) },
                  { icon: "bi-person-check", label: "Người xử lý", value: data.processedByName || "—" },
                  { icon: "bi-calendar-check", label: "Ngày xử lý", value: formatDate(data.processedAt) },
                ].map((item, idx) => (
                  <div key={idx} className="col-6">
                    <small className="text-uppercase fw-semibold text-muted d-block mb-2 fs-6">
                      <i className={`${item.icon} me-2 text-primary`}></i>
                      {item.label}
                    </small>
                    <p className="fs-5 fw-medium text-dark mb-0">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bảng sản phẩm */}
      <div className="card border-0 shadow rounded-4 overflow-hidden">
        <div className="card-header bg-light border-0 py-4">
          <h5 className="mb-0 fw-semibold text-dark d-flex align-items-center gap-3">
            <i className="bi bi-box-seam fs-4 text-primary"></i>
            Danh sách sản phẩm điều chỉnh
          </h5>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th className="text-center ps-4 py-4 fw-semibold" style={{ width: "80px" }}>#</th>
                <th className="ps-4 py-4 fw-semibold">Mã sản phẩm</th>
                <th className="ps-4 py-4 fw-semibold">Tên sản phẩm</th>
                <th className="text-end px-4 py-4 fw-semibold">Tồn hệ thống</th>
                <th className="text-end px-4 py-4 fw-semibold">Tồn thực tế</th>
                <th className="text-end px-4 py-4 fw-semibold">Chênh lệch</th>
              </tr>
            ) : (
              data.items.map((item, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? "bg-body-tertiary" : ""}>
                  <td className="text-center py-3 fw-medium">{idx + 1}</td>
                  <td className="ps-3 pe-2 py-3 fw-medium">{item.code}</td>
                  <td className="ps-3 pe-2 py-3">{item.name}</td>
                  <td className="text-end px-3 py-3 fw-medium">
                    {formatQuantityWithUnit(item.systemLargest, item.systemRemainder, item.unitName)}
                  </td>

                  <td className="text-end px-3 py-3 fw-medium">
                    {formatQuantityWithUnit(item.actualLargest, item.actualRemainder, item.unitName)}
                  </td>

                  <td className="text-end px-3 py-3">
                    <span
                      className={`fw-bold px-3 py-2 rounded fs-5 d-inline-block ${
                        item.difference > 0
                          ? "text-success bg-success-subtle"
                          : item.difference < 0
                          ? "text-danger bg-danger-subtle"
                          : "text-secondary bg-secondary-subtle"
                      }`}
                      style={{ minWidth: "100px", textAlign: "center" }}
                    >
                      {formatDifference(item.difference)} <span>{item.baseUnit}</span>
                    </span>
                  </td>
                </tr>
              ) : (
                data.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="text-center py-4 text-muted fw-medium">{idx + 1}</td>
                    <td className="ps-4 py-4 fw-medium">{item.code}</td>
                    <td className="ps-4 py-4">{item.name}</td>
                    <td className="text-end px-4 py-4 fw-medium">
                      {formatQuantityWithUnit(item.systemLargest, item.systemRemainder, item.unitName, item.baseUnit)}
                    </td>
                    <td className="text-end px-4 py-4 fw-medium">
                      {formatQuantityWithUnit(item.actualLargest, item.actualRemainder, item.unitName, item.baseUnit)}
                    </td>
                    <td className="text-end px-4 py-4">
                      <span
                        className={`fw-bold px-4 py-2 rounded-pill fs-6 d-inline-block border ${
                          item.difference > 0
                            ? "text-success bg-success-subtle border-success-subtle"
                            : item.difference < 0
                            ? "text-danger bg-danger-subtle border-danger-subtle"
                            : "text-secondary bg-secondary-subtle border-secondary-subtle"
                        }`}
                        style={{ minWidth: "120px" }}
                      >
                        {formatDifference(item.difference)} {item.baseUnit}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {canProcess && (
  <div
    className="position-sticky bottom-0 start-0 end-0 border-top mt-5"
    style={{
      zIndex: 1000,
      background: "rgba(255, 255, 255, 0.8)", // Hiệu ứng nền trong suốt nhẹ
      backdropFilter: "blur(10px)",           // Làm mờ nội dung phía sau (Glassmorphism)
      boxShadow: "0 -10px 25px rgba(0, 0, 0, 0.05)", // Shadow hướng lên trên nhẹ nhàng
    }}
  >
    <div className="container-fluid py-3 px-4 px-md-5">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
        
        {/* Phần bên trái: Có thể thêm text hiển thị trạng thái hiện tại để UI đầy đặn hơn */}
        <div className="d-none d-md-block">
          <span className="text-muted small uppercase fw-bold tracking-wider">
            Tác vụ yêu cầu: <span className="text-dark">{data.status}</span>
          </span>
        </div>

        {/* Phần bên phải: Các nút bấm */}
        <div className="d-flex flex-wrap gap-2 ms-auto">
          {data.status === "Pending" && (
            <>
              <button
                className="btn btn-link text-danger text-decoration-none fw-semibold px-4 transition-all"
                disabled={processing}
                onClick={() => handleProcess("Rejected")}
                style={{ transition: 'all 0.2s' }}
              >
                {processing ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                ) : (
                  <i className="bi bi-x-lg me-2"></i>
                )}
                Từ chối
              </button>

              <button
                className="btn btn-dark btn-lg px-5 shadow-sm d-flex align-items-center fw-bold"
                disabled={processing}
                onClick={() => handleProcess("Approved")}
                style={{ borderRadius: '8px', fontSize: '0.95rem' }}
              >
                {processing ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                ) : (
                  <i className="bi bi-check2-all fs-5 me-2"></i>
                )}
                Duyệt yêu cầu
              </button>
            </>
          )}

          {showRedirectButton && (
            <button
              className="btn btn-outline-secondary btn-lg px-4 d-flex align-items-center"
              onClick={() => navigate(`/inventory/requests/adjust?status=${data.status}`)}
              style={{ borderRadius: '8px', fontSize: '0.95rem' }}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Quay lại danh sách
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

function StatusBadge({ status }) {
  const variants = {
    Pending: {
      bg: "bg-warning-subtle",
      text: "text-warning-emphasis",
      border: "border-warning",
      label: "Chờ duyệt",
    },
    Approved: {
      bg: "bg-success-subtle",
      text: "text-success-emphasis",
      border: "border-success",
      label: "Đã duyệt",
    },
    Rejected: {
      bg: "bg-danger-subtle",
      text: "text-danger-emphasis",
      border: "border-danger",
      label: "Đã từ chối",
    },
  };

  const style = variants[status] || {
    bg: "bg-secondary-subtle",
    text: "text-secondary-emphasis",
    border: "border-secondary",
    label: status || "Không xác định",
  };

  return (
    <span
      className={`badge ${style.bg} ${style.text} border ${style.border} fs-5 px-4 py-2 rounded-pill fw-semibold`}
    >
      {style.label}
    </span>
  );
}

export default AdjustmentDetail;