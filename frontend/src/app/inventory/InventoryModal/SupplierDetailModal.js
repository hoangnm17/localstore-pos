// src/components/inventoryComponents/SupplierDetailModal.js
import React, { useEffect } from "react";

const SupplierDetailModal = ({ show, onHide, supplier, loading }) => {
  // Xử lý backdrop và body scroll khi modal mở
  useEffect(() => {
    if (show) {
      document.body.classList.add("modal-open");
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "15px"; // tránh jump layout nếu có scrollbar
    } else {
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }

    // Cleanup khi unmount
    return () => {
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [show]);

  // Xử lý phím Escape để đóng modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && show) {
        onHide();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [show, onHide]);

  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1040 }}
        onClick={onHide}
      ></div>

      {/* Modal chính */}
      <div
        className={`modal fade ${show ? "show" : ""}`}
        style={{ display: show ? "block" : "none", zIndex: 1050 }}
        tabIndex="-1"
        aria-labelledby="supplierModalLabel"
        aria-modal="true"
        role="dialog"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content rounded-4 shadow-xl border-0">
            <div className="modal-header bg-info text-white border-0 rounded-top-4">
              <h5 className="modal-title fw-bold" id="supplierModalLabel">
                <i className="bi bi-building me-2"></i>
                Thông tin nhà cung cấp
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onHide}
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body p-4">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-info" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                  </div>
                  <p className="mt-3 text-muted">Đang tải thông tin nhà cung cấp</p>
                </div>
              ) : supplier ? (
                <div className="supplier-detail">
                  <div className="text-center mb-4">
                    <h4 className="fw-bold text-primary">{supplier.name}</h4>
                    <small className="text-muted">Mã NCC: #{supplier.id}</small>
                  </div>

                  <dl className="row g-3 mb-0">
                    <dt className="col-sm-4 fw-semibold text-muted">Tên nhà cung cấp:</dt>
                    <dd className="col-sm-8 fw-medium">{supplier.name || "—"}</dd>

                    <dt className="col-sm-4 fw-semibold text-muted">Thông tin liên hệ:</dt>
                    <dd className="col-sm-8">
                      <div style={{ whiteSpace: "pre-line" }}>
                        {supplier.contactInfo || "Chưa có thông tin liên hệ"}
                      </div>
                    </dd>

                    <dt className="col-sm-4 fw-semibold text-muted">Địa chỉ:</dt>
                    <dd className="col-sm-8">{supplier.address || "—"}</dd>
                  </dl>

                  {/* Nếu backend trả thêm taxCode hoặc các field khác */}
                  {supplier.taxCode && (
                    <>
                      <hr className="my-4" />
                      <h6 className="fw-bold text-secondary mb-3">Thông tin bổ sung</h6>
                      <dl className="row g-3">
                        <dt className="col-sm-4 fw-semibold text-muted">Mã số thuế:</dt>
                        <dd className="col-sm-8">{supplier.taxCode}</dd>
                      </dl>
                    </>
                  )}
                </div>
              ) : (
                <div className="alert alert-warning text-center py-4">
                  Không tìm thấy thông tin chi tiết nhà cung cấp.
                </div>
              )}
            </div>

            <div className="modal-footer border-0">
              <button
                type="button"
                className="btn btn-secondary rounded-pill px-4"
                onClick={onHide}
              >
                Đóng
              </button>
              {/* Nếu cần thêm nút khác, ví dụ: Xem lịch sử */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SupplierDetailModal;