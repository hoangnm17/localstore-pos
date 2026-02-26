import { Routes, Route, Navigate } from "react-router-dom";
import salesRoute from "./sales.route";
import InventoryRoutes from "./inventory.route";
import authRoute from "./auth.route";
import ProtectedRoute from "./protected.route";
import staffRoute from "./staff.route";
import crmRoute from "./crm.route";
import dashboardRoute from "./dashboard.route";

const AppRoutes = () => {
  return (
    <Routes>
      {authRoute}
      {dashboardRoute}
      {/* <Route element={<ProtectedRoute allowedRoles={['Manager', 'Cashier']} />}>
        {salesRoute}
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['Manager', 'Warehouse']} />}>
        {InventoryRoutes}
      </Route> */}
      <Route element={<ProtectedRoute requiredFeatures={["MANAGE_STAFF"]} />}>
        {staffRoute}
      </Route>
      <Route element={<ProtectedRoute requiredFeatures={["VIEW_SALES"]} />}>
        {salesRoute}
      </Route>

      <Route element={<ProtectedRoute requiredFeatures={["VIEW_INVENTORY"]} />}>
        {InventoryRoutes}
      </Route>

      {crmRoute}

      {/* <Route path="/inventory/*" element={<InventoryRoutes />} /> */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
