import { Route } from "react-router-dom";
import WorkSchedule from "../app/schedule/WorkSchedule";

const scheduleRoute = (
    <Route path="/schedule" element={<WorkSchedule />} />
);

export default scheduleRoute;
