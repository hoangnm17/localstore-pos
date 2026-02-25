import React, { memo } from "react";
import ProductCard from "./ProductCard.js";

const ProductList = ({ products = [], selectedProduct, onSelect }) => {
  return (
    <div className="d-flex flex-wrap gap-3 justify-content-start">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isSelected={selectedProduct?.id === product.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};

export default memo(ProductList);