import { useState, useEffect } from "react";
import AlertMessage from "../../../components/common/AlertMessage";

import supplierService from "../../../services/Inventory/supplierService";
import productStockService from "../../../services/Inventory/productStockService";

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

  // State quản lý Alert
  const [alert, setAlert] = useState({ type: "", message: "" });

  useEffect(() => {
    if (!product || !show) return;

    setPrice(product.supplyPrice?.toString() || "");
    setOldPrice(product.supplyPrice?.toString() || "");
    setStatus(product.status || "ACTIVE");
    setStep(1);
    setAlert({ type: "", message: "" });

    fetchUnits();
  }, [product, show]);

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

  const loadProductUnits = async () => {
    try {
      const res = await supplierService.getProductUnits(product.id);
      if (res?.data?.success) {
        setProductUnits(
          res.data.data.map(u => ({
            ...u,
            salePrice: u.salePrice || 0
          }))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!show || !product) return null;

  // Validate chỉ cho phép nhập số
  const handleNumberInput = (e, setter) => {
    const value = e.target.value;
    if (value === "" || /^\d*$/.test(value)) {
      setter(value);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    // Tự động ẩn alert sau 4 giây
    setTimeout(() => {
      setAlert({ type: "", message: "" });
    }, 4000);
  };

  const handleUpdate = async () => {
    if (!price || price.trim() === "") {
      showAlert("danger", "Giá nhập không được để trống");
      return;
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      showAlert("danger", "Giá nhập phải là số dương");
      return;
    }

    try {
      setLoading(true);

      const data = { status };

      if (numericPrice !== Number(product.supplyPrice)) {
        data.price = numericPrice;
        data.productUnitId = Number(productUnitId);
      }

      await supplierService.updateProductOfSupplier(
        supplierId,
        product.id,
        data
      );

      // 🔥 FIX QUAN TRỌNG: reload UI ngay
      onSuccess();

      if (numericPrice !== Number(oldPrice)) {
        await loadProductUnits();
        setStep(2);
      } else {
        onClose();
      }

    } catch (err) {
      console.error("Update error:", err);
      showAlert("danger", "Có lỗi xảy ra khi cập nhật. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSalePrice = async () => {
    try {
      setLoading(true);

      for (const u of productUnits) {
        const salePrice = Number(u.salePrice);
        if (isNaN(salePrice) || salePrice < 0) {
          showAlert("danger", `Giá bán của đơn vị ${u.unitName} không hợp lệ`);
          setLoading(false);
          return;
        }
        await productStockService.updatePrice(u.id, salePrice);
      }

      // === Cập nhật giá bán THÀNH CÔNG ===
      showAlert("success", "Cập nhật giá bán thành công!");

      // Gọi onSuccess và đóng modal sau 1.5 giây để người dùng thấy alert
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

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content rounded-4 shadow-lg border-0">

            <div className="modal-header border-bottom-0 pb-2">
              <div>
                <h5 className="modal-title fw-semibold">
                  Chỉnh sửa sản phẩm: {product.name}
                </h5>
                <small className="text-muted">Bước {step} / 3</small>
              </div>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body pt-2">

              {alert.message && (
                <div className="mb-3">
                  <AlertMessage
                    type={alert.type}
                    message={alert.message}
                  />
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
                <div className="text-center py-5">
                  <div className="mb-4">
                    <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "3.8rem" }}></i>
                  </div>
                  <h5>Giá nhập đã được cập nhật thành công!</h5>
                  <p className="text-muted mb-4">
                    Bạn có muốn cập nhật <strong>giá bán</strong> cho các đơn vị không?
                  </p>
                </div>
              )}

              {step === 3 && (
                <>
                  <p className="text-muted mb-3">Chỉnh sửa giá bán cho từng đơn vị:</p>
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

            <div className="modal-footer border-top-0 pt-2">
              {step === 1 && (
                <>
                  <button className="btn btn-light px-4" onClick={onClose}>
                    Hủy
                  </button>
                  <button
                    className="btn btn-primary px-5"
                    onClick={handleUpdate}
                    disabled={loading}
                  >
                    {loading ? "Đang lưu..." : "Lưu thay đổi"}
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
                  <button className="btn btn-primary px-5" onClick={handleNextToSale}>
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
                    {loading ? "Đang lưu..." : "Lưu giá bán"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="modal-backdrop fade show" style={{ zIndex: 1040 }} onClick={onClose}></div>
    </>
  );
}

export default UpdateProductModal;