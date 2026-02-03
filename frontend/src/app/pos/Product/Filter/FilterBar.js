export default function FilterBar({
  keyword,
  onKeywordChange,
  categories,
  selectedCategory,
  onSelectCategory,
}) {
  return (
    <div className="w-100 mb-4">
      {/* Thanh tìm kiếm - Đã bỏ giới hạn width để full khối cha */}
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
          value={keyword}
          style={{ 
            height: '55px', 
            fontSize: '1rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)' 
          }}
          onChange={(e) => onKeywordChange(e.target.value)}
        />
      </div>

      {/* Danh mục sản phẩm - Dạng chip hiện đại */}
      <div className="d-flex gap-2 flex-wrap align-items-center">
        <button
          className={`btn rounded-pill px-4 py-2 fw-bold transition-all border-0 ${
            !selectedCategory 
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
              className={`btn rounded-pill px-4 py-2 fw-bold transition-all border-0 ${
                isActive 
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

      <style jsx>{`
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