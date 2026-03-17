import { useEffect, useState } from "react";

const typeStyles = {
  success: {
    bg: "#e6f9f0",
    border: "#22c55e",
    color: "#166534",
    icon: "bi-check-circle-fill",
  },
  error: {
    bg: "#fde8e8",
    border: "#ef4444",
    color: "#7f1d1d",
    icon: "bi-x-circle-fill",
  },
  warning: {
    bg: "#fff7ed",
    border: "#f97316",
    color: "#7c2d12",
    icon: "bi-exclamation-triangle-fill",
  },
  info: {
    bg: "#e0f2fe",
    border: "#0ea5e9",
    color: "#0c4a6e",
    icon: "bi-info-circle-fill",
  },
};

export default function Notification({
  type = "success",
  message,
  onClose,
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
  }, []);

  const style = typeStyles[type] || typeStyles.success;

  return (
    <div
      style={{
        minWidth: "280px",
        padding: "12px 16px",
        borderRadius: "10px",
        backgroundColor: style.bg,
        borderLeft: `4px solid ${style.border}`,
        color: style.color,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        transition: "all 0.3s ease",
        opacity: visible ? 1 : 0,
        transform: visible
          ? "translateX(0)"
          : "translateX(20px)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <i className={`bi ${style.icon}`}></i>
        <span style={{ fontSize: "0.9rem" }}>
          {message}
        </span>
      </div>

      <button
        onClick={onClose}
        style={{
          border: "none",
          background: "transparent",
          fontSize: "1rem",
          cursor: "pointer",
          color: style.color,
        }}
      >
        ×
      </button>
    </div>
  );
}