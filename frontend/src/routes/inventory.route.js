import { Routes, Route } from "react-router-dom";
import CategoryStock from "../app/inventory/pages/CategoryStock.js";
import ProductStock from "../app/inventory/pages/ProductStock.js";

function InventoryRoutes() {
    return (
        <Routes>
            <Route path="categories" element={<CategoryStock />} />
            <Route path="categories/:categoryId/products" element={<ProductStock />} />
        </Routes>
    );
}

export default InventoryRoutes;
