import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";

/** Flip/shift a floating dialog inside the visual viewport, including browser zoom. */
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
      const panel = panelRef.current;
      if (!panel) return;
      const viewport = window.visualViewport;
      const x = viewport?.offsetLeft ?? 0, y = viewport?.offsetTop ?? 0;
      const viewportWidth = viewport?.width ?? window.innerWidth;
      const viewportHeight = viewport?.height ?? window.innerHeight;
      const margin = 12, gap = 8;
      const width = Math.max(0, Math.min(340, viewportWidth - margin * 2));
      const viewportMaxHeight = Math.max(0, viewportHeight - margin * 2);
      const rect = origin?.isConnected ? origin.getBoundingClientRect() : null;
      const scroll = panel.querySelector<HTMLElement>(".kp-preference-scroll");
      const naturalHeight = panel.offsetHeight + (scroll ? scroll.scrollHeight - scroll.clientHeight : 0);
      const desiredHeight = Math.min(naturalHeight, viewportMaxHeight);
      const below = rect ? Math.max(0, y + viewportHeight - margin - rect.bottom - gap) : viewportMaxHeight;
      const above = rect ? Math.max(0, rect.top - gap - y - margin) : viewportMaxHeight;
      const placeBelow = below >= desiredHeight || below >= above;
      const available = placeBelow ? below : above;
      const maxHeight = Math.min(viewportMaxHeight, Math.max(Math.min(240, viewportMaxHeight), available));
      const height = Math.min(desiredHeight, maxHeight);
      const left = Math.max(x + margin, Math.min(rect ? rect.right - width : x + (viewportWidth - width) / 2, x + viewportWidth - margin - width));
      const idealTop = rect ? (placeBelow ? rect.bottom + gap : rect.top - gap - height) : y + (viewportHeight - height) / 2;
      const top = Math.max(y + margin, Math.min(idealTop, y + viewportHeight - margin - height));
      const next = { left, top, width, maxHeight, visibility: "visible" as const };
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
