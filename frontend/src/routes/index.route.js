import { Routes, Route, Navigate } from "react-router-dom";
import salesRoute from "./sales.route";
import InventoryRoutes from "./inventory.route";
import authRoute from "./auth.route";
import ProtectedRoute from "./protected.route";
import staffRoute from "./staff.route";
import crmRoute from "./crm.route";
import CategoryRoutes from "./category.route.js";

const AppRoutes = () => {
  return (
    <Routes>
      {authRoute}
      {/* <Route element={<ProtectedRoute allowedRoles={['Manager', 'Cashier']} />}>
        {salesRoute}
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['Manager', 'Warehouse']} />}>
        {InventoryRoutes}
      </Route> */}
    <Route element={<ProtectedRoute requiredFeatures={["VIEW_STAFF"]}/>}>
        {staffRoute}
      </Route>
      <Route element={<ProtectedRoute requiredFeature="VIEW_SALES" />}>
        {salesRoute}
      </Route>

      <Route element={<ProtectedRoute requiredFeature="VIEW_INVENTORY" />}>
        {InventoryRoutes}
      </Route>

      {crmRoute}

      {salesRoute}
      {InventoryRoutes}
      {CategoryRoutes}
      {/* <Route path="/inventory/*" element={<InventoryRoutes />} /> */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/inventory/*" element={<InventoryRoutes />} />
      <Route path="/categories/*" element={<CategoryRoutes />} />
    </Routes>
  );
};
export default AppRoutes;
