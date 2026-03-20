import { useEffect, useState, useCallback } from "react";
import api from "services/axiosInstance";
import { formatCurrency } from "utils/formatters";
import ReturnDetail from "./ReturnDetail";
import useTitle from "hooks/common/useTitle";

const STATUS_OPTIONS = [
  { label: "Đang chờ", value: "Pending", color: "warning" },
  { label: "Đã duyệt", value: "Approve", color: "success" },
  { label: "Đã từ chối", value: "Reject", color: "danger" },
];

export default function ReturnList() {
  useTitle("Danh sách hoàn hàng")
  const [returns, setReturns] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("Pending");

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const roleName = currentUser?.roleName;

  
  const fetchReturns = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/returns", { params: { status: filterStatus } });
      setReturns(res.data.data || []);
    } catch (err) {
      console.error("Lỗi fetch:", err);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { fetchReturns(); }, [fetchReturns]);

  return (
    <div className="card shadow-sm border-0 rounded-4 p-3">
      <div className="d-flex justify-content-between align-items-center mb-4 px-2">
        <h4 className="fw-bold mb-0 text-primary">Quản lý hàng hoàn</h4>
        <div className="btn-group p-1 bg-light rounded-pill">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`btn btn-sm px-4 rounded-pill border-0 transition-all ${filterStatus === opt.value ? `bg-white shadow-sm fw-bold text-${opt.color}` : "text-muted"
                }`}
              onClick={() => setFilterStatus(opt.value)}
            >{opt.label}</button>
          ))}
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th className="ps-3 border-0">Mã hoàn</th>
              <th className="border-0">Hóa đơn gốc</th>
              <th className="border-0">Khách hàng</th>
              <th className="text-end border-0">Tiền hoàn</th>
              <th className="text-center border-0">Trạng thái</th>
              <th className="text-end pe-3 border-0">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="text-center py-5">Đang tải dữ liệu...</td></tr>
            ) : returns.map((r) => (
              <tr key={r.id}>
                <td className="ps-3 fw-bold">#{r.id}</td>
                <td><span className="text-muted small">{r.invoiceCode}</span></td>
                <td><div className="fw-semibold">{r.customerName || "Khách lẻ"}</div></td>
                <td className="text-end fw-bold text-danger">{formatCurrency(r.totalRefundAmount)}</td>
                <td className="text-center">
                  <span className={`badge bg-${STATUS_OPTIONS.find(o => o.value === r.status)?.color} bg-opacity-10 text-${STATUS_OPTIONS.find(o => o.value === r.status)?.color} px-3 py-2`}>
                    ● {STATUS_OPTIONS.find(o => o.value === r.status)?.label}
                  </span>
                </td>
                <td className="text-end pe-3">
                  <button className="btn btn-sm btn-primary rounded-pill px-3 shadow-sm" onClick={() => setSelectedId(r.id)}>
                    Xem chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedId && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 p-2">
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">Chi tiết đơn hoàn #{selectedId}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedId(null)}></button>
              </div>
              <div className="modal-body">
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
        </div>
      )}
    </div>
  );
}