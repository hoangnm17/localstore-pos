import { Route } from "react-router-dom";
import MySchedule from "../app/cashier/MySchedule";
const cashierRoute = (
    <Route path="/my-schedule" element={<MySchedule />} />
);
export default cashierRoute;