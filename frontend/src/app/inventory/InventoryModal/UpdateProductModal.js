import { useState, useEffect } from "react";
import supplierService from "../../../services/Inventory/supplierService";

function UpdateProductModal({
  show,
  supplierId,
  product,
  onClose,
  onSuccess
}) {

  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [productUnitId, setProductUnitId] = useState("");
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!product) return;

    setPrice(product.supplyPrice || "");
    setStatus(product.status || "ACTIVE");

    fetchUnits();
  }, [product]);

  const fetchUnits = async () => {
    try {

      const res = await supplierService.getProductUnits(product.id);

      if (res?.data?.success) {
        setUnits(res.data.data);

        if (res.data.data.length > 0) {
          setProductUnitId(res.data.data[0].id);
        }
      }

    } catch (err) {
      console.error("Fetch units error:", err);
    }
  };

  if (!show || !product) return null;

  const handleUpdate = async () => {
  // validate
      if (!price || price.toString().trim() === "") {
      alert("Gia nhap khong duoc de trong");
      return;
     }
    try {
      setLoading(true);
      const data = {
      status
      };
      if (Number(price) !== Number(product.supplyPrice)) {
      data.price = Number(price);
      data.productUnitId = Number(productUnitId);
      }
      await supplierService.updateProductOfSupplier(
      supplierId,
      product.id,
      data
    );
      onSuccess();
      onClose();
      } catch (err) {
      console.error("Update error:", err);
      } finally {
      setLoading(false);
      }
    };

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4 shadow">

            <div className="modal-header">
              <h5 className="modal-title">
                Chỉnh sửa: {product.name}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>

            <div className="modal-body">

              <div className="mb-3">
                <label className="form-label">Đơn vị</label>
                <select
                  className="form-select"
                  value={productUnitId}
                  onChange={(e) => setProductUnitId(e.target.value)}
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.unitName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Giá nhập</label>
                <input
                  type="number"
                  className="form-control"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Trạng thái</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

            </div>

            <div className="modal-footer">

              <button
                className="btn btn-secondary"
                onClick={onClose}
              >
                Hủy
              </button>

              <button
                className="btn btn-primary"
                onClick={handleUpdate}
                disabled={loading}
              >
                {loading ? "Đang lưu..." : "Lưu"}
              </button>

            </div>

          </div>
        </div>
      </div>

      <div className="modal-backdrop fade show"></div>
    </>
  );
}

export default UpdateProductModal;