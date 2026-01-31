import { useEffect, useState } from "react";
import categoryService from "../../../services/categoryStockService";
import CategoryCard from "../inventoryComponents/CategoryCard";
import { useNavigate } from "react-router-dom";


function CategoryStock() {
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [inputPage, setInputPage] = useState(1);

    const limit = 9;

    useEffect(() => {
        loadCategories();
        setInputPage(page);
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

    const handlePageInputChange = (e) => {
        setInputPage(e.target.value);
    };

    const jumpToPage = () => {
        let p = parseInt(inputPage);
        if (isNaN(p) || p < 1) p = 1;
        else if (p > totalPages) p = totalPages;
        setPage(p);
        setInputPage(p);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") jumpToPage();
    };

    const handleViewProducts = (categoryId) => {
        console.log(categoryId);
    };

    return (
        <div className="container mt-4">
            <div className="card border border-1 border-dark shadow-sm">
                <div className="card-body">
                    {/* Header */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 className="fw-bold text-primary mb-0">Category Stock</h4>
                        <input
                            type="text"
                            className="form-control w-25"
                            placeholder="Search category..."
                            value={search}
                            onChange={handleSearch}
                        />
                    </div>

                    {/* Grid */}
                    <div className="row g-4">
                        {categories.map((c) => (
                            <div key={c.categoryId} className="col-12 col-md-6 col-lg-4">
                                <CategoryCard
                                    category={c}
                                    onView={handleViewProducts}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="d-flex justify-content-between align-items-center mt-4">
                        <button
                            className="btn btn-outline-primary btn-sm"
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                        >
                            ← Trước
                        </button>

                        <div className="d-flex align-items-center gap-2">
                            <span className="text-muted small">Trang</span>
                            <input
                                type="number"
                                className="form-control form-control-sm text-center"
                                style={{ width: "60px" }}
                                value={inputPage}
                                onChange={handlePageInputChange}
                                onKeyDown={handleKeyDown}
                                onBlur={jumpToPage}
                                min="1"
                                max={totalPages}
                            />
                            <span className="fw-semibold">/ {totalPages}</span>
                        </div>

                        <button
                            className="btn btn-outline-primary btn-sm"
                            disabled={page === totalPages}
                            onClick={() => setPage(page + 1)}
                        >
                            Tiếp →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CategoryStock;
