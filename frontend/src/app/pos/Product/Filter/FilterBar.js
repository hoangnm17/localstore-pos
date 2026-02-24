import React from "react";
import { useState, useEffect } from "react";

export default function FilterBar({
  keyword,
  onKeywordChange,
  categories,
  selectedCategory,
  onSelectCategory,
}) {
  // State nội bộ để gõ phím mượt mà (Controlled input local)
  const [displayKeyword, setDisplayKeyword] = useState(keyword);

  // ✅ LOGIC DEBOUNCE
  useEffect(() => {
    const handler = setTimeout(() => {
      onKeywordChange(displayKeyword);
    }, 300);

    return () => clearTimeout(handler);
  }, [displayKeyword, onKeywordChange]);

  // ✅ ĐỒNG BỘ NGƯỢC
  // Nếu cha reset keyword (vd: bấm nút xóa bộ lọc), state nội bộ phải cập nhật theo
  useEffect(() => {
    setDisplayKeyword(keyword);
  }, [keyword]);

  return (
    <div className="w-100 mb-4">
      {/* Thanh tìm kiếm */}
      <div className="position-relative mb-4">
        <span
          className="position-absolute top-50 start-0 translate-middle-y ps-3 text-secondary"
          style={{ zIndex: 5, fontSize: '1.1rem' }}
        >
          <i className="bi bi-search"></i>
        </span>
        <input
          type="text"
          className="form-control form-control-lg border-0 shadow-sm ps-5 bg-white rounded-4"
          placeholder="Tìm tên món, mã sản phẩm hoặc mô tả..."
          // ⬇️ SỬA Ở ĐÂY: Dùng state nội bộ thay vì prop từ cha
          value={displayKeyword} 
          style={{
            height: '55px',
            fontSize: '1rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}
          // ⬇️ SỬA Ở ĐÂY: Chỉ cập nhật state nội bộ, useEffect sẽ lo việc báo lên cha sau 300ms
          onChange={(e) => setDisplayKeyword(e.target.value)} 
        />
      </div>

      {/* Danh mục sản phẩm - Dạng chip hiện đại */}
      <div className="d-flex gap-2 flex-wrap align-items-center">
        <button
          className={`btn rounded-pill px-4 py-2 fw-bold transition-all border-0 ${!selectedCategory
              ? "btn-primary shadow"
              : "btn-light text-secondary bg-white shadow-sm"
            }`}
          style={{ fontSize: '0.85rem', letterSpacing: '0.3px' }}
          onClick={() => onSelectCategory(null)}
        >
          TẤT CẢ
        </button>

        {categories?.map((cat) => {
          const isActive = selectedCategory?.id === cat.id;
          return (
            <button
              key={cat.id}
              className={`btn rounded-pill px-4 py-2 fw-bold transition-all border-0 ${isActive
                  ? "btn-primary shadow"
                  : "btn-light text-secondary bg-white shadow-sm"
                }`}
              style={{ fontSize: '0.85rem', letterSpacing: '0.3px' }}
              onClick={() => onSelectCategory(cat)}
            >
              {cat.name.toUpperCase()}
            </button>
          );
        })}
      </div>

      <style jsx="true">{`
        .transition-all {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn:hover {
          transform: translateY(-2px);
        }
        .btn-light:hover {
          background-color: #fff !important;
          color: #0d6efd !important;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1) !important;
        }
        .form-control:focus {
          box-shadow: 0 8px 20px rgba(13, 110, 253, 0.1) !important;
          background-color: #fff !important;
        }
      `}</style>
    </div>
  );
}