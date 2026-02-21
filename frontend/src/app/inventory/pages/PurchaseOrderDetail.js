import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import purchaseOrderService from "../../../services/purchaseOrder.service";

const PurchaseOrderDetail = () => {
  const { id } = useParams();

  const [po, setPo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await purchaseOrderService.getPurchaseOrderDetail(id);
        setPo(res.data.data);
      } catch (err) {
        setError("Failed to load purchase order");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!po) return <div>No data found</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Purchase Order #{po.id}</h2>

      <p><strong>Status:</strong> {po.status}</p>
      <p><strong>Note:</strong> {po.note}</p>
      <p>
        <strong>Created At:</strong>{" "}
        {new Date(po.createdAt).toLocaleString()}
      </p>

      <hr />

      <h3>Supplier</h3>
      <p>{po.supplier?.name}</p>

      <hr />

      <h3>Staff Information</h3>
      <p><strong>Created By:</strong> {po.createdBy?.name}</p>

      <p>
        <strong>Processed By:</strong>{" "}
        {po.processedBy ? po.processedBy.name : "Not processed yet"}
      </p>

      <p>
        <strong>Received By:</strong>{" "}
        {po.receivedBy ? po.receivedBy.name : "Not received yet"}
      </p>

      <hr />

      <h3>Items</h3>

      <table border="1" width="100%" cellPadding="8">
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity Before</th>
            <th>Quantity Ordered</th>
          </tr>
        </thead>
        <tbody>
          {po.items && po.items.length > 0 ? (
            po.items.map((item) => (
              <tr key={item.id}>
                <td>{item.productName}</td>
                <td>{item.quantityBeforeOrdered}</td>
                <td>{item.quantityOrdered}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3">No items</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PurchaseOrderDetail;