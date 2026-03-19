import React, { useState, useEffect, useRef } from "react";
import useDebounce from "hooks/common/useDebounce";

const ITEMS_PER_PAGE = 4;

export default function FilterBar({
  keyword,
  onKeywordChange,
  categories = [],
  selectedCategory,
  onSelectCategory,
  addItem,
  focusSignal,
}) {
  const [displayKeyword, setDisplayKeyword] = useState(keyword);
  const [categoryPage, setCategoryPage] = useState(0);

  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  const debouncedKeyword = useDebounce(displayKeyword, 500);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [focusSignal]);

  useEffect(() => {
    setDisplayKeyword(keyword);
  }, [keyword]);

  useEffect(() => {
    onKeywordChange(debouncedKeyword);
  }, [debouncedKeyword, onKeywordChange]);

  // reset page khi categories thay đổi
  useEffect(() => {
    setCategoryPage(0);
  }, [categories]);

  // danh sách category hiển thị (4 cái)
  const visibleCategories = categories.slice(
    categoryPage * ITEMS_PER_PAGE,
    (categoryPage + 1) * ITEMS_PER_PAGE
  );

  const maxPage = Math.ceil(categories.length / ITEMS_PER_PAGE) - 1;

  return (
    <div className="filter-bar-container w-100 mb-4">
      <div className="search-wrapper position-relative mb-4">
        <div className="input-group shadow-sm rounded-pill overflow-hidden border-0">
          <span className="input-group-text bg-light border-0 ps-3">
            <i className="bi bi-search text-primary"></i>
          </span>
          <input
            ref={inputRef}
            type="text"
            className="form-control border-0 bg-light py-2"
            placeholder="Tìm tên sản phẩm hoặc mã vạch..."
            value={displayKeyword}
            onChange={(e) => setDisplayKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                addItem(displayKeyword);
              }
            }}
            style={{ fontSize: "1rem", boxShadow: "none" }}
          />
          {displayKeyword && (
            <button
              className="btn bg-light border-0 text-secondary"
              onClick={() => setDisplayKeyword("")}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          )}
        </div>
      </div>

      <div className="category-scroll-container position-relative d-flex align-items-center">
        <button
          className="btn btn-sm btn-white shadow-sm rounded-circle d-none d-md-block position-absolute start-0"
          onClick={() => setCategoryPage(prev => Math.max(prev - 1, 0))}
          disabled={categoryPage === 0}
          style={{ zIndex: 2, left: "-15px" }}
        >
          <i className="bi bi-chevron-left"></i>
        </button>

        <div
          ref={scrollRef}
          className="category-list d-flex gap-2 overflow-hidden no-scrollbar pb-2"
        >
          <button
            className={`btn rounded-pill px-4 flex-shrink-0 fw-bold transition-all ${
              !selectedCategory
                ? "btn-primary shadow"
                : "btn-outline-secondary border-light-subtle"
            }`}
            onClick={() => onSelectCategory(null)}
          >
            TẤT CẢ
          </button>

          {visibleCategories.map((cat) => (
            <button
              key={cat.id}
              className={`btn rounded-pill px-4 flex-shrink-0 fw-bold transition-all ${
                selectedCategory?.id === cat.id
                  ? "btn-primary shadow"
                  : "btn-outline-secondary border-light-subtle"
              }`}
              onClick={() => onSelectCategory(cat)}
            >
              {cat.name.toUpperCase()}
            </button>
          ))}
        </div>

        <button
          className="btn btn-sm btn-white shadow-sm rounded-circle d-none d-md-block position-absolute end-0"
          onClick={() =>
            setCategoryPage(prev =>
              prev < maxPage ? prev + 1 : prev
            )
          }
          disabled={categoryPage === maxPage}
          style={{ zIndex: 2, right: "-15px" }}
        >
          <i className="bi bi-chevron-right"></i>
        </button>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .transition-all { transition: all 0.25s ease-in-out; }
        .btn-outline-secondary:hover { background-color: #f8f9fa; color: #0d6efd; }
        .category-list { padding: 5px; }
      `}</style>
    </div>
  );
}