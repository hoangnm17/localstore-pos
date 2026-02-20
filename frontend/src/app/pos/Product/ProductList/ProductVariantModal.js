export default function ProductVariant({ product, onClose, onAdd }) {
  if (!product) return null;

  const handleSelectVariant = (variant) => {

    // ✅ SỬA: tránh crash nếu mock không có quantity
    const isOutOfStock =
      variant.quantity !== undefined && variant.quantity === 0;

    if (isOutOfStock) return;

    onAdd({
      productId: product.id,
      productName: product.name,

      // ✅ SỬA: fallback nếu mock không có id
      variantId: variant.id ?? variant.name,

      variantName: variant.name,

      // ✅ SỬA: nếu variant không có price thì dùng salePrice
      unitPrice: variant.price ?? product.salePrice ?? 0,
    });

    onClose(); // ✅ SỬA: tự đóng modal sau khi chọn
  };

  return (
    <div
      className="modal fade show d-block"
      style={{
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: "500px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-lg rounded-4">

          <div className="modal-header border-0 pt-4 px-4 pb-0">
            <div>
              <h5 className="fw-bold mb-0">{product.name}</h5>
              <small className="text-muted">
                Vui lòng chọn một phiên bản
              </small>
            </div>
            <button className="btn-close shadow-none" onClick={onClose} />
          </div>

          <div className="modal-body p-4">
            <div className="row g-3">
              {product.variants.map((variant, index) => {

                // ✅ SỬA: tránh crash nếu quantity undefined
                const isOutOfStock =
                  variant.quantity !== undefined &&
                  variant.quantity === 0;

                return (
                  <div key={index} className="col-6">
                    <button
                      className={`btn w-100 h-100 p-3 border-2 text-start position-relative
                        ${isOutOfStock
                          ? "btn-light opacity-50"
                          : "btn-outline-primary rounded-3"
                        }`}
                      disabled={isOutOfStock}
                      onClick={() => handleSelectVariant(variant)}
                      style={{ minHeight: "90px" }}
                    >
                      <span
                        className={`position-absolute top-0 end-0 mt-2 me-2 badge rounded-pill 
                        ${isOutOfStock
                            ? "bg-danger"
                            : "bg-success bg-opacity-10 text-success"
                          }`}
                      >
                        {isOutOfStock
                          ? "Hết"
                          : variant.quantity !== undefined
                            ? `Còn ${variant.quantity}`
                            : ""}
                      </span>

                      <div className="fw-bold mb-1">
                        {variant.name}
                      </div>

                      <div className="small text-primary">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(
                          // ✅ SỬA: fallback giá
                          variant.price ?? product.salePrice ?? 0
                        )}
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