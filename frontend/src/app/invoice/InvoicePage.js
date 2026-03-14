import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { invoiceGetList } from "services/Invoices/invoice.service";
import Pagination from "components/Pagination/Pagination";
import { formatCurrency } from "utils/formatters";
import InvoiceDetailModal from "./InvoiceDetailModal";
import useDebounce from "hooks/common/useDebounce";
import useTitle from "hooks/common/useTitle";

const STATUS = {
  ALL: "ALL",
  UNPAID: "UNPAID",
  PAID: "PAID",
  CANCELLED: "CANCELLED",
};

const STATUS_META = {
  PAID: { label: "Đã thanh toán", bg: "#D1FAE5", color: "#065F46", icon: "bi-check-all" },
  UNPAID: { label: "Chờ thanh toán", bg: "#FEF3C7", color: "#92400E", icon: "bi-clock-history" },
  CANCELLED: { label: "Đã hủy bỏ", bg: "#FEE2E2", color: "#991B1B", icon: "bi-trash3" },
  DEFAULT: { label: "N/A", bg: "#F3F4F6", color: "#374151", icon: "bi-question-circle" }
};

export default function InvoicesPage() {
  const navigate = useNavigate();

  // --- States ---
  const [status, setStatus] = useState(STATUS.ALL);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [detailId, setDetailId] = useState(null);
  const [pagination, setPagination] = useState({ 
    page: 1, 
    pageSize: 10, 
    totalItems: 0, 
    totalPages: 1 
  });

  // Cập nhật tiêu đề trang động theo trạng thái filter
  useTitle(status === STATUS.ALL ? "Tất cả hóa đơn" : `${STATUS_META[status]?.label}`);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  // --- Logic ---
  const params = useMemo(() => {
    const p = { page, pageSize: pagination.pageSize };
    if (status !== STATUS.ALL) p.status = status;
    if (debouncedSearch?.trim()) p.invoiceCode = debouncedSearch.trim();
    return p;
  }, [page, pagination.pageSize, status, debouncedSearch]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await invoiceGetList(params);
      setRows(res?.data || []);
      setPagination(res?.pagination || { ...pagination, totalItems: 0 });
    } catch (err) {
      console.error("Lỗi lấy danh sách hóa đơn:", err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [params]);

  // Hàm xử lý in lại hóa đơn
  const handlePrint = (id) => {
    // Mở trang in trong tab mới với kích thước chuẩn hóa đơn POS
    const printUrl = `/print/invoice/${id}`;
    const printWindow = window.open(printUrl, '_blank', 'width=450,height=700');
    if (printWindow) {
      printWindow.focus();
    }
  };

  return (
    <div className="invoice-container py-4">
      <div className="container-fluid px-lg-5">

        {/* HEADER SECTION */}
        <div className="row align-items-center mb-4">
          <div className="col-md-6">
            <h4 className="fw-bold text-slate-800 mb-1">Quản lý hóa đơn</h4>
            <p className="text-muted small mb-0">Tra cứu mã hóa đơn, trạng thái và in lại chứng từ bán hàng.</p>
          </div>
          <div className="col-md-6 text-md-end mt-3 mt-md-0">
            <button className="btn btn-primary-modern shadow-sm" onClick={() => navigate('/sales')}>
              <i className="bi bi-cart-plus me-2"></i>Bán hàng (F1)
            </button>
          </div>
        </div>

        {/* TOOLBAR: FILTERS & SEARCH */}
        <div className="card border-0 shadow-sm mb-4 br-16">
          <div className="card-body p-3">
            <div className="row g-3">
              <div className="col-lg-8 col-md-12">
                <div className="d-flex gap-2 flex-wrap">
                  {Object.keys(STATUS).map((key) => (
                    <button
                      key={key}
                      className={`btn-filter ${status === STATUS[key] ? "active" : ""}`}
                      onClick={() => setStatus(STATUS[key])}
                    >
                      {key === 'ALL' ? 'Tất cả' : STATUS_META[key].label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="col-lg-4 col-md-12">
                <div className="search-box-modern">
                  <i className="bi bi-search search-icon"></i>
                  <input
                    type="text"
                    className="form-control border-0 bg-transparent shadow-none"
                    placeholder="Nhập mã hóa đơn cần tìm..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search !== debouncedSearch ? (
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                  ) : search ? (
                    <i className="bi bi-x-circle-fill clear-btn" onClick={() => setSearch("")}></i>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DATA TABLE SECTION */}
        <div className="card border-0 shadow-sm br-16 overflow-hidden">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="bg-light-slate">
                <tr>
                  <th className="ps-4 py-3">Mã hóa đơn</th>
                  <th>Thời gian lập</th>
                  <th>Khách hàng & NV</th>
                  <th className="text-end">Tổng tiền</th>
                  <th className="text-center">Trạng thái</th>
                  <th className="text-end pe-4">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(pagination.pageSize)].map((_, i) => (
                    <tr key={i} className="skeleton-row">
                      <td colSpan="6" className="py-4"><div className="skeleton-line w-100"></div></td>
                    </tr>
                  ))
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <i className="bi bi-search fs-1 d-block mb-2 text-muted opacity-25"></i>
                      <p className="text-muted">Không tìm thấy hóa đơn nào phù hợp với bộ lọc.</p>
                      <button className="btn btn-sm btn-outline-primary" onClick={() => {setSearch(""); setStatus(STATUS.ALL)}}>
                        Xóa tất cả bộ lọc
                      </button>
                    </td>
                  </tr>
                ) : (
                  rows.map((inv) => {
                    const meta = STATUS_META[inv.status] || STATUS_META.DEFAULT;
                    return (
                      <tr key={inv.id} className="invoice-row">
                        <td className="ps-4">
                          <span className="fw-bold text-primary">#{inv.invoiceCode}</span>
                        </td>
                        <td>
                          <div className="small fw-medium text-dark">{new Date(inv.createdAt).toLocaleDateString('vi-VN')}</div>
                          <div className="text-muted xx-small">{new Date(inv.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>
                        <td>
                          <div className="fw-semibold text-slate-700">{inv.customerName || "Khách lẻ"}</div>
                          <div className="text-muted small" style={{fontSize: '0.7rem'}}>NV: {inv.staffName || 'Admin'}</div>
                        </td>
                        <td className="text-end fw-bold text-dark">
                          {formatCurrency(inv.finalAmount)}
                        </td>
                        <td className="text-center">
                          <span className="badge-modern" style={{ backgroundColor: meta.bg, color: meta.color }}>
                            <i className={`bi ${meta.icon} me-1`}></i>{meta.label}
                          </span>
                        </td>
                        <td className="text-end pe-4">
                          <div className="d-flex justify-content-end gap-1">
                            {/* Xem chi tiết */}
                            <button className="btn-icon-action" title="Xem chi tiết" onClick={() => setDetailId(inv.id)}>
                              <i className="bi bi-eye-fill"></i>
                            </button>

                            {/* In lại hóa đơn */}
                            <button className="btn-icon-action text-info" title="In lại hóa đơn" onClick={() => handlePrint(inv.id)}>
                              <i className="bi bi-printer-fill"></i>
                            </button>

                            {/* Thanh toán nhanh (Nếu chưa trả tiền) */}
                            {inv.status === 'UNPAID' && (
                              <button className="btn-icon-action text-success" title="Thanh toán ngay" onClick={() => navigate(`/sales?invoiceId=${inv.id}`)}>
                                <i className="bi bi-credit-card-fill"></i>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION FOOTER */}
          <div className="card-footer bg-white border-top-0 py-3">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <span className="text-muted small">
                Hiển thị <b>{rows.length}</b> trên <b>{pagination.totalItems}</b> hóa đơn
              </span>
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {detailId && <InvoiceDetailModal invoiceId={detailId} onClose={() => setDetailId(null)} />}

      <style>{`
        .invoice-container { background: #f8fafc; min-height: 100vh; }
        .br-16 { border-radius: 16px; }
        .text-slate-800 { color: #1e293b; }
        .bg-light-slate { background-color: #f1f5f9; }
        
        .btn-primary-modern {
          background: #4f46e5; color: white; border: none; padding: 10px 24px;
          border-radius: 12px; font-weight: 600; transition: all 0.2s;
        }
        .btn-primary-modern:hover { background: #4338ca; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); }

        .btn-filter {
          border: 1px solid #e2e8f0; background: white; padding: 7px 18px;
          border-radius: 10px; font-size: 0.85rem; color: #64748b; font-weight: 500;
          transition: all 0.2s;
        }
        .btn-filter.active { background: #4f46e5; color: white; border-color: #4f46e5; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2); }

        .search-box-modern {
          position: relative; display: flex; align-items: center;
          background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 0 12px;
          transition: all 0.2s;
        }
        .search-box-modern:focus-within { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
        .search-icon { color: #94a3b8; }
        .clear-btn { color: #cbd5e1; cursor: pointer; transition: color 0.2s; }
        .clear-btn:hover { color: #ef4444; }

        .badge-modern {
          padding: 6px 12px; border-radius: 8px; font-size: 0.75rem;
          font-weight: 600; display: inline-flex; align-items: center;
          border: 1px solid rgba(0,0,0,0.05);
        }

        .invoice-row { transition: all 0.2s; border-bottom: 1px solid #f1f5f9; }
        .invoice-row:hover { background-color: #f8fafc; transform: scale(1.002); }
        
        .btn-icon-action {
          width: 36px; height: 36px; border-radius: 10px; border: none;
          background: transparent; color: #64748b; transition: all 0.2s;
          display: flex; align-items: center; justify-content: center;
        }
        .btn-icon-action:hover { background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.05); transform: translateY(-1px); }
        
        .skeleton-row .skeleton-line {
          height: 20px; background: linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%);
          background-size: 200% 100%; animation: skeleton-loading 1.5s infinite; border-radius: 6px;
        }
        @keyframes skeleton-loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .xx-small { font-size: 0.725rem; }
      `}</style>
    </div>
  );
}