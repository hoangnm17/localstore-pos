import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import purchaseOrderService from "../../../services/Inventory/purchaseOrderService";
import productStockService from "../../../services/Inventory/productStockService";

const PurchaseOrderCreate = () => {
  const navigate = useNavigate();

  const [note, setNote] = useState("");
  const [items, setItems] = useState([]); // { productUnitId, supplierId, quantity, productName, unitName, supplierName, price }

  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loadingLowStock, setLoadingLowStock] = useState(false);

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [step, setStep] = useState(1); // 1: tìm sản phẩm, 2: chọn NCC + số lượng
  const [searchKeyword, setSearchKeyword] = useState("");
  const [productOptions, setProductOptions] = useState([]);
  const [selectedProductUnit, setSelectedProductUnit] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loadingModal, setLoadingModal] = useState(false);

  const debounceTimeout = useRef(null);

  // Load low stock khi mount
  useEffect(() => {
    const loadLowStock = async () => {
      setLoadingLowStock(true);
      try {
        const res = await productStockService.getLowStockProducts();
        if (res.data?.success) {
          setLowStockProducts(res.data.data || []);
        }
      } catch (err) {
        console.error("Load low stock failed:", err);
      } finally {
        setLoadingLowStock(false);
      }
    };
    loadLowStock();
  }, []);

  // Tự động tìm kiếm sản phẩm khi gõ (step 1)
  useEffect(() => {
    if (step !== 1) return;

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    if (!searchKeyword.trim()) {
      setProductOptions([]);
      return;
    }

    debounceTimeout.current = setTimeout(async () => {
      setLoadingModal(true);
      try {
        const res = await productStockService.searchProductUnits(searchKeyword.trim());
        if (res.data?.success) {
          const options = (res.data.data || []).map(p => ({
            value: p.productUnitId,
            label: `${p.productName} (${p.unitName})`,
            productName: p.productName,
            unitName: p.unitName,
          }));
          setProductOptions(options);
        } else {
          setProductOptions([]);
        }
      } catch (err) {
        console.error("Search product units failed:", err);
        setProductOptions([]);
      } finally {
        setLoadingModal(false);
      }
    }, 500);

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, [searchKeyword, step]);

  // Khi chọn sản phẩm → chuyển bước 2 & load NCC
  const handleSelectProduct = async (option) => {
    setSelectedProductUnit(option);
    setStep(2);
    setSuppliers([]);
    setSelectedSupplier(null);
    setQuantity(1);

    if (!option?.value) return;

    setLoadingModal(true);
    try {
      const res = await purchaseOrderService.getSuppliersByProductUnit(option.value);
      if (res.data?.success) {
        const data = res.data.data || [];
        setSuppliers(data);
        if (data.length > 0) {
          const first = data[0];
          setSelectedSupplier({
            value: first.supplierId,
            label: `${first.supplierName} - ${first.price?.toLocaleString("vi-VN") || "0"} đ`,
            price: first.price || 0,
          });
        }
      }
    } catch (err) {
      console.error("Load suppliers failed:", err);
    } finally {
      setLoadingModal(false);
    }
  };

  // Thêm item
  const handleAddItem = () => {
    if (!selectedProductUnit) return alert("Vui lòng chọn sản phẩm");
    if (!selectedSupplier) return alert("Vui lòng chọn nhà cung cấp");
    if (quantity < 1) return alert("Số lượng phải ≥ 1");

    const newItem = {
      productUnitId: Number(selectedProductUnit.value),
      supplierId: Number(selectedSupplier.value),
      quantity: Number(quantity),
      productName: selectedProductUnit.productName,
      unitName: selectedProductUnit.unitName,
      supplierName: selectedSupplier.label.split(" - ")[0],
      price: selectedSupplier.price || 0,
    };

    setItems((prev) => {
      const existing = prev.find((i) => i.productUnitId === newItem.productUnitId);
      if (existing) {
        return prev.map((i) =>
          i.productUnitId === newItem.productUnitId
            ? { ...i, quantity: i.quantity + newItem.quantity }
            : i
        );
      }
      return [...prev, newItem];
    });

    // Reset modal
    setShowAddModal(false);
    setStep(1);
    setSearchKeyword("");
    setProductOptions([]);
    setSelectedProductUnit(null);
    setSelectedSupplier(null);
    setQuantity(1);
  };

  const removeItem = (productUnitId) => {
    setItems((prev) => prev.filter((i) => i.productUnitId !== productUnitId));
  };

  const updateQuantity = (productUnitId, newQty) => {
    if (newQty < 1) return;
    setItems((prev) =>
      prev.map((i) => (i.productUnitId === productUnitId ? { ...i, quantity: newQty } : i))
    );
  };

  // Tính tổng tiền
  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (items.length === 0) {
      alert("Vui lòng thêm ít nhất 1 sản phẩm vào đơn!");
      return;
    }

    const payload = {
      note: note.trim(),
      items: items.map((i) => ({
        supplierId: i.supplierId,
        productUnitId: i.productUnitId,
        quantity: i.quantity,
      })),
    };

    try {
      const res = await purchaseOrderService.createPurchaseOrder(payload);
      if (res.data?.success) {
        alert("Tạo đơn nhập hàng thành công!");
        navigate("/inventory/purchase-orders");
      } else {
        alert(res.data?.message || "Tạo đơn thất bại");
      }
    } catch (err) {
      console.error("Create PO error:", err);
      alert("Có lỗi xảy ra khi tạo đơn");
    }
  };

  return (
    <div className="container py-4 py-md-5">
      <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
        {/* Header */}
        <div
          className="card-header text-white d-flex justify-content-between align-items-center py-4 px-5"
          style={{ background: "linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)" }}
        >
          <h4 className="mb-0 fw-bold">
            <i className="bi bi-plus-circle me-2"></i>Tạo Đơn Nhập Hàng Mới
          </h4>
          <button
            className="btn btn-outline-light rounded-pill px-4"
            onClick={() => navigate("/inventory/purchase-orders")}
          >
            <i className="bi bi-arrow-left me-2"></i>Quay lại
          </button>
        </div>

        <div className="card-body p-4 p-md-5">
          <form onSubmit={handleSubmit}>
            {/* Ghi chú */}
            <div className="mb-5">
              <label className="form-label fw-bold">Ghi chú</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Ghi chú cho đơn hàng (nếu có)..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            {/* Low stock + Nút thêm */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="mb-0 fw-bold">
                <i className="bi bi-exclamation-triangle-fill me-2 text-warning"></i>
                Sản phẩm sắp hết ({lowStockProducts.length})
              </h5>
              <button
                type="button"
                className="btn btn-primary rounded-pill px-4"
                onClick={() => {
                  setShowAddModal(true);
                  setStep(1);
                  setSearchKeyword("");
                }}
              >
                <i className="bi bi-plus-lg me-1"></i>Thêm sản phẩm
              </button>
            </div>

            {loadingLowStock ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" />
              </div>
            ) : lowStockProducts.length > 0 ? (
              <div className="row g-3 mb-5">
                {lowStockProducts.map((p) => (
                  <div key={p.productUnitId} className="col-md-6 col-lg-4">
                    <div className="card border shadow-sm h-100">
                      <div className="card-body">
                        <h6 className="fw-bold">{p.productName}</h6>
                        <small className="text-muted d-block mb-2">
                          {p.unitName} • Tồn: {p.stockQuantity} • Ngưỡng: {p.minThreshold}
                        </small>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-success"
                          onClick={() => {
                            handleSelectProduct({
                              value: p.productUnitId,
                              label: `${p.productName} (${p.unitName})`,
                              productName: p.productName,
                              unitName: p.unitName,
                            });
                            setShowAddModal(true);
                          }}
                        >
                          Thêm vào đơn
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="alert alert-info text-center mb-5">
                Hiện tại không có sản phẩm nào dưới ngưỡng tồn kho.
              </div>
            )}

            {/* Danh sách items */}
            <h5 className="mb-3 fw-bold">
              <i className="bi bi-cart-check-fill me-2"></i>Sản phẩm trong đơn ({items.length})
            </h5>

            {items.length === 0 ? (
              <div className="alert alert-light text-center py-5 border">
                Chưa có sản phẩm nào trong đơn.
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Sản phẩm</th>
                        <th>Nhà cung cấp</th>
                        <th className="text-end">Giá nhập</th>
                        <th className="text-center">Số lượng</th>
                        <th className="text-end">Thành tiền</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => {
                        const total = item.price * item.quantity;
                        return (
                          <tr key={item.productUnitId}>
                            <td>
                              <div>{item.productName}</div>
                              <small className="text-muted">Đơn vị: {item.unitName}</small>
                            </td>
                            <td>{item.supplierName}</td>
                            <td className="text-end">
                              {item.price ? item.price.toLocaleString("vi-VN") + " đ" : "-"}
                            </td>
                            <td className="text-center">
                              <div className="d-flex justify-content-center gap-2">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => updateQuantity(item.productUnitId, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  -
                                </button>
                                <span className="fw-bold px-3">{item.quantity}</span>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={() => updateQuantity(item.productUnitId, item.quantity + 1)}
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="text-end fw-bold">
                              {total ? total.toLocaleString("vi-VN") + " đ" : "-"}
                            </td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => removeItem(item.productUnitId)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="d-flex justify-content-end mt-4">
                  <div className="text-end">
                    <h5>Tổng cộng:</h5>
                    <h4 className="fw-bold text-primary">
                      {totalAmount.toLocaleString("vi-VN")} đ
                    </h4>
                  </div>
                </div>
              </>
            )}

            {/* Submit */}
            <div className="text-end mt-5 pt-4 border-top">
              <button
                type="submit"
                className="btn btn-success btn-lg px-5 py-3 fw-bold shadow"
                disabled={items.length === 0}
              >
                <i className="bi bi-save me-2"></i>Tạo đơn nhập hàng
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ==================== MODAL THÊM SẢN PHẨM ==================== */}
      {showAddModal && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 shadow">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-plus-circle me-2"></i>
                  Thêm sản phẩm vào đơn
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowAddModal(false);
                    setStep(1);
                    setSearchKeyword("");
                    setProductOptions([]);
                  }}
                ></button>
              </div>

              <div className="modal-body p-4">
                {step === 1 ? (
                  <>
                    <label className="form-label fw-bold mb-3">Tìm sản phẩm</label>
                    <input
                      type="text"
                      className="form-control form-control-lg mb-3"
                      placeholder="Nhập tên sản phẩm, mã sản phẩm..."
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      autoFocus
                    />

                    {loadingModal ? (
                      <div className="text-center py-4">
                        <div className="spinner-border text-primary" role="status" />
                        <p className="mt-2 text-muted">Đang tìm kiếm...</p>
                      </div>
                    ) : searchKeyword.trim() && productOptions.length === 0 ? (
                      <div className="alert alert-warning text-center py-3">
                        Không tìm thấy sản phẩm nào phù hợp.
                      </div>
                    ) : productOptions.length > 0 ? (
                      <div
                        className="border rounded p-2"
                        style={{ maxHeight: "320px", overflowY: "auto" }}
                      >
                        {productOptions.map((opt) => (
                          <div
                            key={opt.value}
                            className="d-flex justify-content-between align-items-center p-3 border-bottom hover-bg-light"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleSelectProduct(opt)}
                          >
                            <div>
                              <div className="fw-bold">{opt.productName}</div>
                              <small className="text-muted">Đơn vị: {opt.unitName}</small>
                            </div>
                            <i className="bi bi-chevron-right text-muted"></i>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted">
                        Nhập từ khóa để tìm sản phẩm
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="alert alert-info mb-4">
                      <strong>Đã chọn:</strong> {selectedProductUnit?.label}
                    </div>

                    <label className="form-label fw-bold mb-2">Nhà cung cấp</label>
                    {loadingModal ? (
                      <div className="text-center py-3">
                        <div className="spinner-border spinner-border-sm" />
                      </div>
                    ) : suppliers.length === 0 ? (
                      <div className="alert alert-warning">
                        Không có nhà cung cấp nào cho sản phẩm này
                      </div>
                    ) : (
                      <Select
                        options={suppliers.map((s) => ({
                          value: s.supplierId,
                          label: `${s.supplierName} - ${s.price?.toLocaleString("vi-VN") || "0"} đ`,
                          price: s.price || 0,
                        }))}
                        value={selectedSupplier}
                        onChange={setSelectedSupplier}
                        placeholder="Chọn nhà cung cấp..."
                        className="mb-4"
                      />
                    )}

                    <label className="form-label fw-bold mb-2">Số lượng</label>
                    <div className="input-group input-group-lg mb-4">
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      >
                        -
                      </button>
                      <input
                        type="text"
                        className="form-control text-center fw-bold"
                        value={quantity}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, "");
                          setQuantity(val ? Number(val) : 1);
                        }}
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => setQuantity((q) => q + 1)}
                      >
                        +
                      </button>
                    </div>

                    {selectedSupplier?.price && (
                      <div className="text-end">
                        <small className="text-muted">Thành tiền tạm tính:</small>
                        <h5 className="fw-bold text-primary">
                          {(selectedSupplier.price * quantity).toLocaleString("vi-VN")} ₫
                        </h5>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="modal-footer bg-light">
                {step === 2 && (
                  <button
                    className="btn btn-outline-secondary px-4"
                    onClick={() => setStep(1)}
                  >
                    <i className="bi bi-arrow-left me-1"></i>Chọn sản phẩm khác
                  </button>
                )}
                <button
                  className="btn btn-secondary px-4"
                  onClick={() => {
                    setShowAddModal(false);
                    setStep(1);
                    setSearchKeyword("");
                  }}
                >
                  Hủy
                </button>
                {step === 2 && (
                  <button
                    className="btn btn-primary px-5 fw-bold"
                    onClick={handleAddItem}
                    disabled={!selectedSupplier || quantity < 1 || loadingModal}
                  >
                    Thêm vào đơn
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderCreate;