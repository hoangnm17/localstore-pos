

import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ requiredFeatures }) => {
  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");

  if (!token || !userString) {
    return <Navigate to="/login" replace />;
  }

  const currentUser = JSON.parse(userString);
  const myFeatures = currentUser.features || []; 

const hasPermission = !requiredFeatures || requiredFeatures.some(f => myFeatures.includes(f));

  if (!hasPermission) {
    alert(`Bạn không có quyền truy cập khu vực này!`);
    return <Navigate to="/" replace />; 
  }

  return <Outlet />;
};

export default ProtectedRoute;

// import { Navigate, Outlet } from "react-router-dom";

// const ProtectedRoute = ({ allowedRoles }) => {
//   const token = localStorage.getItem("token");
//   const userString = localStorage.getItem("user");

//   if (!token || !userString) {
//     return <Navigate to="/login" replace />;
//   }

//   const currentUser = JSON.parse(userString);
//   const currentUserRole = currentUser.roleName;

//   if (allowedRoles && !allowedRoles.includes(currentUserRole)) {
//     alert(`Bạn không có quyền truy cập trang này!`);
    
//     //Để trang sales là trang điều hướng mặc định
//     return <Navigate to="/sales" replace />; 
//   }

//   return <Outlet />;
// };

// export default ProtectedRoute;