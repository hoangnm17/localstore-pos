import { Route } from "react-router-dom";
import CRMPage from "../app/crm/CRMPage";
import MainLayout from "../layouts/MainLayout";

const crmRoute = (
    <Route element={<MainLayout />}>
        <Route path="/crm" element={<CRMPage />} />
    </Route>
);

export default crmRoute;
