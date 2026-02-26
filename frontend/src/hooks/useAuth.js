import { useState, useEffect } from "react";
export const useAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (userString) {
      setUser(JSON.parse(userString));
    }
  }, []);

  const features = user?.hasFeature || [];
  return {
    // user, 
    // roleName,
    // isManager: roleName === "Manager",
    // isCashier: roleName === "Cashier",
    // isWarehouse: roleName === "Warehouse",
    user,
    roleName: user?.roleName || "",
    hasFeature: (featureKey) => features.includes(featureKey),
    isAuthenticated: !!user // Trả về true nếu có user
  };
};