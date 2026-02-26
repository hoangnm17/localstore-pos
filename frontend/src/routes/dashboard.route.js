import { Route } from "react-router-dom";
import DashboardPage from "../app/dashboard/DashboardPage";

const dashboardRoute = (
    <Route path="/dashboard" element={<DashboardPage />} />
);

export default dashboardRoute;
