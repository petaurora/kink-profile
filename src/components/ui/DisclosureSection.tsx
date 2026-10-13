import { useId, type ReactNode } from "react";
import "./disclosure.css";

/** Disclosure is independent from preference editing; only its trigger toggles. */
export function DisclosureSection({
  title,
  description,
  open,
  onToggle,
  children,
}: {
  title: string;
  description?: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <section className="kp-ui kp-disclosure">
      <button
        type="button"
        className="kp-disclosure-trigger"
        aria-expanded={open}
        aria-controls={id}
        onClick={onToggle}
      >
        <span>
          {title}
          {description && <small>{description}</small>}
        </span>
        <span aria-hidden="true">{open ? "⌃" : "⌄"}</span>
      </button>
      <div id={id} hidden={!open}>
        {open && children}
      </div>
    </section>
  );
}
