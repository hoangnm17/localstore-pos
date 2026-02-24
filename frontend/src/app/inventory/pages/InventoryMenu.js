import { useNavigate } from "react-router-dom";
import { useState } from "react";

function InventoryMenu() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="container-fluid py-5 px-4 px-md-5 px-lg-5 bg-light min-vh-100">
        <div className="text-center mb-5">
          <h2 className="fw-bold text-dark mb-2">Quản lý Kho hàng</h2>
          <p className="text-muted lead">Chọn chức năng bạn muốn thực hiện</p>
        </div>

        <div className="row row-cols-1 row-cols-lg-2 g-4 g-lg-5 justify-content-center">
          {/* Card 1 */}
          <div className="col">
            <div
              className="card h-100 border-0 shadow-lg rounded-4 overflow-hidden text-center transition hover-shadow-xl cursor-pointer"
              onClick={() => navigate("/inventory/categories")}
              role="button"
              tabIndex={0}
            >
              <div className="card-body py-5 px-5 d-flex flex-column align-items-center justify-content-center">
                <div className="bg-primary bg-gradient text-white rounded-circle p-5 mb-4 shadow">
                  <i className="bi bi-box-seam fs-2"></i>
                </div>
                <h4 className="card-title fw-bold mb-3 text-dark">Danh sách tồn kho</h4>
                <p className="card-text text-muted mb-4 fs-5">
                  Xem số lượng tồn kho hiện tại của tất cả sản phẩm
                </p>
              </div>
              <div className="card-footer bg-transparent border-0 pb-5 pt-0">
                <button className="btn btn-outline-primary btn-lg rounded-pill px-5 shadow-sm">
                  Truy cập ngay <i className="bi bi-arrow-right ms-2"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="col">
            <div
              className="card h-100 border-0 shadow-lg rounded-4 overflow-hidden text-center transition hover-shadow-xl cursor-pointer"
              onClick={() => setShowModal(true)}
              role="button"
              tabIndex={0}
            >
              <div className="card-body py-5 px-5 d-flex flex-column align-items-center justify-content-center">
                <div className="bg-success bg-gradient text-white rounded-circle p-5 mb-4 shadow">
                  <i className="bi bi-list-check fs-2"></i>
                </div>
                <h4 className="card-title fw-bold mb-3 text-dark">Yêu cầu tồn kho</h4>
                <p className="card-text text-muted mb-4 fs-5">
                  Tạo, theo dõi và phê duyệt yêu cầu xuất/nhập kho
                </p>
              </div>
              <div className="card-footer bg-transparent border-0 pb-5 pt-0">
                <button className="btn btn-outline-success btn-lg rounded-pill px-5 shadow-sm">
                  Truy cập ngay <i className="bi bi-arrow-right ms-2"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Card 3 */}
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

          {/* Card 4 */}
          <div className="col">
            <div
              className="card h-100 border-0 shadow-lg rounded-4 overflow-hidden text-center transition hover-shadow-xl cursor-pointer"
              onClick={() => navigate("/inventory/purchase-orders/report")}
              role="button"
              tabIndex={0}
            >
              <div className="card-body py-5 px-5 d-flex flex-column align-items-center justify-content-center">
                <div className="bg-info bg-gradient text-white rounded-circle p-5 mb-4 shadow">
                  <i className="bi bi-bar-chart-line fs-2"></i>
                </div>
                <h4 className="card-title fw-bold mb-3 text-dark">Báo cáo nhập hàng</h4>
                <p className="card-text text-muted mb-4 fs-5">
                  Thống kê nhập hàng theo thời gian
                </p>
              </div>
              <div className="card-footer bg-transparent border-0 pb-5 pt-0">
                <button className="btn btn-outline-info btn-lg rounded-pill px-5 shadow-sm">
                  Truy cập ngay <i className="bi bi-arrow-right ms-2"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <>
          <div
            className="modal fade show"
            style={{ display: "block" }}
            tabIndex="-1"
            aria-modal="true"
            role="dialog"
          >
            <div className="modal-dialog modal-dialog-centered modal-md">
              <div className="modal-content rounded-4 shadow-xl border-0 overflow-hidden">

                {/* Header */}
                <div className="modal-header bg-primary text-white border-0 py-3 px-4 px-md-5">
                  <div className="d-flex align-items-center gap-3">
                    {/* Icon circle với nền trắng mờ */}
                    <div className="bg-white bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center p-3">
                      <i className="bi bi-list-check fs-4"></i>
                    </div>

                    {/* Tiêu đề */}
                    <h5 className="modal-title fw-bold mb-0 fs-4 text-warning">
                      Chọn loại yêu cầu tồn kho
                    </h5>
                  </div>

                  {/* Nút đóng */}
                  <button
                    type="button"
                    className="btn-close btn-close-white shadow-sm"
                    onClick={() => setShowModal(false)}
                    aria-label="Close"
                  ></button>
                </div>


                {/* Body */}
                <div className="modal-body px-5 py-5 bg-light">
                  <p className="text-center text-muted mb-4 fs-5">
                    Vui lòng chọn hành động bạn muốn thực hiện
                  </p>

                  <div className="d-grid gap-3">
                    <button
                      className="btn btn-success btn-lg rounded-pill shadow d-flex align-items-center justify-content-center py-3"
                      onClick={() => {
                        setShowModal(false);
                        navigate("/inventory/purchase-orders");
                      }}
                    >
                      <i className="bi bi-box-arrow-in-right fs-4 me-3"></i>
                      <span>Yêu cầu nhập kho</span>
                    </button>

                    <button
                      className="btn btn-warning btn-lg rounded-pill shadow d-flex align-items-center justify-content-center py-3"
                      onClick={() => {
                        setShowModal(false);
                        navigate("/inventory/requests/adjust");
                      }}
                    >
                      <i className="bi bi-arrow-left-right fs-4 me-3"></i>
                      <span>Yêu cầu điều chỉnh tồn kho</span>
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="modal-footer border-0 px-5 pb-5 pt-0 bg-light">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-lg rounded-pill px-5"
                    onClick={() => setShowModal(false)}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Backdrop */}
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 1040 }} // đảm bảo nằm dưới modal (modal z-index mặc định 1050)
            onClick={() => setShowModal(false)}
          ></div>
        </>
      )}
    </>
  );
}

export default InventoryMenu;