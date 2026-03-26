import React, { useState, useEffect, useCallback } from "react";
import { useNotification } from "components/global/Notification/NotificationContext";
import { getItems, approveRestock, rejectRestock } from "services/Return/return.service";
import useTitle from "hooks/common/useTitle";

const RestockList = () => {
  const [items, setItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useTitle("Nhập kho hàng hoàn trả");
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
        showNotification(`${isApproved ? "Đã duyệt" : "Đã từ chối"}: ${item.productName}`, "success");
        fetchItems();
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Thao tác thất bại";
      showNotification(msg, "error");
    }
  };

  return (
    <div className="restock-modern-container">
      <div className="restock-header">
        <div className="title-section">
          <h3>Nhập kho hàng hoàn trả</h3>
          <div className="breadcrumb">Quản lý kho <i className="bi bi-chevron-right"></i> Phê duyệt hoàn trả</div>
        </div>

        <div className="status-tabs-wrapper">
          {["Pending", "Approved", "Rejected"].map((status) => (
            <button
              key={status}
              className={`status-tab ${statusFilter === status ? "active" : ""}`}
              onClick={() => { setStatusFilter(status); setPage(1); }}
            >
              {status === "Pending" && <i className="bi bi-clock-history"></i>}
              {status === "Approved" && <i className="bi bi-check2-all"></i>}
              {status === "Rejected" && <i className="bi bi-slash-circle"></i>}
              <span>{status === "Pending" ? "Chờ duyệt" : status === "Approved" ? "Đã nhập" : "Đã hủy"}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="restock-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton-card-modern"></div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state-modern">
          <div className="empty-icon"><i className="bi bi-box-seam"></i></div>
          <h3>Kho hàng đang trống</h3>
          <p>Tất cả hàng hoàn trả đã được xử lý xong.</p>
        </div>
      ) : (
        <div className="restock-grid">
          {items.map((item) => (
            <div key={item.id} className="restock-card">
              <div className="card-top">
                <span className="return-badge">Đơn hoàn #{item.returnId}</span>
                <span className="time-tag">
                  <i className="bi bi-calendar3"></i> {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                </span>
              </div>

              <div className="card-mid">
                <h4 className="product-name" title={item.productName}>{item.productName}</h4>
                <div className="product-meta">ID Sản phẩm: {item.id}</div>
                
                <div className="stats-container">
                  <div className="stat-pill">
                    <label>Số lượng</label>
                    <div className="val">{item.quantity} <span>{item.unitName}</span></div>
                  </div>
                  <div className="stat-pill highlight">
                    <label>Quy đổi gốc</label>
                    <div className="val">{item.baseQuantity}</div>
                  </div>
                </div>
              </div>

              <div className="card-bottom">
                {statusFilter === "Pending" ? (
                  <div className="action-buttons">
                    <button className="btn-approve-modern" onClick={() => handleAction(item, true)}>
                      Duyệt vào kho
                    </button>
                    <button className="btn-reject-modern" onClick={() => handleAction(item, false)}>
                      Bỏ qua
                    </button>
                  </div>
                ) : (
                  <div className={`final-status ${statusFilter.toLowerCase()}`}>
                    <i className={`bi ${statusFilter === "Approved" ? "bi-patch-check" : "bi-x-octagon"}`}></i>
                    {statusFilter === "Approved" ? "Đã nhập kho thành công" : "Đơn hàng đã bị hủy"}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {total > pageSize && (
        <div className="modern-pagination">
          <button className="p-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            <i className="bi bi-chevron-left"></i>
          </button>
          <div className="p-info">Trang <b>{page}</b> / {Math.ceil(total / pageSize)}</div>
          <button className="p-btn" disabled={page * pageSize >= total} onClick={() => setPage(p => p + 1)}>
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      )}

      <style jsx>{`
        .restock-modern-container { padding: 30px; background: #fbfbfd; min-height: 100vh; }
        
        .restock-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; }
        .restock-header h2 { font-weight: 800; font-size: 28px; color: #1d1d1f; margin-bottom: 5px; }
        .breadcrumb { font-size: 13px; color: #86868b; display: flex; align-items: center; gap: 8px; }
        
        .status-tabs-wrapper { display: flex; background: #e8e8ed; padding: 4px; border-radius: 12px; }
        .status-tab { border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600; color: #515154; transition: all 0.2s; background: transparent; }
        .status-tab.active { background: #fff; color: #0071e3; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .status-tab i { font-size: 16px; }

        .restock-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 25px; }
        
        .restock-card { background: #fff; border-radius: 20px; border: 1px solid rgba(0,0,0,0.05); padding: 24px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; }
        .restock-card:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,0.08); }
        
        .card-top { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .return-badge { background: #f5f5f7; color: #1d1d1f; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; }
        .time-tag { color: #86868b; font-size: 12px; display: flex; align-items: center; gap: 5px; }

        .product-name { font-size: 18px; font-weight: 700; color: #1d1d1f; margin-bottom: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4; }
        .product-meta { color: #86868b; font-size: 13px; margin-bottom: 20px; }

        .stats-container { display: flex; gap: 12px; margin-bottom: 25px; }
        .stat-pill { flex: 1; background: #f5f5f7; padding: 12px; border-radius: 14px; }
        .stat-pill label { display: block; font-size: 10px; font-weight: 700; color: #86868b; text-transform: uppercase; margin-bottom: 4px; }
        .stat-pill .val { font-size: 18px; font-weight: 800; color: #1d1d1f; }
        .stat-pill .val span { font-size: 12px; font-weight: 500; color: #86868b; }
        .stat-pill.highlight { background: #e1f2ff; }
        .stat-pill.highlight .val { color: #0071e3; }

        .action-buttons { display: flex; gap: 10px; }
        .btn-approve-modern { flex: 2; background: #0071e3; color: #fff; border: none; padding: 12px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: 0.2s; }
        .btn-approve-modern:hover { background: #0077ed; transform: scale(1.02); }
        .btn-reject-modern { flex: 1; background: #fff; color: #ff3b30; border: 1px solid #ff3b3022; padding: 12px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: 0.2s; }
        .btn-reject-modern:hover { background: #fff1f0; }

        .final-status { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; border-radius: 12px; font-weight: 700; font-size: 14px; }
        .final-status.approved { background: #e8f5e9; color: #34c759; }
        .final-status.rejected { background: #fff1f0; color: #ff3b30; }

        .modern-pagination { display: flex; justify-content: center; align-items: center; gap: 15px; margin-top: 50px; }
        .p-btn { width: 40px; height: 40px; border-radius: 50%; border: 1px solid #d2d2d7; background: #fff; cursor: pointer; transition: 0.2s; }
        .p-btn:hover:not(:disabled) { border-color: #0071e3; color: #0071e3; }
        .p-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .p-info { color: #1d1d1f; font-size: 14px; }

        .empty-state-modern { text-align: center; padding: 100px 0; }
        .empty-icon { font-size: 64px; color: #d2d2d7; margin-bottom: 20px; }
        .skeleton-card-modern { height: 260px; background: #eee; border-radius: 20px; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }
      `}</style>
    </div>
  );
};

export default RestockList;