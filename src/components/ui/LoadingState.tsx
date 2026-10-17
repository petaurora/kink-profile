import type { ReactNode } from "react";
import { AppIcon } from "./AppIcon";
import { LoadingBar } from "./ProgressBar";
import "./feedback.css";

export type LoadingSize = "small" | "medium" | "large";

/**
 * Continuous linear rotation: a temporary Tabler glyph today, commissioned
 * artwork later through the artwork slot, without changing loading semantics.
 */
export function LoadingIndicator({
  size = "medium",
  artwork,
  className = "",
}: {
  size?: LoadingSize;
  artwork?: ReactNode;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`kp-ui kp-loading-indicator kp-loading-indicator--${size}${className ? " " + className : ""}`}
    >
      <span className="kp-loading-indicator__art">
        {artwork ?? <AppIcon name="pending" size={size === "small" ? 17 : size === "large" ? 42 : 26} />}
      </span>
    </span>
  );
}

/** Use inside a known loading surface; never substitute it for useful page content. */
export function LoadingState({
  label,
  detail,
  presentation = "inline",
  size = "medium",
  artwork,
  showBar = false,
  className = "",
}: {
  label: string;
  detail?: string;
  presentation?: "inline" | "panel";
  size?: LoadingSize;
  artwork?: ReactNode;
  showBar?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`kp-ui kp-loading-state kp-loading-state--${presentation}${className ? " " + className : ""}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <LoadingIndicator size={size} artwork={artwork} />
      <div className="kp-loading-state__copy">
        <strong>{label}</strong>
        {detail && <span>{detail}</span>}
        {showBar && <LoadingBar label={label} size="hairline" />}
      </div>
    </div>
  );
}

/** Decorative placeholder for loading layouts; put a real status on the parent. */
export function SkeletonBlock({
  width = "100%",
  height = "1rem",
  radius = "small",
  className = "",
}: {
  width?: string;
  height?: string;
  radius?: "small" | "medium" | "round";
  className?: string;
}) {
  return (
    <span
      className={`kp-ui kp-skeleton kp-skeleton--${radius}${className ? " " + className : ""}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}
