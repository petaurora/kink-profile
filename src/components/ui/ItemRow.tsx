import type { ReactNode, MouseEvent } from "react";
import "./itemRow.css";

/** Compact row with independent identity, indicator and control slots. */
export function ItemRow({
  name,
  itemId,
  supportingText,
  indicators,
  preference,
  onRefine,
  refined = false,
  refineStatus,
}: {
  name: string;
  itemId: string;
  supportingText?: string;
  indicators?: ReactNode;
  preference: ReactNode;
  onRefine?: (event: MouseEvent<HTMLButtonElement>) => void;
  refined?: boolean;
  refineStatus?: "saving" | "failed";
}) {
  return (
    <article className="kp-ui kp-item" data-item-id={itemId}>
      <div className="kp-item-row">
        <span className="kp-item-main">
          <span className="kp-item-name">{name}</span>
          {indicators}
        </span>
        {preference}
        {onRefine && (
          <button
            type="button"
            className="kp-refine-toggle"
            aria-haspopup="dialog"
            aria-label={refineStatus === "failed" ? `${name}: Modifier save failed. Reveal issue` : refineStatus === "saving" ? `${name}: Saving modifiers. Refine` : `Refine ${name}${refined ? ". Has rated modifiers" : ""}`}
            onClick={onRefine}
          >
            <span aria-hidden="true">+</span> Refine
            {refineStatus ? <span className={`kp-refine-status kp-refine-status--${refineStatus}`} aria-hidden="true">{refineStatus === "failed" ? "!" : "◌"}</span> : refined && <span className="kp-refined-dot" aria-hidden="true" />}
          </button>
        )}
        {supportingText && <small className="kp-item-supporting-text">{supportingText}</small>}
      </div>
    </article>
  );
}
