import React, { useState, useEffect, useMemo } from "react";
import useDebounce from "hooks/common/useDebounce";
import { getProductWithBarcode } from "services/Product/product.service";
import { useNotification } from "components/global/Notification/NotificationContext";

const ITEMS_PER_PAGE = 4;

export default function FilterBar({
  keyword,
  onKeywordChange,
  categories = [],
  selectedCategory,
  onSelectCategory,
  addItem,
}) {
  const { showNotification } = useNotification();
  const [displayKeyword, setDisplayKeyword] = useState(keyword);
  const [categoryPage, setCategoryPage] = useState(1);

  const debouncedKeyword = useDebounce(displayKeyword, 500);


  const handleAddItem = async (keyword) => {
    try {
      const res = await getProductWithBarcode(keyword);
      if (res?.success) {
        const product = res.data;
        addItem({
          productId: product.id,
          productName: product.name,
          unitPrice: product.salePrice,
        });
      } else {
        showNotification(res?.message || "Sản phẩm không tồn tại!", "error")
      }

    } catch (err) {
      console.error("Scan error:", err);
    }
  };

  useEffect(() => {
    onKeywordChange(debouncedKeyword);
  }, [debouncedKeyword, onKeywordChange]);

  useEffect(() => {
    setDisplayKeyword(keyword);
  }, [keyword]);

  /* =========================
     CATEGORY PAGINATION (FE)
  ========================== */

  const totalPages = Math.ceil(categories.length / ITEMS_PER_PAGE);

  const displayCategories = useMemo(() => {
    const start = (categoryPage - 1) * ITEMS_PER_PAGE;
    return categories.slice(start, start + ITEMS_PER_PAGE);
  }, [categories, categoryPage]);

  // Reset page nếu categories thay đổi
  useEffect(() => {
    setCategoryPage(1);
  }, [categories]);

  return (
    <div className="w-100 mb-4">

      {/* SEARCH */}
      <div className="position-relative mb-4">
        <span
          className="position-absolute top-50 start-0 translate-middle-y ps-3 text-secondary"
          style={{ zIndex: 5, fontSize: "1.1rem" }}
        >
          <i className="bi bi-search"></i>
        </span>

        <input
          type="text"
          className="form-control form-control-lg border-0 shadow-sm ps-5 bg-white rounded-4"
          placeholder="Tìm tên món, mã sản phẩm..."
          value={displayKeyword}
          onChange={(e) => setDisplayKeyword(e.target.value)}
          style={{
            height: "55px",
            fontSize: "1rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddItem(displayKeyword)
            }
          }}
        />
      </div>

      {/* CATEGORY */}
      <div className="position-relative">

        {/* Nút trái */}
        {categoryPage > 1 && (
          <button
            className="btn btn-light position-absolute start-0 top-50 translate-middle-y shadow-sm"
            style={{ zIndex: 10 }}
            onClick={() => setCategoryPage((prev) => prev - 1)}
          >
            <i className="bi bi-chevron-left"></i>
          </button>
        )}

        <div
          className="d-flex gap-2 px-4"
          style={{ whiteSpace: "nowrap" }}
        >
          {/* TẤT CẢ */}
          <button
            className={`btn rounded-pill px-4 py-2 fw-bold border-0 ${!selectedCategory
              ? "btn-primary shadow"
              : "btn-light text-secondary bg-white shadow-sm"
              }`}
            onClick={() => onSelectCategory(null)}
          >
            TẤT CẢ
          </button>

          {displayCategories.map((cat) => {
            const isActive = selectedCategory?.id === cat.id;

            return (
              <button
                key={cat.id}
                className={`btn rounded-pill px-4 py-2 fw-bold border-0 ${isActive
                  ? "btn-primary shadow"
                  : "btn-light text-secondary bg-white shadow-sm"
                  }`}
                onClick={() => onSelectCategory(cat)}
              >
                {cat.name.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* Nút phải */}
        {categoryPage < totalPages && (
          <button
            className="btn btn-light position-absolute end-0 top-50 translate-middle-y shadow-sm"
            style={{ zIndex: 10 }}
            onClick={() => setCategoryPage((prev) => prev + 1)}
          >
            <i className="bi bi-chevron-right"></i>
          </button>
        )}
      </div>
    </div>
  );
}