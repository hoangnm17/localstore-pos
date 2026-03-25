import Notification from "./Notification";

export default function NotificationContainer({
  notifications,
  removeNotification,
}) {
  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 999999,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      {notifications.map((n) => (
        <Notification
          key={n.id}
          type={n.type}
          message={n.message}
          onClose={() => removeNotification(n.id)}
        />
      ))}
    </div>
  );
}