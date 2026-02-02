export default function ProductVariant({ product, onClose, onAdd }) {
  if (!product) return null;

  return (
    <div
      className="modal fade show"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          {/* Header */}
          <div className="modal-header">
            <h5 className="modal-title">{product.name}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            />
          </div>

          {/* Body */}
          <div className="modal-body">
            <div className="row g-2">
              {product.variants.map((variant, index) => (
                <div key={index} className="col-6">
                  <button
                    className="btn btn-outline-primary w-100 h-100"
                    disabled={variant.quantity === 0}
                    onClick={() => onAdd(variant)}
                  >
                    <div className="fw-bold">{variant.name}</div>
                    <small>Còn {variant.quantity}</small>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button
              className="btn btn-secondary"
              onClick={onClose}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
