import React, { memo, useMemo } from "react";
import { formatCurrency } from "utils/formatters";
import { LOW_STOCK_THRESHOLD } from "config/stock";

const ProductCard = ({ product, isSelected, onSelect }) => {
  const {
    name,
    imageUrl,
    salePrice,
    stockQuantity = 0,
  } = product || {};

  const stockStatus = useMemo(() => {
    if (stockQuantity <= 0) return "OUT_OF_STOCK";
    if (stockQuantity <= LOW_STOCK_THRESHOLD) return "LOW_STOCK";
    return "NORMAL";
  }, [stockQuantity]);

  const isOut = stockStatus === "OUT_OF_STOCK";
  const isLowStock = stockStatus === "LOW_STOCK";

  const handleClick = () => {
    if (isOut) return;
    onSelect(product);
  };

  const getStockBadgeClass = () => {
    if (isOut) return "bg-danger";
    if (isLowStock) return "bg-warning text-dark";
    return "bg-success";
  };

  const getStockText = () => {
    if (isOut) return "Hết hàng";
    if (isLowStock) return `Sắp hết (${stockQuantity})`;
    return `Tồn: ${stockQuantity}`;
  };

  return (
    <div
      onClick={handleClick}
      className={`position-relative rounded-4 overflow-hidden border shadow-sm transition-all 
        ${isSelected ? "border-primary border-3 ring-active" : "border-light"}
        ${isOut ? "opacity-50" : ""}
      `}
      style={{
        width: 150,
        height: 190,
        cursor: isOut ? "not-allowed" : "pointer",
        backgroundColor: "#fff",
      }}
    >
      {/* IMAGE */}
      <img
        src={imageUrl || "https://via.placeholder.com/150"}
        alt={name}
        className="w-100 h-100 object-fit-cover"
      />

      {/* STOCK BADGE */}
      <div className="position-absolute top-0 end-0 m-2">
        <span className={`badge ${getStockBadgeClass()}`}>
          {getStockText()}
        </span>
      </div>

      {/* GRADIENT */}
      <div
        className="position-absolute bottom-0 start-0 w-100"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)",
          height: "65%",
        }}
      />

      {/* INFO */}
      <div className="position-absolute bottom-0 start-0 w-100 p-2 text-white">
        <div
          className="fw-bold text-truncate"
          style={{ fontSize: "0.9rem" }}
        >
          {name}
        </div>

        <div className="small text-warning fw-semibold">
          {formatCurrency(salePrice || 0)}
        </div>
      </div>

      {/* SELECTED */}
      {isSelected && !isOut && (
        <div className="position-absolute top-0 start-0 m-2">
          <div
            className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: 20, height: 20 }}
          >
            <i
              className="bi bi-check-lg"
              style={{ fontSize: "0.8rem" }}
            ></i>
          </div>
        </div>
      )}

      <style>{`
        .transition-all { transition: all 0.2s ease; }
        .ring-active {
          box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.25);
        }
      `}</style>
    </div>
  );
};

export default memo(ProductCard);