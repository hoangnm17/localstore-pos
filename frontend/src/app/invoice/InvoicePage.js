import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { invoiceGetList, invoiceGetDetail } from "services/Invoices/invoice.service";
import Pagination from "components/Pagination/Pagination";
import { formatCurrency } from "utils/formatters";
import BillModal from "components/pos/Sale/Bill";
import ReturnCreateModal from "app/invoice/ReturnCreateModal";
import useDebounce from "hooks/common/useDebounce";
import useTitle from "hooks/common/useTitle";
import InvoiceDetailModal from "./InvoiceDetailModal";

const STATUS = {
  ALL: "ALL",
  PENDING: "PENDING",
  UNPAID: "UNPAID",
  PAID: "PAID",
  CANCELLED: "CANCELLED",
};

const STATUS_META = {
  PAID: { label: "Đã thanh toán", bg: "bg-success-subtle", color: "text-success", icon: "bi-check-circle-fill" },
  UNPAID: { label: "Chờ thanh toán", bg: "bg-warning-subtle", color: "text-warning-emphasis", icon: "bi-clock-history" },
  PENDING: { label: "Đang xử lý", bg: "bg-info-subtle", color: "text-info-emphasis", icon: "bi-hourglass-split" },
  CANCELLED: { label: "Đã hủy bỏ", bg: "bg-danger-subtle", color: "text-danger", icon: "bi-x-circle-fill" },
  DEFAULT: { label: "N/A", bg: "bg-secondary-subtle", color: "text-secondary", icon: "bi-question-circle" }
};

export default function InvoicesPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState(STATUS.ALL);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [autoPrint, setAutoPrint] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1, pageSize: 10, totalItems: 0, totalPages: 1
  });

  useTitle("Quản lý hóa đơn");
  useEffect(() => { setPage(1); }, [debouncedSearch, status]);

  const handleOpenAction = async (id, actionType) => {
    setLoading(true);
    try {
      const res = await invoiceGetDetail(id);
      if (res?.data) {
        setSelectedInvoice(res.data);
        if (actionType === 'VIEW') {
          setAutoPrint(false);
          setShowDetailModal(true); // Mở modal chi tiết khi click VIEW
        }
        if (actionType === 'PRINT') {
          setAutoPrint(true);
          setShowDetailModal(false);
        }
        if (actionType === 'RETURN') {
          setShowReturnModal(true);
          setShowDetailModal(false);
        }
      }
    } finally { setLoading(false); }
  };

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
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchInvoices(); }, [params]);

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container-fluid px-lg-5">

        <div className="d-md-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold text-dark mb-1">Hóa đơn bán hàng</h3>
            <p className="text-muted small mb-0">Quản lý và theo dõi lịch sử giao dịch</p>
          </div>
          <button className="btn btn-primary shadow-sm px-4 fw-bold mt-3 mt-md-0" onClick={() => navigate('/sales')}>
            <i className="bi bi-plus-lg me-2"></i>Tạo hóa đơn mới
          </button>
        </div>

        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-3">
            <div className="row g-3">
              <div className="col-md-4">
                <div className="input-group border rounded-2">
                  <span className="input-group-text bg-transparent border-0"><i className="bi bi-search text-muted"></i></span>
                  <input
                    type="text" className="form-control border-0 shadow-none"
                    placeholder="Tìm mã hóa đơn..."
                    value={search} onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-8 d-flex justify-content-md-end gap-2 overflow-x-auto pb-2 pb-md-0">
                {Object.keys(STATUS).map(s => (
                  <button
                    key={s}
                    className={`btn btn-sm rounded-pill px-3 fw-medium transition-all ${status === STATUS[s] ? 'btn-primary' : 'btn-outline-secondary border-light-subtle'}`}
                    onClick={() => setStatus(STATUS[s])}
                  >
                    {s === 'ALL' ? 'Tất cả' : STATUS_META[s]?.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="card border-0 shadow-sm overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="ps-4 py-3 text-secondary small fw-bold uppercase">Mã đơn</th>
                  <th className="py-3 text-secondary small fw-bold uppercase">Thời gian</th>
                  <th className="py-3 text-secondary small fw-bold uppercase">Khách hàng</th>
                  <th className="py-3 text-end text-secondary small fw-bold uppercase">Tổng tiền</th>
                  <th className="py-3 text-center text-secondary small fw-bold uppercase">Trạng thái</th>
                  <th className="pe-4 py-3 text-end text-secondary small fw-bold uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading && rows.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-5 text-muted small italic">Đang tải dữ liệu...</td></tr>
                ) : rows.map((inv) => {
                  const meta = STATUS_META[inv.status] || STATUS_META.DEFAULT;
                  return (
                    <tr key={inv.id}>
                      <td className="ps-4 fw-bold text-primary">#{inv.invoiceCode}</td>
                      <td className="text-muted small">{new Date(inv.createdAt.replace('Z', '')).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}</td>
                      <td>{inv.customerName || <span className="text-muted italic small">Khách lẻ</span>}</td>
                      <td className="text-end fw-bold">{formatCurrency(inv.finalAmount)}</td>
                      <td className="text-center">
                        <span className={`badge ${meta.bg} ${meta.color} px-3 py-2 rounded-pill fw-medium`} style={{ fontSize: '0.75rem' }}>
                          <i className={`bi ${meta.icon} me-1`}></i>{meta.label}
                        </span>
                      </td>
                      <td className="pe-4 text-end">
                        <div className="btn-group shadow-sm border rounded-2 bg-white">
                          <button
                            className="btn btn-sm btn-white border-0 px-3 py-1 text-primary border-end"
                            onClick={() => handleOpenAction(inv.id, 'VIEW')}
                            title="Xem chi tiết"
                          >
                            <i className="bi bi-eye"></i>
                          </button>

                          {inv.status === "PAID" && (<button
                            className="btn btn-sm btn-white border-0 px-3 py-1 text-secondary border-end"
                            onClick={() => handleOpenAction(inv.id, 'PRINT')}
                            title="In hóa đơn"
                          >
                            <i className="bi bi-printer"></i>
                          </button>)}

                          {inv.status === "PAID" && (
                            <button
                              className="btn btn-sm btn-white border-0 px-3 py-1 text-danger"
                              onClick={() => handleOpenAction(inv.id, 'RETURN')}
                              title="Hoàn trả"
                            >
                              <i className="bi bi-arrow-counterclockwise"></i>
                            </button>
                          )}

                          {['PENDING', 'UNPAID'].includes(inv.status) && (
                            <button
                              className="btn btn-sm btn-white border-0 px-3 py-1 text-success border-end transition-all hover:bg-light"
                              onClick={() => navigate(`/sales?invoiceId=${inv.id}`)}
                              title="Thanh toán ngay"
                            >
                              <i className="bi bi-credit-card-fill"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="card-footer bg-white border-0 py-3">
            <Pagination currentPage={page} totalPages={pagination.totalPages} onPageChange={setPage} />
          </div>
        </div>
      </div>

      {showDetailModal && selectedInvoice && (
        <InvoiceDetailModal
          invoiceId={selectedInvoice.id}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedInvoice(null);
          }}
        />
      )}

      {selectedInvoice && !showDetailModal && !showReturnModal && (
        <BillModal invoice={selectedInvoice} autoPrint={autoPrint} onClose={() => setSelectedInvoice(null)} />
      )}

      {showReturnModal && selectedInvoice && (
        <ReturnCreateModal
          invoice={selectedInvoice}
          onClose={() => { setShowReturnModal(false); setSelectedInvoice(null); }}
          onCreated={() => { setShowReturnModal(false); setSelectedInvoice(null); fetchInvoices(); }}
        />
      )}
    </div>
  );
}