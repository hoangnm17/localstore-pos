function CategoryCard({ category, onView }) {
    return (
        <div className="card h-100 shadow-sm border-0">
            <div className="card-body">

                <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="fw-bold mb-0">
                        {category.categoryName}
                    </h5>

                    <span className="badge bg-secondary">
                        ID: {category.categoryId}
                    </span>
                </div>

                <hr />

                <div className="row text-center mb-3">
                    <div className="col-6">
                        <div className="text-muted small">Products</div>
                        <div className="fw-bold fs-5">
                            {category.totalProducts}
                        </div>
                    </div>

                    <div className="col-6">
                        <div className="text-muted small">Total Stock</div>
                        <div className="fw-bold fs-5">
                            {category.totalStock}
                        </div>
                    </div>
                </div>

                <div className="d-grid">
                    <button
                        className="btn btn-outline-primary"
                        onClick={() => onView(category.categoryId)}
                    >
                        View products
                    </button>
                </div>

            </div>
        </div>
    );
}

export default CategoryCard;
