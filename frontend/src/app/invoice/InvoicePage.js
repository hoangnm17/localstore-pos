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
    <div className="container py-3">
      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-3">
        <div className="d-flex align-items-center gap-3">
          <div
            className="d-flex align-items-center justify-content-center rounded-4"
            style={{
              width: 44,
              height: 44,
              background: "rgba(13,110,253,0.10)",
            }}
          >
            <i className="bi bi-receipt fs-4 text-primary" />
          </div>

          <div>
            <h4 className="m-0">Danh sách hóa đơn</h4>
            <div className="text-muted small">
              Quản lý • Lọc trạng thái • Xem nhanh chi tiết
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="text-muted small">Tổng</span>
          <span className="badge bg-primary-subtle text-primary border">
            {pagination.totalItems} hóa đơn
          </span>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="card border-0 shadow-sm mb-3 overflow-hidden">
        <div
          className="card-body"
          style={{
            background:
              "linear-gradient(135deg, rgba(13,110,253,0.06), rgba(25,135,84,0.04))",
          }}
        >
          <div className="d-flex flex-column flex-lg-row align-items-lg-center gap-3">
            {/* STATUS PILLS */}
            <div className="d-flex flex-wrap gap-2">
              <button
                className={`btn btn-sm rounded-pill ${
                  status === STATUS.ALL ? "btn-primary" : "btn-outline-primary"
                }`}
                onClick={() => setStatusAndReset(STATUS.ALL)}
              >
                <i className="bi bi-grid me-1" />
                Tất cả
              </button>

              <button
                className={`btn btn-sm rounded-pill ${
                  status === STATUS.UNPAID ? "btn-warning" : "btn-outline-warning"
                }`}
                onClick={() => setStatusAndReset(STATUS.UNPAID)}
              >
                <i className="bi bi-hourglass-split me-1" />
                Chưa thanh toán
              </button>

              <button
                className={`btn btn-sm rounded-pill ${
                  status === STATUS.PAID ? "btn-success" : "btn-outline-success"
                }`}
                onClick={() => setStatusAndReset(STATUS.PAID)}
              >
                <i className="bi bi-check-circle me-1" />
                Đã thanh toán
              </button>

              <button
                className={`btn btn-sm rounded-pill ${
                  status === STATUS.CANCELLED ? "btn-secondary" : "btn-outline-secondary"
                }`}
                onClick={() => setStatusAndReset(STATUS.CANCELLED)}
              >
                <i className="bi bi-x-circle me-1" />
                Đã hủy
              </button>
            </div>

            {/* SEARCH */}
            <div className="ms-lg-auto" style={{ minWidth: 280, maxWidth: 420, width: "100%" }}>
              <div className="input-group input-group-sm shadow-sm">
                <span className="input-group-text bg-white border-0">
                  <i className="bi bi-search text-muted" />
                </span>

                <input
                  className="form-control border-0"
                  placeholder="Tìm mã hóa đơn / khách hàng..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                />

                {search?.trim() && (
                  <button
                    className="btn btn-outline-secondary border-0"
                    onClick={() => {
                      setSearch("");
                      setPage(1);
                    }}
                    title="Xóa"
                  >
                    <i className="bi bi-x-lg" />
                  </button>
                )}
              </div>

              <div className="text-muted small mt-1">
                Gợi ý: nhập <b>INV2026…</b> hoặc tên khách (nếu có)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th className="ps-3">Mã</th>
                  <th>Thời gian</th>
                  <th>Khách</th>
                  <th>Quầy / NV</th>
                  <th className="text-end">Thanh toán</th>
                  <th>Trạng thái</th>
                  <th className="text-end pe-3">Hành động</th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={7} className="text-center py-5">
                      <div className="d-inline-flex align-items-center gap-2 text-muted">
                        <div className="spinner-border spinner-border-sm" role="status" />
                        Đang tải dữ liệu...
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-5 text-muted">
                      <i className="bi bi-inbox fs-3 d-block mb-2" />
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
                        <td className="ps-3">
                          <div className="fw-semibold">{inv.invoiceCode}</div>
                          <div className="text-muted small">ID: {inv.id}</div>
                        </td>

                        <td>
                          <div className="fw-semibold">
                            {new Date(inv.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-muted small">
                            {new Date(inv.createdAt).toLocaleTimeString()}
                          </div>
                        </td>

                        <td className="fw-semibold">
                          {inv.customerName || "Khách lẻ"}
                        </td>

                        <td>
                          <div className="fw-semibold">{inv.counterName || "-"}</div>
                          <small className="text-muted">{inv.staffName || "-"}</small>
                        </td>

                        <td className="text-end">
                          <div className="fw-bold">
                            {formatCurrency(inv.finalAmount || 0)}
                          </div>
                        </td>

                        <td>
                          <span className={`badge ${meta.className}`}>
                            <i className={`bi ${meta.icon} me-1`} />
                            {meta.text}
                          </span>
                        </td>

                        <td className="text-end pe-3">
                          <div className="d-inline-flex gap-2">
                            {isUnpaid && (
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => goCheckout(inv.id)}
                              >
                                <i className="bi bi-cash-coin me-1" />
                                Thanh toán
                              </button>
                            )}

                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => setDetailId(inv.id)}
                            >
                              <i className="bi bi-eye me-1" />
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
        </div>

        <div className="card-footer bg-white border-0">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      </div>

      {/* MODAL DETAIL */}
      {detailId && (
        <InvoiceDetailModal invoiceId={detailId} onClose={() => setDetailId(null)} />
      )}
    </div>
  );
}