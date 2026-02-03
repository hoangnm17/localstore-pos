import { useState } from "react";
import FilterBar from "./Filter/FilterBar";
import ProductList from "./ProductList/ProductList";
import ProductVariant from "./ProductList/ProductVariantModal";

const PRODUCTS = [
  {
    id: 1,
    name: "Cà phê sữa",
    url: "https://via.placeholder.com/300",
    salePrice: 20000,
    variants: [
      { name: "Size S", quantity: 10 },
      { name: "Size M", quantity: 5 },
    ],
  },
  {
    id: 2,
    name: "Trà đào",
    url: "https://via.placeholder.com/300",
    salePrice: 25000,
    variants: [
      { name: "Ít đá", quantity: 8 },
      { name: "Nhiều đá", quantity: 12 },
      { name: "Ít khô", quantity: 11}
    ],
  },
  {
    id: 3,
    name: "Trà đào a",
    url: "https://via.placeholder.com/300",
    salePrice: 25000,
    variants: [
      { name: "Ít đá", quantity: 8 },
      { name: "Nhiều đá", quantity: 12 },
    ],
  }
];

export default function Product({ addItem }) {
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const filteredProducts = PRODUCTS.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="d-flex gap-3">
      {/* LEFT */}
      <div>
        <h5 className="mb-2">Sản phẩm</h5>

        <FilterBar value={search} onChange={setSearch} />

        <ProductList
          products={filteredProducts}
          selectedProduct={selectedProduct}
          onSelect={setSelectedProduct}
        />
      </div>

      {selectedProduct && (
        <ProductVariant
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAdd={(variant) => {
            addItem({
              productId: selectedProduct.id,
              productName: selectedProduct.name,
              variant: variant.name,
              unitPrice: selectedProduct.salePrice,
              lineTotal: selectedProduct.lineTotal,
            });

            setSelectedProduct(null);
          }}
        />
      )}

    </div>
  );
}
