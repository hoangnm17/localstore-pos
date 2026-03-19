import React, { memo, useMemo } from "react";
import { formatCurrency } from "utils/formatters";

const ProductCard = ({
  product,
  isSelected = false,
  onSelect = () => {},
  showStock = true,
  showUnits = true,
  showPrice = true,
  disableOutStyle = false,
  selectable = true,
}) => {
  const {
    name = "Sản phẩm không tên",
    imageUrl = "",
    stock = 0,
    units = [],
    lowStock = false,
  } = product || {};

  const baseUnit = useMemo(() => {
    return units.find((u) => u.factor === 1) || units[0];
  }, [units]);

  const displayName = baseUnit ? `${name} - ${baseUnit.unitName}` : name;

  const hasMultipleUnits = units.length > 1;

  const stockStatus = useMemo(() => {
    if (stock <= 0) return "OUT_OF_STOCK";
    if (lowStock) return "LOW_STOCK";
    return "NORMAL";
  }, [stock, lowStock]);

  const isOut = stockStatus === "OUT_OF_STOCK";
  const isLowStock = stockStatus === "LOW_STOCK";

  const disabled = selectable && isOut && !disableOutStyle;

  const handleClick = () => {
    if (disabled) return;
    onSelect(product, hasMultipleUnits);
  };

  const getStockBadgeClass = () => {
    if (isOut) return "bg-danger";
    if (isLowStock) return "bg-warning text-dark";
    return "bg-success";
  };

  return (
    <div
      onClick={handleClick}
      className={`position-relative rounded-4 overflow-hidden border shadow-sm transition-all 
        ${isSelected ? "border-primary border-3 ring-active" : "border-light"}
        ${disabled ? "opacity-50 grayscale" : "hover-up"}
      `}
      style={{
        width: 150,
        height: 150,
        cursor: disabled ? "not-allowed" : selectable ? "pointer" : "default",
        backgroundColor: "#fff",
      }}
    >
      {/* IMAGE */}
      <img
        src={imageUrl || "https://via.placeholder.com/150"}
        alt={name}
        className="w-100 h-100 object-fit-cover"
      />

      {/* MULTIPLE UNIT BADGE */}
      {showUnits && hasMultipleUnits && !disabled && (
        <div className="position-absolute top-0 start-0 m-1">
          <span className="badge bg-info text-dark" style={{ fontSize: "0.65rem" }}>
            {units.length} Đơn vị
          </span>
        </div>
      )}

      {/* STOCK BADGE */}
      {showStock && (
        <div className="position-absolute top-0 end-0 m-1">
          <span className={`badge ${getStockBadgeClass()}`} style={{ fontSize: "0.65rem" }}>
            {isOut ? "Hết" : isLowStock ? `Sắp hết (${stock})` : `Tồn: ${stock}`}
          </span>
        </div>
      )}

      {/* GRADIENT */}
      <div
        className="position-absolute bottom-0 start-0 w-100"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)",
          height: "60%",
        }}
      />

      {/* PRODUCT INFO */}
      <div className="position-absolute bottom-0 start-0 w-100 p-2 text-white">
        <div
          className="fw-bold text-truncate"
          style={{ fontSize: "0.85rem", lineHeight: "1.2" }}
          title={displayName}
        >
          {displayName}
        </div>

        {showPrice && (
          <div className="mt-1 d-flex align-items-center gap-1 flex-wrap">
            {baseUnit?.discountedPrice < baseUnit?.price ? (
              <>
                <div className="small text-warning fw-semibold">
                  {formatCurrency(baseUnit.discountedPrice)}
                </div>
                <div className="text-white opacity-50 text-decoration-line-through" style={{ fontSize: '0.65rem' }}>
                  {formatCurrency(baseUnit.price)}
                </div>
              </>
            ) : (
              <div className="small text-warning fw-semibold">
                {formatCurrency(baseUnit?.price || 0)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SELECTED ICON */}
      {isSelected && !disabled && (
        <div className="position-absolute top-50 start-50 translate-middle">
          <div
            className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow"
            style={{ width: 30, height: 30, opacity: 0.9 }}
          >
            <i className="bi bi-check-lg" style={{ fontSize: "1.2rem" }}></i>
          </div>
        </div>
      )}

      <style>{`
        .transition-all { transition: all 0.25s ease; }
        .hover-up:hover { transform: translateY(-3px); }
        .grayscale { filter: grayscale(1); }
        .ring-active {
          box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.2);
        }
      `}</style>
    </div>
  );
};

export default memo(ProductCard);