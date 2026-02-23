import React, { useState, useEffect } from "react";
import useDebounce from "hooks/common/useDebounce";

export default function FilterBar({
  keyword,
  onKeywordChange,
  categories,
  selectedCategory,
  onSelectCategory,
}) {
  const [displayKeyword, setDisplayKeyword] = useState(keyword);

  const debouncedKeyword = useDebounce(displayKeyword, 500);

  useEffect(() => {
    onKeywordChange(debouncedKeyword);
  }, [debouncedKeyword, onKeywordChange]);

  useEffect(() => {
    setDisplayKeyword(keyword);
  }, [keyword]);

  return (
    <div className="w-100 mb-4">
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
          placeholder="Tìm tên món, mã sản phẩm hoặc mô tả..."
          value={displayKeyword}
          onChange={(e) => setDisplayKeyword(e.target.value)}
          style={{
            height: "55px",
            fontSize: "1rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          }}
        />
      </div>

      {/* Category giữ nguyên */}
      <div className="d-flex gap-2 flex-wrap align-items-center">
        <button
          className={`btn rounded-pill px-4 py-2 fw-bold border-0 ${
            !selectedCategory
              ? "btn-primary shadow"
              : "btn-light text-secondary bg-white shadow-sm"
          }`}
          onClick={() => onSelectCategory(null)}
        >
          TẤT CẢ
        </button>

        {categories?.map((cat) => {
          const isActive = selectedCategory?.id === cat.id;

          return (
            <button
              key={cat.id}
              className={`btn rounded-pill px-4 py-2 fw-bold border-0 ${
                isActive
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
    </div>
  );
}