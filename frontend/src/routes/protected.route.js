import { Navigate, Outlet } from "react-router-dom";
const ProtectedRoute = ({ requiredFeatures = [], requiredRoles = [], redirectTo = "/Error" }) => {
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");

  if (!token || !userString) {
    return <Navigate to="/login" replace />;
  }

  let currentUser;
  try {
    currentUser = JSON.parse(userString);
  } catch {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles.length > 0) {
    const userRole = currentUser.roleName;
    if (!requiredRoles.includes(userRole)) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  if (requiredFeatures.length > 0) {
    const myFeatures = currentUser.features || [];
    const hasPermission = requiredFeatures.some((f) => myFeatures.includes(f));
    if (!hasPermission) {
      return <Navigate to={redirectTo} replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
