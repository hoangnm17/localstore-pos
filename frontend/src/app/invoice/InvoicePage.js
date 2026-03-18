import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { invoiceGetList, invoiceGetDetail } from "services/Invoices/invoice.service";
import Pagination from "components/Pagination/Pagination";
import { formatCurrency } from "utils/formatters";
import BillModal from "components/pos/Sale/Bill";
import useDebounce from "hooks/common/useDebounce";
import useTitle from "hooks/common/useTitle";

const STATUS = {
  ALL: "ALL",
  PENDING: "PENDING",
  UNPAID: "UNPAID",
  PAID: "PAID",
  CANCELLED: "CANCELLED",
};

const STATUS_META = {
  PAID: { label: "Đã thanh toán", bg: "#D1FAE5", color: "#065F46", icon: "bi-check-all" },
  UNPAID: { label: "Chờ thanh toán", bg: "#FEF3C7", color: "#92400E", icon: "bi-clock-history" },
  PENDING: { label: "Đang xử lý", bg: "#E0F2FE", color: "#075985", icon: "bi-hourglass-split" },
  CANCELLED: { label: "Đã hủy bỏ", bg: "#FEE2E2", color: "#991B1B", icon: "bi-trash3" },
  DEFAULT: { label: "N/A", bg: "#F3F4F6", color: "#374151", icon: "bi-question-circle" }
};

export default function InvoicesPage() {
  const navigate = useNavigate();

  const [status, setStatus] = useState(STATUS.ALL);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);

  // States cho BillModal (Dùng chung cho cả Xem và In)
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [autoPrint, setAutoPrint] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 1
  });

  useTitle(status === STATUS.ALL ? "Tất cả hóa đơn" : (STATUS_META[status]?.label || "Hóa đơn"));

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

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

  const handleOpenBill = async (id, isPrintAction) => {
    setLoading(true);
    try {
      const res = await invoiceGetDetail(id);
      if (res?.data) {
        setSelectedInvoice(res.data);
        setAutoPrint(isPrintAction);
      }
    } catch (err) {
      console.error("Lỗi lấy chi tiết hóa đơn:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="invoice-container py-4">
      <div className="container-fluid px-lg-5">

        <div className="row align-items-center mb-4">
          <div className="col-md-6">
            <h4 className="fw-bold text-slate-800 mb-1">Quản lý hóa đơn</h4>
            <p className="text-muted small mb-0">Tra cứu, xem chi tiết và in lại hóa đơn bán hàng.</p>
          </div>
          <div className="col-md-6 text-md-end mt-3 mt-md-0">
            <button className="btn btn-primary-modern shadow-sm" onClick={() => navigate('/sales')}>
              <i className="bi bi-cart-plus me-2"></i>Bán hàng (F1)
            </button>
          </div>
        </div>

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
                      {key === 'ALL' ? 'Tất cả' : STATUS_META[key]?.label}
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
                    placeholder="Tìm mã hóa đơn..."
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
                {loading && rows.length === 0 ? (
                  [...Array(pagination.pageSize)].map((_, i) => (
                    <tr key={i} className="skeleton-row">
                      <td colSpan="6" className="py-4"><div className="skeleton-line w-100"></div></td>
                    </tr>
                  ))
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <i className="bi bi-inbox fs-1 d-block mb-2 text-muted opacity-25"></i>
                      <p className="text-muted">Không tìm thấy hóa đơn nào.</p>
                    </td>
                  </tr>
                ) : (
                  rows.map((inv) => {
                    const meta = STATUS_META[inv.status] || STATUS_META.DEFAULT;
                    const date = new Date(inv.createdAt ? inv.createdAt.replace('Z', '') : new Date());

                    return (
                      <tr key={inv.id} className="invoice-row">
                        <td className="ps-4">
                          <span className="fw-bold text-primary">#{inv.invoiceCode}</span>
                        </td>
                        <td>
                          <div className="small fw-medium text-dark">{date.toLocaleDateString('vi-VN')}</div>
                          <div className="text-muted xx-small">{date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>
                        <td>
                          <div className="fw-semibold text-slate-700">{inv.customerName || "Khách lẻ"}</div>
                          <div className="text-muted small" style={{ fontSize: '0.7rem' }}>NV: {inv.staffName || 'Hệ thống'}</div>
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
                            <button className="btn-icon-action" title="Xem chi tiết" onClick={() => handleOpenBill(inv.id, false)}>
                              <i className="bi bi-eye-fill"></i>
                            </button>
                            <button className="btn-icon-action text-info" title="In lại" onClick={() => handleOpenBill(inv.id, true)}>
                              <i className="bi bi-printer-fill"></i>
                            </button>
                            {['UNPAID', 'PENDING'].includes(inv.status) && (
                              <button className="btn-icon-action text-success" title="Thanh toán" onClick={() => navigate(`/sales?invoiceId=${inv.id}`)}>
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

          <div className="card-footer bg-white border-top-0 py-3">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <span className="text-muted small">
                Hiển thị <b>{rows.length}</b> / <b>{pagination.totalItems}</b> hóa đơn
              </span>
              <Pagination
                currentPage={page}
                totalPages={pagination.totalPages}
                onPageChange={setPage}
              />
            </div>
          </div>
        </div>
      </div>

      {selectedInvoice && (
        <BillModal
          invoice={selectedInvoice}
          autoPrint={autoPrint}
          onClose={() => setSelectedInvoice(null)}
        />
      )}

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
        .invoice-row:hover { background-color: #f8fafc; }
        
        .btn-icon-action {
          width: 32px; height: 32px; border-radius: 8px; border: none;
          background: transparent; color: #64748b; transition: all 0.2s;
          display: flex; align-items: center; justify-content: center;
        }
        .btn-icon-action:hover { background: #edf2f7; color: #1a202c; }
        
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