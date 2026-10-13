import { useEffect, useId, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
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
  const message = state === "saving" ? `${label}: Saving` : state === "saved" ? `${label}: Saved` : state === "failed" ? `${label}: Not saved` : "";
  return (
    <span className="kp-save-status">
      <span role="status" aria-atomic="true" className="kp-visually-hidden">{message}</span>
      {state === "failed" ? (onRetry ? (
          <button
            type="button"
            className="kp-retry"
            onClick={onRetry}
            aria-label={`Retry saving ${label}`}
          >
            Retry
          </button>
        ) : (
          <span aria-hidden="true">!</span>
        )) : (
      <span aria-hidden="true">
        {state === "saving" ? "◌" : state === "saved" ? "✓" : ""}
      </span>
      )}
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
  helpOpen,
  onHelpOpenChange,
  className = "",
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  context?: string;
  value?: string;
  options: readonly string[];
  onChange: (value: string | undefined) => void;
  help?: ReactNode;
  helpOpen?: boolean;
  onHelpOpenChange?: (open: boolean) => void;
  className?: string;
}) {
  const titleId = useId();
  const helpId = useId();
  const [showHelp, setShowHelp] = useState(false);
  const expanded = helpOpen ?? showHelp;
  const [focusIndex, setFocusIndex] = useState(Math.max(0, options.indexOf(value || "")));
  const choicesRef = useRef<HTMLDivElement>(null);
  useEffect(() => setFocusIndex(Math.max(0, options.indexOf(value || ""))), [label, open, value, options]);
  const close = () => {
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
        onTitleKeyDown={event => {
          if (event.key === "Tab" && !event.shiftKey) {
            event.preventDefault();
            choicesRef.current?.querySelector<HTMLButtonElement>('button[tabindex="0"]')?.focus();
          }
        }}
      />
      <span className="kp-keyboard-hint">Arrow keys move focus; Enter or Space chooses. Escape cancels.</span>
      <div className="kp-preference-options" role="group" aria-label="Rating choices" ref={choicesRef} onKeyDown={event => {
        if ((event.key === "Enter" || event.key === " ") && event.target instanceof HTMLButtonElement) {
          event.preventDefault();
          onChange(options[focusIndex]);
          close();
          return;
        }
        const direction = ["ArrowRight", "ArrowDown"].includes(event.key) ? 1 : ["ArrowLeft", "ArrowUp"].includes(event.key) ? -1 : 0;
        if (!direction && event.key !== "Home" && event.key !== "End") return;
        event.preventDefault();
        const next = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : (focusIndex + direction + options.length) % options.length;
        setFocusIndex(next);
        choicesRef.current?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus();
      }}>
        {options.map((option, index) => (
          <button
            key={option}
            type="button"
            className={value === option ? "chosen" : ""}
            aria-pressed={value === option}
            tabIndex={index === focusIndex ? 0 : -1}
            onFocus={() => setFocusIndex(index)}
            onClick={() => {
              onChange(option);
              close();
            }}
          >
            {option}
            {value === option && <span aria-hidden="true"> ✓</span>}
          </button>
        ))}
      </div>
      {help && (
        <>
          <button
            type="button"
            className="kp-preference-help"
            aria-expanded={expanded}
            aria-controls={helpId}
            onClick={() => { setShowHelp(!expanded); onHelpOpenChange?.(!expanded); }}
          >
            What do these mean? {expanded ? "−" : "+"}
          </button>
            <div className="kp-preference-explanation" id={helpId} hidden={!expanded}>{help}</div>
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
  onTitleKeyDown,
}: {
  title: string;
  titleId?: string;
  context?: string;
  onClose: () => void;
  closeLabel?: string;
  children?: React.ReactNode;
  onTitleKeyDown?: (event: KeyboardEvent<HTMLHeadingElement>) => void;
}) {
  return (
    <div className="kp-sheet-header">
      <div>
        {context && <small>{context}</small>}
        <h3 id={titleId} data-dialog-initial-focus tabIndex={-1} onKeyDown={onTitleKeyDown}>
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
