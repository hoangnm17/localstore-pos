import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import productStockService from "../../../services/Inventory/productStockService";
import adjustmentService from "../../../services/Inventory/adjustmentService";
import useTitle from "../../../hooks/common/useTitle";

const CreateAdjustment = () => {
  useTitle("Tạo phiếu điều chỉnh tồn kho");
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [adjustmentItems, setAdjustmentItems] = useState([]);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // State mới để theo dõi sản phẩm có chênh lệch = 0
  const [zeroDiffErrors, setZeroDiffErrors] = useState(new Set());

  useEffect(() => {
    window.scrollTo(0, 0);
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
      setShowSearchResults(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (product) => {
    if (adjustmentItems.some((i) => i.id === product.id)) return;

    try {
      const res = await adjustmentService.checkProductConflict(product.id);
      const isInPending = res.data.data.isInPending;

      if (isInPending) {
        alert(`Sản phẩm "${product.name}" đang nằm trong phiếu kiểm kê khác đang chờ xử lý.\nBạn không thể thêm sản phẩm này vào phiếu điều chỉnh.`);
        return;
      }

      setAdjustmentItems((prev) => [
        ...prev,
        {
          ...product,
          actualLargest: product.systemLargest.toString(),
          actualRemainder: product.systemRemainder.toString(),
          isConflict: isInPending,
        },
      ]);

      setKeyword("");
      setShowSearchResults(false);
    } catch (err) {
      console.error(err);
      alert("Không kiểm tra được trạng thái sản phẩm");
    }
  };

  const handleLargestChange = (id, e) => {
    let val = e.target.value.replace(/[^0-9]/g, "");
    if (val === "") val = "0";

    setAdjustmentItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, actualLargest: val } : item
      )
    );

    // Xóa lỗi nếu người dùng đang sửa
    setZeroDiffErrors((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const handleRemainderChange = (id, e) => {
    let val = e.target.value;

    const item = adjustmentItems.find((i) => i.id === id);
    const allowDecimal = item?.allowDecimalQuantity === true;

    if (allowDecimal) {
      val = val.replace(/[^0-9.]/g, "");
      const parts = val.split(".");
      if (parts.length > 2) {
        val = parts[0] + "." + parts.slice(1).join("");
      }
    } else {
      val = val.replace(/[^0-9]/g, "");

      const max = item?.largestConversionFactor
        ? item.largestConversionFactor - 1
        : 999999;

      if (val !== "" && Number(val) >= max) {
        val = (max - 1).toString();
      }
    }

    if (val === "") val = "0";

    setAdjustmentItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, actualRemainder: val } : item
      )
    );

    // Xóa lỗi nếu người dùng đang sửa
    setZeroDiffErrors((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const handleRemove = (id) => {
    setAdjustmentItems((prev) => prev.filter((i) => i.id !== id));
    setZeroDiffErrors((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const calculateDifference = (item) => {
    const conv = Number(item.largestConversionFactor) || 1;
    const actual =
      (Number(item.actualLargest) || 0) * conv +
      (Number(item.actualRemainder) || 0);

    return actual - (Number(item.quantityOnHand) || 0);
  };

  const formatSystemQuantity = (item) => {
    const largest = Number(item.systemLargest) || 0;
    const remainder = Number(item.systemRemainder) || 0;
    const unit = item.largestUnitName || item.baseUnit || "Đơn vị";

    if (largest > 0)
      return `${largest.toLocaleString()} ${unit}${remainder ? ` + ${remainder} lẻ` : ""}`;

    return remainder ? `${remainder} lẻ` : "0";
  };

  const summary = useMemo(() => {
    let increase = 0;
    let decrease = 0;

    adjustmentItems.forEach((item) => {
      const diff = calculateDifference(item);
      if (diff > 0) increase++;
      if (diff < 0) decrease++;
    });

    return {
      total: adjustmentItems.length,
      increase,
      decrease,
    };
  }, [adjustmentItems]);

  // Hàm kiểm tra trước khi submit
  const validateBeforeSubmit = () => {
    const errors = new Set();

    adjustmentItems.forEach((item) => {
      const diff = calculateDifference(item);
      if (diff === 0) {
        errors.add(item.id);
      }
    });

    setZeroDiffErrors(errors);

    if (errors.size > 0) {
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      return setReasonError("Vui lòng nhập lý do điều chỉnh.");
    }

    if (adjustmentItems.length === 0) {
      return alert("Vui lòng thêm ít nhất một sản phẩm.");
    }

    // Kiểm tra chênh lệch trước khi tạo phiếu
    if (!validateBeforeSubmit()) {
      return;
    }

    const payload = {
      reason: trimmedReason,
      items: adjustmentItems.map((item) => ({
        productId: Number(item.id),
        actualLargest: Number(item.actualLargest) || 0,
        actualRemainder: Number(item.actualRemainder) || 0,
      })),
    };

    try {
      setSaving(true);
      await adjustmentService.createAdjustment(payload);

      alert("Tạo phiếu điều chỉnh thành công!");
      navigate("/inventory/requests/adjust?status=Pending");
    } catch (err) {
      alert(err.response?.data?.message || "Tạo phiếu thất bại.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-fluid py-4 bg-light min-vh-100">
      <div className="row justify-content-center">
        <div className="col-xl-10">

          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold text-primary d-flex align-items-center gap-2">
              <i className="bi bi-box-seam"></i>
              Tạo phiếu điều chỉnh tồn kho
            </h3>

            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate(-1)}
            >
              <i className="bi bi-arrow-left me-1"></i>
              Quay lại
            </button>
          </div>

          {/* Lý do */}
          <div className="card shadow-sm border-0 rounded-4 mb-4">
            <div className="card-header bg-primary text-white">
              <i className="bi bi-info-circle me-2"></i>
              Thông tin phiếu
            </div>

            <div className="card-body">
              <label className="form-label fw-semibold">
                Lý do điều chỉnh <span className="text-danger">*</span>
              </label>

              <textarea
                className="form-control"
                rows="3"
                placeholder="Nhập lý do điều chỉnh tồn kho..."
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setReasonError("");
                }}
              />

              {reasonError && (
                <div className="text-danger mt-1">{reasonError}</div>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="card shadow-sm border-0 rounded-4 mb-4">
            <div className="card-header bg-info text-white">
              <i className="bi bi-search me-2"></i>
              Tìm sản phẩm
            </div>

            <div className="card-body">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Nhập tên hoặc mã sản phẩm..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />

                {keyword && (
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setKeyword("");
                      setSearchResults([]);
                    }}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>

              {loading && (
                <div className="text-center mt-3">
                  <div className="spinner-border text-primary"></div>
                </div>
              )}

              {showSearchResults && searchResults.length > 0 && (
                <div
                  className="list-group mt-3"
                  style={{ maxHeight: 300, overflowY: "auto" }}
                >
                  {searchResults
                    .filter(item => !adjustmentItems.some(i => i.id === item.id))
                    .map((item) => (
                      <button
                        key={item.id}
                        className="list-group-item list-group-item-action d-flex justify-content-between"
                        onClick={() => handleAddProduct(item)}
                      >
                        <div>
                          <div className="fw-bold">{item.name}</div>
                          <small className="text-muted">
                            Mã: {item.code} • Tồn: {formatSystemQuantity(item)}
                          </small>
                        </div>
                        <span className="badge bg-primary">Thêm</span>
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Danh sách sản phẩm */}
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-header bg-dark text-white">
              <i className="bi bi-list-ul me-2"></i>
              Danh sách sản phẩm kiểm kê
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Sản phẩm</th>
                    <th className="text-end">Tồn hệ thống</th>
                    <th className="text-end">Tồn thực tế</th>
                    <th className="text-end">Chênh lệch</th>
                    <th className="text-center">Xóa</th>
                  </tr>
                </thead>

                <tbody>
                  {adjustmentItems.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-5 text-muted">
                        <i className="bi bi-cart-x fs-3 d-block mb-2"></i>
                        Chưa có sản phẩm nào được thêm
                      </td>
                    </tr>
                  ) : (
                    adjustmentItems.map((item) => {
                      const diff = calculateDifference(item);
                      const unit = item.largestUnitName || "ĐV";
                      const hasZeroDiffError = zeroDiffErrors.has(item.id);

                      return (
                        <tr key={item.id} className={hasZeroDiffError ? "table-warning" : ""}>
                          <td>
                            <div className="fw-bold">{item.name}</div>
                            <small className="text-muted">{item.code}</small>
                          </td>

                          <td className="text-end fw-semibold">
                            {formatSystemQuantity(item)}
                          </td>

                          <td>
                            <div className="d-flex gap-2 justify-content-end">
                              <div className="input-group input-group-sm" style={{ width: 120 }}>
                                <input
                                  type="text"
                                  className="form-control text-end"
                                  value={item.actualLargest}
                                  onChange={(e) => handleLargestChange(item.id, e)}
                                />
                                <span className="input-group-text">{unit}</span>
                              </div>

                              <div className="input-group input-group-sm" style={{ width: 120 }}>
                                <input
                                  type="text"
                                  className="form-control text-end"
                                  value={item.actualRemainder}
                                  onChange={(e) => handleRemainderChange(item.id, e)}
                                />
                                <span className="input-group-text">lẻ</span>
                              </div>
                            </div>

                            {hasZeroDiffError && (
                              <div className="text-danger mt-2 small text-end">
                                <i className="bi bi-exclamation-circle-fill me-1"></i>
                                Số lượng thực tế đang bằng số lượng tồn trên hệ thống.
                              </div>
                            )}
                          </td>

                          <td className="text-end">
                            <span
                              className={`badge ${diff > 0
                                ? "bg-success"
                                : diff < 0
                                  ? "bg-danger"
                                  : "bg-secondary"
                                }`}
                            >
                              {diff > 0 ? "+" : ""}
                              {item.allowDecimalQuantity
                                ? Number(diff).toFixed(3)
                                : diff}
                            </span>
                          </td>

                          <td className="text-center">
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleRemove(item.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary & Submit Button */}
          <div className="card shadow-sm border-0 rounded-4 mt-4">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <div className="d-flex gap-3 flex-wrap">
                    <span className="badge bg-primary fs-6 p-2">
                      Tổng sản phẩm: {summary.total}
                    </span>
                    <span className="badge bg-success fs-6 p-2">
                      Tăng: {summary.increase}
                    </span>
                    <span className="badge bg-danger fs-6 p-2">
                      Giảm: {summary.decrease}
                    </span>
                  </div>
                </div>

                <div className="col-md-4 text-end">
                  <button
                    className="btn btn-success btn-lg px-4"
                    disabled={saving}
                    onClick={handleSubmit}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Đang tạo...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Tạo phiếu điều chỉnh
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CreateAdjustment;