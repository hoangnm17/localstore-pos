import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import purchaseOrderService from "../../../services/purchaseOrderService";

const PurchaseOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [po, setPo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchDetail = async () => {
      try {
        const res = await purchaseOrderService.getPurchaseOrderDetail(id);

        // interceptor đã return response.data
        setPo(res?.data || null);
      } catch (err) {
        setError("Không thể tải thông tin đơn đặt hàng. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="container-fluid py-5 bg-light min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-primary" style={{ width: "4rem", height: "4rem" }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="mt-4 text-muted">Đang tải chi tiết đơn đặt hàng...</h5>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid py-5 bg-light min-vh-100">
        <div className="alert alert-danger alert-dismissible fade show shadow" role="alert">
          <strong>Lỗi!</strong> {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
            aria-label="Close"
          ></button>
        </div>
      </div>
    );
  }

  if (!po) {
    return (
      <div className="container-fluid py-5 bg-light min-vh-100">
        <div className="alert alert-warning text-center shadow">
          Không tìm thấy thông tin đơn đặt hàng #{id}
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    let color = "warning";
    let text = status;

    if (status === "Approved") {
      color = "success";
      text = "Đã duyệt";
    } else if (status === "Received") {
      color = "info";
      text = "Đã nhận hàng";
    } else if (status === "Pending") {
      text = "Chờ duyệt";
    }

    return <span className={`badge bg-${color} fs-6 px-4 py-2 rounded-pill`}>{text}</span>;
  };

  return (
    <div className="container-fluid py-4 px-3 px-md-4 bg-light min-vh-100">
      <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
        {/* Header */}
        <div className="card-header bg-primary text-white d-flex align-items-center justify-content-between py-4 px-4 px-md-5">
          <div className="d-flex align-items-center">
            <button
              className="btn btn-outline-light rounded-pill px-4 me-4"
              onClick={() => navigate("/inventory/purchase-orders")}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Quay lại danh sách
            </button>
            <h3 className="mb-0 fw-bold">Chi tiết Đơn đặt hàng #{po.id}</h3>
          </div>
        </div>

        {/* Body */}
        <div className="card-body p-4 p-md-5">
          {/* Thông tin tổng quát */}
          <div className="row g-4 mb-5">
            <div className="col-lg-6">
              <h5 className="fw-bold text-primary mb-3">
                <i className="bi bi-info-circle me-2"></i>Thông tin đơn hàng
              </h5>
              <dl className="row mb-0">
                <dt className="col-sm-4 fw-semibold text-muted">Trạng thái:</dt>
                <dd className="col-sm-8">{getStatusBadge(po.status)}</dd>

                <dt className="col-sm-4 fw-semibold text-muted">Ghi chú:</dt>
                <dd className="col-sm-8">{po.note || "Không có ghi chú"}</dd>

                <dt className="col-sm-4 fw-semibold text-muted">Ngày tạo:</dt>
                <dd className="col-sm-8">
                  {po.createdAt
                    ? new Date(po.createdAt).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                    : "—"}
                </dd>
              </dl>
            </div>

            <div className="col-lg-6">
              <h5 className="fw-bold text-primary mb-3">
                <i className="bi bi-person-badge me-2"></i>Thông tin nhân sự
              </h5>
              <dl className="row mb-0">
                <dt className="col-sm-5 fw-semibold text-muted">Người tạo:</dt>
                <dd className="col-sm-7">{po.createdBy?.name || "—"}</dd>

                <dt className="col-sm-5 fw-semibold text-muted">Người xử lý:</dt>
                <dd className="col-sm-7">
                  {po.processedBy ? po.processedBy.name : "Chưa xử lý"}
                </dd>

                <dt className="col-sm-5 fw-semibold text-muted">Người nhận hàng:</dt>
                <dd className="col-sm-7">
                  {po.receivedBy ? po.receivedBy.name : "Chưa nhận hàng"}
                </dd>
              </dl>
            </div>
          </div>

          {/* Nhà cung cấp */}
          <div className="mb-5">
            <h5 className="fw-bold text-primary mb-3">
              <i className="bi bi-building me-2"></i>Nhà cung cấp
            </h5>
            <div className="alert alert-light border shadow-sm">
              {po.supplier?.name || "Không có thông tin nhà cung cấp"}
            </div>
          </div>

          {/* Danh sách sản phẩm */}
          <h5 className="fw-bold text-primary mb-3">
            <i className="bi bi-box-seam me-2"></i>Danh sách sản phẩm
          </h5>

          <div className="table-responsive rounded-3 border shadow-sm">
            <table className="table table-hover table-striped align-middle mb-0">
              <thead className="table-dark">
                <tr>
                  <th scope="col" className="ps-4">Sản phẩm</th>
                  <th scope="col" className="text-center">Số lượng tồn trước khi đặt</th>
                  <th scope="col" className="text-center">Số lượng đặt</th>
                </tr>
              </thead>
              <tbody>
                {po.items && po.items.length > 0 ? (
                  po.items.map((item) => (
                    <tr key={item.id}>
                      <td className="ps-4 fw-medium">{item.productName}</td>
                      <td className="text-center">{item.quantityBeforeOrdered || 0}</td>
                      <td className="text-center fw-bold text-primary">
                        {item.quantityOrdered || 0}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center py-4 text-muted fst-italic">
                      Không có sản phẩm nào trong đơn hàng
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer (tùy chọn) */}
        <div className="card-footer bg-light text-muted text-center py-3">
          Đơn đặt hàng #{po.id} • Ngày tạo: {po.createdAt ? new Date(po.createdAt).toLocaleDateString("vi-VN") : "—"}
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderDetail;