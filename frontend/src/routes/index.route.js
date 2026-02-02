import { Routes, Route } from "react-router-dom";
import salesRoute from "./sales.route";
import InventoryRoutes from "./inventory.route";

const AppRoutes = () => {
  return (
    <Routes>
      {salesRoute}
      {InventoryRoutes}
      {/* <Route path="/inventory/*" element={<InventoryRoutes />} /> */}
    </Routes>
  );
};

export default AppRoutes;
