import { useEffect, useState, useCallback } from "react";
import api from "services/axiosInstance";
import { formatCurrency } from "utils/formatters";
import ReturnDetail from "./ReturnDetail";
import useTitle from "hooks/common/useTitle";
import { getReturn } from "services/Return/return.service";
import 'style/Return/Return.css'

const STATUS_OPTIONS = [
  { label: "Đang chờ", value: "Pending", color: "#f59e0b", bg: "#fffbeb", icon: "bi-hourglass-split" },
  { label: "Đã duyệt", value: "Approve", color: "#10b981", bg: "#ecfdf5", icon: "bi-check-all" },
  { label: "Đã từ chối", value: "Reject", color: "#ef4444", bg: "#fef2f2", icon: "bi-x-circle" },
];

export default function ReturnList() {
  useTitle("Danh sách hoàn hàng");
  const [returns, setReturns] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("Pending");

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const roleName = currentUser?.roleName;

  const fetchReturns = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getReturn({ status: filterStatus });
      setReturns(res.data || []);
    } catch (err) {
      console.error("Lỗi fetch:", err);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { fetchReturns(); }, [fetchReturns]);

  return (
    <div className="modern-return-container p-4">
      {/* HEADER SECTION */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h3 className="fw-bold text-dark m-0">Quản lý hàng hoàn</h3>
          <p className="text-muted small m-0">Theo dõi và xử lý các yêu cầu hoàn tiền từ khách hàng</p>
        </div>
        
        <div className="filter-pill-box">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`filter-pill ${filterStatus === opt.value ? "active" : ""}`}
              style={filterStatus === opt.value ? { '--active-color': opt.color } : {}}
              onClick={() => setFilterStatus(opt.value)}
            >
              <i className={`bi ${opt.icon} me-2`}></i>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 custom-table">
            <thead>
              <tr>
                <th className="ps-4 py-3">Mã đơn hoàn</th>
                <th>Thông tin hóa đơn</th>
                <th>Khách hàng</th>
                <th className="text-end">Tiền hoàn</th>
                <th className="text-center">Trạng thái</th>
                <th className="text-end pe-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="skeleton-row">
                    <td colSpan="6"><div className="skeleton-bar"></div></td>
                  </tr>
                ))
              ) : returns.length > 0 ? (
                returns.map((r) => {
                  const statusInfo = STATUS_OPTIONS.find(o => o.value === r.status);
                  return (
                    <tr key={r.id}>
                      <td className="ps-4">
                        <span className="id-badge">#{r.id}</span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-receipt text-primary"></i>
                          <span className="fw-medium text-dark">{r.invoiceCode || "N/A"}</span>
                        </div>
                        <small className="text-muted" style={{ fontSize: '11px' }}>Hóa đơn gốc</small>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="avatar-circle">{r.customerName?.[0] || "K"}</div>
                          <span className="fw-semibold">{r.customerName || "Khách lẻ"}</span>
                        </div>
                      </td>
                      <td className="text-end">
                        <span className="fw-bold text-danger">{formatCurrency(r.totalRefundAmount)}</span>
                      </td>
                      <td className="text-center">
                        <span className="status-badge" style={{ backgroundColor: statusInfo?.bg, color: statusInfo?.color }}>
                          <i className={`bi ${statusInfo?.icon} me-1`}></i>
                          {statusInfo?.label}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <button className="btn-action-view" onClick={() => setSelectedId(r.id)}>
                          <span>Chi tiết</span>
                          <i className="bi bi-arrow-right-short ms-1"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <img src="https://cdn-icons-png.flaticon.com/512/5058/5058436.png" width="80" alt="empty" className="opacity-25 mb-3" />
                    <p className="text-muted">Không có dữ liệu đơn hoàn nào</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETAIL */}
      {selectedId && (
        <div className="modal-custom-overlay">
          <div className="modal-custom-content">
            <div className="modal-custom-header">
              <h5 className="m-0 fw-bold"><i className="bi bi-info-circle me-2"></i>Chi tiết đơn hoàn #{selectedId}</h5>
              <button className="btn-close-custom" onClick={() => setSelectedId(null)}><i className="bi bi-x-lg"></i></button>
            </div>
            <div className="modal-custom-body">
              <ReturnDetail
                returnId={selectedId}
                roleName={roleName}
                onActionSuccess={() => {
                  setSelectedId(null);
                  fetchReturns();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}