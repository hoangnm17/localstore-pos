export default function ProductList({ products, selectedProduct, onSelect }) {
  return (
    <div className="d-flex flex-wrap gap-3 justify-content-start">
      {products?.map((product) => {
        const isSelected = selectedProduct?.id === product.id;

        return (
          <div
            key={product.id}
            onClick={() => onSelect(product)}
            className={`position-relative rounded-4 overflow-hidden border transition-all shadow-sm ${
              isSelected ? "border-primary border-3 ring-active" : "border-light"
            }`}
            style={{ 
              width: 150, 
              height: 180, 
              cursor: "pointer",
              backgroundColor: "#fff"
            }}
          >
            {/* Image - Giữ nguyên độ sáng */}
            <img
              src={product.url || 'https://via.placeholder.com/150'}
              alt={product.name}
              className="w-100 h-100 object-fit-cover"
            />

            {/* Gradient Overlay - Chỉ làm tối vùng dưới để đọc chữ */}
            <div 
              className="position-absolute bottom-0 start-0 w-100 h-60"
              style={{
                background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)",
                height: "65%"
              }}
            ></div>

            {/* Top right badge - Số lượng biến thể */}
            <div className="position-absolute top-0 end-0 p-2">
              <span className="badge rounded-pill bg-primary shadow-sm" style={{ fontSize: '0.7rem' }}>
                {product.variants?.length || 0} mẫu
              </span>
            </div>

            {/* Bottom Info */}
            <div className="position-absolute bottom-0 start-0 w-100 p-2 text-white">
              <div className="fw-bold text-truncate mb-0" style={{ fontSize: '0.9rem' }}>
                {product.name}
              </div>
              <div className="small text-warning fw-semibold">
                {new Intl.NumberFormat('vi-VN').format(product.salePrice)}đ
              </div>
            </div>

            {/* Selected Tick - Hiển thị dấu check khi được chọn */}
            {isSelected && (
              <div className="position-absolute top-0 start-0 m-2">
                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: 20, height: 20 }}>
                  <i className="bi bi-check-lg" style={{ fontSize: '0.8rem' }}></i>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <style jsx>{`
        .transition-all { transition: all 0.2s ease; }
        .shadow-sm-hover:hover { 
          transform: translateY(-3px); 
          box-shadow: 0 4px 15px rgba(0,0,0,0.1) !important; 
        }
        .ring-active {
          box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.25);
        }
      `}</style>
    </div>
  );
}