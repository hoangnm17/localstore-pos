import { useState, useEffect } from "react";
import AlertMessage from "../../../components/common/AlertMessage";

import supplierService from "../../../services/Inventory/supplierService";
import productStockService from "../../../services/Inventory/productStockService";
import { updateProductUnit } from "../../../services/Product/product.service";

function UpdateProductModal({
  show,
  supplierId,
  product,
  onClose,
  onSuccess
}) {
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [productUnitId, setProductUnitId] = useState("");
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [productUnits, setProductUnits] = useState([]);

  const [alert, setAlert] = useState({ type: "", message: "" });
  const [priceError, setPriceError] = useState("");
  const [salePriceError, setSalePriceError] = useState(""); 

  const [initialSalePrices, setInitialSalePrices] = useState({});

  useEffect(() => {
    if (!product || !show) return;

    const initialPrice = product.supplyPrice?.toString() || "";
    setPrice(initialPrice);
    setOldPrice(initialPrice);
    setStatus(product.status || "ACTIVE");
    setStep(1);
    setAlert({ type: "", message: "" });
    setPriceError("");
    setSalePriceError("");
    fetchUnits();
  }, [product, show]);

  const fetchUnits = async () => {
    try {
      const res = await supplierService.getProductUnits(product.id);
      if (res?.data?.success) {
        setUnits(res.data.data || []);
        if (res.data.data?.length > 0) {
          setProductUnitId(res.data.data[0].id);
        }
      }
    } catch (err) {
      console.error("Fetch units error:", err);
    }
  };

  const loadProductUnits = async () => {
    try {
      const res = await supplierService.getProductUnits(product.id);
      if (res?.data?.success) {
        const unitsData = res.data.data.map(u => ({
          ...u,
          salePrice: u.salePrice || 0
        }));

        setProductUnits(unitsData);

        // Lưu giá bán ban đầu để so sánh sau này
        const initialPrices = {};
        unitsData.forEach(u => {
          initialPrices[u.id] = Number(u.salePrice) || 0;
        });
        setInitialSalePrices(initialPrices);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!show || !product) return null;

  const handleNumberInput = (e, setter) => {
    const value = e.target.value;
    if (value === "" || /^\d*$/.test(value)) {
      setter(value);
      if (setter === setPrice) setPriceError("");
    }
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert({ type: "", message: "" }), 4000);
  };

  const hasPriceChanged = () => {
    return Number(price) !== Number(oldPrice) || status !== product.status;
  };

  const hasAnySalePriceChanged = () => {
    if (!productUnits.length) return false;

    return productUnits.some(u => {
      const current = Number(u.salePrice) || 0;
      const initial = initialSalePrices[u.id] || 0;
      return current !== initial;
    });
  };

  const handleUpdate = async () => {
    setPriceError("");

    if (!price || price.trim() === "") {
      showAlert("danger", "Giá nhập không được để trống");
      return;
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      showAlert("danger", "Giá nhập phải là số dương");
      return;
    }

    if (!hasPriceChanged()) {
      setPriceError("Giá nhập chưa có thay đổi nào.");
      return;
    }

    try {
      setLoading(true);

      const data = { status };
      if (numericPrice !== Number(product.supplyPrice)) {
        data.price = numericPrice;
        data.productUnitId = Number(productUnitId);
      }

      await supplierService.updateProductOfSupplier(supplierId, product.id, data);

      setOldPrice(price);

      showAlert("success", "Cập nhật thông tin sản phẩm thành công!");
      onSuccess();

      if (numericPrice !== Number(oldPrice)) {
        await loadProductUnits();
        setStep(2);
      } else {
        setTimeout(() => onClose(), 1200);
      }
    } catch (err) {
      console.error("Update error:", err);
      showAlert("danger", "Có lỗi xảy ra khi cập nhật. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSalePrice = async () => {
    setSalePriceError("");

    if (!hasAnySalePriceChanged()) {
      setSalePriceError("Giá bán chưa có thay đổi nào.");
      return;
    }

    try {
      setLoading(true);

      for (const u of productUnits) {
        const salePrice = Number(u.salePrice);
        if (isNaN(salePrice) || salePrice < 0) {
          showAlert("danger", `Giá bán của đơn vị ${u.unitName} không hợp lệ`);
          setLoading(false);
          return;
        }

        await updateProductUnit(u.id, { salePrice });
      }

      showAlert("success", "Cập nhật giá bán thành công!");

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      showAlert("danger", "Có lỗi khi cập nhật giá bán.");
    } finally {
      setLoading(false);
    }
  };

  const handleNextToSale = () => setStep(3);
  const handleBack = () => setStep(1);
  const handleClose = () => onClose();

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content rounded-4 shadow-lg border-0">

            {/* Header + Stepper */}
            <div className="modal-header border-bottom-0 pb-3">
              <div className="flex-grow-1">
                <h5 className="modal-title fw-semibold mb-1">
                  Chỉnh sửa sản phẩm: <span className="text-primary">{product.name}</span>
                </h5>
                <small className="text-muted">Bước {step} / 3</small>

                <div className="d-flex mt-3">
                  {[1, 2, 3].map((s, index) => (
                    <div key={s} className="flex-fill text-center position-relative">
                      <div 
                        className={`mx-auto mb-1 d-flex align-items-center justify-content-center rounded-circle border fw-medium
                          ${step === s ? 'bg-primary text-white border-primary' 
                            : step > s ? 'bg-success text-white border-success' 
                            : 'bg-light text-muted border-secondary'}`}
                        style={{ width: '32px', height: '32px', fontSize: '1rem' }}
                      >
                        {step > s ? '✓' : s}
                      </div>
                      <small className={step >= s ? 'text-dark fw-medium' : 'text-muted'}>
                        {s === 1 ? 'Thông tin' : s === 2 ? 'Xác nhận' : 'Giá bán'}
                      </small>
                      {index < 2 && (
                        <div className={`step-line position-absolute top-50 start-50 translate-middle-y bg-secondary ${step > s ? 'bg-success' : ''}`} 
                             style={{ height: '2px', width: 'calc(100% - 40px)' }}></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <button type="button" className="btn-close" onClick={handleClose}></button>
            </div>

            <div className="modal-body pt-3">

              {alert.message && (
                <div className="mb-4">
                  <AlertMessage type={alert.type} message={alert.message} />
                </div>
              )}

              {step === 1 && (
                <>
                  <div className="mb-4">
                    <label className="form-label fw-medium">Đơn vị tính</label>
                    <select
                      className="form-select form-select-lg"
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

                  <div className="mb-4">
                    <label className="form-label fw-medium">Giá nhập (VND)</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      value={price}
                      onChange={(e) => handleNumberInput(e, setPrice)}
                      placeholder="Nhập giá nhập"
                      inputMode="numeric"
                    />
                    {priceError && (
                      <div className="text-danger mt-2 small fw-medium">
                        {priceError}
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-medium">Trạng thái</label>
                    <select
                      className="form-select form-select-lg"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                      <option value="INACTIVE">Không hoạt động (INACTIVE)</option>
                    </select>
                  </div>
                </>
              )}

              {step === 2 && (
                <div className="text-center py-5 my-4">
                  <div className="mb-4">
                    <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "4.5rem" }}></i>
                  </div>
                  <h4 className="mb-3 text-success">Giá nhập đã được cập nhật thành công!</h4>
                  <p className="text-muted fs-5 px-4">
                    Bạn có muốn cập nhật <strong>giá bán</strong> cho các đơn vị tính không?
                  </p>
                </div>
              )}

              {step === 3 && (
                <>
                  <p className="text-muted mb-3">Chỉnh sửa giá bán cho từng đơn vị:</p>
                  
                  {salePriceError && (
                    <div className="alert alert-warning py-2 small mb-3">
                      {salePriceError}
                    </div>
                  )}

                  <div className="table-responsive">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Đơn vị</th>
                          <th>Hệ số</th>
                          <th className="text-end">Giá bán (VND)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productUnits.map((u, i) => (
                          <tr key={u.id}>
                            <td className="fw-medium">{u.unitName}</td>
                            <td>{u.conversionFactor}</td>
                            <td className="text-end">
                              <input
                                type="text"
                                className="form-control text-end"
                                value={u.salePrice || ""}
                                onChange={(e) => {
                                  const list = [...productUnits];
                                  if (e.target.value === "" || /^\d*$/.test(e.target.value)) {
                                    list[i].salePrice = e.target.value;
                                    setProductUnits(list);
                                    setSalePriceError(""); // Xóa lỗi khi người dùng chỉnh
                                  }
                                }}
                                placeholder="0"
                                inputMode="numeric"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer border-top-0 pt-3 pb-4">
              {step === 1 && (
                <>
                  <button className="btn btn-light px-4" onClick={handleClose}>
                    Hủy
                  </button>
                  <button
                    className="btn btn-primary px-5"
                    onClick={handleUpdate}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Đang lưu...
                      </>
                    ) : "Lưu thay đổi"}
                  </button>
                </>
              )}

              {step === 2 && (
                <>
                  <button className="btn btn-light px-4" onClick={() => setStep(1)}>
                    Quay lại
                  </button>
                  <button className="btn btn-secondary px-4" onClick={onClose}>
                    Không, đóng
                  </button>
                  <button
                    className="btn btn-primary px-5"
                    onClick={handleNextToSale}
                  >
                    Có, cập nhật giá bán
                  </button>
                </>
              )}

              {step === 3 && (
                <>
                  <button className="btn btn-light px-4" onClick={handleBack}>
                    Quay lại
                  </button>
                  <button
                    className="btn btn-primary px-5"
                    onClick={handleUpdateSalePrice}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Đang lưu...
                      </>
                    ) : "Lưu giá bán"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }} onClick={handleClose}></div>
    </>
  );
}

export default UpdateProductModal;