import React, { useState, useEffect, useCallback } from "react";
import { useNotification } from "components/global/Notification/NotificationContext";
import {
  getItems,
  approveRestock,
  rejectRestock,
} from "services/Return/return.service";
import useTitle from "hooks/common/useTitle";

const RestockList = () => {
  const [items, setItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useTitle("Nhập kho hàng hoàn trả")
  const pageSize = 8;
  const { showNotification } = useNotification();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getItems(statusFilter, page, pageSize);

      if (result?.success) {
        const apiData = result.data;
        setItems(apiData.data || []);
        setTotal(apiData.total || 0);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      showNotification("Không thể lấy dữ liệu từ máy chủ", "error");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page, showNotification]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleAction = async (item, isApproved) => {
    try {
      const apiCall = isApproved ? approveRestock : rejectRestock;
      const response = await apiCall(item.id);

      if (response.status === 200 || response.data?.success) {
        showNotification(
          `${isApproved ? "Đã duyệt" : "Đã từ chối"}: ${item.productName}`,
          "success"
        );
        fetchItems();
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Thao tác thất bại";
      showNotification(msg, "error");
    }
  };

  return (
    <div className="restock-container">
      <div className="header">
        <div className="title-section">
          <h2>Quản lý nhập kho</h2>
          <p>Phê duyệt và theo dõi lịch sử hàng hoàn trả</p>
        </div>

        <div className="tabs">
          {["Pending", "Approved", "Rejected"].map((status) => (
            <button
              key={status}
              className={`tab ${statusFilter === status ? "active" : ""}`}
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
            >
              {status === "Pending" ? "Chờ duyệt" : status === "Approved" ? "Đã nhập" : "Đã hủy"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-header"></div>
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#ccc' }}></i>
          <h3>Danh sách trống</h3>
          <p>Không có mục nào đang ở trạng thái này.</p>
        </div>
      ) : (
        <div className="grid">
          {items.map((item) => (
            <div key={item.id} className="card">
              <div className="card-header">
                <span className="id-badge">ID: {item.id}</span>
                <span className="date-tag">
                  {new Date(item.createdAt).toLocaleString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                  })}
                </span>
              </div>

              <div className="card-body">
                <h4 title={item.productName}>{item.productName}</h4>
                <div className="info-row">
                  <span>Mã hoàn: <strong>#{item.returnId}</strong></span>
                </div>

                {/* HIỂN THỊ UNIT NAME VÀ QUANTITY */}
                <div className="stats-row" style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                  <div className="stat-box" style={{ flex: 1 }}>
                    <label>Số lượng</label>
                    <span className="value">{item.quantity} <small style={{ fontSize: '12px', fontWeight: 'normal' }}>{item.unitName}</small></span>
                  </div>

                  {/* HIỂN THỊ BASE QUANTITY (QUY ĐỔI) */}
                  <div className="stat-box" style={{ flex: 1 }}>
                    <label>Quy đổi</label>
                    <span className="value">{item.baseQuantity}</span>
                  </div>
                </div>
              </div>

              <div className="card-footer">
                {statusFilter === "Pending" ? (
                  <div className="actions">
                    <button className="btn-approve" onClick={() => handleAction(item, true)}>
                      Duyệt nhập
                    </button>
                    <button className="btn-reject" onClick={() => handleAction(item, false)}>
                      Từ chối
                    </button>
                  </div>
                ) : (
                  <div className={`status-pill ${statusFilter === "Approved" ? "approved" : "rejected"}`}>
                    <span className="dot"></span>
                    {statusFilter === "Approved" ? "Đã vào kho" : "Đã hủy bỏ"}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PHÂN TRANG */}
      {total > pageSize && (
        <div className="pagination-wrapper">
          <button className="pag-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            Trước
          </button>
          <span className="page-indicator">Trang {page} / {Math.ceil(total / pageSize)}</span>
          <button className="pag-btn" disabled={page * pageSize >= total} onClick={() => setPage(p => p + 1)}>
            Sau
          </button>
        </div>
      )}

      <style jsx>{`
        .restock-container { padding: 20px; max-width: 1200px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .tabs { display: flex; gap: 10px; background: #f0f0f0; padding: 5px; border-radius: 8px; }
        .tab { border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; transition: 0.3s; }
        .tab.active { background: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); font-weight: bold; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
        .card { border: 1px solid #eee; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .card-header { padding: 12px; background: #fafafa; display: flex; justify-content: space-between; font-size: 11px; color: #666; }
        .card-body { padding: 15px; flex-grow: 1; }
        .card-body h4 { margin: 0 0 8px 0; color: #111; font-size: 16px; }
        .info-row { font-size: 13px; color: #666; }
        .stat-box { background: #f8f9fa; padding: 10px; border-radius: 6px; border: 1px solid #f0f0f0; }
        .stat-box label { font-size: 10px; color: #888; text-transform: uppercase; display: block; margin-bottom: 2px; }
        .stat-box .value { font-size: 16px; font-weight: bold; color: #333; }
        .card-footer { padding: 12px; border-top: 1px solid #eee; }
        .actions { display: flex; gap: 8px; }
        .btn-approve { flex: 2; background: #111; color: white; border: none; padding: 10px; border-radius: 6px; cursor: pointer; font-weight: 600; }
        .btn-reject { flex: 1; background: #fff; color: #dc3545; border: 1px solid #f5c6cb; padding: 10px; border-radius: 6px; cursor: pointer; }
        .status-pill { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 8px; border-radius: 6px; font-size: 13px; font-weight: 600; }
        .status-pill.approved { background: #e8f5e9; color: #2e7d32; }
        .status-pill.rejected { background: #ffebee; color: #c62828; }
        .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
        .pagination-wrapper { margin-top: 30px; display: flex; justify-content: center; align-items: center; gap: 20px; }
        .pag-btn { padding: 8px 16px; border: 1px solid #ddd; background: #fff; border-radius: 6px; cursor: pointer; }
        .pag-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </div>
  );
};

export default RestockList;