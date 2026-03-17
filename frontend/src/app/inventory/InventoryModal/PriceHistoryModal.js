import React, { useEffect, useState } from "react";
import supplierService from "../../../services/Inventory/supplierService";

function PriceHistoryModal({ show, onClose, supplierId, product }) {
  const [priceHistory, setPriceHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!show || !product?.id) return;

    const loadHistory = async () => {
      setLoading(true);
      try {
        const res = await supplierService.getPriceHistory(supplierId, product.id);
        if (res?.data?.success) {
          setPriceHistory(res.data.data || []);
        }
      } catch (err) {
        console.error("Load price history error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [show, product, supplierId]);

  if (!show) return null;

  return (
    <>
    <div
      className="modal fade show"
      style={{ display: "block" }}
      tabIndex="-1"
      aria-modal="true"
      role="dialog"
    >
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          
          {/* Header */}
          <div className="modal-header bg-light border-0 pb-0 pt-4 px-4">
            <div className="d-flex align-items-center">
              <h5 className="modal-title fw-semibold fs-4 mb-0 text-dark">
                Lịch sử giá nhập
              </h5>
              <span className="badge bg-primary-subtle text-primary ms-3 px-3 py-2 rounded-pill">
                {product?.name}
              </span>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          {/* Body */}
          <div className="modal-body px-4 pb-4">
            {loading ? (
              <div className="d-flex justify-content-center align-items-center py-5">
                <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }} role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : priceHistory.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-clock-history fs-1 d-block mb-3"></i>
                <p className="mb-1">Chưa có lịch sử thay đổi giá</p>
                <small>Dữ liệu sẽ hiển thị khi có thay đổi giá nhập</small>
              </div>
            ) : (
              <div className="table-responsive rounded-3 border bg-white">
                <table className="table table-hover table-striped align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th scope="col" className="ps-4 py-3">Giá nhập</th>
                      <th scope="col" className="py-3">Đơn vị</th>
                      <th scope="col" className="py-3">Ngày chỉnh sửa</th>
                      <th scope="col" className="py-3">Người chỉnh sửa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {priceHistory.map((item) => (
                      <tr key={item.id}>
                        <td className="ps-4 fw-medium">
                          {item.price?.toLocaleString("vi-VN")} ₫
                        </td>
                        <td>{item.unitName || "—"}</td>
                        <td>
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleString("vi-VN", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })
                            : "—"}
                        </td>
                        <td>{item.updatedBy || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer (tùy chọn - có thể bỏ nếu không cần) */}
          <div className="modal-footer border-0 pt-0 px-4 pb-4">
            <button
              type="button"
              className="btn btn-outline-secondary px-4"
              onClick={onClose}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
      
    </div>
    <div className="modal-backdrop fade show"></div>
    </>
  );
}

export default PriceHistoryModal;