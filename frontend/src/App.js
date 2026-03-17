import AppRoutes from "./routes/index.route";
import { NotificationProvider } from "components/global/Notification/NotificationContext";

function App() {
  return (
    <NotificationProvider>
      <AppRoutes />
    </NotificationProvider>

  );
}

export default App;
