import MyProfile from "app/staff/MyProfile";
import { Route } from "react-router-dom";

const profileRoute = (
  <>
    <Route path="/my-profile" element={<MyProfile />} />
  </>
);

export default profileRoute;
