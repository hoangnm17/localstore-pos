function CategoryCard({ category, onView }) {
    return (
        <div className="category-card">
            <h4>{category.categoryName}</h4>
            <p>Products: {category.totalProducts}</p>
            <p>Stock: {category.totalStock}</p>

            <button onClick={() => onView(category.categoryId)}>
                View products
            </button>
        </div>
    );
}

export default CategoryCard;
