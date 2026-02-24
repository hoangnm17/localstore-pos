import React from "react";

export default function AlertMessage({
  type = "danger",
  message,
  className = "",
}) {
  if (!message) return null;

  const iconMap = {
    danger: "bi-exclamation-circle",
    success: "bi-check-circle",
    warning: "bi-exclamation-triangle",
    info: "bi-info-circle",
  };

  return (
    <div
      className={`alert alert-${type} py-2 px-3 rounded-3 border-0 ${className}`}
      style={{ fontSize: "0.85rem" }}
    >
      <i className={`bi ${iconMap[type]} me-2`}></i>
      {message}
    </div>
  );
}