import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import purchaseOrderService from "../../../services/Inventory/purchaseOrderService";
import productStockService from "../../../services/Inventory/productStockService";

const PurchaseOrderCreate = () => {
  const navigate = useNavigate();

  const [note, setNote] = useState("");
  const [items, setItems] = useState([]);

  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loadingLowStock, setLoadingLowStock] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [step, setStep] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [productOptions, setProductOptions] = useState([]);
  const [selectedProductUnit, setSelectedProductUnit] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loadingModal, setLoadingModal] = useState(false);

  const debounceTimeout = useRef(null);

  useEffect(() => {
    const loadLowStock = async () => {
      setLoadingLowStock(true);
      try {
        const res = await productStockService.getLowStockProducts();
        if (res.data?.success) setLowStockProducts(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingLowStock(false);
      }
    };
    loadLowStock();
  }, []);

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
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingModal(false);
      }
    }, 500);

    return () => clearTimeout(debounceTimeout.current);
  }, [searchKeyword, step]);

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
            label: `${first.supplierName} - ${first.price?.toLocaleString("vi-VN") || "0"} ₫`,
            price: first.price || 0,
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingModal(false);
    }
  };

  const handleAddItem = () => {
    if (!selectedProductUnit || !selectedSupplier || quantity < 1) {
      alert("Vui lòng chọn đầy đủ thông tin!");
      return;
    }

    const newItem = {
      productUnitId: Number(selectedProductUnit.value),
      supplierId: Number(selectedSupplier.value),
      quantity: Number(quantity),
      productName: selectedProductUnit.productName,
      unitName: selectedProductUnit.unitName,
      supplierName: selectedSupplier.label.split(" - ")[0],
      price: selectedSupplier.price || 0,
    };

    setItems(prev => {
      const existing = prev.find(i => i.productUnitId === newItem.productUnitId);
      if (existing) {
        return prev.map(i =>
          i.productUnitId === newItem.productUnitId ? { ...i, quantity: i.quantity + newItem.quantity } : i
        );
      }
      return [...prev, newItem];
    });

    setShowAddModal(false);
    setStep(1);
    setSearchKeyword("");
    setProductOptions([]);
    setSelectedProductUnit(null);
    setSelectedSupplier(null);
    setQuantity(1);
  };

  const removeItem = (productUnitId) => {
    setItems(prev => prev.filter(i => i.productUnitId !== productUnitId));
  };

  const updateQuantity = (productUnitId, delta) => {
    setItems(prev =>
      prev.map(i => {
        if (i.productUnitId !== productUnitId) return i;
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      })
    );
  };

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      alert("Vui lòng thêm ít nhất 1 sản phẩm!");
      return;
    }

    const payload = {
      note: note.trim(),
      items: items.map(i => ({
        supplierId: i.supplierId,
        productUnitId: i.productUnitId,
        quantity: i.quantity,
      })),
    };

    try {
      const res = await purchaseOrderService.createPurchaseOrder(payload);
      if (res.data?.success) {
        alert("Tạo đơn thành công!");
        navigate("/inventory/purchase-orders");
      } else {
        alert(res.data?.message || "Tạo đơn thất bại!");
      }
    } catch (err) {
      alert("Lỗi hệ thống!");
    }
  };

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: "#f8f9fa" }}>
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
        {/* Header */}
        <div
          className="card-header text-white py-4 px-5 d-flex justify-content-between align-items-center"
          style={{
            background: "linear-gradient(135deg, #4e54c8 0%, #8f94fb 100%)",
          }}
        >
          <h4 className="mb-0 fw-bold d-flex align-items-center">
            <i className="bi bi-file-earmark-plus me-3 fs-3"></i>
            Tạo Đơn Nhập Hàng Mới
          </h4>
          <button
            className="btn btn-outline-light rounded-pill px-4 fw-semibold"
            onClick={() => navigate("/inventory/purchase-orders")}
          >
            <i className="bi bi-arrow-left me-2"></i>Quay lại
          </button>
        </div>

        <div className="card-body p-4 p-md-5">
          <form onSubmit={handleSubmit}>
            {/* Ghi chú */}
            <div className="mb-5">
              <label className="form-label fw-semibold text-dark">Ghi chú đơn hàng</label>
              <textarea
                className="form-control rounded-3 border-secondary-subtle shadow-sm"
                rows={3}
                placeholder="Nhập ghi chú (nếu có)..."
                value={note}
                onChange={e => setNote(e.target.value)}
              />
            </div>

            {/* Low stock section */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold text-dark d-flex align-items-center">
                <i className="bi bi-exclamation-diamond-fill me-2 text-warning fs-4"></i>
                Sản phẩm sắp hết ({lowStockProducts.length})
              </h5>
              <button
                type="button"
                className="btn btn-primary rounded-pill px-4 py-2 shadow-sm"
                onClick={() => {
                  setShowAddModal(true);
                  setStep(1);
                  setSearchKeyword("");
                }}
              >
                <i className="bi bi-plus-lg me-2"></i>Thêm sản phẩm
              </button>
            </div>

            {loadingLowStock ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" />
              </div>
            ) : lowStockProducts.length > 0 ? (
              <div className="row g-3 mb-5">
                {lowStockProducts.map(p => (
                  <div key={p.productUnitId} className="col-md-4 col-lg-3">
                    <div className="card border-0 shadow-sm h-100 hover-lift">
                      <div className="card-body">
                        <h6 className="fw-bold mb-2">{p.productName}</h6>
                        <small className="text-muted d-block mb-3">
                          {p.unitName} • Tồn kho: <strong>{p.stockQuantity}</strong> • Ngưỡng: <strong>{p.minThreshold}</strong>
                        </small>
                        <button
                          type="button"
                          className="btn btn-outline-success btn-sm rounded-pill"
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
                          <i className="bi bi-cart-plus me-1"></i>Thêm
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="alert alert-light border text-center py-4 rounded-3 mb-5">
                Không có sản phẩm nào dưới ngưỡng tồn kho.
              </div>
            )}

            {/* Items table */}
            <h5 className="fw-bold mb-3 d-flex align-items-center">
              <i className="bi bi-list-check me-2 fs-4 text-primary"></i>
              Danh sách sản phẩm ({items.length})
            </h5>

            {items.length === 0 ? (
              <div className="alert alert-info text-center py-5 rounded-3 border-0 shadow-sm">
                Chưa có sản phẩm nào. Nhấn "Thêm sản phẩm" để bắt đầu.
              </div>
            ) : (
              <>
                <div className="table-responsive rounded-3 shadow-sm overflow-hidden">
                  <table className="table table-hover table-striped align-middle mb-0">
                    <thead className="table-dark">
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
                      {items.map(item => {
                        const total = item.price * item.quantity;
                        return (
                          <tr key={item.productUnitId}>
                            <td>
                              <div className="fw-semibold">{item.productName}</div>
                              <small className="text-muted">Đơn vị: {item.unitName}</small>
                            </td>
                            <td>{item.supplierName}</td>
                            <td className="text-end fw-medium">
                              {item.price ? item.price.toLocaleString("vi-VN") + " ₫" : "-"}
                            </td>
                            <td className="text-center">
                              <div className="d-flex align-items-center justify-content-center gap-2">
                                <button
                                  className="btn btn-sm btn-outline-secondary rounded-circle"
                                  onClick={() => updateQuantity(item.productUnitId, -1)}
                                  disabled={item.quantity <= 1}
                                >
                                  -
                                </button>
                                <span className="fw-bold px-3">{item.quantity}</span>
                                <button
                                  className="btn btn-sm btn-outline-secondary rounded-circle"
                                  onClick={() => updateQuantity(item.productUnitId, 1)}
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="text-end fw-bold text-success">
                              {total.toLocaleString("vi-VN")} ₫
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-danger rounded-circle"
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
                  <div className="card border-primary shadow-sm" style={{ maxWidth: "320px" }}>
                    <div className="card-body text-end">
                      <h6 className="mb-1 text-muted">Tổng cộng</h6>
                      <h4 className="fw-bold text-primary mb-0">
                        {totalAmount.toLocaleString("vi-VN")} ₫
                      </h4>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Submit */}
            <div className="text-end mt-5 pt-4 border-top">
              <button
                type="submit"
                className="btn btn-success btn-lg px-5 py-3 rounded-pill fw-bold shadow-lg"
                disabled={items.length === 0}
              >
                <i className="bi bi-check2-circle me-2"></i>
                Tạo đơn nhập hàng
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.6)" }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-xl overflow-hidden">
              <div className="modal-header bg-gradient-primary text-white py-4">
                <h5 className="modal-title fw-bold d-flex align-items-center">
                  <i className="bi bi-cart-plus me-3 fs-4"></i>
                  Thêm sản phẩm mới
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowAddModal(false);
                    setStep(1);
                    setSearchKeyword("");
                  }}
                ></button>
              </div>

              <div className="modal-body p-4 p-md-5 bg-light">
                {step === 1 ? (
                  <>
                    <div className="mb-4">
                      <label className="form-label fw-bold fs-5">Tìm kiếm sản phẩm</label>
                      <input
                        type="text"
                        className="form-control form-control-lg rounded-pill shadow-sm"
                        placeholder="Nhập tên hoặc mã sản phẩm..."
                        value={searchKeyword}
                        onChange={e => setSearchKeyword(e.target.value)}
                        autoFocus
                      />
                    </div>

                    {loadingModal ? (
                      <div className="text-center py-5">
                        <div className="spinner-border text-primary" />
                      </div>
                    ) : searchKeyword.trim() && productOptions.length === 0 ? (
                      <div className="alert alert-warning rounded-3 text-center py-4">
                        Không tìm thấy sản phẩm phù hợp.
                      </div>
                    ) : productOptions.length > 0 ? (
                      <div className="list-group rounded-3 shadow-sm" style={{ maxHeight: "350px", overflowY: "auto" }}>
                        {productOptions.map(opt => (
                          <button
                            key={opt.value}
                            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center px-4 py-3 border-bottom"
                            onClick={() => handleSelectProduct(opt)}
                          >
                            <div>
                              <div className="fw-bold fs-5">{opt.productName}</div>
                              <small className="text-muted">Đơn vị: {opt.unitName}</small>
                            </div>
                            <i className="bi bi-chevron-right text-muted fs-4"></i>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-5 text-muted">
                        Nhập từ khóa để tìm kiếm sản phẩm...
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="alert alert-info rounded-3 mb-4 py-3">
                      <strong className="d-block mb-2">Sản phẩm đã chọn:</strong>
                      {selectedProductUnit?.label}
                    </div>

                    <label className="form-label fw-bold mb-2">Nhà cung cấp</label>
                    {loadingModal ? (
                      <div className="text-center py-3"><div className="spinner-border spinner-border-sm" /></div>
                    ) : suppliers.length === 0 ? (
                      <div className="alert alert-warning">Không có nhà cung cấp nào</div>
                    ) : (
                      <Select
                        options={suppliers.map(s => ({
                          value: s.supplierId,
                          label: `${s.supplierName} - ${s.price?.toLocaleString("vi-VN") || "0"} ₫`,
                          price: s.price || 0,
                        }))}
                        value={selectedSupplier}
                        onChange={setSelectedSupplier}
                        placeholder="Chọn nhà cung cấp tốt nhất..."
                        className="mb-4"
                      />
                    )}

                    <label className="form-label fw-bold mb-2">Số lượng nhập</label>
                    <div className="input-group input-group-lg mb-4 rounded-pill overflow-hidden shadow-sm">
                      <button className="btn btn-outline-secondary" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                      <input
                        type="text"
                        className="form-control text-center fw-bold"
                        value={quantity}
                        onChange={e => {
                          const val = e.target.value.replace(/[^0-9]/g, "");
                          setQuantity(val ? Number(val) : 1);
                        }}
                      />
                      <button className="btn btn-outline-secondary" onClick={() => setQuantity(q => q + 1)}>+</button>
                    </div>

                    {selectedSupplier?.price && (
                      <div className="text-end bg-white p-3 rounded-3 shadow-sm border">
                        <small className="text-muted">Thành tiền tạm tính</small>
                        <h4 className="fw-bold text-success mb-0">
                          {(selectedSupplier.price * quantity).toLocaleString("vi-VN")} ₫
                        </h4>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="modal-footer bg-white border-0 px-5 py-4">
                {step === 2 && (
                  <button className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setStep(1)}>
                    <i className="bi bi-arrow-left me-2"></i>Chọn lại sản phẩm
                  </button>
                )}
                <button className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setShowAddModal(false)}>
                  Hủy
                </button>
                {step === 2 && (
                  <button
                    className="btn btn-primary rounded-pill px-5 fw-bold shadow"
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