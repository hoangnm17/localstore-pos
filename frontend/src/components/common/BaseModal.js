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
    // 1. Khi Modal vừa xuất hiện (Mount): Tăng biến đếm modal toàn cục
    window.isModalOpen = (window.isModalOpen || 0) + 1;

    return () => {
      // 2. Khi Modal đóng (Unmount): Giảm biến đếm
      window.isModalOpen = Math.max(0, (window.isModalOpen || 0) - 1);

      // 3. Nếu không còn Modal nào đang mở trên màn hình, báo cho FilterBar biết
      if (window.isModalOpen === 0) {
        window.dispatchEvent(new Event("RE_FOCUS_SEARCH"));
      }
    };
  }, []);
  
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