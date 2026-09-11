import type { ReactNode } from "react";
import "./pairwiseComparison.css";

export type PairwiseComparisonItem = {
  id: string;
  eyebrow?: ReactNode;
  label: ReactNode;
  description?: ReactNode;
  pickLabel?: ReactNode;
};

export function PairwiseComparisonPanel({
  left,
  right,
  metaStart,
  metaEnd,
  onPick,
  actions,
  footer,
  ariaLabel,
}: {
  left: PairwiseComparisonItem;
  right: PairwiseComparisonItem;
  metaStart?: ReactNode;
  metaEnd?: ReactNode;
  onPick: (side: "left" | "right") => void;
  actions?: ReactNode;
  footer?: ReactNode;
  ariaLabel?: string;
}) {
  const renderChoice = (
    item: PairwiseComparisonItem,
    side: "left" | "right",
  ) => (
    <button
      key={item.id}
      type="button"
      className="pairwise-choice"
      onClick={() => onPick(side)}
    >
      {item.eyebrow && (
        <span className="pairwise-choice-eyebrow">{item.eyebrow}</span>
      )}
      <strong>{item.label}</strong>
      {item.description && (
        <p className="pairwise-choice-description">
          {item.description}
        </p>
      )}
      <small>{item.pickLabel ?? "Pick this"}</small>
    </button>
  );

  return (
    <article
      className="pairwise-panel panel"
      aria-label={ariaLabel}
    >
      {(metaStart || metaEnd) && (
        <div className="pairwise-meta">
          <span>{metaStart}</span>
          <span>{metaEnd}</span>
        </div>
      )}

      <div className="pairwise-grid">
        {renderChoice(left, "left")}
        {renderChoice(right, "right")}
        <div className="pairwise-or" aria-hidden="true">
          OR
        </div>
      </div>

      {actions && <div className="pairwise-actions">{actions}</div>}
      {footer && <div className="pairwise-footer">{footer}</div>}
    </article>
  );
}
