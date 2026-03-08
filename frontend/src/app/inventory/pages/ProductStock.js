import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import productStockService from "../../../services/Inventory/productStockService";
import UpdateMinThresholdModal from "../InventoryModal/UpdateMinThreshold";

function ProductStock() {
  const user = JSON.parse(localStorage.getItem("user"));
  const canUpdateLowStock = user?.features?.includes("EDIT_LOWSTOCK");

  const { categoryId } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [inputPage, setInputPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newMinThreshold, setNewMinThreshold] = useState("");
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  const limit = 10;
  const totalPages = Math.ceil(total / limit);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productStockService.getProductsByCategory(
        categoryId,
        search,
        page,
        limit
      );

      const response = res?.data;

      if (response?.success) {
        setProducts(response.data?.products || []);
        setTotal(response.data?.total || 0);
        setCategoryName(response.data?.categoryName || "Không xác định");
      } else {
        setProducts([]);
        setTotal(0);
        setCategoryName("Không xác định");
      }

    } catch (err) {
      console.error("Lỗi tải tồn kho:", err);
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [categoryId, search, page]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setInputPage(page);
  }, [page]);

  const getStatus = (qty, min) => {
    return qty <= min ? "THẤP" : "BÌNH THƯỜNG";
  };

  const handleUpdateStock = (product) => {
    if (!canUpdateLowStock) {
      alert("Bạn không có quyền cập nhật ngưỡng tồn kho tối thiểu.");
      return;
    }
    setSelectedProduct(product);
    setNewMinThreshold((product.minThreshold ?? 0).toString());
    setError("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewMinThreshold("");
    setError("");
    setSelectedProduct(null);
  };

  const handleSaveStock = async () => {
    const trimmedValue = newMinThreshold.trim();
    setError("");

    if (!trimmedValue) {
      setError("Vui lòng nhập ngưỡng tồn kho tối thiểu");
      return;
    }

    if (!/^\d*\.?\d*$/.test(trimmedValue)) {
      setError("Chỉ được nhập số");
      return;
    }

    const min = parseFloat(trimmedValue);

    if (isNaN(min)) {
      setError("Giá trị không hợp lệ");
      return;
    }

    if (min < 0) {
      setError("Ngưỡng không được âm");
      return;
    }

    const allowDecimal = selectedProduct?.allowDecimalQuantity === true;

    if (!allowDecimal && !Number.isInteger(min)) {
      setError("Sản phẩm này chỉ chấp nhận số nguyên");
      return;
    }

    if (!selectedProduct) {
      setError("Không tìm thấy sản phẩm");
      return;
    }

    setUpdating(true);

    try {
      const res = await productStockService.updateMinThreshold(
        selectedProduct.productId,
        min
      );

      const response = res?.data;

      if (!response?.success) {
        setError(response?.message || "Cập nhật thất bại");
        return;
      }

      handleCloseModal();
      loadProducts();
    } catch (err) {
      setError("Cập nhật thất bại. Vui lòng thử lại.");
    } finally {
      setUpdating(false);
    }
  };

  const handlePageInputChange = (e) => {
    setInputPage(e.target.value);
  };

  const jumpToPage = () => {
    let p = parseInt(inputPage, 10);
    if (isNaN(p) || p < 1) p = 1;
    if (p > totalPages) p = totalPages;
    setPage(p);
    setInputPage(p);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      jumpToPage();
    }
  };



  return (
    <div className="container-fluid py-4 py-md-5">
      <div className="card shadow-lg border-0 rounded-4 overflow-hidden">
        {/* HEADER */}
        <div className="card-header bg-white border-bottom py-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">
            <div className="d-flex align-items-center gap-3">
              <button
                className="btn btn-outline-secondary btn-sm rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: "38px", height: "38px" }}
                onClick={() => navigate(-1)}
                title="Quay lại"
              >
                <i className="bi bi-arrow-left"></i>
              </button>

              <div>
                <h4 className="fw-bold mb-1 text-dark">Quản lý tồn kho sản phẩm</h4>
                <div className="text-muted d-flex align-items-center small">
                  <i className="bi bi-folder2-open me-2"></i>
                  Danh mục: <strong className="ms-1 text-primary">{categoryName}</strong>
                </div>
              </div>
            </div>

            <div className="input-group" style={{ maxWidth: "320px" }}>
              <span className="input-group-text bg-white border-end-0 rounded-start-pill">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 rounded-end-pill py-2"
                placeholder="Tìm tên, mã sản phẩm..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* BODY - Table */}
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4 py-3 text-center">Ảnh</th>
                  <th className="py-3">Tên sản phẩm</th>
                  <th className="py-3 text-center">Mã</th>
                  <th className="py-3 text-center">Tồn kho</th>
                  <th className="py-3 text-center">Trạng thái</th>
                  {canUpdateLowStock && <th className="py-3 text-center">Ngưỡng tồn kho thấp</th>}
                  {canUpdateLowStock && <th className="py-3 text-center">Hành động</th>}
                </tr>
              </thead>

              <tbody className="border-top-0">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>
                      <td className="text-center ps-4 py-4">
                        <div
                          className="placeholder placeholder-glow bg-secondary-subtle rounded"
                          style={{ height: "80px", width: "80px" }}
                        ></div>
                      </td>
                      <td className="py-4">
                        <div className="placeholder placeholder-glow col-10 bg-secondary-subtle rounded py-3"></div>
                      </td>
                      <td className="text-center py-4">
                        <div className="placeholder placeholder-glow col-6 bg-secondary-subtle rounded py-3"></div>
                      </td>
                      <td className="text-center py-4">
                        <div className="placeholder placeholder-glow col-5 bg-secondary-subtle rounded py-3"></div>
                      </td>
                      <td className="text-center py-4">
                        <div className="placeholder placeholder-glow col-7 bg-secondary-subtle rounded py-3"></div>
                      </td>
                      {canUpdateLowStock && (
                        <td className="text-center py-4">
                          <div className="placeholder placeholder-glow col-8 bg-secondary-subtle rounded py-3"></div>
                        </td>
                      )}
                    </tr>
                  ))
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 py-md-6 text-muted fst-italic">
                      <i className="bi bi-inbox fs-2 d-block mb-3 opacity-50"></i>
                      Không tìm thấy sản phẩm nào trong danh mục này
                    </td>
                  </tr>
                ) : (
                  products.map((p) => {
                    const status = getStatus(p.quantityOnHand, p.minThreshold);

                    return (
                      <tr key={p.productId} className="hover-bg-light">
                        <td className="text-center ps-4 py-4">
                          <img
                            src={p.imageUrl || "https://via.placeholder.com/80?text=No+Img"}
                            alt={p.productName}
                            className="rounded shadow-sm"
                            width="80"
                            height="80"
                            style={{ objectFit: "cover" }}
                          />
                        </td>
                        <td className="py-4 fw-medium">{p.productName}</td>
                        <td className="text-center py-4 text-muted small">{p.productCode}</td>
                        <td className="text-center py-4 fw-bold fs-5">
                          {(p.quantityOnHand ?? 0).toLocaleString()}
                        </td>
                        <td className="text-center py-4">
                          <span
                            className={`badge rounded-pill px-4 py-2 fs-6 fw-medium ${status === "THẤP"
                              ? "bg-danger-subtle text-danger border border-danger-subtle"
                              : "bg-success-subtle text-success border border-success-subtle"
                              }`}
                          >
                            {status}
                          </span>
                        </td>
                        {canUpdateLowStock && (<td className="text-center py-4 fw-bold fs-5">
                          {(p.minThreshold ?? 0).toLocaleString()}
                        </td>)}
                        <td className="text-center py-4">
                          {canUpdateLowStock && (
                            <button
                              className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2 mx-auto px-4 py-2"
                              onClick={() => handleUpdateStock(p)}
                            >
                              <i className="bi bi-pencil-square"></i>
                              Cập nhật 
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* FOOTER - Pagination */}
        {!loading && total > 0 && (
          <div className="card-footer bg-white border-top py-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
              <div className="text-muted small">
                Trang <strong>{page}</strong> / <strong>{totalPages}</strong> • Hiển thị <strong>{products.length}</strong> sản phẩm
              </div>

              <nav aria-label="Pagination">
                <div className="d-flex align-items-center gap-2">
                  <button
                    className="btn btn-outline-secondary btn-sm px-3"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>

                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="number"
                      className="form-control form-control-sm text-center"
                      style={{ width: "70px" }}
                      value={inputPage}
                      onChange={handlePageInputChange}
                      onKeyDown={handleKeyDown}
                      onBlur={jumpToPage}
                      min="1"
                      max={totalPages}
                    />
                    <span className="text-muted small fw-medium">/ {totalPages}</span>
                  </div>

                  <button
                    className="btn btn-outline-secondary btn-sm px-3"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </div>
              </nav>
            </div>
          </div>
        )}

        {/* MODAL */}
        <UpdateMinThresholdModal
          show={showModal}
          product={selectedProduct}
          updating={updating}
          onClose={handleCloseModal}
          onSave={async (min) => {
            setUpdating(true);
            try {
              const res = await productStockService.updateMinThreshold(
                selectedProduct.productId,
                min
              );

              if (!res?.data?.success) {
                return;
              }

              handleCloseModal();
              loadProducts();
            } finally {
              setUpdating(false);
            }
          }}
        />
      </div>
    </div>
  );
}

export default ProductStock;