import { Routes, Route, Navigate } from "react-router-dom";
import salesRoute from "./sales.route";
import InventoryRoutes from "./inventory.route";
import authRoute from "./auth.route";
import CategoryRoutes from "./category.route.js";
import ProductRoutes from "./product.route";
import InvocieRoutes from "./invoice.route"

const AppRoutes = () => {
  return (
    <Routes>
      {authRoute}
      {salesRoute}
      {InvocieRoutes}
      {InventoryRoutes}
      {CategoryRoutes}
      {ProductRoutes}
      {/* <Route path="/inventory/*" element={<InventoryRoutes />} /> */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/inventory/*" element={<InventoryRoutes />} />
      <Route path="/categories/*" element={<CategoryRoutes />} />
    </Routes>
  );
};
export default AppRoutes;