import React, { useState, useEffect, useRef } from "react";
import useDebounce from "hooks/common/useDebounce";

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
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  const debouncedKeyword = useDebounce(displayKeyword, 500);

  useEffect(() => {
    if (focusSignal) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [focusSignal]);

  useEffect(() => {
    setDisplayKeyword(keyword);
  }, [keyword]);

  useEffect(() => {
    onKeywordChange(debouncedKeyword);
  }, [debouncedKeyword, onKeywordChange]);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 200; 
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="filter-bar-container w-100 mb-4">
      {/* Search Input */}
      <div className="search-wrapper mb-3">
        <div className="input-group shadow-sm rounded-pill overflow-hidden border">
          <span className="input-group-text bg-white border-0 ps-3">
            <i className="bi bi-search text-primary"></i>
          </span>
          <input
            ref={inputRef}
            type="text"
            className="form-control border-0 py-2"
            placeholder="Tìm tên sản phẩm hoặc mã vạch..."
            value={displayKeyword}
            onChange={(e) => setDisplayKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addItem(displayKeyword);
              }
            }}
            style={{ boxShadow: "none" }}
          />
          {displayKeyword && (
            <button
              className="btn bg-white border-0 text-secondary"
              onClick={() => {
                setDisplayKeyword("");
                inputRef.current?.focus();
              }}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          )}
        </div>
      </div>

      {/* Category Navigation - CHỐNG ĐÈ NHAU */}
      <div className="d-flex align-items-center gap-2">
        {/* Nút Trái */}
        <button
          className="btn btn-outline-primary rounded-circle d-none d-md-flex align-items-center justify-content-center flex-shrink-0"
          onClick={() => handleScroll("left")}
          style={{ width: "38px", height: "38px" }}
        >
          <i className="bi bi-chevron-left"></i>
        </button>

        {/* Danh sách cuộn */}
        <div
          ref={scrollRef}
          className="category-scroll-viewport d-flex gap-2 overflow-hidden no-scrollbar py-1"
          style={{ scrollBehavior: "smooth" }}
        >
          <button
            className={`btn rounded-pill px-4 flex-shrink-0 fw-bold transition-all ${
              !selectedCategory
                ? "btn-primary shadow-sm"
                : "btn-outline-secondary border-light-subtle text-uppercase"
            }`}
            onClick={() => onSelectCategory(null)}
          >
            TẤT CẢ
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`btn rounded-pill px-4 flex-shrink-0 fw-bold transition-all text-uppercase ${
                selectedCategory?.id === cat.id
                  ? "btn-primary shadow-sm"
                  : "btn-outline-secondary border-light-subtle"
              }`}
              onClick={() => onSelectCategory(cat)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Nút Phải */}
        <button
          className="btn btn-outline-primary rounded-circle d-none d-md-flex align-items-center justify-content-center flex-shrink-0"
          onClick={() => handleScroll("right")}
          style={{ width: "38px", height: "38px" }}
        >
          <i className="bi bi-chevron-right"></i>
        </button>
      </div>

      <style jsx>{`
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .category-scroll-viewport {
          flex: 1; /* Để danh sách chiếm trọn không gian ở giữa */
        }
        .transition-all {
          transition: all 0.2s ease;
        }
        .btn-outline-secondary {
          color: #6c757d;
          background: #fff;
        }
        .btn-outline-secondary:hover {
          background-color: #f8f9fa;
          border-color: #0d6efd;
          color: #0d6efd;
        }
      `}</style>
    </div>
  );
}