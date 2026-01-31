import React from "react";

function CategoryCard({ category, onView }) {
    const {
        categoryId,
        categoryName,
        totalProducts,
        totalStock,
        imageUrl
    } = category;

    return (
        <div className="card h-100 border-0 shadow-sm overflow-hidden">
            {/* Image */}
            <div style={{ height: "160px", overflow: "hidden" }}>
                <img
                    src={imageUrl || "https://via.placeholder.com/400x200?text=No+Image"}
                    alt={categoryName}
                    className="w-100 h-100"
                    style={{ objectFit: "cover" }}
                />
            </div>

            <div className="card-body d-flex flex-column">
                {/* Title */}
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="fw-bold text-dark mb-0">{categoryName}</h5>
                    <span className="badge bg-light text-primary border">
                        ID {categoryId}
                    </span>
                </div>

                {/* Stats */}
                <div className="row text-center my-3">
                    <div className="col-6">
                        <div className="text-muted small">Số lượng sản phẩm</div>
                        <div className="fw-bold fs-5">{totalProducts}</div>
                    </div>
                    <div className="col-6">
                        <div className="text-muted small">Tổng tồn kho</div>
                        <div className="fw-bold fs-5">{totalStock}</div>
                    </div>
                </div>

                {/* Button */}
                <div className="mt-auto d-grid">
                    <button
                        className="btn btn-primary"
                        onClick={() => onView(categoryId)}
                    >
                        Xem chi tiết tồn kho sản phẩm
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CategoryCard;
