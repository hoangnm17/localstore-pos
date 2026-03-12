import React from "react";
import { formatCurrency } from "utils/formatters";

const ProductUnitModal = ({ product, show, onHide, onSelectUnit }) => {
    if (!product) return null;

    return (
        <div className={`modal fade ${show ? "show d-block" : ""}`} tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg rounded-4">

                    <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title fw-bold">Chọn đơn vị tính</h5>
                        <button type="button" className="btn-close" onClick={onHide}></button>
                    </div>

                    <div className="modal-body">
                        <div className="d-flex align-items-center mb-3 p-2 bg-light rounded-3">
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="rounded-2"
                                style={{ width: 50, height: 50, objectFit: 'cover' }}
                            />
                            <div className="ms-3">
                                <div className="fw-bold">{product.name}</div>
                                <small className="text-muted">Mã: {product.code}</small>
                            </div>
                        </div>

                        <div className="list-group">
                            {product.units.map((unit) => (
                                <button
                                    key={unit.unitId}
                                    className="list-group-item list-group-item-action d-flex justify-content-between align-items-center p-3 mb-2 rounded-3 border"
                                    onClick={() => onSelectUnit(product, unit)}
                                    disabled={unit.stock <= 0}
                                >
                                    <div>
                                        <span className="fw-bold d-block">{unit.unitName}</span>
                                        <small className={unit.stock <= 0 ? "text-danger" : "text-muted"}>
                                            Tồn kho: {unit.stock}
                                        </small>
                                    </div>
                                    <div className="text-end">
                                        <span className="fw-bold text-primary d-block">
                                            {formatCurrency(unit.price)}
                                        </span>
                                        {unit.factor > 1 && (
                                            <small className="badge bg-secondary-subtle text-secondary">
                                                x{unit.factor} đơn vị lẻ
                                            </small>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductUnitModal;