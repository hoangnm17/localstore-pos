import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./protected.route";

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
import returnRoute from "./return.route"
import restockRoute from "./restock.route"

const AppRoutes = () => {
  return (
    <Routes>
      {authRoute}
      <Route element={<ProtectedRoute requiredRoles={['Manager']} />}>
        {dashboardRoute}
        {staffRoute}
        {shiftRoute}
        {scheduleRoute}
        {salaryRoute}
        {crmRoute}
        {ProductRoutes}
        {CategoryRoutes}
      </Route>
      <Route element={<ProtectedRoute requiredRoles={['Manager', 'Warehouse']} />}>
        {InventoryRoutes}
        {restockRoute}
        <Route path="/inventory/*" element={<InventoryRoutes />} />
      </Route>
      <Route element={<ProtectedRoute requiredRoles={['Manager', 'Cashier']} />}>
        {salesRoute}
        {InvocieRoutes}
        {returnRoute}
      </Route>
      <Route element={<ProtectedRoute requiredRoles={['Cashier']} />}>
        {cashierRoute}
      </Route>
      <Route path="/Error" element={<Forbidden />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
export default AppRoutes;
