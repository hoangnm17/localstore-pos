import { useState, useEffect } from "react";
import Select from "react-select";
import supplierService from "../../../services/Inventory/supplierService";

function AddProductModal({ show, onClose, supplierId, onSuccess }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [options, setOptions] = useState([]);
  const [search, setSearch] = useState("");
  const [supplyPrice, setSupplyPrice] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!show || !supplierId) return;

    const fetchProducts = async () => {
      try {
        const res = await supplierService.getAvailableProducts(
          supplierId,
          search
        );

        if (res?.data?.success) {
          const mapped = res.data.data.map((p) => ({
            value: p.id,
            label: `${p.name} (${p.barcode || p.code})`,
            salePrice: p.salePrice // ✅ lưu giá bán
          }));
          setOptions(mapped);
        } else {
          setOptions([]);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setOptions([]);
      }
    };

    fetchProducts();
  }, [show, supplierId, search]);

  const handleAdd = async () => {
    if (!selectedProduct || !supplyPrice) return;

    try {
      setLoading(true);

      await supplierService.addProductToSupplier(
        supplierId,
        {
          productId: Number(selectedProduct.value),
          supplyPrice: Number(supplyPrice)
        }
      );

      onSuccess();
      onClose();

      // reset form
      setSelectedProduct(null);
      setSupplyPrice("");
      setSearch("");
    } catch (err) {
      console.error("Add error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4 shadow">

            <div className="modal-header">
              <h5 className="modal-title">Thêm sản phẩm</h5>
              <button
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>

            <div className="modal-body">
              <label className="form-label">Chọn sản phẩm</label>

              <Select
                options={options}
                value={selectedProduct}
                onChange={setSelectedProduct}
                onInputChange={(value) => setSearch(value)}
                isClearable
                placeholder="Tìm theo tên hoặc barcode..."
                isLoading={loading}
              />

              {/* ✅ HIỂN THỊ GIÁ BÁN */}
              {selectedProduct && (
                <div className="mt-2 text-muted">
                  Giá bán:{" "}
                  <strong>
                    {selectedProduct.salePrice
                      ? selectedProduct.salePrice.toLocaleString()
                      : 0} đ
                  </strong>
                </div>
              )}

              <div className="mt-3">
                <label className="form-label">Giá nhập</label>
                <input
                  type="number"
                  className="form-control"
                  value={supplyPrice}
                  onChange={(e) => setSupplyPrice(e.target.value)}
                  placeholder="Nhập giá nhập..."
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={onClose}
              >
                Huỷ
              </button>

              <button
                className="btn btn-primary"
                onClick={handleAdd}
                disabled={!selectedProduct || !supplyPrice || loading}
              >
                {loading ? "Đang thêm..." : "Thêm"}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Backdrop nền tối */}
      <div className="modal-backdrop fade show"></div>
    </>
  );
}

export default AddProductModal;