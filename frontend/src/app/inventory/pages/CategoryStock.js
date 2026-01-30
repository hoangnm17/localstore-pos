import { useEffect, useState } from "react";
import categoryService from "../../../services/categoryStockService";
import CategoryCard from "../inventoryComponents/CategoryCard";

function CategoryStock() {
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const limit = 10;

    useEffect(() => {
        loadCategories();
    }, [page, search]);

    const loadCategories = async () => {
        try {
            const res = await categoryService.getCategoryStock(search, page, limit);
            setCategories(res.data.categories);
            setTotalPages(res.data.pagination.totalPages);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSearch = (e) => {
        setPage(1);
        setSearch(e.target.value);
    };

    const handleViewProducts = (categoryId) => {
        console.log(categoryId);
    };

    return (
        <div className="container mt-4">
            <div className="card shadow-sm">
                <div className="card-body">

                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h4 className="mb-0 fw-bold">Category Stock</h4>
                        <input
                            type="text"
                            className="form-control w-25"
                            placeholder="Search category..."
                            value={search}
                            onChange={handleSearch}
                        />
                    </div>

                    <div className="row g-3">
                        {categories.map((c) => (
                            <div key={c.categoryId} className="col-12 col-md-6">
                                <CategoryCard
                                    category={c}
                                    onView={handleViewProducts}
                                />
                            </div>
                        ))}
                    </div>


                    <div className="d-flex justify-content-between align-items-center mt-4">
                        <button
                            className="btn btn-outline-secondary"
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                        >
                            ← Prev
                        </button>

                        <span className="fw-semibold">
                            Page {page} / {totalPages}
                        </span>

                        <button
                            className="btn btn-outline-secondary"
                            disabled={page === totalPages}
                            onClick={() => setPage(page + 1)}
                        >
                            Next →
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default CategoryStock;
