import { appIcons } from "./appIcons";
import { useId, type ReactNode } from "react";
import "./disclosure.css";

/** Disclosure is independent from preference editing; only its trigger toggles. */
export function DisclosureSection({
  title,
  description,
  open,
  onToggle,
  children,
  status,
}: {
  title: string;
  description?: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
  status?: "saving" | "failed";
}) {
  const id = useId();
  return (
    <section className="kp-ui kp-disclosure">
      <button
        type="button"
        className="kp-disclosure-trigger"
        aria-expanded={open}
        aria-controls={id}
        aria-label={status === "failed" ? `${title}: Save failed. Reveal issue` : undefined}
        onClick={onToggle}
      >
        <span>
          {title}
          {description && <small>{description}</small>}
        </span>
        <span>{status && <span className="kp-group-status" role="status" aria-label={status === "failed" ? "Save failed" : "Saving"}>{status === "failed" ? "!" : "◌"}</span>}<span aria-hidden="true"><appIcons.expand size={18} stroke={1.65} style={{ transform: open ? "rotate(180deg)" : undefined }} /></span></span>
      </button>
      <div id={id} hidden={!open}>
        {open && children}
      </div>
    </section>
  );
}
