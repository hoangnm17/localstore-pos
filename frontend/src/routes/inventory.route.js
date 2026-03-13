import { Route } from "react-router-dom";
import CategoryStock from "../app/inventory/pages/CategoryStock";
import ProductStock from "../app/inventory/pages/ProductStock";
import MainLayout from "../layouts/MainLayout";
import ManagerLayout from '../layouts/ManagerLayout';
import InventoryMenu from "../app/inventory/pages/InventoryMenu";
import ProblematicReport from "../app/inventory/pages/ProblematicReport";
import PurchaseOrderList from "../app/inventory/pages/PurchaseOrderList";
import PurchaseOrderDetail from "../app/inventory/pages/PurchaseOrderDetail";
import PurchaseOrderCreate from "../app/inventory/pages/PurchaseOrderCreate";
import PurchaseOrderReport from "../app/inventory/pages/PurchaseOrderReport";
import SupplierList from "../app/inventory/pages/SuppliersList";
import SupplierDetail from "../app/inventory/pages/SupplierDetail";
import AdjustmentList from "../app/inventory/pages/AdjustmentList";
import AdjustmentDetail from "../app/inventory/pages/AdjustmentDetail";
import CreateAdjustment from "../app/inventory/pages/CreateAdjustment";

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
        <Route path="suppliers" element={<SupplierList />} />
        <Route path="suppliers/:id" element={<SupplierDetail />} />
        <Route path="requests/adjust" element={<AdjustmentList />} />
        <Route path="requests/adjust/:id" element={<AdjustmentDetail />} />
        <Route path="requests/adjust/create" element={<CreateAdjustment />} />
        <Route path="menu" element={<InventoryMenu />} />
    </Route>
);

export default InventoryRoutes;
