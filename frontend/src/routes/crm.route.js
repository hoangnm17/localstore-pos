import { Route } from "react-router-dom";
import CRMPage from "../app/crm/CRMPage";

const crmRoute = (
    <Route >
        <Route path="/crm" element={<CRMPage />} />
    </Route>
);

export default crmRoute;
