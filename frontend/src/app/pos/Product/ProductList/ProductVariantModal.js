export default function ProductVariant({ product, onClose, onAdd }) {
  if (!product) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: "500px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-lg rounded-4">
          
          {/* HEADER: Hiển thị tên sản phẩm nổi bật */}
          <div className="modal-header border-0 pt-4 px-4 pb-0">
            <div>
              <h5 className="fw-bold mb-0">{product.name}</h5>
              <small className="text-muted">Vui lòng chọn một phiên bản</small>
            </div>
            <button className="btn-close shadow-none" onClick={onClose} />
          </div>

          <div className="modal-body p-4">
            <div className="row g-3">
              {product.variants.map((variant, index) => {
                const isOutOfStock = variant.quantity === 0;
                
                return (
                  <div key={index} className="col-6">
                    <button
                      className={`btn w-100 h-100 p-3 border-2 text-start transition-all position-relative
                        ${isOutOfStock 
                          ? "btn-light border-dashed opacity-50 cursor-not-allowed" 
                          : "btn-outline-primary rounded-3 shadow-sm-hover"
                        }`}
                      disabled={isOutOfStock}
                      onClick={() => onAdd(variant)}
                      style={{ minHeight: "80px" }}
                    >
                      {/* Badge hiển thị số lượng */}
                      <span className={`position-absolute top-0 end-0 mt-2 me-2 badge rounded-pill 
                        ${isOutOfStock ? "bg-danger" : "bg-success bg-opacity-10 text-success"}`}>
                        {isOutOfStock ? "Hết" : `Còn ${variant.quantity}`}
                      </span>

                      <div className={`fw-bold mb-1 ${!isOutOfStock && "text-dark"}`}>
                        {variant.name}
                      </div>
                      
                      <div className="fw-normal small text-primary">
                        {variant.price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(variant.price) : "Liên hệ"}
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="modal-footer border-0 pb-4 px-4">
            <button 
              className="btn btn-light w-100 rounded-3 fw-bold text-secondary py-2" 
              onClick={onClose}
            >
              HỦY BỎ
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}