import { Route } from "react-router-dom";
import CategoryStock from "../app/inventory/pages/CategoryStock";
import ProductStock from "../app/inventory/pages/ProductStock";
import MainLayout from "../layouts/MainLayout";
import InventoryMenu from "../app/inventory/pages/InventoryMenu";
import ProblematicReport from "../app/inventory/pages/ProblematicReport";
import PurchaseOrderList from "../app/inventory/pages/PurchaseOrderList";
import PurchaseOrderDetail from "../app/inventory/pages/PurchaseOrderDetail";
import PurchaseOrderCreate from "../app/inventory/pages/PurchaseOrderCreate";
import PurchaseOrderReport from "../app/inventory/pages/PurchaseOrderReport";

const InventoryRoutes = (
    <Route path="/inventory" element={<MainLayout />}>
        <Route path="categories" element={<CategoryStock />} />
        <Route
            path="categories/:categoryId/products"
            element={<ProductStock />}
        />
        <Route path="problematic" element={<ProblematicReport />} />
        <Route path="purchase-orders" element={<PurchaseOrderList />} />
        <Route path="purchase-orders/:id" element={<PurchaseOrderDetail />} />
        <Route path="purchase-orders/create" element={<PurchaseOrderCreate />} />
        <Route path="purchase-orders/report" element={<PurchaseOrderReport />} />
        <Route path="menu" element={<InventoryMenu />} />
    </Route>
);

export default InventoryRoutes;
