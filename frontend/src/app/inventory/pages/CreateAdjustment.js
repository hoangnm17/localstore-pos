import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import productStockService from "../../../services/Inventory/productStockService";
import adjustmentService from "../../../services/Inventory/adjustmentService";

const CreateAdjustment = () => {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [adjustmentItems, setAdjustmentItems] = useState([]);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Debounce search
  useEffect(() => {
    const delay = setTimeout(() => {
      if (keyword.trim().length >= 2) {
        handleSearch(keyword);
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [keyword]);

  const handleSearch = async (value) => {
    try {
      setLoading(true);
      const res = await productStockService.searchProduct(value);
      setSearchResults(res.data.data || []);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = (product) => {
    if (adjustmentItems.some((i) => i.id === product.id)) return;

    setAdjustmentItems([
      ...adjustmentItems,
      {
        ...product,
        actualQuantity: product.quantityOnHand.toString(), // lưu dạng string để validate
      },
    ]);

    setKeyword("");
    setSearchResults([]);
  };

  // Validate input giống hệt UpdateMinThresholdModal
  const handleQuantityChange = (id, e) => {
    let val = e.target.value;

    // 1. Chỉ giữ số và tối đa 1 dấu chấm
    val = val.replace(/[^0-9.]/g, "");

    // 2. Ngăn nhiều hơn 1 dấu chấm
    const parts = val.split(".");
    if (parts.length > 2) {
      val = parts[0] + "." + parts.slice(1).join("");
    }

    // 3. Nếu sản phẩm không cho phép thập phân → loại bỏ dấu chấm
    const item = adjustmentItems.find((i) => i.id === id);
    const allowDecimal = item?.allowDecimalQuantity === true; // giả sử backend có field này

    if (!allowDecimal) {
      val = val.replace(/\./g, "");
    }

    // Cập nhật giá trị
    const updated = adjustmentItems.map((item) =>
      item.id === id ? { ...item, actualQuantity: val } : item
    );
    setAdjustmentItems(updated);
  };

  const handleRemove = (id) => {
    setAdjustmentItems(adjustmentItems.filter((i) => i.id !== id));
  };

  const handleSubmit = async () => {
    // Kiểm tra lý do
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      setReasonError("Vui lòng nhập lý do điều chỉnh.");
      return;
    }
    setReasonError("");

    // Kiểm tra danh sách sản phẩm
    if (adjustmentItems.length === 0) {
      alert("Vui lòng thêm ít nhất một sản phẩm.");
      return;
    }

    // Validate tất cả actualQuantity trước khi gửi
    for (const item of adjustmentItems) {
      const val = (item.actualQuantity || "").trim();

      if (!val) {
        alert(`Vui lòng nhập tồn thực tế cho sản phẩm "${item.name}"`);
        return;
      }

      if (!/^\d*\.?\d*$/.test(val)) {
        alert(`Giá trị tồn thực tế của "${item.name}" không hợp lệ`);
        return;
      }

      const qty = parseFloat(val);

      if (isNaN(qty)) {
        alert(`Giá trị tồn thực tế của "${item.name}" không hợp lệ`);
        return;
      }

      if (qty < 0) {
        alert(`Tồn thực tế của "${item.name}" không được âm`);
        return;
      }

      const allowDecimal = item?.allowDecimalQuantity === true;
      if (!allowDecimal && !Number.isInteger(qty)) {
        alert(`Sản phẩm "${item.name}" chỉ chấp nhận số nguyên`);
        return;
      }
    }

    const payload = {
      reason: trimmedReason,
      items: adjustmentItems.map((item) => ({
        productId: item.id,
        systemQuantity: Number(item.quantityOnHand),
        actualQuantity: Number(item.actualQuantity),
      })),
    };

    try {
      setSaving(true);
      await adjustmentService.createAdjustment(payload);
      alert("Tạo phiếu điều chỉnh thành công!");
      navigate("/inventory/requests/adjust?status=Pending");
    } catch (err) {
      console.error("Create adjustment error:", err);
      alert("Tạo phiếu thất bại. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const calculateDifference = (item) => {
    const actual = Number(item.actualQuantity) || 0;
    const system = Number(item.quantityOnHand) || 0;
    return actual - system;
  };

  return (
    <div className="container-fluid py-4 px-md-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold text-dark mb-0">
          Tạo phiếu điều chỉnh tồn kho
        </h3>
        <button
          className="btn btn-outline-secondary d-flex align-items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <i className="bi bi-arrow-left"></i>
          Quay lại
        </button>
      </div>

      <div className="row g-4">
        {/* Cột trái: Tìm kiếm + Lý do */}
        <div className="col-lg-8">
          {/* Tìm kiếm sản phẩm */}
          <div className="card shadow-sm border-0 rounded-3 mb-4">
            <div className="card-header bg-light py-3">
              <h5 className="mb-0 fw-semibold d-flex align-items-center gap-2">
                <i className="bi bi-search text-primary"></i>
                Tìm kiếm sản phẩm
              </h5>
            </div>
            <div className="card-body">
              <div className="position-relative">
                <div className="input-group input-group-lg">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="bi bi-search text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Tìm theo tên sản phẩm hoặc mã vạch..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                </div>

                {loading && (
                  <div className="text-center py-3 text-muted">
                    <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                    Đang tìm kiếm...
                  </div>
                )}

                {searchResults.length > 0 && (
                  <div
                    className="position-absolute w-100 mt-1 bg-white border rounded-3 shadow-lg overflow-auto"
                    style={{ maxHeight: "320px", zIndex: 1000 }}
                  >
                    {searchResults.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 border-bottom hover-bg-light cursor-pointer"
                        onClick={() => handleAddProduct(item)}
                      >
                        <div className="fw-medium">{item.name}</div>
                        <div className="small text-muted">
                          Mã: {item.code} • Tồn kho: {item.quantityOnHand.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lý do */}
          <div className="card shadow-sm border-0 rounded-3">
            <div className="card-header bg-light py-3">
              <h5 className="mb-0 fw-semibold d-flex align-items-center gap-2">
                <i className="bi bi-journal-text text-primary"></i>
                Lý do điều chỉnh
              </h5>
            </div>
            <div className="card-body">
              <textarea
                className="form-control form-control-lg"
                rows={4}
                placeholder="Nhập lý do kiểm kê / điều chỉnh tồn kho..."
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (reasonError) setReasonError("");
                }}
              ></textarea>

              {reasonError && (
                <div className="text-danger mt-2 small fw-medium">
                  {reasonError}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cột phải: Danh sách sản phẩm + Submit */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 rounded-3 sticky-top" style={{ top: "20px" }}>
            <div className="card-header bg-light py-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-semibold">
                Sản phẩm điều chỉnh ({adjustmentItems.length})
              </h5>
            </div>

            {adjustmentItems.length === 0 ? (
              <div className="card-body text-center py-5 text-muted">
                <i className="bi bi-cart-x fs-1 mb-3 d-block"></i>
                Chưa có sản phẩm nào được thêm
              </div>
            ) : (
              <>
                <div className="table-responsive" style={{ maxHeight: "400px", overflowY: "auto" }}>
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light sticky-top">
                      <tr>
                        <th>Sản phẩm</th>
                        <th className="text-end">Tồn hệ thống</th>
                        <th className="text-end">Tồn thực tế</th>
                        <th className="text-end">Chênh lệch</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {adjustmentItems.map((item) => {
                        const diff = calculateDifference(item);
                        return (
                          <tr key={item.id}>
                            <td>
                              <div className="fw-medium">{item.name}</div>
                              <small className="text-muted">Mã: {item.code}</small>
                            </td>
                            <td className="text-end">{item.quantityOnHand.toLocaleString()}</td>
                            <td className="text-end" style={{ minWidth: "140px" }}>
                              <input
                                type="text"
                                inputMode="decimal"
                                className="form-control form-control-sm text-end"
                                value={item.actualQuantity}
                                onChange={(e) => handleQuantityChange(item.id, e)}
                                placeholder="0"
                                onKeyDown={(e) => {
                                  if (["e", "E", "+", "-"].includes(e.key)) {
                                    e.preventDefault();
                                  }
                                  // Chặn dấu chấm nếu không cho phép thập phân
                                  if (
                                    item.allowDecimalQuantity !== true &&
                                    e.key === "."
                                  ) {
                                    e.preventDefault();
                                  }
                                }}
                              />
                            </td>
                            <td className="text-end">
                              <span
                                className={`fw-bold ${
                                  diff > 0
                                    ? "text-success"
                                    : diff < 0
                                    ? "text-danger"
                                    : "text-muted"
                                }`}
                              >
                                {diff > 0 ? "+" : ""}
                                {diff.toLocaleString()}
                              </span>
                            </td>
                            <td className="text-center">
                              <button
                                className="btn btn-sm btn-outline-danger rounded-circle"
                                onClick={() => handleRemove(item.id)}
                                title="Xóa sản phẩm"
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

                <div className="card-footer bg-white border-0 text-end py-3">
                  <button
                    className="btn btn-lg btn-success d-flex align-items-center gap-2 mx-auto"
                    onClick={handleSubmit}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                        Đang lưu...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle"></i>
                        Tạo phiếu điều chỉnh
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAdjustment;