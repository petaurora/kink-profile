import type { ReactNode, MouseEvent } from "react";
import "./itemRow.css";

/** Compact row with independent identity, indicator and control slots. */
export function ItemRow({
  name,
  itemId,
  indicators,
  preference,
  onRefine,
  refined = false,
}: {
  name: string;
  itemId: string;
  indicators?: ReactNode;
  preference: ReactNode;
  onRefine?: (event: MouseEvent<HTMLButtonElement>) => void;
  refined?: boolean;
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
            onClick={onRefine}
          >
            <span aria-hidden="true">+</span> Refine
            {refined && <span className="kp-refined-dot" aria-hidden="true" />}
          </button>
        )}
      </div>
    </article>
  );
}
