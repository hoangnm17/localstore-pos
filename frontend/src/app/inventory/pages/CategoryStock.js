import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import categoryService from "../../../services/categoryStockService";
import CategoryCard from "../inventoryComponents/CategoryCard";

function CategoryStock() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [inputPage, setInputPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const limit = 9;
  const navigate = useNavigate();

  useEffect(() => {
    loadCategories();
  }, [page, search]);

  useEffect(() => {
    setInputPage(page);
  }, [page]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryService.getCategoryStock(search, page, limit);
      setCategories(res.data?.categories || []);
      setTotalPages(res.data?.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Lỗi tải danh mục tồn kho:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setPage(1);
    setSearch(e.target.value.trim());
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

  const handleViewProducts = (categoryId) => {
    navigate(`/inventory/categories/${categoryId}/products`);
  };

  return (
    <div className="container-fluid py-4">
      <div className="card shadow border-0 rounded-4 overflow-hidden">
        {/* Header */}
        <div className="card-header bg-white border-bottom py-3">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <h4 className="fw-bold mb-1 text-dark">Quản lý tồn kho theo danh mục</h4>
              <div className="text-muted small d-flex align-items-center">
                <i className="bi bi-tags me-2"></i>
                Tổng số danh mục: <strong className="ms-1">{totalPages * limit}</strong> (ước tính)
              </div>
            </div>

            {/* Search bar nhỏ gọn */}
            <div className="input-group ms-md-auto" style={{ maxWidth: "300px" }}>
              <span className="input-group-text bg-white border-end-0 rounded-start-pill">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 rounded-end-pill"
                placeholder="Tìm danh mục..."
                value={search}
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="card-body p-4">
          {loading ? (
            <div className="row g-4">
              {Array.from({ length: limit }).map((_, i) => (
                <div key={i} className="col-12 col-md-6 col-lg-4">
                  <div className="card h-100 shadow-sm border-0">
                    <div className="card-body p-4">
                      <div
                        className="placeholder placeholder-glow bg-secondary-subtle rounded mb-3"
                        style={{ height: "140px" }}
                      ></div>
                      <div className="placeholder placeholder-glow col-9 bg-secondary-subtle mb-2 rounded"></div>
                      <div className="placeholder placeholder-glow col-7 bg-secondary-subtle mb-3 rounded"></div>
                      <div className="placeholder placeholder-glow col-5 bg-secondary-subtle rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-folder-x fs-1 d-block mb-3 opacity-75"></i>
              <h5>Không tìm thấy danh mục nào</h5>
              <p className="small">
                Thử thay đổi từ khóa tìm kiếm hoặc thêm danh mục mới vào hệ thống.
              </p>
            </div>
          ) : (
            <div className="row g-4">
              {categories.map((c) => (
                <div key={c.categoryId} className="col-12 col-md-6 col-lg-4">
                  <CategoryCard
                    category={c}
                    onView={() => handleViewProducts(c.categoryId)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Pagination */}
        {!loading && totalPages > 1 && (
          <div className="card-footer bg-white border-top py-3">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
              <div className="text-muted small">
                Trang {page} / {totalPages} • Hiển thị {categories.length} danh mục
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
      </div>
    </div>
  );
}

export default CategoryStock;