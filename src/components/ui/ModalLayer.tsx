import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import "./modal.css";

type DialogEntry = {
  panel: HTMLElement;
  close: () => void;
  returnFocus: HTMLElement | null;
};
const dialogs: DialogEntry[] = [];
const focusableSelector =
  'button:not(:disabled), a[href], input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';
let previousOverflow = "";
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
export function useModalOpen() {
  return useSyncExternalStore(
    subscribe,
    () => dialogs.length > 0,
    () => false,
  );
}

export function useModalPanel() {
  return useSyncExternalStore(subscribe, () => dialogs.at(-1)?.panel ?? null, () => null);
}

// Hide only sibling branches, never an ancestor of the active dialog. Preserve
// pre-existing attributes and recompute when nested dialogs/portal content change.
const isolated = new Map<HTMLElement, { inert: string | null; hidden: string | null }>();
let isolationObserver: MutationObserver | undefined;
function restoreBackground() {
  for (const [element, original] of isolated) {
    if (original.inert === null) element.removeAttribute("inert");
    else element.setAttribute("inert", original.inert);
    if (original.hidden === null) element.removeAttribute("aria-hidden");
    else element.setAttribute("aria-hidden", original.hidden);
  }
  isolated.clear();
}
function isolateBackground() {
  restoreBackground();
  const top = dialogs.at(-1);
  if (!top) return;
  const backdrop = top.panel.parentElement?.querySelector<HTMLElement>(".kp-modal-backdrop");
  // The active backdrop stays pointer-operable; its own aria-hidden/tabindex
  // keeps it out of assistive technology and sequential keyboard navigation.
  const allowed = [top.panel, ...(backdrop ? [backdrop] : []), ...document.querySelectorAll<HTMLElement>("[data-modal-accessory]")];
  function visit(parent: HTMLElement) {
    for (const element of parent.children) {
      if (!(element instanceof HTMLElement) || /^(SCRIPT|STYLE|LINK)$/.test(element.tagName)) continue;
      if (allowed.includes(element)) continue;
      if (allowed.some((surface) => element.contains(surface))) visit(element);
      else {
        isolated.set(element, { inert: element.getAttribute("inert"), hidden: element.getAttribute("aria-hidden") });
        element.setAttribute("inert", "");
        element.setAttribute("aria-hidden", "true");
      }
    }
  }
  visit(document.body);
}

function focusable(panel: HTMLElement) {
  return [...new Set([
    ...panel.querySelectorAll<HTMLElement>(focusableSelector),
    ...document.querySelectorAll<HTMLElement>(
      `[data-modal-accessory] ${focusableSelector.split(", ").join(", [data-modal-accessory] ")}`,
    ),
  ])].filter(
    (element) =>
      element.tabIndex >= 0 &&
      !element.closest('[hidden], [inert], [aria-hidden="true"]') &&
      element.getClientRects().length > 0,
  );
}
function focusDialog(panel: HTMLElement) {
  const initial = panel.querySelector<HTMLElement>(
    "[data-dialog-initial-focus]",
  );
  (initial ?? focusable(panel)[0] ?? panel).focus();
}
function handleKey(event: KeyboardEvent) {
  const top = dialogs.at(-1);
  if (!top) return;
  if (event.key === "Escape") {
    event.preventDefault();
    event.stopImmediatePropagation();
    top.close();
  } else if (event.key === "Tab") {
    const elements = focusable(top.panel);
    const first = elements[0],
      last = elements.at(-1);
    const current = document.activeElement;
    if (!first) {
      event.preventDefault();
      top.panel.focus();
    } else if (
      event.shiftKey &&
      (current === first || !elements.includes(current as HTMLElement))
    ) {
      event.preventDefault();
      last?.focus();
    } else if (
      !event.shiftKey &&
      (current === last || !elements.includes(current as HTMLElement))
    ) {
      event.preventDefault();
      first.focus();
    }
  }
}
function handleFocus(event: FocusEvent) {
  const top = dialogs.at(-1);
  if (
    top &&
    !top.panel.contains(event.target as Node) &&
    !(event.target as HTMLElement).closest("[data-modal-accessory]")
  )
    focusDialog(top.panel);
}

/** A controlled modal surface. Content, semantics and visual variants are slots;
 * keyboard dismissal, scroll locking, nested focus and restoration are shared. */
type ModalLayerProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  closeLabel?: string;
  className?: string;
  panelClassName?: string;
  backdropClassName?: string;
  id?: string;
} & (
  { label: string; labelledBy?: never } | { label?: never; labelledBy: string }
);

export function ModalLayer({ open, ...props }: ModalLayerProps) {
  return open ? <ModalSurface {...props} /> : null;
}

function ModalSurface({
  onClose,
  children,
  label,
  labelledBy,
  closeLabel = "Close dialog",
  className = "",
  panelClassName = "",
  backdropClassName = "",
  id,
}: Omit<ModalLayerProps, "open">) {
  // Capture before descendants commit autofocus; the surface mounts only on open.
  const [returnFocus] = useState(() =>
    typeof document !== "undefined" &&
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null,
  );
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const entry: DialogEntry = {
      panel,
      close: () => closeRef.current(),
      returnFocus,
    };
    if (!dialogs.length) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKey, true);
      document.addEventListener("focusin", handleFocus);
      isolationObserver = new MutationObserver(isolateBackground);
      isolationObserver.observe(document.body, { childList: true, subtree: true });
    }
    // Child effects can register first; ancestors must stay below their children.
    const childIndex = dialogs.findIndex((dialog) =>
      panel.contains(dialog.panel),
    );
    if (childIndex === -1) dialogs.push(entry);
    else {
      entry.returnFocus = dialogs[childIndex].returnFocus;
      dialogs.splice(childIndex, 0, entry);
    }
    notify();
    // A newly mounted sheet may have been isolated by the observer before its
    // effect registers. Release that isolation before trying to focus its title.
    restoreBackground();
    if (dialogs.at(-1) === entry && !panel.contains(document.activeElement))
      focusDialog(panel);
    isolateBackground();
    return () => {
      const wasTop = dialogs.at(-1) === entry;
      const index = dialogs.indexOf(entry);
      if (index !== -1) dialogs.splice(index, 1);
      notify();
      if (!dialogs.length) {
        isolationObserver?.disconnect();
        isolationObserver = undefined;
        document.body.style.overflow = previousOverflow;
        document.removeEventListener("keydown", handleKey, true);
        document.removeEventListener("focusin", handleFocus);
      }
      isolateBackground();
      if (wasTop) {
        const target = entry.returnFocus;
        const top = dialogs.at(-1);
        if (target?.isConnected && (!top || top.panel.contains(target)))
          target.focus();
        else if (top) focusDialog(top.panel);
      }
    };
  }, [returnFocus]);
  return (
    <div className={`kp-ui kp-modal-layer ${className}`}>
      <button
        type="button"
        tabIndex={-1}
        className={`kp-modal-backdrop ${backdropClassName}`}
        aria-label={closeLabel}
        aria-hidden="true"
        onClick={onClose}
      />
      <section
        ref={panelRef}
        id={id}
        className={`kp-modal-panel ${panelClassName}`}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        aria-labelledby={labelledBy}
        tabIndex={-1}
      >
        {children}
      </section>
    </div>
  );
}
