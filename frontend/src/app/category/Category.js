import React from "react";
import categoryService from "../../services/categoryService";
import { Link } from "react-router-dom";

function Category() {
    const [categories, setCategories] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const fetchCategories = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await categoryService.fetchCategoryList();
            setCategories(response.data.data || []);
        } catch (err) {
            setError("Failed to fetch categories");
        }
        setLoading(false);
    }
    React.useEffect(() => {
        fetchCategories();
    }
        , []);
    return (
        <div>
            <h1>Danh mục sản phẩm</h1>
            {loading && <p>Đang tải...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
            <ul>
                {categories.map((category) => (
                    <li key={category.id}>
                        <Link to={`/categories/${category.id}`}>{category.name}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

