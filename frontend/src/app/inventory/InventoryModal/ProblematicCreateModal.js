import React, { useState, useEffect } from "react";

function ProblematicCreateModal({ show, onClose, onSubmit }) {
  const [title, setTitle] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form khi modal mở
  useEffect(() => {
    if (show) {
      setTitle("");
      setIssueDescription("");
      setIsSubmitting(false);
    }
  }, [show]);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !issueDescription.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        issueDescription: issueDescription.trim(),
      });
      // onSubmit đã xử lý fetchReports và close modal ở parent
    } catch (err) {
      console.error("Submit error:", err);
      // Có thể thêm toast error ở đây nếu có hệ thống thông báo
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="modal-backdrop fade show" style={{ opacity: 0.65 }}></div>

      <div
        className="modal fade show"
        tabIndex="-1"
        style={{ display: "block" }}
        aria-modal="true"
        role="dialog"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
          <div className="modal-content border-0 shadow-xl rounded-4 overflow-hidden">

            {/* Header */}
            <div className="modal-header bg-gradient bg-primary-subtle border-0 pt-4 px-4 pb-0">
              <div>
                <h5 className="modal-title fw-bold text-primary fs-3 mb-1">
                  Tạo báo cáo mới
                </h5>
                <small className="text-muted">
                  Mô tả vấn đề hàng hóa để xử lý nhanh chóng
                </small>
              </div>

              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onClose}
                disabled={isSubmitting}
              ></button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit}>
              <div className="modal-body px-4 pb-4">
                {/* Tiêu đề */}
                <div className="mb-4">
                  <label className="form-label fw-semibold text-muted small mb-2">
                    Tiêu đề báo cáo <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg rounded-3 border-secondary-subtle shadow-sm"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Tiêu đề "
                    required
                    maxLength={150}
                    disabled={isSubmitting}
                  />
                  <div className="form-text text-muted small">
                    {title.length}/150 ký tự
                  </div>
                </div>

                {/* Mô tả */}
                <div className="mb-3">
                  <label className="form-label fw-semibold text-muted small mb-2">
                    Mô tả chi tiết vấn đề <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control form-control-lg rounded-3 border-secondary-subtle shadow-sm"
                    rows="6"
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    placeholder="Mô tả vấn đề: . . ."
                    required
                    disabled={isSubmitting}
                  ></textarea>
                  <div className="form-text text-muted small text-end">
                    {issueDescription.length} ký tự
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer border-0 bg-light px-4 py-3 d-flex gap-3 justify-content-end">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-lg rounded-pill px-4"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg rounded-pill px-5 shadow shadow-lg-hover d-flex align-items-center gap-2"
                  disabled={isSubmitting || !title.trim() || !issueDescription.trim()}
                >
                  {isSubmitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-plus-circle"></i>
                      Tạo báo cáo
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProblematicCreateModal;