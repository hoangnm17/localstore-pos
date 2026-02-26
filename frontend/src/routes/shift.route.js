import { Route } from "react-router-dom";
import ShiftList from "../app/shift/ShiftList";

const shiftRoute = (
  <>
    <Route path="/shifts" element={<ShiftList />} />
  </>
);

export default shiftRoute;