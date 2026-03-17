import { Route } from "react-router-dom";
import ReturnList from "app/invoice/ReturnList";
import MainLayout from "layouts/MainLayout";

const InvoiceRoutes = (
  <Route path="/returns" element={<ReturnList />}>
  </Route>
);



export default InvoiceRoutes;
