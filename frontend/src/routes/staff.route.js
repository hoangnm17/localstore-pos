import { Route } from "react-router-dom";
import StaffList from "../app/staff/StaffList"; 
import StaffCreate from "../app/staff/StaffCreate";
import StaffUpdate from "../app/staff/StaffUpdate";

const staffRoute = (
  <>
    <Route path="/staff" element={<StaffList />} />
    <Route path="/staff/create" element={<StaffCreate />} />
    <Route path="/staff/update" element={<StaffUpdate />} />
  </>
);

export default staffRoute;