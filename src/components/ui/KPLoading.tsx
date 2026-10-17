import type { CSSProperties } from "react";
import "./kpLoading.css";

/**
 * Temporary, original SVG loading mark. No watermarked/stock asset is included.
 * Swap the SVG artwork when the commissioned KP mark is ready.
 */
export type KPLoadingProps = {
  label?: string;
  size?: number;
  compact?: boolean;
  className?: string;
};

export function KPLoading({
  label = "Loading…",
  size = 72,
  compact = false,
  className = "",
}: KPLoadingProps) {
  const safeSize = Number.isFinite(size) ? Math.max(24, Math.min(240, size)) : 72;
  const style = { "--kp-loading-size": safeSize + "px" } as CSSProperties;
  return (
    <div
      className={"kp-ui kp-loading " + (compact ? "kp-loading-compact " : "") + className}
      style={style}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <svg className="kp-loading-symbol" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
        <g fill="none" stroke="currentColor" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="50" cy="50" r="40" />
          <path d="M50 50 C42 44 32 39 32 29 C32 21 38 15 46 12" />
          <path d="M50 50 C42 44 32 39 32 29 C32 21 38 15 46 12" transform="rotate(120 50 50)" />
          <path d="M50 50 C42 44 32 39 32 29 C32 21 38 15 46 12" transform="rotate(240 50 50)" />
        </g>
        <g fill="currentColor">
          <circle cx="51" cy="30" r="4.7" />
          <circle cx="51" cy="30" r="4.7" transform="rotate(120 50 50)" />
          <circle cx="51" cy="30" r="4.7" transform="rotate(240 50 50)" />
        </g>
      </svg>
      {!compact && <span className="kp-loading-label" aria-hidden="true">{label}</span>}
    </div>
  );
}
