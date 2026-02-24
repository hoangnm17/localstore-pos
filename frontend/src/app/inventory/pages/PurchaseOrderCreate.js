import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import purchaseOrderService from "../../../services/purchaseOrderService";
import supplierService from "../../../services/supplierService";
import productService from "../../../services/productStockService";

const PurchaseOrderCreate = () => {
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);

  const [supplierSearch, setSupplierSearch] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [note, setNote] = useState("");
  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchSuppliers("");
  }, []);

  const fetchSuppliers = async (search = "") => {
    try {
      const res = await supplierService.getSupplierList(search);
      setSuppliers(res?.data?.data || []);
    } catch (error) {
      console.error("Load suppliers error:", error);
      setSuppliers([]);
    }
  };

  // Debounce để tránh gọi API quá nhiều khi gõ nhanh
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedFetchProducts = useCallback(
    debounce((supId, search) => {
      if (!supId) return;
      setLoadingProducts(true);
      setProducts([]);
      productService
        .getProductsBySupplier(supId, search, 1, 100)
        .then((res) => {
          setProducts(res?.data?.products || []);
        })
        .catch((error) => {
          console.error("Load products error:", error);
          setProducts([]);
        })
        .finally(() => setLoadingProducts(false));
    }, 400),
    []
  );

  const handleSupplierSearchChange = (e) => {
    const value = e.target.value;
    setSupplierSearch(value);
    fetchSuppliers(value);
  };

  const handleSupplierChange = (e) => {
    const value = e.target.value;
    setSupplierId(value);
    setItems([]);
    setProducts([]);
    setErrors({});

    if (value) {
      debouncedFetchProducts(value, ""); // load sản phẩm khi chọn NCC
    }
  };

  const handleProductSearchChange = (e) => {
    const searchValue = e.target.value;
    debouncedFetchProducts(supplierId, searchValue);
  };

  const handleAddItem = () => {
    setItems([...items, { productId: "", quantityOrdered: 1 }]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    if (field === "quantityOrdered") {
      // Chỉ cho phép số nguyên dương
      const numValue = value.replace(/[^0-9]/g, "");
      updated[index][field] = numValue === "" ? "" : Math.max(1, Number(numValue));
    } else {
      updated[index][field] = value;
    }
    setItems(updated);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!supplierId) newErrors.supplierId = "Vui lòng chọn nhà cung cấp";
    if (items.length === 0) newErrors.items = "Vui lòng thêm ít nhất 1 sản phẩm";

    items.forEach((item, idx) => {
      if (!item.productId) newErrors[`item_${idx}_product`] = "Chưa chọn sản phẩm";
      if (!item.quantityOrdered || item.quantityOrdered < 1)
        newErrors[`item_${idx}_qty`] = "Số lượng phải ≥ 1";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
      alert(error?.response?.data?.message || "Tạo đơn thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="card shadow-lg border-0 rounded-4">
        <div className="card-header bg-gradient-primary text-white d-flex justify-content-between align-items-center py-3">
          <h4 className="mb-0 fw-semibold">Tạo Đơn Nhập Hàng Mới</h4>
          <button
            className="btn btn-light btn-sm px-3"
            onClick={() => navigate("/inventory/purchase-orders")}
          >
            <i className="bi bi-arrow-left me-1"></i> Quay lại
          </button>
        </div>

        <div className="card-body p-4 p-md-5">
          <form onSubmit={handleSubmit} noValidate>
            {/* Supplier Search & Select */}
            <div className="row g-4 mb-5">
              <div className="col-lg-6">
                <div className="form-floating mb-3">
                  <input
                    type="text"
                    className="form-control"
                    id="supplierSearch"
                    placeholder="Tìm nhà cung cấp..."
                    value={supplierSearch}
                    onChange={handleSupplierSearchChange}
                  />
                  <label htmlFor="supplierSearch">Tìm nhà cung cấp</label>
                </div>

                <div className="form-floating">
                  <select
                    className={`form-select ${errors.supplierId ? "is-invalid" : ""}`}
                    id="supplier"
                    value={supplierId}
                    onChange={handleSupplierChange}
                    required
                  >
                    <option value="">-- Chọn nhà cung cấp --</option>
                    {suppliers.map((sup) => (
                      <option key={sup.id} value={sup.id}>
                        {sup.name} {sup.code ? `(${sup.code})` : ""}
                      </option>
                    ))}
                  </select>
                  <label htmlFor="supplier">Nhà cung cấp *</label>
                  {errors.supplierId && (
                    <div className="invalid-feedback">{errors.supplierId}</div>
                  )}
                </div>
              </div>

              <div className="col-lg-6">
                <div className="form-floating">
                  <textarea
                    className="form-control"
                    id="note"
                    placeholder="Ghi chú..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    style={{ height: "138px" }}
                  />
                  <label htmlFor="note">Ghi chú</label>
                </div>
              </div>
            </div>

            {/* Items Section */}
            <div className="mb-5">
              <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3">
                <h5 className="mb-0 fw-semibold text-dark">Danh sách sản phẩm nhập</h5>
                <div className="d-flex gap-2 flex-wrap">
                  <div style={{ minWidth: "220px" }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Tìm sản phẩm..."
                      onChange={handleProductSearchChange}
                      disabled={!supplierId || loadingProducts}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-success px-4"
                    onClick={handleAddItem}
                    disabled={!supplierId || loadingProducts || loading}
                  >
                    <i className="bi bi-plus-lg me-2"></i>Thêm sản phẩm
                  </button>
                </div>
              </div>

              {loadingProducts ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Đang tải...</span>
                  </div>
                  <p className="mt-2 text-muted">Đang tải danh sách sản phẩm...</p>
                </div>
              ) : items.length === 0 ? (
                <div className="alert alert-info mb-0 text-center py-4">
                  Chưa có sản phẩm nào. Nhấn "Thêm sản phẩm" để bắt đầu.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: "55%" }}>Sản phẩm *</th>
                        <th style={{ width: "25%" }}>Số lượng *</th>
                        <th style={{ width: "20%" }} className="text-end">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <select
                              className={`form-select ${
                                errors[`item_${index}_product`] ? "is-invalid" : ""
                              }`}
                              value={item.productId}
                              onChange={(e) =>
                                handleItemChange(index, "productId", e.target.value)
                              }
                              required
                            >
                              <option value="">-- Chọn sản phẩm --</option>
                              {products.map((prod) => (
                                <option key={prod.productId} value={prod.productId}>
                                  {prod.name}
                                  {prod.sku ? ` (${prod.sku})` : ""}
                                </option>
                              ))}
                            </select>
                            {errors[`item_${index}_product`] && (
                              <div className="invalid-feedback">
                                {errors[`item_${index}_product`]}
                              </div>
                            )}
                          </td>

                          <td>
                            <input
                              type="text" // dùng text để kiểm soát chặt hơn
                              inputMode="numeric"
                              pattern="[0-9]*"
                              className={`form-control ${
                                errors[`item_${index}_qty`] ? "is-invalid" : ""
                              }`}
                              value={item.quantityOrdered}
                              onChange={(e) =>
                                handleItemChange(index, "quantityOrdered", e.target.value)
                              }
                              placeholder="1"
                              required
                            />
                            {errors[`item_${index}_qty`] && (
                              <div className="invalid-feedback">
                                {errors[`item_${index}_qty`]}
                              </div>
                            )}
                          </td>

                          <td className="text-end">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleRemoveItem(index)}
                            >
                              <i className="bi bi-trash"></i> Xóa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {errors.items && (
                <div className="alert alert-danger mt-3">{errors.items}</div>
              )}
            </div>

            <div className="text-end">
              <button
                type="submit"
                className="btn btn-primary btn-lg px-5"
                disabled={loading || loadingProducts}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Đang tạo...
                  </>
                ) : (
                  "Tạo đơn nhập hàng"
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