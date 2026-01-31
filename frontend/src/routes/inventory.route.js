import { Route } from "react-router-dom";
import CategoryStock from "../app/inventory/pages/CategoryStock";
import ProductStock from "../app/inventory/pages/ProductStock";
import MainLayout from "../layouts/MainLayout";

const InventoryRoutes = (
    <Route path="/inventory" element={<MainLayout />}>
        <Route path="categories" element={<CategoryStock />} />
        <Route
            path="categories/:categoryId/products"
            element={<ProductStock />}
        />
    </Route>
);

export default InventoryRoutes;
