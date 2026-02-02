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
    ],
  },
    {
    id: 2,
    name: "Trà đào a",
    url: "https://via.placeholder.com/300",
    salePrice: 25000,
    variants: [
      { name: "Ít đá", quantity: 8 },
      { name: "Nhiều đá", quantity: 12 },
    ],
  }
];

export default function Product() {
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const filteredProducts = PRODUCTS.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="d-flex gap-3">
      {/* LEFT */}
      <div style={{ width: 300 }}>
        <h5 className="mb-2">Sản phẩm</h5>

        <FilterBar value={search} onChange={setSearch} />

        <ProductList
          products={filteredProducts}
          selectedProduct={selectedProduct}
          onSelect={setSelectedProduct}
        />
      </div>

      {/* RIGHT – chỉ hiện khi đã chọn sản phẩm */}
      {selectedProduct && (
        <ProductVariant
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAdd={(variant) => {
            console.log("Add:", variant);
            setSelectedProduct(null);
          }}
        />
      )}

    </div>
  );
}
