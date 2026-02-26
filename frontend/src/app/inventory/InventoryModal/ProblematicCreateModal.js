import React, { useState, useEffect } from "react";

function ProblematicCreateModal({ show, onClose, onSubmit }) {
  const [title, setTitle] = useState("");
  const [issueDescription, setIssueDescription] = useState("");

  // Reset form khi mở lại modal
  useEffect(() => {
    if (show) {
      setTitle("");
      setIssueDescription("");
    }
  }, [show]);

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim() || !issueDescription.trim()) return;

    onSubmit({
      title,
      issueDescription,
    });
  };

  return (
    <>
      <div className="modal-backdrop fade show"></div>

      <div
        className="modal fade show"
        tabIndex="-1"
        style={{ display: "block" }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4">

            <div className="modal-header bg-light">
              <h5 className="modal-title fw-bold">
                Tạo báo cáo mới
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Tiêu đề
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Nhập tiêu đề báo cáo..."
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">
                    Mô tả vấn đề
                  </label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={issueDescription}
                    onChange={(e) =>
                      setIssueDescription(e.target.value)
                    }
                    placeholder="Mô tả chi tiết vấn đề..."
                    required
                  />
                </div>

              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Tạo báo cáo
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