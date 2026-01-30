import { Route } from "react-router-dom";
import SalesHome from "../app/pos/SalesPage";

const salesRoute = (
  <Route path="/sales" element={<SalesHome />}>
    {/* <Route index element={<SalesHome />} /> */}
  </Route>
);

export default salesRoute;
