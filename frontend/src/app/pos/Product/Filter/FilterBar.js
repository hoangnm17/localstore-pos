import React, { useState, useEffect, useRef, useMemo } from "react";
import useDebounce from "hooks/common/useDebounce";

export default function FilterBar({
  keyword,
  onKeywordChange,
  categories = [],
  selectedCategory,
  onSelectCategory,
  addItem,
  preventFocus,
  allProducts = [],
  onFilteredResults,
}) {
  const [displayKeyword, setDisplayKeyword] = useState(keyword);
  const inputRef = useRef(null);

  const [catPage, setCatPage] = useState(0);
  const catsPerPage = 4;

  useEffect(() => {
    setDisplayKeyword(keyword);
  }, [keyword]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setDisplayKeyword(val);
    onKeywordChange(val);
  };

  const visibleCategories = useMemo(() => {
    const start = catPage * catsPerPage;
    return categories.slice(start, start + catsPerPage);
  }, [categories, catPage]);

  const totalCatPages = Math.ceil(categories.length / catsPerPage);

  const [prodPage, setProdPage] = useState(1);
  const prodsPerPage = 12;

  const debouncedKeyword = useDebounce(displayKeyword, 500);

  const { currentItems, totalProdPages } = useMemo(() => {
    const filtered = allProducts.filter((item) => {
      const matchCat = !selectedCategory || item.categoryId === selectedCategory.id;
      const matchKey = item.name.toLowerCase().includes(debouncedKeyword.toLowerCase());
      return matchCat && matchKey;
    });

    const lastIndex = prodPage * prodsPerPage;
    const firstIndex = lastIndex - prodsPerPage;
    
    const slicedItems = filtered.slice(firstIndex, lastIndex);
    
    if (onFilteredResults) onFilteredResults(slicedItems);

    return {
      currentItems: slicedItems,
      totalProdPages: Math.ceil(filtered.length / prodsPerPage) || 1
    };
  }, [allProducts, selectedCategory, debouncedKeyword, prodPage, onFilteredResults]);

  useEffect(() => {
    setProdPage(1);
  }, [selectedCategory, debouncedKeyword]);

  useEffect(() => {
    const handleFocus = () => {
      if (window.isModalOpen > 0) return;
      setTimeout(() => {
        if (!window.isModalOpen || window.isModalOpen === 0) {
          inputRef.current?.focus();
        }
      }, 150);
    };
    window.addEventListener("RE_FOCUS_SEARCH", handleFocus);
    const handleGlobalClick = (e) => {
      if (!['INPUT', 'TEXTAREA'].includes(e.target.tagName)) handleFocus();
    };
    window.addEventListener("click", handleGlobalClick);
    handleFocus();
    return () => {
      window.removeEventListener("RE_FOCUS_SEARCH", handleFocus);
      window.removeEventListener("click", handleGlobalClick);
    };
  }, []);

  return (
    <div className="filter-bar-container w-100">
      <div className="search-wrapper mb-3">
        <div className="input-group shadow-sm rounded-pill overflow-hidden border bg-white">
          <span className="input-group-text bg-white border-0 ps-3">
            <i className="bi bi-search text-primary"></i>
          </span>
          <input
            ref={inputRef}
            type="text"
            className="form-control border-0 py-2"
            placeholder="Tìm tên hoặc mã vạch..."
            value={displayKeyword}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addItem(displayKeyword);
                setDisplayKeyword("");
                onKeywordChange("");
              }
            }}
          />
        </div>
      </div>

      <div className="d-flex align-items-center gap-2 mb-3">
        <button
          className="btn btn-sm btn-outline-primary rounded-circle"
          disabled={catPage === 0}
          onClick={() => setCatPage(p => p - 1)}
          style={{ width: '32px', height: '32px' }}
        >
          <i className="bi bi-chevron-left"></i>
        </button>

        <div className="d-flex gap-2 flex-grow-1 justify-content-center">
          {catPage === 0 && (
            <button
              className={`btn btn-sm rounded-pill px-3 fw-bold ${!selectedCategory ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => onSelectCategory(null)}
            >
              TẤT CẢ
            </button>
          )}
          
          {visibleCategories.map((cat) => (
            <button
              key={cat.id}
              className={`btn btn-sm rounded-pill px-3 text-uppercase fw-bold ${selectedCategory?.id === cat.id ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => onSelectCategory(cat)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <button
          className="btn btn-sm btn-outline-primary rounded-circle"
          disabled={catPage >= totalCatPages - 1}
          onClick={() => setCatPage(p => p + 1)}
          style={{ width: '32px', height: '32px' }}
        >
          <i className="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>
  );
}