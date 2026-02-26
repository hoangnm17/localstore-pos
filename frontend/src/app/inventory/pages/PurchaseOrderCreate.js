import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import purchaseOrderService from "../../../services/Inventory/purchaseOrderService";
import supplierService from "../../../services/Inventory/supplierService";
import productService from "../../../services/Inventory/productStockService";

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

  // Modal thêm sản phẩm
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ productId: "", quantityOrdered: 1, selectedProduct: null });

  /* ================= FETCH SUPPLIERS ================= */
  useEffect(() => {
    fetchSuppliers("");
  }, []);

  const fetchSuppliers = async (search = "") => {
    try {
      const res = await supplierService.getSupplierList(search);
      const response = res?.data;
      if (response?.success) {
        setSuppliers(response.data || []);
      }
    } catch (error) {
      console.error("Load suppliers error:", error);
    }
  };

  /* ================= FETCH PRODUCTS ================= */
  const fetchProducts = async (supId, search = "") => {
    if (!supId) return;
    setLoadingProducts(true);
    setProducts([]);

    try {
      const res = await productService.getProductsBySupplier(supId, search);
      const response = res?.data;
      if (response?.success) {
        setProducts(response.data?.products || []);
      }
    } catch (error) {
      console.error("Load products error:", error);
    } finally {
      setLoadingProducts(false);
    }
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

  const openAddModal = () => {
    setNewItem({ productId: "", quantityOrdered: 1, selectedProduct: null });
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
  };

  const handleAddNewItem = () => {
    if (!newItem.productId) {
      alert("Vui lòng chọn sản phẩm");
      return;
    }
    if (!newItem.quantityOrdered || newItem.quantityOrdered < 1) {
      alert("Số lượng phải ≥ 1");
      return;
    }

    setItems((prev) => [
      ...prev,
      {
        productId: newItem.productId,
        quantityOrdered: Number(newItem.quantityOrdered),
        selectedProduct: newItem.selectedProduct,
      },
    ]);
    closeAddModal();
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemQuantityChange = (index, delta) => {
    setItems((prev) => {
      const updated = [...prev];
      const newQty = Math.max(1, (updated[index].quantityOrdered || 0) + delta);
      updated[index].quantityOrdered = newQty;
      return updated;
    });
  };

  /* ================= VALIDATE ================= */
  const validateForm = () => {
    const newErrors = {};

    if (!supplierId) newErrors.supplierId = "Vui lòng chọn nhà cung cấp";
    if (items.length === 0) newErrors.items = "Vui lòng thêm ít nhất 1 sản phẩm";

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
      const res = await purchaseOrderService.createPurchaseOrder(payload);
      const response = res?.data;

      if (!response?.success) {
        alert(response?.message || "Tạo đơn thất bại!");
        return;
      }

      alert("Tạo đơn nhập hàng thành công!");
      navigate("/inventory/purchase-orders");
    } catch (error) {
      console.error("Create PO error:", error);
      alert("Tạo đơn thất bại!");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SELECT STYLE ================= */
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      borderColor: errors.supplierId ? "#dc3545" : state.isFocused ? "#0d6efd" : "#ced4da",
      boxShadow: state.isFocused ? "0 0 0 0.25rem rgba(13,110,253,.25)" : "none",
      borderRadius: "0.375rem",
      minHeight: "42px",
    }),
    option: (base) => ({
      ...base,
      fontSize: "0.95rem",
    }),
  };

  return (
    <div className="container py-4 py-md-5">
      <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
        {/* Header */}
        <div
          className="card-header text-white d-flex justify-content-between align-items-center py-4 px-4 px-md-5"
          style={{
            background: "linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)",
          }}
        >
          <h4 className="mb-0 fw-bold">
            <i className="bi bi-plus-circle me-2"></i>
            Tạo Đơn Nhập Hàng Mới
          </h4>
          <button
            className="btn btn-outline-light rounded-pill px-4 fw-semibold"
            onClick={() => navigate("/inventory/purchase-orders")}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Quay lại
          </button>
        </div>

        {/* Body */}
        <div className="card-body p-4 p-md-5">
          <form onSubmit={handleSubmit}>
            {/* Nhà cung cấp + Ghi chú */}
            <div className="row g-4 mb-5">
              <div className="col-lg-8">
                <label className="form-label fw-bold text-dark">
                  Nhà cung cấp <span className="text-danger">*</span>
                </label>
                <Select
                  options={supplierOptions}
                  value={selectedSupplier}
                  onChange={handleSupplierSelect}
                  isClearable
                  isDisabled={loading}
                  placeholder="Tìm và chọn nhà cung cấp..."
                  styles={selectStyles}
                  classNamePrefix="react-select"
                />
                {errors.supplierId && (
                  <div className="invalid-feedback d-block mt-1">{errors.supplierId}</div>
                )}
              </div>

              <div className="col-lg-4">
                <label className="form-label fw-bold text-dark">Ghi chú</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Ghi chú cho đơn hàng (nếu có)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  disabled={loading}
                ></textarea>
              </div>
            </div>

            {/* Danh sách sản phẩm + Nút thêm */}
            <div className="mb-4 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold text-dark">
                <i className="bi bi-box-seam me-2"></i>
                Sản phẩm đã chọn ({items.length})
              </h5>
              <button
                type="button"
                className="btn btn-success rounded-pill px-4 py-2 shadow-sm"
                onClick={openAddModal}
                disabled={!supplierId || loadingProducts || loading}
              >
                <i className="bi bi-plus-lg me-1"></i>
                Thêm sản phẩm
              </button>
            </div>

            {loadingProducts && (
              <div className="text-primary mb-3">
                <span className="spinner-border spinner-border-sm me-2"></span>
                Đang tải sản phẩm...
              </div>
            )}

            {items.length === 0 ? (
              <div className="alert alert-light text-center py-5 border">
                Chưa có sản phẩm nào. Vui lòng thêm sản phẩm để tiếp tục.
              </div>
            ) : (
              <div className="row g-3">
                {items.map((item, index) => (
                  <div key={index} className="col-12 col-md-6 col-lg-4">
                    <div className="card border shadow-sm h-100">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <h6 className="fw-bold mb-1">{item.selectedProduct?.label}</h6>
                            <small className="text-muted">Mã: {item.selectedProduct?.value}</small>
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger rounded-circle"
                            onClick={() => handleRemoveItem(index)}
                            disabled={loading}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>

                        <div className="input-group mb-2">
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => handleItemQuantityChange(index, -1)}
                            disabled={loading || item.quantityOrdered <= 1}
                          >
                            -
                          </button>
                          <input
                            type="text"
                            className="form-control text-center fw-bold"
                            value={item.quantityOrdered}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, "");
                              handleItemQuantityChange(index, 0);
                              const updated = [...items];
                              updated[index].quantityOrdered = val === "" ? "" : Math.max(1, Number(val));
                              setItems(updated);
                            }}
                            disabled={loading}
                          />
                          <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => handleItemQuantityChange(index, 1)}
                            disabled={loading}
                          >
                            +
                          </button>
                        </div>

                        {errors[`item_${index}_qty`] && (
                          <div className="text-danger small">{errors[`item_${index}_qty`]}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Modal thêm sản phẩm */}
            <div
              className={`modal fade ${showAddModal ? "show d-block" : ""}`}
              tabIndex="-1"
              style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            >
              <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content rounded-4 shadow-xl border-0">
                  <div className="modal-header bg-primary text-white">
                    <h5 className="modal-title fw-bold">
                      <i className="bi bi-plus-circle me-2"></i>
                      Thêm sản phẩm mới
                    </h5>
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      onClick={closeAddModal}
                    ></button>
                  </div>
                  <div className="modal-body p-4">
                    <div className="mb-4">
                      <label className="form-label fw-bold">Sản phẩm <span className="text-danger">*</span></label>
                      <Select
                        options={productOptions}
                        value={newItem.selectedProduct}
                        onChange={(option) =>
                          setNewItem({
                            ...newItem,
                            productId: option ? option.value : "",
                            selectedProduct: option,
                          })
                        }
                        styles={selectStyles}
                        placeholder="Tìm và chọn sản phẩm..."
                        isDisabled={loadingProducts}
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label fw-bold">Số lượng <span className="text-danger">*</span></label>
                      <div className="input-group input-group-lg">
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() =>
                            setNewItem({
                              ...newItem,
                              quantityOrdered: Math.max(1, (newItem.quantityOrdered || 1) - 1),
                            })
                          }
                        >
                          -
                        </button>
                        <input
                          type="text"
                          className="form-control text-center fw-bold"
                          value={newItem.quantityOrdered}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, "");
                            setNewItem({
                              ...newItem,
                              quantityOrdered: val === "" ? "" : Math.max(1, Number(val)),
                            });
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() =>
                            setNewItem({
                              ...newItem,
                              quantityOrdered: (newItem.quantityOrdered || 1) + 1,
                            })
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer bg-light">
                    <button
                      type="button"
                      className="btn btn-secondary px-4"
                      onClick={closeAddModal}
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary px-5 fw-bold"
                      onClick={handleAddNewItem}
                      disabled={!newItem.productId || !newItem.quantityOrdered || loadingProducts}
                    >
                      Thêm vào đơn
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Nút submit */}
            <div className="text-end mt-5 pt-4 border-top">
              <button
                type="submit"
                className="btn btn-primary btn-lg px-5 py-3 fw-bold shadow"
                disabled={loading || !supplierId || items.length === 0}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Đang tạo đơn...
                  </>
                ) : (
                  <>
                    <i className="bi bi-save me-2"></i>
                    Tạo đơn nhập hàng
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderCreate;