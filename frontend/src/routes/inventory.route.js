import { Route } from "react-router-dom";
import CategoryStock from "../app/inventory/pages/CategoryStock";
import ProductStock from "../app/inventory/pages/ProductStock";
import MainLayout from "../layouts/MainLayout";
import InventoryMenu from "../app/inventory/pages/InventoryMenu";
import ProblematicReport from "../app/inventory/pages/ProblematicReport";

const InventoryRoutes = (
    <Route path="/inventory" element={<MainLayout />}>
        <Route path="categories" element={<CategoryStock />} />
        <Route
            path="categories/:categoryId/products"
            element={<ProductStock />}
        />
        <Route path="problematic" element={<ProblematicReport />} />
        <Route path="menu" element={<InventoryMenu />} />
    </Route>
);

export default InventoryRoutes;
