import React, { memo } from "react";
import { formatCurrency } from "../../../../utils/formatters";

const ProductCard = ({ product, isSelected, onSelect }) => {
  const variants = product?.variants || [];
  const variantCount = variants.length;

  let displayPrice = null;

  // Chỉ hiển thị giá nếu đúng 1 variant
  if (variantCount === 1) {
    displayPrice = Number(variants[0]?.price);
  }

  return (
    <div
      onClick={() => onSelect(product)}
      className={`position-relative rounded-4 overflow-hidden border shadow-sm transition-all ${
        isSelected ? "border-primary border-3 ring-active" : "border-light"
      }`}
      style={{
        width: 150,
        height: 180,
        cursor: "pointer",
        backgroundColor: "#fff",
      }}
    >
      {/* IMAGE */}
      <img
        src={product?.imageUrl || "https://via.placeholder.com/150"}
        alt={product?.name}
        className="w-100 h-100 object-fit-cover"
      />

      {/* GRADIENT */}
      <div
        className="position-absolute bottom-0 start-0 w-100"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)",
          height: "65%",
        }}
      />

      {/* VARIANT BADGE */}
      <div className="position-absolute top-0 end-0 p-2">
        <span
          className="badge rounded-pill bg-primary shadow-sm"
          style={{ fontSize: "0.7rem" }}
        >
          {variantCount} mẫu
        </span>
      </div>

      {/* BOTTOM INFO */}
      <div className="position-absolute bottom-0 start-0 w-100 p-2 text-white">
        <div
          className="fw-bold text-truncate mb-0"
          style={{ fontSize: "0.9rem" }}
        >
          {product?.name}
        </div>

        {displayPrice != null && (
          <div className="small text-warning fw-semibold">
            {formatCurrency(displayPrice)}
          </div>
        )}
      </div>

      {/* SELECTED ICON */}
      {isSelected && (
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