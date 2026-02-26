import { Routes, Route, Navigate } from "react-router-dom";
import salesRoute from "./sales.route";
import InventoryRoutes from "./inventory.route";
import authRoute from "./auth.route";
import CategoryRoutes from "./category.route.js";
import ProductRoutes from "./product.route";
import ProtectedRoute from "./protected.route";
import staffRoute from "./staff.route";
import crmRoute from "./crm.route";
import dashboardRoute from "./dashboard.route";

const AppRoutes = () => {
  return (
    <Routes>
      {authRoute}
      <Route element={<ProtectedRoute />}>
        {dashboardRoute}
      </Route>
      <Route element={<ProtectedRoute requiredFeatures={["MANAGE_STAFF"]} />}>
        {staffRoute}
      </Route>
      <Route element={<ProtectedRoute requiredFeatures={["VIEW_SALES"]} />}>
        {salesRoute}
      </Route>
      <Route >
        {InventoryRoutes}
      </Route>
      <Route element={<ProtectedRoute requiredFeatures={["MANAGE_PRODUCTS"]} />}>
        {CategoryRoutes}
        {ProductRoutes}
      </Route>
      <Route element={<ProtectedRoute requiredFeatures={["VIEW_CRM"]} />}>
        {crmRoute}
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
export default AppRoutes;