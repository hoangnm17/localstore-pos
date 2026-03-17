import { useNavigate } from "react-router-dom";
import { useState } from "react";

function InventoryMenu() {
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
                <h4 className="card-title fw-bold mb-3 text-dark">Lỗi nhập hàng</h4>
                <p className="card-text text-muted mb-4 fs-5">
                  Ghi nhận và xử lý các sai lệch khi nhập kho
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
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 shadow">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">
                  Chọn trạng thái đơn điều chỉnh
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <div className="modal-body text-center pb-4">
                <div className="d-grid gap-3">

                  <button
                    className="btn btn-warning btn-lg rounded-pill"
                    onClick={() => navigateToStatus("Pending")}
                  >
                    Chờ xử lý
                  </button>

                  <button
                    className="btn btn-success btn-lg rounded-pill"
                    onClick={() => navigateToStatus("Approved")}
                  >
                    Đã duyệt
                  </button>

                  <button
                    className="btn btn-danger btn-lg rounded-pill"
                    onClick={() => navigateToStatus("Rejected")}
                  >
                    Từ chối
                  </button>

                  <button
                    className="btn btn-primary btn-lg rounded-pill"
                    onClick={() => navigate("/inventory/requests/adjust/create")}
                  >
                    Tạo đơn
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