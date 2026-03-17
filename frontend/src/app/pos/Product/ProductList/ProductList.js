import React, { memo, useState } from "react";
import ProductUnitModal from "./ProductUnitModal.js";
import ProductCard from "components/pos/Product/ProductCard.js";

const ProductList = ({ products = [], onSelect }) => {
  const [targetProduct, setTargetProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleCardClick = (product, hasMultipleUnits) => {
    if (hasMultipleUnits) {
      setTargetProduct(product);
      setShowModal(true);
    } else {
      const singleUnit = product.units[0];
      onSelect(product, singleUnit);
    }
  };

  const handleSelectUnit = (product, unit) => {
    onSelect(product, unit);
    setShowModal(false);
  };

  return (
    <div className="d-flex flex-wrap gap-4 justify-content-start">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onSelect={handleCardClick}
        />
      ))}

      <ProductUnitModal
        show={showModal}
        product={targetProduct}
        onHide={() => setShowModal(false)}
        onSelectUnit={handleSelectUnit}
      />
    </div>
  );
};

export default memo(ProductList);