import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import productStockService from "../../../services/productStockService";

function ProductStock() {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newQuantity, setNewQuantity] = useState("");
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  const limit = 10;
  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    loadProducts();
  }, [categoryId, page, search]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await productStockService.getProductsByCategory(
        categoryId,
        search,
        page,
        limit
      );

      setProducts(res.data?.products || []);
      setTotal(res.data?.total || 0);
      setCategoryName(res.data?.categoryName || "Không xác định");
    } catch (err) {
      console.error("Lỗi tải tồn kho:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (qty, min) => {
    return qty <= min ? "THẤP" : "BÌNH THƯỜNG";
  };

  const handleUpdateStock = (product) => {
    setSelectedProduct(product);
    setNewQuantity(product.quantityOnHand.toString());
    setError("");
    setShowModal(true);
  };

  const handleSaveStock = async () => {
    const qty = Number(newQuantity);
    if (isNaN(qty) || qty < 0) {
      setError("Số lượng không hợp lệ (phải là số ≥ 0)");
      return;
    }

    if (!selectedProduct) return;

    setUpdating(true);
    setError("");
    try {
      await productStockService.updateStock(selectedProduct.productId, qty);
      setShowModal(false);
      loadProducts(); // reload để cập nhật UI
    } catch (err) {
      setError(err.response?.data?.message || "Cập nhật thất bại, vui lòng thử lại");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="card shadow border-0 rounded-4 overflow-hidden">
        {/* HEADER */}
        <div className="card-header bg-white border-bottom py-3">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div className="d-flex align-items-center gap-3">
              <button
                className="btn btn-sm btn-outline-secondary rounded-circle"
                onClick={() => navigate(-1)}
                title="Quay lại"
              >
                <i className="bi bi-arrow-left"></i>
              </button>

              <div>
                <h4 className="fw-bold mb-1 text-dark">Quản lý tồn kho sản phẩm</h4>
                <div className="text-muted small d-flex align-items-center">
                  <i className="bi bi-folder2-open me-2"></i>
                  Danh mục: <strong className="ms-1 text-primary">{categoryName}</strong>
                </div>
              </div>
            </div>

            {/* Search nhỏ gọn */}
            <div className="input-group ms-md-auto" style={{ maxWidth: "300px" }}>
              <span className="input-group-text bg-white border-end-0 rounded-start-pill">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 rounded-end-pill"
                placeholder="Tìm tên hoặc mã..."
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value.trim());
                }}
              />
            </div>
          </div>
        </div>

        {/* BODY - Table */}
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-striped align-middle mb-0">
              <thead className="table-light text-center">
                <tr>
                  <th className="ps-4">Ảnh</th>
                  <th>Tên sản phẩm</th>
                  <th>Mã</th>
                  <th>Tồn kho</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="text-center ps-4">
                        <div
                          className="placeholder placeholder-glow bg-secondary-subtle rounded"
                          style={{ height: "60px", width: "60px" }}
                        ></div>
                      </td>
                      <td>
                        <div className="placeholder placeholder-glow col-9 bg-secondary-subtle rounded"></div>
                      </td>
                      <td className="text-center">
                        <div className="placeholder placeholder-glow col-5 bg-secondary-subtle rounded"></div>
                      </td>
                      <td className="text-center">
                        <div className="placeholder placeholder-glow col-4 bg-secondary-subtle rounded"></div>
                      </td>
                      <td className="text-center">
                        <div className="placeholder placeholder-glow col-6 bg-secondary-subtle rounded"></div>
                      </td>
                      <td className="text-center">
                        <div className="placeholder placeholder-glow col-6 bg-secondary-subtle rounded"></div>
                      </td>
                    </tr>
                  ))
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted fst-italic">
                      <i className="bi bi-inbox fs-1 d-block mb-3 opacity-75"></i>
                      Không tìm thấy sản phẩm nào trong danh mục này
                    </td>
                  </tr>
                ) : (
                  products.map((p) => {
                    const status = getStatus(p.quantityOnHand, p.minThreshold);

                    return (
                      <tr key={p.productId}>
                        <td className="text-center ps-4">
                          <img
                            src={p.imageUrl || "https://via.placeholder.com/60?text=No+Img"}
                            alt={p.productName}
                            className="rounded shadow-sm"
                            width="60"
                            height="60"
                            style={{ objectFit: "cover" }}
                          />
                        </td>
                        <td className="fw-medium">{p.productName}</td>
                        <td className="text-center text-muted small">{p.productCode}</td>
                        <td className="text-center fw-bold">
                          {p.quantityOnHand.toLocaleString()}
                        </td>
                        <td className="text-center">
                          <span
                            className={`badge rounded-pill px-3 py-2 fs-6 ${
                              status === "THẤP" ? "bg-danger-subtle text-danger" : "bg-success-subtle text-success"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="text-center">
                          <button
                            className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 mx-auto px-3"
                            onClick={() => handleUpdateStock(p)}
                          >
                            <i className="bi bi-pencil-square"></i>
                            Cập nhật
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

        {/* FOOTER - Pagination */}
        {!loading && total > 0 && (
          <div className="card-footer bg-white border-top py-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
              <div className="text-muted small">
                Hiển thị {products.length} / {total} sản phẩm
              </div>

              <nav aria-label="Page navigation">
                <ul className="pagination pagination-sm mb-0">
                  <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Trước
                    </button>
                  </li>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <li key={p} className={`page-item ${page === p ? "active" : ""}`}>
                      <button className="page-link" onClick={() => setPage(p)}>
                        {p}
                      </button>
                    </li>
                  ))}

                  <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                    >
                      Tiếp
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        )}

        {/* MODAL CẬP NHẬT TỒN KHO */}
        {showModal && (
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-4 shadow">
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold">Cập nhật tồn kho</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                    disabled={updating}
                  ></button>
                </div>

                <div className="modal-body">
                  <p className="fw-medium mb-1">{selectedProduct?.productName}</p>
                  <p className="text-muted small mb-3">Mã: {selectedProduct?.productCode}</p>

                  <label htmlFor="newQty" className="form-label small fw-medium">
                    Số lượng tồn kho mới
                  </label>
                  <input
                    id="newQty"
                    type="number"
                    className="form-control"
                    min="0"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    disabled={updating}
                  />

                  {error && <div className="alert alert-danger small mt-3 py-2">{error}</div>}
                </div>

                <div className="modal-footer border-0 pt-2">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                    disabled={updating}
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={updating}
                    onClick={handleSaveStock}
                  >
                    {updating ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Đang lưu...
                      </>
                    ) : (
                      "Lưu thay đổi"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductStock;