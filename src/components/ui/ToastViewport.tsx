import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import "./toast.css";

export type ToastMessage = {
  id: number;
  message: string;
  kind: "success" | "error" | "info";
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
};

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: (id: number) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const pointer = useRef<{
    x: number;
    y: number;
    id: number;
    horizontal: boolean;
  } | null>(null);
  const duration =
    toast.duration ??
    (toast.kind === "error" ? 0 : toast.actionLabel ? 8000 : 3500);
  const remaining = useRef(duration);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;
  const paused = hovered || focused || dragging;
  useEffect(() => {
    if (paused || leaving || remaining.current <= 0) return;
    const started = Date.now();
    const timer = setTimeout(
      () => dismissRef.current(toast.id),
      remaining.current,
    );
    return () => {
      clearTimeout(timer);
      remaining.current = Math.max(
        0,
        remaining.current - (Date.now() - started),
      );
    };
  }, [paused, leaving, toast.id]);
  useEffect(() => () => clearTimeout(dismissTimer.current), []);
  const dismiss = () => {
    if (leaving) return;
    setLeaving(true);
    dismissTimer.current = setTimeout(() => dismissRef.current(toast.id), 150);
  };
  const compact =
    toast.kind === "success" && !toast.actionLabel && toast.message.length < 45;
  return (
    <div
      className={`kp-toast ${compact ? "kp-toast-pill" : "kp-toast-rect"} kp-toast-${toast.kind}${leaving ? " kp-toast-leaving" : ""}`}
      role={toast.kind === "error" ? "alert" : "status"}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
      onPointerDown={(event) => {
        // Swiping must never activate an Undo/Retry or dismiss button by accident.
        if ((event.target as HTMLElement).closest("button")) return;
        if (event.pointerType === "touch" || event.pointerType === "pen") {
          pointer.current = {
            x: event.clientX,
            y: event.clientY,
            id: event.pointerId,
            horizontal: false,
          };
          setDragging(true);
        }
      }}
      onPointerMove={(event) => {
        const start = pointer.current;
        if (!start || start.id !== event.pointerId) return;
        const dx = event.clientX - start.x,
          dy = event.clientY - start.y;
        if (
          !start.horizontal &&
          Math.abs(dy) > 8 &&
          Math.abs(dy) > Math.abs(dx)
        ) {
          pointer.current = null;
          setDragging(false);
          return;
        }
        if (
          start.horizontal ||
          (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.3)
        ) {
          start.horizontal = true;
          if (!event.currentTarget.hasPointerCapture(event.pointerId))
            event.currentTarget.setPointerCapture(event.pointerId);
          setOffset(dx);
        }
      }}
      onPointerUp={(event) => {
        const start = pointer.current;
        if (!start || start.id !== event.pointerId) return;
        pointer.current = null;
        const dx = event.clientX - start.x;
        if (start.horizontal && Math.abs(dx) > 75) {
          setOffset(dx > 0 ? 320 : -320);
          dismiss();
        } else {
          setOffset(0);
          setDragging(false);
        }
      }}
      onPointerCancel={() => {
        pointer.current = null;
        setOffset(0);
        setDragging(false);
      }}
      style={{
        transform: `translateX(${offset}px)`,
        opacity: leaving ? 0 : Math.max(0.35, 1 - Math.abs(offset) / 260),
      }}
    >
      <span className="kp-toast-message">{toast.message}</span>
      {toast.actionLabel && (
        <button
          type="button"
          className="kp-toast-action"
          onClick={() => {
            if (leaving) return;
            toast.onAction?.();
            dismiss();
          }}
        >
          {toast.actionLabel}
        </button>
      )}
      {!compact && (
        <button
          type="button"
          className="kp-toast-dismiss"
          onClick={dismiss}
          aria-label="Dismiss notification"
        >
          ×
        </button>
      )}
    </div>
  );
}

/** One visible toast. Queue ownership belongs to useToastQueue or the caller. */
export function ToastViewport({
  items,
  onDismiss,
  position = "above-navigation",
}: {
  items: ToastMessage[];
  onDismiss: (id: number) => void;
  position?: "above-navigation" | "modal";
}) {
  const active = items[0];
  if (!active) return null;
  return createPortal(
    <div
      data-modal-accessory
      className={`kp-ui kp-toast-region${position === "modal" ? " kp-toast-region-modal" : ""}`}
      aria-label="Notifications"
    >
      <ToastCard key={active.id} toast={active} onDismiss={onDismiss} />
    </div>,
    document.body,
  );
}
