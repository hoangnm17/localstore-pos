import { Route } from "react-router-dom";
import SalaryReport from "../app/salary/SalaryReport";

const salaryRoute = (
    <Route path="/salary" element={<SalaryReport />} />
);

export default salaryRoute;
