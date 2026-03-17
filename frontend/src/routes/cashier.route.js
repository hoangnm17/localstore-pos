import { Route } from "react-router-dom";
import MySchedule from "../app/cashier/MySchedule";
import HandoverReport from "app/cashier/HandoverReport";
const cashierRoute = (
    <>
    <Route path="/my-schedule" element={<MySchedule />} />
    <Route path="/handover-report" element={<HandoverReport />} />
    </>
);
export default cashierRoute;