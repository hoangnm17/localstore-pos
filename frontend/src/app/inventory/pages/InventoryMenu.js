import { useNavigate } from "react-router-dom";
import { useState } from "react";
import useTitle from "../../../hooks/common/useTitle";

function InventoryMenu() {
  useTitle("Menu quản lý kho hàng");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const navigateToStatus = (status) => {
    setShowModal(false);
    navigate(`/inventory/requests/adjust?status=${status}`);
  };

  return (
    <>
      <div className="container-fluid py-5 px-4 px-md-5 px-lg-5 bg-light min-vh-100">
        <div className="text-center mb-5">
          <h2 className="fw-bold text-dark mb-2">Quản lý Kho hàng</h2>
          <p className="text-muted lead">Chọn chức năng bạn muốn thực hiện</p>
        </div>

        <div className="row row-cols-1 row-cols-lg-2 g-4 g-lg-5 justify-content-center">

          {/* Danh sách tồn kho */}
          <div className="col">
            <div
              className="card h-100 border-0 shadow-lg rounded-4 text-center cursor-pointer"
              onClick={() => navigate("/inventory/categories")}
              role="button"
            >
              <div className="card-body py-5 px-5 d-flex flex-column align-items-center justify-content-center">
                <div className="bg-primary bg-gradient text-white rounded-circle p-5 mb-4 shadow">
                  <i className="bi bi-box-seam fs-2"></i>
                </div>
                <h4 className="fw-bold mb-3 text-dark">Danh sách tồn kho</h4>
                <p className="text-muted fs-5">
                  Xem số lượng tồn kho hiện tại của tất cả sản phẩm
                </p>
              </div>
              <div className="card-footer bg-transparent border-0 pb-5 pt-0">
                <button className="btn btn-outline-primary btn-lg rounded-pill px-5 shadow-sm">
                  Truy cập ngay
                </button>
              </div>
            </div>
          </div>

          {/* Yêu cầu nhập kho */}
          <div className="col">
            <div
              className="card h-100 border-0 shadow-lg rounded-4 text-center cursor-pointer"
              onClick={() => navigate("/inventory/purchase-orders")}
              role="button"
            >
              <div className="card-body py-5 px-5 d-flex flex-column align-items-center justify-content-center">
                <div className="bg-success bg-gradient text-white rounded-circle p-5 mb-4 shadow">
                  <i className="bi bi-box-arrow-in-right fs-2"></i>
                </div>
                <h4 className="fw-bold mb-3 text-dark">Yêu cầu nhập kho</h4>
                <p className="text-muted fs-5">
                  Tạo và theo dõi các yêu cầu nhập hàng
                </p>
              </div>
              <div className="card-footer bg-transparent border-0 pb-5 pt-0">
                <button className="btn btn-outline-success btn-lg rounded-pill px-5 shadow-sm">
                  Truy cập ngay
                </button>
              </div>
            </div>
          </div>

          {/* Yêu cầu điều chỉnh tồn kho */}
          <div className="col">
            <div
              className="card h-100 border-0 shadow-lg rounded-4 text-center cursor-pointer"
              onClick={() => setShowModal(true)}
              role="button"
            >
              <div className="card-body py-5 px-5 d-flex flex-column align-items-center justify-content-center">
                <div className="bg-warning bg-gradient text-white rounded-circle p-5 mb-4 shadow">
                  <i className="bi bi-arrow-left-right fs-2"></i>
                </div>
                <h4 className="fw-bold mb-3 text-dark">Yêu cầu điều chỉnh tồn kho</h4>
                <p className="text-muted fs-5">
                  Tạo và xử lý các yêu cầu điều chỉnh số lượng tồn kho
                </p>
              </div>
              <div className="card-footer bg-transparent border-0 pb-5 pt-0">
                <button className="btn btn-outline-warning btn-lg rounded-pill px-5 shadow-sm">
                  Truy cập ngay
                </button>
              </div>
            </div>
          </div>

          {/* Quản lý nhà cung cấp */}
          <div className="col">
            <div
              className="card h-100 border-0 shadow-lg rounded-4 text-center cursor-pointer"
              onClick={() => navigate("/inventory/suppliers")}
              role="button"
            >
              <div className="card-body py-5 px-5 d-flex flex-column align-items-center justify-content-center">
                <div className="bg-info bg-gradient text-white rounded-circle p-5 mb-4 shadow">
                  <i className="bi bi-truck fs-2"></i>
                </div>
                <h4 className="fw-bold mb-3 text-dark">Quản lý nhà cung cấp</h4>
                <p className="text-muted fs-5">
                  Thêm, chỉnh sửa và quản lý thông tin nhà cung cấp
                </p>
              </div>
              <div className="card-footer bg-transparent border-0 pb-5 pt-0">
                <button className="btn btn-outline-info btn-lg rounded-pill px-5 shadow-sm">
                  Truy cập ngay
                </button>
              </div>
            </div>
          </div>

          {/* Báo cáo nhập hàng */}
          <div className="col">
            <div
              className="card h-100 border-0 shadow-lg rounded-4 text-center cursor-pointer"
              onClick={() => navigate("/inventory/purchase-orders/report")}
              role="button"
            >
              <div className="card-body py-5 px-5 d-flex flex-column align-items-center justify-content-center">
                <div className="bg-secondary bg-gradient text-white rounded-circle p-5 mb-4 shadow">
                  <i className="bi bi-bar-chart-line fs-2"></i>
                </div>
                <h4 className="fw-bold mb-3 text-dark">Báo cáo nhập hàng</h4>
                <p className="text-muted fs-5">
                  Thống kê nhập hàng theo thời gian
                </p>
              </div>
              <div className="card-footer bg-transparent border-0 pb-5 pt-0">
                <button className="btn btn-outline-secondary btn-lg rounded-pill px-5 shadow-sm">
                  Truy cập ngay
                </button>
              </div>
            </div>
          </div>

          <div className="col">
            <div
              className="card h-100 border-0 shadow-lg rounded-4 overflow-hidden text-center transition hover-shadow-xl cursor-pointer"
              onClick={() => navigate("/inventory/problematic")}
              role="button"
              tabIndex={0}
            >
              <div className="card-body py-5 px-5 d-flex flex-column align-items-center justify-content-center">
                <div className="bg-warning bg-gradient text-white rounded-circle p-5 mb-4 shadow">
                  <i className="bi bi-exclamation-triangle fs-2"></i>
                </div>
                <h4 className="card-title fw-bold mb-3 text-dark">Vấn đề của kho</h4>
                <p className="card-text text-muted mb-4 fs-5">
                  Ghi nhận các vấn đề của kho
                </p>
              </div>
              <div className="card-footer bg-transparent border-0 pb-5 pt-0">
                <button className="btn btn-outline-warning btn-lg rounded-pill px-5 shadow-sm">
                  Truy cập ngay <i className="bi bi-arrow-right ms-2"></i>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">

              {/* Header với nền nhẹ */}
              <div className="modal-header border-0 bg-light rounded-top-4 px-4 pt-4">
                <h5 className="modal-title fw-bold text-dark">
                  <i className="bi bi-layers-half me-2 text-primary"></i>
                  Quản lý Đơn Điều Chỉnh
                </h5>
                <button
                  type="button"
                  className="btn-close shadow-none"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <div className="modal-body px-4 pb-4">
                <p className="text-muted small mb-4">Vui lòng chọn trạng thái bạn muốn xem hoặc tạo đơn mới.</p>

                <div className="d-grid gap-2">

                  {/* Group: Bộ lọc trạng thái */}
                  <div className="row g-2 mb-2">
                    <div className="col-12">
                      <button
                        className="btn btn-outline-warning w-100 py-3 rounded-3 d-flex align-items-center justify-content-between px-4 border-2 fw-semibold"
                        onClick={() => navigateToStatus("Pending")}
                      >
                        <span><i className="bi bi-clock-history me-2"></i> Chờ xử lý</span>
                        <i className="bi bi-chevron-right opacity-50"></i>
                      </button>
                    </div>

                    <div className="col-6">
                      <button
                        className="btn btn-outline-success w-100 py-3 rounded-3 fw-semibold border-2"
                        onClick={() => navigateToStatus("Approved")}
                      >
                        <i className="bi bi-check2-circle me-1"></i> Đã duyệt
                      </button>
                    </div>

                    <div className="col-6">
                      <button
                        className="btn btn-outline-danger w-100 py-3 rounded-3 fw-semibold border-2"
                        onClick={() => navigateToStatus("Rejected")}
                      >
                        <i className="bi bi-x-circle me-1"></i> Từ chối
                      </button>
                    </div>
                  </div>

                  <hr className="my-3 opacity-10" />

                  {/* Action: Tạo đơn mới - Nổi bật nhất */}
                  <button
                    className="btn btn-primary btn-lg py-3 rounded-3 shadow-sm fw-bold d-flex align-items-center justify-content-center border-0"
                    style={{ background: 'linear-gradient(45deg, #0d6efd, #0b5ed7)' }}
                    onClick={() => navigate("/inventory/requests/adjust/create")}
                  >
                    <i className="bi bi-plus-lg me-2"></i>
                    TẠO ĐƠN MỚI
                  </button>

                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop tối nền */}
      {showModal && <div className="modal-backdrop fade show"></div>}
    </>
  );
}

export default InventoryMenu;