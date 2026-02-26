import React from "react";

function ProblematicDetailModal({
  show,
  report,
  onClose,
  onMarkAsProcessed,
  getStatusBadge,
  hasProcessPermission
}) {
  if (!show || !report) return null;

  const canProcess =
    hasProcessPermission && report.status === "OPEN";

  return (
    <>
      <div className="modal-backdrop fade show"></div>

      <div
        className="modal fade show"
        tabIndex="-1"
        style={{ display: "block" }}
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 shadow-lg rounded-4">

            <div className="modal-header bg-light">
              <h5 className="modal-title fw-bold">
                Chi tiết báo cáo #{report.id}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>

            <div className="modal-body">
              <p><strong>Tiêu đề:</strong> {report.title}</p>
              <p><strong>Trạng thái:</strong> {getStatusBadge(report.status)}</p>
              <p>
                <strong>Ngày tạo:</strong>{" "}
                {new Date(report.createdAt).toLocaleDateString("vi-VN")}
              </p>

              <hr />

              <p><strong>Mô tả:</strong></p>
              <div className="p-3 bg-light rounded">
                {report.issueDescription}
              </div>
            </div>

            <div className="modal-footer">

              {canProcess && (
                <button
                  className="btn btn-success"
                  onClick={() => onMarkAsProcessed(report.id)}
                >
                  Đánh dấu là đã xử lý
                </button>
              )}

              <button
                className="btn btn-secondary"
                onClick={onClose}
              >
                Đóng
              </button>

            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default ProblematicDetailModal;