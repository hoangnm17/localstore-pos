import React from "react";

function ProblematicDetailModal({
  show,
  report,
  onClose,
  onMarkAsProcessed,
  getStatusBadge,
  hasProcessPermission,
}) {
  if (!show || !report) return null;

  const canProcess = hasProcessPermission && report.status === "OPEN";

  // Format ngày đẹp hơn (ví dụ: 26/02/2026 23:37)
  const formattedDate = new Date(report.createdAt).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <>
      <div className="modal-backdrop fade show" style={{ opacity: 0.7 }}></div>

      <div
        className="modal fade show"
        tabIndex="-1"
        style={{ display: "block" }}
        aria-modal="true"
        role="dialog"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
          <div className="modal-content border-0 shadow-xl rounded-4 overflow-hidden">

            {/* Header với gradient nhẹ */}
            <div className="modal-header bg-gradient bg-primary-subtle border-0 pb-0 pt-4 px-4">
              <div>
                <h5 className="modal-title fw-bold text-primary fs-4 mb-1">
                  Chi tiết báo cáo #{report.id}
                </h5>
                <small className="text-muted">
                  {formattedDate}
                </small>
              </div>

              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onClose}
              ></button>
            </div>

            {/* Body */}
            <div className="modal-body px-4 pb-4">
              {/* Info row - grid layout đẹp hơn */}
              <div className="row g-4 mb-4">
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted small mb-1">
                    Tiêu đề
                  </label>
                  <div className="p-3 bg-light rounded-3 border border-secondary-subtle fw-medium">
                    {report.title}
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted small mb-1">
                    Trạng thái
                  </label>
                  <div className="pt-2">
                    {getStatusBadge(report.status)}
                  </div>
                </div>
              </div>

              <hr className="my-4 border-secondary-subtle" />

              <label className="form-label fw-semibold text-muted small mb-2">
                Mô tả vấn đề
              </label>
              <div
                className="p-4 bg-light rounded-3 border border-secondary-subtle lh-lg"
                style={{ whiteSpace: "pre-wrap", minHeight: "120px" }}
              >
                {report.issueDescription || (
                  <span className="text-muted fst-italic">
                    Không có mô tả chi tiết
                  </span>
                )}
              </div>

              {/* Có thể thêm các field khác nếu báo cáo có: ảnh, sản phẩm liên quan, người tạo, v.v. */}
            </div>

            {/* Footer - nút nổi bật hơn */}
            <div className="modal-footer border-0 bg-light px-4 py-3">
              {canProcess ? (
                <>
                  <button
                    className="btn btn-success btn-lg rounded-pill px-4 shadow shadow-lg-hover"
                    onClick={() => onMarkAsProcessed()}
                  >
                    <i className="bi bi-check2-circle me-2"></i>
                    Đánh dấu đã xử lý
                  </button>

                  <button
                    className="btn btn-outline-secondary btn-lg rounded-pill px-4"
                    onClick={onClose}
                  >
                    Đóng
                  </button>
                </>
              ) : (
                <button
                  className="btn btn-outline-secondary btn-lg rounded-pill px-5 mx-auto"
                  onClick={onClose}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Đóng
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProblematicDetailModal;