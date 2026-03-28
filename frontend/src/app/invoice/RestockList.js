import React, { useState, useEffect, useCallback } from "react";
import { useNotification } from "components/global/Notification/NotificationContext";
import { getItems, approveRestock, rejectRestock } from "services/Return/return.service";
import useTitle from "hooks/common/useTitle";
import 'style/Return/Return.css'

const RestockList = () => {
  const [items, setItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useTitle("Nhập kho hàng hoàn trả");
  const pageSize = 8;
  const { showNotification } = useNotification();

  /**
   * Lấy danh sách hàng hoàn trả từ API
   */
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

  /**
   * Hàm xử lý khi DUYỆT nhập kho
   */
  const handleApprove = async (item) => {
    try {
      const response = await approveRestock(item.id);
      if (response.status === 200 || response.data?.success) {
        showNotification(`Đã nhập kho thành công: ${item.productName}`, "success");
        fetchItems();
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Duyệt nhập kho thất bại";
      showNotification(msg, "error");
    }
  };

  /**
   * Hàm xử lý khi TỪ CHỐI/BỎ QUA nhập kho
   */
  const handleReject = async (item) => {
    try {
      const response = await rejectRestock(item.id);
      if (response.status === 200 || response.data?.success) {
        showNotification(`Đã từ chối nhập kho: ${item.productName}`, "error");
        fetchItems();
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Thao tác từ chối thất bại";
      showNotification(msg, "error");
    }
  };

  // --- Render logic giữ nguyên phần giao diện ---
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
                    <button
                      className="btn-approve-modern"
                      onClick={() => handleApprove(item)}
                    >
                      Duyệt vào kho
                    </button>
                    <button
                      className="btn-reject-modern"
                      onClick={() => handleReject(item)}
                    >
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
    </div>
  );
};

export default RestockList;