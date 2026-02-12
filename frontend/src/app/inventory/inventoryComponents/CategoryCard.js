import React from "react";

function CategoryCard({ category, onView }) {
    const {
        categoryId,
        categoryName,
        totalProducts = 0,
        totalStock = 0,
        imageUrl,
    } = category;

    return (
        <div
            className="card h-100 border-0 shadow-sm overflow-hidden transition-all hover-shadow"
            style={{
                transition: "all 0.3s ease",
                cursor: "pointer"
            }}
            onMouseEnter={(e) => e.currentTarget.classList.add("hover-lift")}
            onMouseLeave={(e) => e.currentTarget.classList.remove("hover-lift")}
        >
            {/* Image Section */}
            <div
                className="position-relative"
                style={{ height: "180px", overflow: "hidden" }}
            >
                <img
                    src={imageUrl || "https://via.placeholder.com/400x200?text=Category+Image"}
                    alt={categoryName}
                    className="w-100 h-100 object-fit-cover"
                />
                {/* Overlay badge ID */}
                <span className="position-absolute top-0 end-0 m-3 badge bg-dark text-white opacity-75 small">
                    ID: {categoryId}
                </span>
            </div>

            <div className="card-body d-flex flex-column p-4">
                {/* Title */}
                <h5 className="card-title fw-bold text-dark mb-3 line-clamp-2">
                    {categoryName}
                </h5>

                {/* Stats Grid */}
                <div className="row g-3 mb-4 text-center">
                    <div className="col-6">
                        <div className="bg-light rounded-3 p-3">
                            <div className="text-muted small mb-1">Sản phẩm</div>
                            <div className="fw-bold fs-4 text-primary">{totalProducts.toLocaleString()}</div>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="bg-light rounded-3 p-3">
                            <div className="text-muted small mb-1">Tồn kho</div>
                            <div className="fw-bold fs-4 text-success">{totalStock.toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <div className="mt-auto">
                    <button
                        className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2 py-2"
                        onClick={() => onView(categoryId)}
                    >
                        <i className="bi bi-box-seam fs-5"></i>
                        Xem tồn kho chi tiết
                    </button>
                </div>
            </div>

            {/* Optional: subtle footer or indicator */}
            <div className="card-footer bg-transparent border-0 text-center py-2 small text-muted">
                <i className="bi bi-arrow-right-circle me-1"></i> Nhấn để xem sản phẩm
            </div>
        </div>
    );
}

export default CategoryCard;