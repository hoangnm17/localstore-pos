import { useEffect, useRef } from "react";

export default function useHotkeys(shortcuts = {}) {
  const shortcutsRef = useRef(shortcuts);

  shortcutsRef.current = shortcuts;

  useEffect(() => {
    const handler = (e) => {
      const shortcuts = shortcutsRef.current;

      let combo = "";
      if (e.ctrlKey) combo += "Ctrl+";
      if (e.altKey) combo += "Alt+";
      if (e.shiftKey) combo += "Shift+";

      combo += e.key.toLowerCase();

      const fn =
        shortcuts[combo] ||
        shortcuts[e.key] ||
        shortcuts[e.key.toLowerCase()];

      if (!fn) return;

      e.preventDefault();
      fn(e);
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
}