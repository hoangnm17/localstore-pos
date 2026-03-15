import React, { useEffect, useState } from "react";
import api from "services/axiosInstance";
import ProductCard from "app/pos/Product/ProductList/ProductCard";
import { formatCurrency } from "utils/formatters";
import { approveReturn, getReturnDetail, rejectReturn } from "services/Return/return.service";

export default function ReturnDetail({ returnId, roleName, onActionSuccess }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const canAction = roleName === "Manager";

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await getReturnDetail(returnId);
        setData(res.data);
      } catch (err) {
        console.error("Lỗi tải chi tiết:", err);
      } finally {
        setLoading(false);
      }
    };
    if (returnId) fetchDetail();
  }, [returnId]);

  const handleApprove = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn duyệt đơn hoàn này?")) return;
    try {
      setSubmitting(true);
      await approveReturn;
      onActionSuccess();
    } catch (err) {
      alert("Duyệt thất bại: " + (err.response?.data?.message || "Lỗi server"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    const reason = window.prompt("Nhập lý do từ chối (không bắt buộc):");
    if (reason === null) return;
    try {
      setSubmitting(true);
      await rejectReturn();
      onActionSuccess();
    } catch (err) {
      alert("Từ chối thất bại: " + (err.response?.data?.message || "Lỗi server"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary spinner-border-sm me-2"></div>
      Đang tải chi tiết...
    </div>
  );

  if (!data) return <div className="text-center py-5">Không tìm thấy dữ liệu.</div>;

  return (
    <div>
      {/* Header Info */}
      <div className="row g-3 mb-4 p-3 bg-light rounded-4 mx-0 border">
        <div className="col-md-6 border-end">
          <label className="text-muted small d-block">Khách hàng</label>
          <span className="fw-bold text-primary">{data.customerName || "Khách lẻ"}</span>
          <div className="small text-muted"><i className="bi bi-telephone me-1"></i>{data.phone || "N/A"}</div>
        </div>
        <div className="col-md-6 ps-md-4">
          <label className="text-muted small d-block">Hóa đơn gốc</label>
          <span className="badge bg-white text-dark border px-3 py-2 fw-semibold">#{data.invoiceCode}</span>
          <div className="small text-muted mt-1">Ngày: {new Date(data.createdAt).toLocaleDateString('vi-VN')}</div>
        </div>
        <div className="col-12 mt-2 pt-2 border-top">
          <label className="text-muted small d-block">Lý do hoàn trả</label>
          <div className="fst-italic text-secondary">
            <i className="bi bi-chat-left-quote me-2"></i>
            {data.reason || "Không rõ lý do"}
          </div>
        </div>
      </div>

      <h6 className="fw-bold mb-3 d-flex align-items-center">
        <i className="bi bi-box-seam me-2 text-primary"></i>
        Sản phẩm hoàn trả
      </h6>
      <div className="d-flex flex-wrap gap-3 mb-4 overflow-auto p-1" style={{ maxHeight: "350px" }}>
        {data.returnItems?.map((item) => (
          <div key={item.id} className="border rounded-4 p-2 bg-white shadow-sm hover-up transition-all" style={{ width: "160px" }}>
            <ProductCard
              product={{
                ...item.product,
                units: [{ unitName: item.product.unitName, factor: 1 }]
              }}
            />
            <div className="mt-2 text-center border-top pt-2">
              <div className="small text-muted">Số lượng: <b className="text-danger">{item.quantity}</b></div>
              <div className="fw-bold text-dark small">{formatCurrency(item.refundAmount)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Total & Footer Nâng cấp Phân quyền */}
      <div className="modal-footer border-0 px-0 mt-4 d-flex justify-content-between align-items-center bg-light p-3 rounded-4">
        <div className="text-start">
          <div className="text-muted small">Tổng tiền hoàn trả</div>
          <h4 className="fw-bold text-danger mb-0">{formatCurrency(data.totalRefundAmount)}</h4>
        </div>

        <div className="d-flex gap-2">
          {data.status === 'Pending' ? (
            canAction ? (
              /* HIỂN THỊ NÚT CHO MANAGER */
              <>
                <button
                  className="btn btn-outline-danger rounded-pill px-4"
                  onClick={handleReject}
                  disabled={submitting}
                >
                  Từ chối
                </button>
                <button
                  className="btn btn-success rounded-pill px-4 shadow-sm"
                  onClick={handleApprove}
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="spinner-border spinner-border-sm me-2"></span>
                  ) : (
                    <i className="bi bi-check-circle-fill me-2"></i>
                  )}
                  Duyệt đơn hoàn
                </button>
              </>
            ) : (
              <div className="text-muted small fst-italic border-start ps-3 border-secondary">
                <i className="bi bi-info-circle me-1"></i>
                Bạn không có quyền duyệt đơn. <br/>Vui lòng chờ Quản lý xử lý.
              </div>
            )
          ) : (
            <span className="badge bg-secondary px-4 py-2 rounded-pill">Đã xử lý xong</span>
          )}
        </div>
      </div>
    </div>
  );
}