import { Route } from "react-router-dom";
import RestockList from "app/invoice/RestockList";

const InvoiceRoutes = (
  <Route path="/return-items" element={<RestockList />}>
  </Route>
);

export default InvoiceRoutes;
