export default function ProductList({ products, selectedProduct, onSelect }) {
  return (
    <div className="d-flex flex-wrap gap-3">
      {products?.map((product) => (
        <div
          key={product.id}
          onClick={() => onSelect(product)}
          className={`position-relative rounded overflow-hidden border ${
            selectedProduct?.id === product.id
              ? "border-primary border-2"
              : "border-secondary"
          }`}
          style={{ width: 160, height: 160, cursor: "pointer" }}
        >
          {/* Image */}
          <img
            src={product.url}
            alt={product.name}
            className="w-100 h-100 object-fit-cover"
          />

          {/* Dark overlay */}
          <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-50"></div>

          {/* Top right badge */}
          <div className="position-absolute top-0 end-0 p-1">
            <div className="small bg-dark bg-opacity-75 text-white rounded px-2">
              3 mặt hàng
            </div>
          </div>

          {/* Bottom center text */}
          <div className="position-absolute bottom-0 start-0 w-100 text-center text-white pb-2">
            <div className="small">{product.salePrice} đ</div>
            <div className="fw-bold">{product.name}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
