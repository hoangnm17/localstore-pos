import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ requiredFeatures = [] }) => {
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");

  // 🟢 Không có yêu cầu quyền → ai cũng vào được
  if (!requiredFeatures || requiredFeatures.length === 0) {
    return <Outlet />;
  }

  // 🔒 Có yêu cầu quyền mà chưa login → chặn
  if (!token || !userString) {
    return <Navigate to="/login" replace />;
  }

  let currentUser;
  try {
    currentUser = JSON.parse(userString);
  } catch {
    return <Navigate to="/login" replace />;
  }

  const myFeatures = currentUser.features || [];

  const hasPermission = requiredFeatures.some((f) =>
    myFeatures.includes(f)
  );

  if (!hasPermission) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;