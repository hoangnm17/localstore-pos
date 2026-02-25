import { Route } from "react-router-dom";
import LoginPage from "../app/auth/LoginPage";

const authRoute = (
  <Route path="/login" element={<LoginPage />} />
);

export default authRoute;