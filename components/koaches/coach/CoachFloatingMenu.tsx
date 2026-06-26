"use client";

import { createPortal } from "react-dom";
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { cn } from "@/lib/utils";

type CoachFloatingMenuProps = {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  menuRef?: RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
  className?: string;
  /** Estimated menu height for flip-above logic */
  estimatedHeight?: number;
  scrollable?: boolean;
};

export function CoachFloatingMenu({
  open,
  anchorRef,
  menuRef: externalMenuRef,
  children,
  className,
  estimatedHeight = 240,
  scrollable = true,
}: CoachFloatingMenuProps) {
  const internalMenuRef = useRef<HTMLDivElement>(null);
  const menuRef = externalMenuRef ?? internalMenuRef;
  const [mounted, setMounted] = useState(false);
  const [style, setStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open || !anchorRef.current) return;

    const updatePosition = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;

      const rect = anchor.getBoundingClientRect();
      const gap = 6;
      const spaceBelow = window.innerHeight - rect.bottom - gap;
      const spaceAbove = rect.top - gap;
      const flip = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;
      const maxHeight = Math.max(160, flip ? spaceAbove : spaceBelow);

      setStyle({
        position: "fixed",
        left: rect.left,
        width: rect.width,
        maxHeight,
        zIndex: 110,
        ...(flip
          ? { bottom: window.innerHeight - rect.top + gap }
          : { top: rect.bottom + gap }),
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, anchorRef, estimatedHeight]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      ref={menuRef}
      className={cn("coach-picker-menu", scrollable && "overflow-y-auto", className)}
      style={style}
    >
      {children}
    </div>,
    document.body
  );
}
