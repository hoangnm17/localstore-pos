import { useEffect, useRef } from "react";

export default function useHotkeys(shortcuts = {}, options = {}) {
  const {
    enabled = true,
    disableInInput = true
  } = options;

  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    if (!enabled) return;

    const handler = (e) => {
      if (e.repeat) return;

      const shortcuts = shortcutsRef.current;

      if (disableInInput) {
        const tag = e.target.tagName;

        if (
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          e.target.isContentEditable
        ) {
          return;
        }
      }

      let combo = "";

      if (e.ctrlKey) combo += "ctrl+";
      if (e.altKey) combo += "alt+";
      if (e.shiftKey) combo += "shift+";

      combo += e.key.toLowerCase();

      const fn =
        shortcuts[combo] ||
        shortcuts[e.key] ||
        shortcuts[e.key.toLowerCase()];

      if (!fn) return;

      e.preventDefault();
      e.stopPropagation();

      fn(e);
    };

    window.addEventListener("keydown", handler);

    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [enabled]);
}