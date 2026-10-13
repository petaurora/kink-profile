import { useId, useState, type MouseEvent } from "react";
import { ModalLayer } from "./ModalLayer";
import "./preference.css";

export type SaveState = "idle" | "saving" | "saved" | "failed";

/** Presentation only: callers must confirm persistence before passing saved. */
export function InlineSaveStatus({
  state = "idle",
  label,
  onRetry,
}: {
  state?: SaveState;
  label: string;
  onRetry?: () => void;
}) {
  if (state === "failed")
    return (
      <span className="kp-save-status" role="status">
        {onRetry ? (
          <button
            type="button"
            className="kp-retry"
            onClick={onRetry}
            aria-label={`Retry saving ${label}`}
          >
            Retry
          </button>
        ) : (
          <span aria-label={`${label}: Not saved`}>!</span>
        )}
      </span>
    );
  return (
    <span
      className="kp-save-status"
      role="status"
      aria-label={
        state === "saving"
          ? `${label}: Saving`
          : state === "saved"
            ? `${label}: Saved`
            : undefined
      }
    >
      <span aria-hidden="true">
        {state === "saving" ? "◌" : state === "saved" ? "✓" : ""}
      </span>
    </span>
  );
}

export function PreferenceControl({
  value,
  label,
  onActivate,
  saveState,
  onRetry,
}: {
  value?: string;
  label: string;
  onActivate: (event: MouseEvent<HTMLButtonElement>) => void;
  saveState?: SaveState;
  onRetry?: () => void;
}) {
  return (
    <span className="kp-ui kp-rating-wrap">
      <button
        type="button"
        className="kp-rating"
        aria-haspopup="dialog"
        aria-label={`${label}: ${value || "Not rated"}. Change rating`}
        onClick={(event) => {
          event.stopPropagation();
          onActivate(event);
        }}
      >
        {value || "Not rated"}
      </button>
      <InlineSaveStatus state={saveState} label={label} onRetry={onRetry} />
    </span>
  );
}

/** Option vocabulary, independent values and save policy belong to the caller. */
export function PreferenceSheet({
  open,
  onClose,
  label,
  context,
  value,
  options,
  onChange,
  help,
  className = "",
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  context?: string;
  value?: string;
  options: readonly string[];
  onChange: (value: string | undefined) => void;
  help?: string;
  className?: string;
}) {
  const titleId = useId();
  const helpId = useId();
  const [showHelp, setShowHelp] = useState(false);
  const close = () => {
    setShowHelp(false);
    onClose();
  };
  return (
    <ModalLayer
      open={open}
      onClose={close}
      labelledBy={titleId}
      closeLabel="Close rating selector"
      className={className}
    >
      <SheetHeader
        title={label}
        titleId={titleId}
        context={context}
        onClose={close}
        closeLabel="Close selector"
      />
      <div className="kp-preference-options">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={value === option ? "chosen" : ""}
            aria-pressed={value === option}
            onClick={() => {
              onChange(option);
              close();
            }}
          >
            {option}
            {value === option ? " ✓" : ""}
          </button>
        ))}
      </div>
      {help && (
        <>
          <button
            type="button"
            className="kp-preference-help"
            aria-expanded={showHelp}
            aria-controls={helpId}
            onClick={() => setShowHelp((previous) => !previous)}
          >
            What do these mean? {showHelp ? "−" : "+"}
          </button>
          {showHelp && (
            <p className="kp-preference-explanation" id={helpId}>
              {help}
            </p>
          )}
        </>
      )}
      {value && (
        <button
          type="button"
          className="kp-preference-clear"
          onClick={() => {
            onChange(undefined);
            close();
          }}
        >
          Clear rating
        </button>
      )}
    </ModalLayer>
  );
}

export function SheetHeader({
  title,
  titleId,
  context,
  onClose,
  closeLabel = "Close",
  children,
}: {
  title: string;
  titleId?: string;
  context?: string;
  onClose: () => void;
  closeLabel?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="kp-sheet-header">
      <div>
        {context && <small>{context}</small>}
        <h3 id={titleId} data-dialog-initial-focus tabIndex={-1}>
          {title}
        </h3>
        {children}
      </div>
      <button type="button" onClick={onClose} aria-label={closeLabel}>
        ×
      </button>
    </div>
  );
}
