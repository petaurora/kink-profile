import "./progress.css";
import "./feedback.css";

export type ProgressSize = "hairline" | "regular" | "prominent";

function normalizedProgress(value: number, max: number) {
  const safeMax = Number.isFinite(max) && max > 0 ? max : 1;
  const safeValue = Number.isFinite(value) ? Math.max(0, Math.min(value, safeMax)) : 0;
  return { value: safeValue, max: safeMax, percentage: (safeValue / safeMax) * 100 };
}

/** Real, determinate progress only. Do not supply fabricated percentages for loading. */
export function ProgressBar({
  value,
  max = 100,
  label,
  valueText,
  size = "regular",
  className = "",
}: {
  value: number;
  max?: number;
  label: string;
  valueText?: string;
  size?: ProgressSize;
  className?: string;
}) {
  const progress = normalizedProgress(value, max);
  return (
    <div
      className={`kp-ui kp-progress-track kp-progress--${size}${className ? " " + className : ""}`}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuenow={progress.value}
      aria-valuemax={progress.max}
      aria-valuetext={valueText}
    >
      <span style={{ width: `${progress.percentage}%` }} />
    </div>
  );
}

/** The number of completed steps is independent of the currently displayed step. */
export function StepProgress({
  completed,
  total,
  title = "Progress",
  showCount = true,
  size = "regular",
  className = "",
}: {
  completed: number;
  total: number;
  title?: string;
  showCount?: boolean;
  size?: ProgressSize;
  className?: string;
}) {
  const safeTotal = Number.isFinite(total) && total > 0 ? Math.floor(total) : 0;
  const safeCompleted = Number.isFinite(completed)
    ? Math.max(0, Math.min(Math.floor(completed), safeTotal))
    : 0;
  const valueText = `${safeCompleted} of ${safeTotal} complete`;
  return (
    <div className={`kp-ui kp-step-progress${className ? " " + className : ""}`}>
      {showCount && (
        <div className="kp-step-progress__meta">
          <span>{title}</span>
          <span aria-hidden="true">{safeCompleted} / {safeTotal}</span>
        </div>
      )}
      <ProgressBar
        label={title}
        value={safeCompleted}
        max={safeTotal || 1}
        valueText={valueText}
        size={size}
      />
    </div>
  );
}

/** Unknown duration: motion communicates activity without implying measured completion. */
export function LoadingBar({
  label = "Loading",
  size = "regular",
  className = "",
}: {
  label?: string;
  size?: ProgressSize;
  className?: string;
}) {
  return (
    <div
      className={`kp-ui kp-progress-track kp-progress--${size} kp-loading-bar${className ? " " + className : ""}`}
      role="progressbar"
      aria-label={label}
      aria-valuetext="In progress"
    >
      <span aria-hidden="true" />
    </div>
  );
}
