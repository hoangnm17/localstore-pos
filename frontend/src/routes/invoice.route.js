import { Route } from "react-router-dom";
import InvoicePage from "app/invoice/InvoicePage";
import MainLayout from "layouts/MainLayout";

const InvoiceRoutes = (
  <Route element={<MainLayout />}>
  <Route path="/invoices" element={<InvoicePage />} />
  </Route>
);

export default InvoiceRoutes;
