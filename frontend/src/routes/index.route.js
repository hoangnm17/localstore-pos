import { Routes, Route, Navigate } from "react-router-dom";
import salesRoute from "./sales.route";
import InventoryRoutes from "./inventory.route";
import authRoute from "./auth.route";
import ProtectedRoute from "./protected.route";
import staffRoute from "./staff.route";
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
      <Route element={<ProtectedRoute requiredFeatures={["MANAGE_STAFF"]} />}>
        {staffRoute}
      </Route>
      <Route element={<ProtectedRoute requiredFeature="VIEW_SALES" />}>
        {salesRoute}
      </Route>

      <Route element={<ProtectedRoute requiredFeature="VIEW_INVENTORY" />}>
        {InventoryRoutes}
      </Route>
      {/* <Route path="/inventory/*" element={<InventoryRoutes />} /> */}
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
