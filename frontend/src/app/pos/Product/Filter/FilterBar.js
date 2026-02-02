export default function FilterBar({
  keyword,
  onKeywordChange,
  categories,
  selectedCategory,
  onSelectCategory,
}) {
  return (
    <div className="mb-3">
      {/* Search */}
      <input
        type="text"
        className="form-control mb-2"
        placeholder="Tìm sản phẩm..."
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
      />

      {/* Categories */}
      <div className="d-flex gap-2 flex-wrap">
        <button
          className={`btn ${
            !selectedCategory ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => onSelectCategory(null)}
        >
          Tất cả
        </button>

        {categories?.map((cat) => (
          <button
            key={cat.id}
            className={`btn ${
              selectedCategory?.id === cat.id
                ? "btn-primary"
                : "btn-outline-primary"
            }`}
            onClick={() => onSelectCategory(cat)}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
