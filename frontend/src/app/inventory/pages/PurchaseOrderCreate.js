import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import purchaseOrderService from "../../../services/purchaseOrderService";
import supplierService from "../../../services/supplierService";
import productService from "../../../services/productStockService";

const PurchaseOrderCreate = () => {
  const navigate = useNavigate();
  const debounceRef = useRef(null);

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);

  const [supplierId, setSupplierId] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [note, setNote] = useState("");
  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [errors, setErrors] = useState({});

  /* ================= FETCH SUPPLIERS ================= */

  useEffect(() => {
    fetchSuppliers("");
  }, []);

  const fetchSuppliers = async (search = "") => {
    try {
      const res = await supplierService.getSupplierList(search);
      // supplierService dùng axios thường
      setSuppliers(res?.data?.data || res?.data || []);
    } catch (error) {
      console.error("Load suppliers error:", error);
      setSuppliers([]);
    }
  };

  /* ================= FETCH PRODUCTS ================= */

  const fetchProducts = (supId, search = "") => {
    if (!supId) return;

    setLoadingProducts(true);
    setProducts([]);

    productService
      .getProductsBySupplier(supId, search, 1, 100)
      .then((res) => {
        // productService dùng axiosInstance (đã interceptor)
        setProducts(res?.products || []);
      })
      .catch((error) => {
        console.error("Load products error:", error);
        setProducts([]);
      })
      .finally(() => setLoadingProducts(false));
  };

  const debouncedFetchProducts = (supId, search = "") => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchProducts(supId, search);
    }, 400);
  };

  /* ================= OPTIONS ================= */

  const supplierOptions = useMemo(
    () =>
      suppliers.map((sup) => ({
        value: Number(sup.id),
        label: `${sup.name}${sup.code ? ` (${sup.code})` : ""}`,
      })),
    [suppliers]
  );

  const productOptions = useMemo(
    () =>
      products.map((prod) => ({
        value: Number(prod.productId),
        label: `${prod.name}${prod.code ? ` (${prod.code})` : ""}`,
      })),
    [products]
  );

  /* ================= HANDLERS ================= */

  const handleSupplierSelect = (option) => {
    setSelectedSupplier(option);
    setSupplierId(option ? option.value : "");
    setItems([]);
    setProducts([]);
    setErrors((prev) => ({ ...prev, supplierId: undefined }));

    if (option?.value) {
      debouncedFetchProducts(option.value);
    }
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { productId: "", quantityOrdered: 1, selectedProduct: null },
    ]);
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index) => (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    const num = value === "" ? "" : Math.max(1, Number(value));

    const updated = [...items];
    updated[index].quantityOrdered = num;
    setItems(updated);

    setErrors((prev) => ({
      ...prev,
      [`item_${index}_qty`]: undefined,
    }));
  };

  /* ================= VALIDATE ================= */

  const validateForm = () => {
    const newErrors = {};

    if (!supplierId) newErrors.supplierId = "Vui lòng chọn nhà cung cấp";
    if (items.length === 0)
      newErrors.items = "Vui lòng thêm ít nhất 1 sản phẩm";

    items.forEach((item, idx) => {
      if (!item.productId)
        newErrors[`item_${idx}_product`] = "Chưa chọn sản phẩm";

      if (!item.quantityOrdered || item.quantityOrdered < 1)
        newErrors[`item_${idx}_qty`] = "Số lượng phải ≥ 1";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      supplierId: Number(supplierId),
      note: note.trim(),
      items: items.map((item) => ({
        productId: Number(item.productId),
        quantityOrdered: Number(item.quantityOrdered),
      })),
    };

    try {
      setLoading(true);
      await purchaseOrderService.createPurchaseOrder(payload);
      alert("Tạo đơn nhập hàng thành công!");
      navigate("/inventory/purchase-orders");
    } catch (error) {
      console.error("Create PO error:", error);
      alert("Tạo đơn thất bại!");
    } finally {
      setLoading(false);
    }
  };

  /* ================= STYLES ================= */

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      borderColor: state.isFocused ? "#86b7fe" : "#ced4da",
      boxShadow: state.isFocused
        ? "0 0 0 0.25rem rgba(13,110,253,.25)"
        : "none",
      borderRadius: "0.375rem",
      minHeight: "38px",
    }),
  };

  /* ================= UI ================= */

  return (
    <div className="container py-4">
      <div className="card shadow border-0">
        <div className="card-header d-flex justify-content-between">
          <h5 className="mb-0">Tạo Đơn Nhập Hàng</h5>
          <button
            className="btn btn-light btn-sm"
            onClick={() => navigate("/inventory/purchase-orders")}
          >
            Quay lại
          </button>
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row mb-4">
              <div className="col-md-6">
                <label className="form-label">Nhà cung cấp *</label>
                <Select
                  options={supplierOptions}
                  value={selectedSupplier}
                  onChange={handleSupplierSelect}
                  isClearable
                  styles={selectStyles}
                />
                {errors.supplierId && (
                  <div className="text-danger mt-1">
                    {errors.supplierId}
                  </div>
                )}
              </div>

              <div className="col-md-6">
                <label className="form-label">Ghi chú</label>
                <textarea
                  className="form-control"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-3">
              <button
                type="button"
                className="btn btn-success"
                onClick={handleAddItem}
                disabled={!supplierId || loadingProducts}
              >
                Thêm sản phẩm
              </button>
            </div>

            {loadingProducts && <p>Đang tải sản phẩm...</p>}

            {items.map((item, index) => (
              <div key={index} className="row mb-3">
                <div className="col-md-6">
                  <Select
                    options={productOptions}
                    value={item.selectedProduct}
                    onChange={(option) => {
                      const updated = [...items];
                      updated[index] = {
                        ...updated[index],
                        productId: option ? option.value : "",
                        selectedProduct: option,
                      };
                      setItems(updated);
                    }}
                    styles={selectStyles}
                  />
                </div>

                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    value={item.quantityOrdered}
                    onChange={handleQuantityChange(index)}
                  />
                </div>

                <div className="col-md-2">
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => handleRemoveItem(index)}
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}

            <div className="text-end">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Đang tạo..." : "Tạo đơn"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderCreate;