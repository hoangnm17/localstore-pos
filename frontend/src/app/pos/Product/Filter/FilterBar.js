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
        if (product.quantityOnHand > 0) {
          addItem({
            productId: product.id,
            productName: product.name,
            unitPrice: product.salePrice,
          });
        } else {
          showNotification(res?.message || "Sản phẩm hết hàng!", "error");
        }

      } else {
        showNotification(res?.message || "Sản phẩm không tồn tại!", "error");
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

  /* CATEGORY PAGINATION */

  const totalPages = Math.ceil(categories.length / ITEMS_PER_PAGE);

  const displayCategories = useMemo(() => {
    const start = (categoryPage - 1) * ITEMS_PER_PAGE;
    return categories.slice(start, start + ITEMS_PER_PAGE);
  }, [categories, categoryPage]);

  useEffect(() => {
    setCategoryPage(1);
  }, [categories]);

  return (
    <div className="w-100 mb-4">

      {/* SEARCH */}
      <div className="position-relative mb-4">

        <i
          className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary"
          style={{ fontSize: "1.2rem", zIndex: 5 }}
        />

        <input
          type="text"
          className="form-control border-0 rounded-pill shadow-sm ps-5 pe-5"
          placeholder="Tìm sản phẩm..."
          value={displayKeyword}
          onChange={(e) => setDisplayKeyword(e.target.value)}
          style={{
            height: "50px",
            fontSize: "0.95rem",
            background: "#f9fafb",
            transition: "all .2s",
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddItem(displayKeyword);
            }
          }}
        />

        {/* CLEAR BUTTON */}
        {displayKeyword && (
          <button
            className="btn position-absolute top-50 end-0 translate-middle-y me-2"
            onClick={() => setDisplayKeyword("")}
          >
            <i className="bi bi-x-circle text-secondary"></i>
          </button>
        )}
      </div>

      {/* CATEGORY */}
      <div className="position-relative">

        {/* LEFT BUTTON */}
        {categoryPage > 1 && (
          <button
            className="btn btn-light position-absolute start-0 top-50 translate-middle-y shadow-sm rounded-circle"
            style={{ zIndex: 10 }}
            onClick={() => setCategoryPage((prev) => prev - 1)}
          >
            <i className="bi bi-chevron-left"></i>
          </button>
        )}

        <div
          className="d-flex gap-2 px-4"
          style={{
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          {/* ALL */}
          <button
            className={`btn rounded-pill px-4 fw-semibold ${!selectedCategory
                ? "btn-primary shadow-sm"
                : "btn-light border text-secondary"
              }`}
            style={{
              transition: "all .2s",
            }}
            onClick={() => onSelectCategory(null)}
          >
            TẤT CẢ
          </button>

          {displayCategories.map((cat) => {
            const isActive = selectedCategory?.id === cat.id;

            return (
              <button
                key={cat.id}
                className={`btn rounded-pill px-4 fw-semibold ${isActive
                    ? "btn-primary shadow-sm"
                    : "btn-light border text-secondary"
                  }`}
                style={{
                  transition: "all .2s",
                }}
                onClick={() => onSelectCategory(cat)}
              >
                {cat.name.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* RIGHT BUTTON */}
        {categoryPage < totalPages && (
          <button
            className="btn btn-light position-absolute end-0 top-50 translate-middle-y shadow-sm rounded-circle"
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