import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { invoiceGetList } from "services/Invoices/invoice.service";
import Pagination from "components/Pagination/Pagination";
import { formatCurrency } from "utils/formatters";
import InvoiceDetailModal from "./InvoiceDetailModal";

const STATUS = {
  ALL: "ALL",
  UNPAID: "UNPAID",
  PAID: "PAID",
  CANCELLED: "CANCELLED",
};

// Cấu hình màu sắc SaaS hiện đại (Soft-border & Pastel background)
const STATUS_META = {
  PAID: { 
    label: "Đã thanh toán", 
    bg: "#ecfdf5", 
    color: "#059669", 
    border: "#10b98133", 
    icon: "bi-check-circle-fill" 
  },
  UNPAID: { 
    label: "Chưa thanh toán", 
    bg: "#fffbeb", 
    color: "#d97706", 
    border: "#f59e0b33", 
    icon: "bi-hourglass-split" 
  },
  CANCELLED: { 
    label: "Đã hủy", 
    bg: "#fef2f2", 
    color: "#dc2626", 
    border: "#ef444433", 
    icon: "bi-x-circle-fill" 
  },
  DEFAULT: { 
    label: "N/A", 
    bg: "#f9fafb", 
    color: "#6b7280", 
    border: "#e5e7eb", 
    icon: "bi-info-circle" 
  }
};

export default function InvoicesPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState(STATUS.ALL);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [detailId, setDetailId] = useState(null);

  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1,
  });

  const params = useMemo(() => {
    const p = { page, pageSize: pagination.pageSize };
    if (status !== STATUS.ALL) p.status = status;
    if (search.trim()) p.q = search.trim();
    return p;
  }, [page, pagination.pageSize, status, search]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await invoiceGetList(params);
      setRows(res?.data || []);
      setPagination(res?.pagination || { page, pageSize: 10, totalItems: 0, totalPages: 1 });
    } catch (err) {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [params]);

  const goCheckout = (id) => navigate(`/sales?invoiceId=${id}`);

  return (
    <div className="invoice-modern-wrapper py-4">
      <div className="container">
        
        {/* HEADER SECTION */}
        <div className="d-flex justify-content-between align-items-end mb-4 flex-wrap gap-3">
          <div>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-1">
                <li className="breadcrumb-item small text-muted">Hệ thống</li>
                <li className="breadcrumb-item small text-muted active">Hóa đơn</li>
              </ol>
            </nav>
            <h2 className="fw-bold m-0 h3">Quản lý hóa đơn</h2>
          </div>
          <div className="header-stats d-none d-md-flex gap-3">
            <div className="stat-card">
              <span className="text-muted small">Tổng hóa đơn</span>
              <span className="fw-bold d-block">{pagination.totalItems}</span>
            </div>
          </div>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="filter-container p-3 mb-4">
          <div className="row g-3 align-items-center">
            <div className="col-12 col-lg-7">
              <div className="status-group-pills">
                {Object.keys(STATUS).map((key) => (
                  <button
                    key={key}
                    className={`pill-btn ${status === STATUS[key] ? "active" : ""}`}
                    onClick={() => { setStatus(STATUS[key]); setPage(1); }}
                  >
                    {key === 'ALL' ? 'Tất cả' : STATUS_META[key]?.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="col-12 col-lg-5">
              <div className="modern-search-input">
                <i className="bi bi-search"></i>
                <input
                  type="text"
                  placeholder="Tìm khách hàng, mã hóa đơn..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
                {search && <i className="bi bi-x-circle-fill clear-icon" onClick={() => setSearch("")}></i>}
              </div>
            </div>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="table-responsive-wrapper">
          <table className="table modern-table">
            <thead>
              <tr>
                <th>MÃ HÓA ĐƠN</th>
                <th>NGÀY TẠO</th>
                <th>KHÁCH HÀNG</th>
                <th className="text-end">TỔNG TIỀN</th>
                <th>TRẠNG THÁI</th>
                <th className="text-end">HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary"></div></td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-5 text-muted">Không tìm thấy dữ liệu hóa đơn</td></tr>
              ) : (
                rows.map((inv) => {
                  const meta = STATUS_META[inv.status] || STATUS_META.DEFAULT;
                  return (
                    <tr key={inv.id}>
                      <td>
                        <div className="fw-bold text-dark mb-0" style={{fontSize: '0.95rem'}}>{inv.invoiceCode}</div>
                        <div className="text-muted" style={{fontSize: '0.75rem'}}>ID: {inv.id}</div>
                      </td>
                      <td>
                        <div className="text-dark">{new Date(inv.createdAt).toLocaleDateString('vi-VN')}</div>
                        <div className="text-muted small">{new Date(inv.createdAt).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</div>
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">{inv.customerName || "Khách lẻ"}</div>
                        <div className="text-muted small">{inv.staffName || "Hệ thống"}</div>
                      </td>
                      <td className="text-end">
                        <span className="fw-bold text-dark">{formatCurrency(inv.finalAmount || 0)}</span>
                      </td>
                      <td>
                        <span className="status-badge" style={{ backgroundColor: meta.bg, color: meta.color, borderColor: meta.border }}>
                          <i className={`bi ${meta.icon} me-1`}></i>
                          {meta.label}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2">
                          {inv.status === "UNPAID" && (
                            <button className="btn btn-pay-action btn-sm" onClick={() => goCheckout(inv.id)}>Thanh toán</button>
                          )}
                          <button className="btn btn-view-action btn-sm" onClick={() => setDetailId(inv.id)}>
                            <i className="bi bi-eye"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="d-flex justify-content-center mt-4">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      </div>

      {detailId && <InvoiceDetailModal invoiceId={detailId} onClose={() => setDetailId(null)} />}

      <style>{`
        .invoice-modern-wrapper {
          background-color: #f8fafc;
          min-height: 100vh;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }

        /* Filter & Search Bar */
        .filter-container {
          background: white;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }

        .status-group-pills {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
        }

        .pill-btn {
          padding: 6px 16px;
          border-radius: 10px;
          border: 1px solid transparent;
          background: #f1f5f9;
          color: #64748b;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .pill-btn.active {
          background: #6366f1;
          color: white;
        }

        .modern-search-input {
          position: relative;
          width: 100%;
        }

        .modern-search-input i.bi-search {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .modern-search-input input {
          width: 100%;
          padding: 10px 40px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .modern-search-input input:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }

        /* Table Modernization */
        .table-responsive-wrapper {
          overflow-x: auto;
        }

        .modern-table {
          border-collapse: separate !important;
          border-spacing: 0 10px !important;
          margin-top: -10px;
        }

        .modern-table thead th {
          border: none;
          color: #64748b;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.025em;
          padding: 10px 20px;
        }

        .modern-table tbody tr {
          background-color: white;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        .modern-table tbody tr:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
        }

        .modern-table tbody td {
          border: none;
          padding: 16px 20px;
          vertical-align: middle;
        }

        .modern-table tbody td:first-child { border-radius: 12px 0 0 12px; border-left: 1px solid #f1f5f9; }
        .modern-table tbody td:last-child { border-radius: 0 12px 12px 0; border-right: 1px solid #f1f5f9; }

        /* Status Badge */
        .status-badge {
          padding: 5px 12px;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
          border: 1px solid;
          display: inline-flex;
          align-items: center;
        }

        /* Buttons Action */
        .btn-pay-action {
          background-color: #6366f1;
          color: white;
          border-radius: 8px;
          font-weight: 500;
          padding: 6px 14px;
        }
        
        .btn-view-action {
          background-color: #f1f5f9;
          color: #475569;
          border-radius: 8px;
          padding: 6px 10px;
        }

        /* Mobile View (Card style) */
        @media (max-width: 768px) {
          .modern-table thead { display: none; }
          .modern-table tbody tr {
            display: block;
            margin-bottom: 15px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
          }
          .modern-table tbody td {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 15px;
            border-bottom: 1px solid #f8fafc;
          }
          .modern-table tbody td:last-child { border-bottom: none; }
          .modern-table tbody td::before {
            content: attr(data-label);
            font-weight: 600;
            font-size: 0.8rem;
            color: #64748b;
          }
        }
      `}</style>
    </div>
  );
}