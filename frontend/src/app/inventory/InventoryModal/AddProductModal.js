import { useState, useEffect } from "react";
import Select from "react-select";
import supplierService from "../../../services/Inventory/supplierService";

function AddProductModal({ show, onClose, supplierId, onSuccess }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productOptions, setProductOptions] = useState([]);

  const [unitOptions, setUnitOptions] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);

  const [search, setSearch] = useState("");
  const [supplyPrice, setSupplyPrice] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);

  useEffect(() => {
    if (!show || !supplierId) return;

    const fetchProducts = async () => {
      try {
        const res = await supplierService.getAvailableProducts(supplierId, search);

        if (res?.data?.success) {
          const mapped = res.data.data.map((p) => ({
            value: p.id,
            label: `${p.name} (${p.barcode || p.code})`,
            salePrice: p.salePrice
          }));
          setProductOptions(mapped);
        } else {
          setProductOptions([]);
        }
      } catch (err) {
        console.error(err);
        setProductOptions([]);
      }
    };

    if (!selectedProduct) fetchProducts();
  }, [show, supplierId, search]);

  useEffect(() => {
    if (!selectedProduct) {
      setUnitOptions([]);
      setSelectedUnit(null);
      return;
    }

    const fetchUnits = async () => {
      try {
        setLoadingUnits(true);

        const res = await supplierService.getProductUnits(
          selectedProduct.value
        );

        if (res?.data?.success) {
          const mapped = res.data.data.map((u) => ({
            value: u.id,
            label: `${u.unitName} (x${u.conversionFactor})`,
            price: u.price
          }));

          setUnitOptions(mapped);
        } else {
          setUnitOptions([]);
        }
      } catch (err) {
        console.error(err);
        setUnitOptions([]);
      } finally {
        setLoadingUnits(false);
      }
    };

    fetchUnits();
  }, [selectedProduct]);

  const handleAdd = async () => {
    if (!selectedProduct || !selectedUnit || !supplyPrice) return;

    try {
      setLoading(true);

      await supplierService.addProductToSupplier(
        supplierId,
        {
          productId: Number(selectedProduct.value),
          productUnitId: Number(selectedUnit.value),
          price: Number(supplyPrice)
        }
      );

      onSuccess();
      onClose();

      setSelectedProduct(null);
      setSelectedUnit(null);
      setSupplyPrice("");
      setSearch("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <>
      <div className="modal fade show d-block">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4 shadow">

            <div className="modal-header">
              <h5 className="modal-title">Thêm sản phẩm</h5>
              <button className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body">

              <label className="form-label">Chọn sản phẩm</label>

              <Select
                options={productOptions}
                value={selectedProduct}
                onChange={setSelectedProduct}
                onInputChange={(value) => setSearch(value)}
                isClearable
                placeholder="Tìm theo tên hoặc barcode..."
              />

              {selectedProduct && (
                <>
                  <label className="form-label mt-3">Đơn vị</label>

                  <Select
                    options={unitOptions}
                    value={selectedUnit}
                    onChange={setSelectedUnit}
                    placeholder="Chọn đơn vị..."
                    isLoading={loadingUnits}
                  />
                </>
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
                disabled={
                  !selectedProduct ||
                  !selectedUnit ||
                  !supplyPrice ||
                  loading
                }
              >
                {loading ? "Đang thêm..." : "Thêm"}
              </button>

            </div>

          </div>
        </div>
      </div>

      <div className="modal-backdrop fade show"></div>
    </>
  );
}

export default AddProductModal;