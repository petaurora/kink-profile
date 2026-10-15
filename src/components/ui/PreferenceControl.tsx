import { AppIcon } from "./AppIcon";
import { appIcons } from "./appIcons";
import { useEffect, useLayoutEffect, useId, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { ModalLayer } from "./ModalLayer";
import { PreferenceChip, isPreferenceRating, preferenceIconMeanings } from "./PreferenceChip";
import { useAnchoredPanel } from "./useAnchoredPanel";
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
            <AppIcon name="refresh" size={15} inline />Retry
          </button>
        ) : (
          <AppIcon name="error" size={15} />
        )) : (
      <span aria-hidden="true">
        {state === "saving" ? <AppIcon name="pending" size={15} /> : state === "saved" ? <AppIcon name="confirm" size={15} /> : null}
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
  expanded = false,
}: {
  value?: string;
  label: string;
  onActivate: (event: MouseEvent<HTMLButtonElement>) => void;
  saveState?: SaveState;
  onRetry?: () => void;
  expanded?: boolean;
}) {
  return (
    <span className="kp-ui kp-rating-wrap">
      <button
        type="button"
        className="kp-rating"
        aria-haspopup="dialog"
        aria-expanded={expanded}
        aria-label={`${label}: ${value || "Not rated"}. Change rating`}
        onClick={(event) => {
          event.stopPropagation();
          onActivate(event);
        }}
      >
        <PreferenceChip value={value} />
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
  anchor,
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
  anchor?: HTMLElement | null;
}) {
  const titleId = useId();
  const helpId = useId();
  const [showHelp, setShowHelp] = useState(false);
  const expanded = helpOpen ?? showHelp;
  const [focusIndex, setFocusIndex] = useState(Math.max(0, options.indexOf(value || "")));
  const choicesRef = useRef<HTMLDivElement>(null);
  const revealedSelection = useRef<string | null>(null);
  const position = useAnchoredPanel(open, anchor);
  useEffect(() => setFocusIndex(Math.max(0, options.indexOf(value || ""))), [label, open, value, options]);
  useLayoutEffect(() => {
    if (!open) { revealedSelection.current = null; return; }
    if (position.panelStyle.visibility !== "visible" || revealedSelection.current === label) return;
    const selected = choicesRef.current?.querySelector<HTMLElement>('[aria-pressed="true"]');
    const scroll = choicesRef.current?.parentElement;
    if (!selected || !scroll) return;
    revealedSelection.current = label;
    const row = selected.getBoundingClientRect(), viewport = scroll.getBoundingClientRect();
    if (row.bottom > viewport.bottom) scroll.scrollTop += row.bottom - viewport.bottom;
    else if (row.top < viewport.top) scroll.scrollTop -= viewport.top - row.top;
  }, [open, label, position.panelStyle]);
  const close = () => {
    onClose();
  };
  return (
    <ModalLayer
      open={open}
      onClose={close}
      labelledBy={titleId}
      closeLabel="Close rating selector"
      className={`kp-preference-popover ${className}`}
      panelClassName="kp-preference-panel"
      panelRef={position.panelRef}
      panelStyle={position.panelStyle}
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
      <div className="kp-preference-scroll">
      <div className="kp-preference-options" role="group" aria-label="Rating choices" ref={choicesRef} onKeyDown={event => {
        if ((event.key === "Enter" || event.key === " ") && event.target instanceof HTMLButtonElement) {
          event.preventDefault();
          if (options[focusIndex] !== value) onChange(options[focusIndex]);
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
            aria-label={option}
            tabIndex={index === focusIndex ? 0 : -1}
            onFocus={() => setFocusIndex(index)}
            onClick={() => {
              if (option !== value) onChange(option);
              close();
            }}
          >
            {isPreferenceRating(option) && <AppIcon name={preferenceIconMeanings[option]} size={20} />}
            <span className="kp-preference-option-label">{option}</span>
            {value === option && <AppIcon name="confirm" size={18} />}
          </button>
        ))}
      </div>
      {help && (
        <>
          <button
            type="button"
            className="kp-preference-help"
            aria-label="What do these ratings mean?"
            aria-expanded={expanded}
            aria-controls={helpId}
            onClick={() => { setShowHelp(!expanded); onHelpOpenChange?.(!expanded); }}
          >
            <AppIcon name="help" size={18} inline />What do these ratings mean? <AppIcon name="expand" size={16} style={{transform: expanded ? "rotate(180deg)" : undefined}} />
          </button>
            <div className="kp-preference-explanation" id={helpId} hidden={!expanded}>{help}</div>
        </>
      )}
      </div>
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
  icon,
}: {
  title: string;
  titleId?: string;
  context?: string;
  onClose: () => void;
  closeLabel?: string;
  children?: React.ReactNode;
  onTitleKeyDown?: (event: KeyboardEvent<HTMLHeadingElement>) => void;
  icon?: ReactNode;
}) {
  return (
    <div className="kp-sheet-header">
      <div>
        {context && <small>{context}</small>}
        <h3 id={titleId} data-dialog-initial-focus tabIndex={-1} onKeyDown={onTitleKeyDown}>
          {icon}{title}
        </h3>
        {children}
      </div>
      <button type="button" onClick={onClose} aria-label={closeLabel} title={closeLabel}>
        <appIcons.close size={20} stroke={1.65} aria-hidden="true" />
      </button>
    </div>
  );
}
