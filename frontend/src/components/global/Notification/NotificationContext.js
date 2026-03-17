import { createContext, useContext, useState, useCallback } from "react";
import NotificationContainer from "./NotificationContainer";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const showNotification = useCallback(
    (message, type = "success", duration = 3000) => {
      const id = Date.now();

      setNotifications((prev) => [
        ...prev,
        { id, message, type },
      ]);

      setTimeout(() => {
        removeNotification(id);
      }, duration);
    },
    [removeNotification]
  );

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <NotificationContainer
        notifications={notifications}
        removeNotification={removeNotification}
      />
    </NotificationContext.Provider>
  );
}

export const useNotification = () =>
  useContext(NotificationContext);