import { useEffect, useState } from "react";
import purchaseOrderService from "../../../services/purchaseOrder.service";
import { useNavigate } from "react-router-dom";

const PurchaseOrderList = () => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    status: "",
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const fetchData = async (customPage = page) => {
    try {
      setLoading(true);

      const res = await purchaseOrderService.getPurchaseOrders({
        page: customPage,
        from: filters.from || undefined,
        to: filters.to || undefined,
        status: filters.status || undefined,
      });

      const responseData = res?.data;

      setOrders(Array.isArray(responseData?.data) ? responseData.data : []);
      setTotalPages(responseData?.totalPages || 1);
      setPage(responseData?.page || 1);
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const handleFilter = () => {
    setPage(1);
    fetchData(1);
  };

  return (
    <div>
      <h2>Purchase Orders</h2>

      {/* Filter */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="date"
          value={filters.from}
          onChange={(e) =>
            setFilters({ ...filters, from: e.target.value })
          }
        />
        <input
          type="date"
          value={filters.to}
          onChange={(e) =>
            setFilters({ ...filters, to: e.target.value })
          }
        />
        <select
          value={filters.status}
          onChange={(e) =>
            setFilters({ ...filters, status: e.target.value })
          }
        >
          <option value="">All</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Received">Received</option>
        </select>

        <button onClick={handleFilter}>Filter</button>
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table border="1" width="100%">
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>Supplier</th>
              <th>Created By</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="5" align="center">
                  No data
                </td>
              </tr>
            ) : (
              orders.map((po) => (
                <tr
                  key={po.id}
                  onClick={() =>
                    navigate(`/inventory/purchase-orders/${po.id}`)
                  }
                  style={{ cursor: "pointer" }}
                >
                  <td>{po.id}</td>
                  <td>{po.status}</td>
                  <td>{po.supplierName}</td>
                  <td>{po.createdByName}</td>
                  <td>
                    {po.createdAt
                      ? new Date(po.createdAt).toLocaleString()
                      : ""}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      <div style={{ marginTop: 20 }}>
        <button
          disabled={page <= 1}
          onClick={() => fetchData(page - 1)}
        >
          Prev
        </button>

        <span>
          {" "}
          Page {page} / {totalPages}{" "}
        </span>

        <button
          disabled={page >= totalPages}
          onClick={() => fetchData(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PurchaseOrderList;