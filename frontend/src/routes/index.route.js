import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./protected.route";
import AppLayout from "../layouts/AppLayout";  // ✅ Layout chung mới

// Lazy imports — giữ nguyên tên cũ của page components
import salesRoute from "./sales.route";
import InventoryRoutes from "./inventory.route";
import authRoute from "./auth.route";
import CategoryRoutes from "./category.route.js";
import ProductRoutes from "./product.route";
import InvocieRoutes from "./invoice.route";
import staffRoute from "./staff.route";
import crmRoute from "./crm.route";
import dashboardRoute from "./dashboard.route";
import shiftRoute from "./shift.route";
import scheduleRoute from "./schedule.route";
import salaryRoute from "./salary.route";
import cashierRoute from "./cashier.route";
import Forbidden from "../app/auth/Forbidden";

const AppRoutes = () => {
  return (
    <Routes>
      {authRoute}

      <Route element={<ProtectedRoute requiredRoles={['Manager']} />}>
        <Route element={<AppLayout />}>
          {dashboardRoute}
          {staffRoute}
          {shiftRoute}
          {scheduleRoute}
          {salaryRoute}
          {crmRoute}
        </Route>
      </Route>
      <Route element={<ProtectedRoute requiredRoles={['Manager', 'Warehouse']} />}>
        <Route element={<AppLayout />}>
          {InventoryRoutes}
          {ProductRoutes}
          {CategoryRoutes}
        </Route>
      </Route>

      <Route element={<ProtectedRoute requiredRoles={['Manager', 'Cashier']} />}>
        <Route element={<AppLayout />}>
          {InvocieRoutes}
          {cashierRoute}
        </Route>
      </Route>
      <Route element={<ProtectedRoute requiredRoles={['Manager', 'Cashier']} />}>
          {salesRoute}
      </Route>

      <Route path="/Error" element={<Forbidden />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
