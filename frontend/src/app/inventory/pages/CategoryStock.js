import { useEffect, useState } from "react";
import categoryService from "../../../services/categoryService";
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
            console.error("Load categories error:", err);
        }
    };

    const handleSearch = (e) => {
        setPage(1);
        setSearch(e.target.value);
    };

    const handleViewProducts = (categoryId) => {
        console.log("View category:", categoryId);
        // navigate(`/inventory/categories/${categoryId}`)
    };

    return (
        <div className="category-stock-container">
            <h2>Category Stock</h2>

            <input
                type="text"
                placeholder="Tìm theo tên category..."
                value={search}
                onChange={handleSearch}
                className="search-input"
            />

            <div className="category-grid">
                {categories.map((c) => (
                    <CategoryCard
                        key={c.categoryId}
                        category={c}
                        onView={handleViewProducts}
                    />
                ))}
            </div>

            <div className="pagination">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                >
                    Prev
                </button>

                <span>
                    Page {page} / {totalPages}
                </span>

                <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );
}

export default CategoryStock;
