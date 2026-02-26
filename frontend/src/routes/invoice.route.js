import { Route } from "react-router-dom";
import InvoicePage from "app/invoice/InvoicePage";

const InvoiceRoutes = (
  <Route path="/invoices" element={<InvoicePage />}>
  </Route>
);

export default InvoiceRoutes;
