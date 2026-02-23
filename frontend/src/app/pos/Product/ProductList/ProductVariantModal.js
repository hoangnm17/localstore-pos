import { formatCurrency } from "../../../../utils/formatters";
import BaseModal from "../../../../components/common/BaseModal";

export default function ProductVariant({ product, onClose, onAdd }) {
  if (!product) return null;

  const variants = product.variants || [];

  const handleSelectVariant = (variant) => {
    if (!variant) return;

    const isOutOfStock =
      variant.quantity !== undefined && variant.quantity === 0;

    if (isOutOfStock) return;

    onAdd({
      productId: product.id,
      productName: product.name,
      variantId: variant.id,
      variantName: variant.name,
      unitPrice: Number(variant.price),
    });

    onClose();
  };

  return (
    <BaseModal onClose={onClose} maxWidth="500px">
      <div className="modal-content border-0 shadow-lg rounded-4 bg-white">

        {/* HEADER */}
        <div className="modal-header border-0 pt-4 px-4 pb-0">
          <div>
            <h5 className="fw-bold mb-0">{product.name}</h5>
            <small className="text-muted">
              Vui lòng chọn một phiên bản
            </small>
          </div>
          <button className="btn-close shadow-none" onClick={onClose} />
        </div>

        {/* BODY */}
        <div className="modal-body p-4">
          <div className="row g-3">
            {variants.map((variant) => {
              const isOutOfStock =
                variant.quantity !== undefined &&
                variant.quantity === 0;

              return (
                <div key={variant.id} className="col-6">
                  <button
                    className={`btn w-100 h-100 p-3 border-2 text-start position-relative ${
                      isOutOfStock
                        ? "btn-light opacity-50"
                        : "btn-outline-primary rounded-3"
                    }`}
                    disabled={isOutOfStock}
                    onClick={() => handleSelectVariant(variant)}
                    style={{ minHeight: "90px" }}
                  >
                    {/* STOCK BADGE */}
                    {variant.quantity !== undefined && (
                      <span
                        className={`position-absolute top-0 end-0 mt-2 me-2 badge rounded-pill ${
                          isOutOfStock
                            ? "bg-danger"
                            : "bg-success bg-opacity-10 text-success"
                        }`}
                      >
                        {isOutOfStock
                          ? "Hết"
                          : `Còn ${variant.quantity}`}
                      </span>
                    )}

                    <div className="fw-bold mb-1">
                      {variant.name}
                    </div>

                    <div className="small text-primary">
                      {formatCurrency(variant.price)}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* FOOTER */}
        <div className="modal-footer border-0 pb-4 px-4">
          <button
            className="btn btn-light w-100 rounded-3 fw-bold text-secondary py-2"
            onClick={onClose}
          >
            HỦY BỎ
          </button>
        </div>

      </div>
    </BaseModal>
  );
}