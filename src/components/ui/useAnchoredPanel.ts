import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";

/** Stable rating dialog: centered on phones, anchored on desktop, viewport-safe at zoom. */
export function useAnchoredPanel(open: boolean, anchor?: HTMLElement | null) {
  const panelRef = useRef<HTMLElement>(null);
  const [style, setStyle] = useState<CSSProperties>({ visibility: "hidden", width: "min(340px, calc(100vw - 24px))" });
  useLayoutEffect(() => {
    if (!open) {
      setStyle(previous => previous.visibility === "hidden" ? previous : { ...previous, visibility: "hidden" });
      return;
    }
    const origin = anchor ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    const update = () => {
      if (!panelRef.current) return;
      const viewport = window.visualViewport;
      const x = viewport?.offsetLeft ?? 0, y = viewport?.offsetTop ?? 0;
      const viewportWidth = viewport?.width ?? window.innerWidth;
      const viewportHeight = viewport?.height ?? window.innerHeight;
      const margin = 12, gap = 8;
      const width = Math.max(0, Math.min(340, viewportWidth - margin * 2));
      // Trigger position, selection, labels and expanded help never size the frame.
      const height = Math.max(0, Math.min(560, viewportHeight - margin * 2));
      const centered = window.innerWidth <= 680;
      const rect = origin?.isConnected ? origin.getBoundingClientRect() : null;
      const below = rect ? Math.max(0, y + viewportHeight - margin - rect.bottom - gap) : 0;
      const above = rect ? Math.max(0, rect.top - gap - y - margin) : 0;
      const placeBelow = below >= height || below >= above;
      const left = Math.max(x + margin, Math.min(!centered && rect ? rect.right - width : x + (viewportWidth - width) / 2, x + viewportWidth - margin - width));
      const idealTop = !centered && rect ? (placeBelow ? rect.bottom + gap : rect.top - gap - height) : y + (viewportHeight - height) / 2;
      const top = Math.max(y + margin, Math.min(idealTop, y + viewportHeight - margin - height));
      const next = { left, top, width, height, maxHeight: height, visibility: "visible" as const };
      setStyle(previous => Object.keys(next).every(key => previous[key as keyof CSSProperties] === next[key as keyof typeof next]) ? previous : next);
    };
    update();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(update) : null;
    if (panelRef.current) observer?.observe(panelRef.current);
    if (origin) observer?.observe(origin);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    window.visualViewport?.addEventListener("resize", update);
    window.visualViewport?.addEventListener("scroll", update);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      window.visualViewport?.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("scroll", update);
    };
  }, [open, anchor]);
  return { panelRef, panelStyle: style };
}
