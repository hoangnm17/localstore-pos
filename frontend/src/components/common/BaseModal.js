import { createPortal } from "react-dom";
import { useEffect } from "react";

export default function BaseModal({
  children,
  onClose,
  maxWidth = "1200px",
  zIndex = 2000,
  closeOnOverlay = true,
  disableClose = false,
}) {
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && !disableClose) {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () =>
      window.removeEventListener("keydown", handleEsc);
  }, [onClose, disableClose]);

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(4px)",
        padding: "20px",
      }}
      onClick={
        closeOnOverlay && !disableClose
          ? onClose
          : undefined
      }
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth,
          width: "100%",
        }}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}