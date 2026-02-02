import { useNavigate } from "react-router-dom";

function InventoryMenu() {
  const navigate = useNavigate();

  return (
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
            onClick={() => navigate("/inventory/requests")}
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
            onClick={() => navigate("/inventory/errors")}
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
            onClick={() => navigate("/inventory/reports")}
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
  );
}

export default InventoryMenu;