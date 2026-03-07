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

const getStatusMeta = (status) => {
  switch (status) {
    case "PAID":
      return { text: "Đã thanh toán", className: "bg-success", icon: "bi-check-circle" };
    case "UNPAID":
      return { text: "Chưa thanh toán", className: "bg-warning text-dark", icon: "bi-hourglass-split" };
    case "CANCELLED":
      return { text: "Đã hủy", className: "bg-secondary", icon: "bi-x-circle" };
    default:
      return { text: status || "-", className: "bg-light text-dark", icon: "bi-info-circle" };
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
      setPagination(
        res?.pagination || {
          page,
          pageSize: pagination.pageSize,
          totalItems: 0,
          totalPages: 1,
        }
      );
    } catch (err) {
      console.error("invoiceGetList error:", err);
      setRows([]);
      setPagination((prev) => ({ ...prev, totalItems: 0, totalPages: 1 }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const goCheckout = (id) => navigate(`/sales?invoiceId=${id}`);

  const setStatusAndReset = (s) => {
    setStatus(s);
    setPage(1);
  };

  return (
    <div className="container py-4 invoice-page">

      {/* HEADER */}
      <div className="invoice-header">

        <div className="header-left">

          <div className="header-icon">
            <i className="bi bi-receipt"></i>
          </div>

          <div>
            <h4 className="m-0 fw-bold">Danh sách hóa đơn</h4>
            <div className="text-muted small">
              Quản lý • Lọc trạng thái • Xem nhanh chi tiết
            </div>
          </div>

        </div>

        <div className="header-right">

          <span className="text-muted small">Tổng</span>

          <span className="badge invoice-count">
            {pagination.totalItems} hóa đơn
          </span>

        </div>

      </div>

      {/* FILTER */}
      <div className="invoice-filter">

        <div className="status-filter">

          {Object.values(STATUS).map((s) => {

            const label = {
              ALL: "Tất cả",
              UNPAID: "Chưa thanh toán",
              PAID: "Đã thanh toán",
              CANCELLED: "Đã hủy"
            }[s];

            const icon = {
              ALL: "bi-grid",
              UNPAID: "bi-hourglass-split",
              PAID: "bi-check-circle",
              CANCELLED: "bi-x-circle"
            }[s];

            const color = {
              ALL: "primary",
              UNPAID: "warning",
              PAID: "success",
              CANCELLED: "secondary"
            }[s];

            return (
              <button
                key={s}
                className={`status-pill ${status === s ? `active ${color}` : ""
                  }`}
                onClick={() => setStatusAndReset(s)}
              >
                <i className={`bi ${icon} me-1`} />
                {label}
              </button>
            );
          })}

        </div>

        {/* SEARCH */}

        <div className="invoice-search">

          <i className="bi bi-search search-icon"></i>

          <input
            placeholder="Tìm mã hóa đơn / khách hàng..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          {search && (
            <button
              className="clear-btn"
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          )}

        </div>

      </div>

      {/* TABLE */}

      <div className="invoice-table-card">

        <div className="table-responsive">

          <table className="table align-middle mb-0 invoice-table">

            <thead>
              <tr>
                <th>Mã</th>
                <th>Thời gian</th>
                <th>Khách</th>
                <th>Quầy / NV</th>
                <th className="text-end">Thanh toán</th>
                <th>Trạng thái</th>
                <th className="text-end">Hành động</th>
              </tr>
            </thead>

            <tbody>

              {loading && (
                <tr>
                  <td colSpan={7} className="text-center py-5">
                    <div className="spinner-border spinner-border-sm" />
                  </td>
                </tr>
              )}

              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    <i className="bi bi-inbox fs-3 d-block mb-2"></i>
                    Không có hóa đơn phù hợp
                  </td>
                </tr>
              )}

              {!loading &&
                rows.map((inv) => {

                  const isUnpaid = inv.status === "UNPAID";
                  const meta = getStatusMeta(inv.status);

                  return (
                    <tr key={inv.id}>

                      <td>
                        <div className="invoice-code">
                          {inv.invoiceCode}
                        </div>

                        <small className="text-muted">
                          ID: {inv.id}
                        </small>
                      </td>

                      <td>
                        <div>
                          {new Date(inv.createdAt).toLocaleDateString()}
                        </div>

                        <small className="text-muted">
                          {new Date(inv.createdAt).toLocaleTimeString()}
                        </small>
                      </td>

                      <td className="fw-semibold">
                        {inv.customerName || "Khách lẻ"}
                      </td>

                      <td>
                        <div>{inv.counterName || "-"}</div>
                        <small className="text-muted">
                          {inv.staffName || "-"}
                        </small>
                      </td>

                      <td className="text-end fw-bold">
                        {formatCurrency(inv.finalAmount || 0)}
                      </td>

                      <td>
                        <span className={`badge ${meta.className}`}>
                          <i className={`bi ${meta.icon} me-1`} />
                          {meta.text}
                        </span>
                      </td>

                      <td className="text-end">

                        <div className="action-buttons">

                          {isUnpaid && (
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => goCheckout(inv.id)}
                            >
                              <i className="bi bi-cash-coin me-1"></i>
                              Thanh toán
                            </button>
                          )}

                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => setDetailId(inv.id)}
                          >
                            <i className="bi bi-eye me-1"></i>
                            Chi tiết
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                })}

            </tbody>

          </table>

        </div>

        <div className="invoice-pagination">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>

      </div>

      {detailId && (
        <InvoiceDetailModal
          invoiceId={detailId}
          onClose={() => setDetailId(null)}
        />
      )}

      <style>{`

.invoice-header{
display:flex;
justify-content:space-between;
align-items:center;
margin-bottom:20px;
}

.header-left{
display:flex;
align-items:center;
gap:12px;
}

.header-icon{
width:42px;
height:42px;
background:#eef4ff;
border-radius:10px;
display:flex;
align-items:center;
justify-content:center;
font-size:20px;
color:#0d6efd;
}

.invoice-count{
background:#e8f1ff;
color:#0d6efd;
padding:6px 12px;
}

.invoice-filter{
display:flex;
gap:16px;
align-items:center;
flex-wrap:wrap;
margin-bottom:16px;
}

.status-pill{
border:1px solid #ddd;
background:white;
border-radius:20px;
padding:6px 14px;
font-size:14px;
}

.status-pill.active.primary{background:#0d6efd;color:white}
.status-pill.active.warning{background:#ffc107;color:black}
.status-pill.active.success{background:#198754;color:white}
.status-pill.active.secondary{background:#6c757d;color:white}

.invoice-search{
position:relative;
margin-left:auto;
}

.invoice-search input{
padding:6px 34px;
border:1px solid #ddd;
border-radius:20px;
}

.search-icon{
position:absolute;
left:10px;
top:50%;
transform:translateY(-50%);
color:#888;
}

.clear-btn{
position:absolute;
right:8px;
top:50%;
transform:translateY(-50%);
border:none;
background:none;
}

.invoice-table-card{
background:white;
border-radius:12px;
box-shadow:0 6px 16px rgba(0,0,0,0.05);
overflow:hidden;
}

.invoice-table tbody tr:hover{
background:#fafafa;
}

.invoice-code{
font-weight:600;
}

.invoice-pagination{
padding:12px;
border-top:1px solid #eee;
}

.action-buttons{
display:flex;
gap:8px;
justify-content:flex-end;
}

`}</style>

    </div>
  );
}