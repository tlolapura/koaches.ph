"use client";

import { useEffect, type RefObject } from "react";

export function useDismissible(
  open: boolean,
  onClose: () => void,
  ref: RefObject<HTMLElement | null>,
  extraRef?: RefObject<HTMLElement | null>
) {
  useEffect(() => {
    if (!open) return;

    const contains = (target: Node) => {
      if (ref.current?.contains(target)) return true;
      if (extraRef?.current?.contains(target)) return true;
      return false;
    };

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (!contains(target)) {
        onClose();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, ref, extraRef]);
}
