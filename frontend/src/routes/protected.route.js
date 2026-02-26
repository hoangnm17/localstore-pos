import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ requiredFeatures = [] }) => {
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");

  if (!token || !userString) {
    return <Navigate to="/login" replace />;
  }

  // 🟢 Không có yêu cầu quyền cụ thể → CHỈ CẦN TOKEN là đủ
  if (!requiredFeatures || requiredFeatures.length === 0) {
    return <Outlet />;
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