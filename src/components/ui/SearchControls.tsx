import { useId, type ReactNode } from "react";
import { ModalLayer } from "./ModalLayer";
import "./search.css";

export function SearchRow({ children }: { children: ReactNode }) {
  return <div className="kp-ui kp-search-row">{children}</div>;
}

export type SortBy = "default" | "az" | "za";
export type GroupBy = "none" | "category";

export type ChipOption = {
  id: string;
  label: string;
  active: boolean;
  onClick: () => void;
};

export function SearchFilterButton({
  onClick,
  active = false,
  expanded = false,
  groupingAvailable = true,
}: {
  onClick: () => void;
  active?: boolean;
  expanded?: boolean;
  groupingAvailable?: boolean;
}) {
  return (
    <button
      type="button"
      className={
        "kp-ui kp-search-filter-trigger" + (active ? " is-active" : "")
      }
      aria-label={groupingAvailable ? "Sort and group results" : "Sort results"}
      title={groupingAvailable ? "Sort and group results" : "Sort results"}
      aria-haspopup="dialog"
      aria-expanded={expanded}
      onClick={onClick}
    >
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 7h16M7 12h10M10 17h4" />
        <circle cx="8" cy="7" r="2" fill="var(--kp-search-bg, #17183f)" />
        <circle cx="15" cy="12" r="2" fill="var(--kp-search-bg, #17183f)" />
      </svg>
    </button>
  );
}

export function SearchChips({
  options,
  label,
  clear,
}: {
  options: readonly ChipOption[];
  label: string;
  clear?: () => void;
}) {
  return (
    <div className="kp-ui kp-search-chips" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          type="button"
          key={option.id}
          className={"kp-search-chip" + (option.active ? " is-active" : "")}
          aria-pressed={option.active}
          onClick={option.onClick}
        >
          {option.label}
        </button>
      ))}
      {clear && (
        <button type="button" className="kp-search-chips-clear" onClick={clear}>
          Clear
        </button>
      )}
    </div>
  );
}

/**
 * Controlled sort/group sheet. The caller decides whether grouping is useful.
 * Filtering and classification state stay outside this sheet.
 */
export function SortGroupSheet({
  open,
  onClose,
  sort,
  onSort,
  group,
  onGroup,
  defaultSortLabel = "Default order",
  showDefault = true,
  showGrouping = true,
}: {
  open: boolean;
  onClose: () => void;
  sort: SortBy;
  onSort: (value: SortBy) => void;
  group?: GroupBy;
  onGroup?: (value: GroupBy) => void;
  defaultSortLabel?: string;
  showDefault?: boolean;
  showGrouping?: boolean;
}) {
  const titleId = useId();
  const canGroup = showGrouping && !!onGroup && group !== undefined;
  return (
    <ModalLayer
      open={open}
      onClose={onClose}
      labelledBy={titleId}
      closeLabel={
        canGroup ? "Close sort and group options" : "Close sort options"
      }
      className="kp-order-layer"
      backdropClassName="kp-order-backdrop"
      panelClassName="kp-order-sheet"
    >
      <div className="kp-order-header">
        <h2 id={titleId} data-dialog-initial-focus tabIndex={-1}>
          {canGroup ? "Sort & Group" : "Sort"}
        </h2>
        <button
          type="button"
          aria-label="Close"
          className="kp-order-close"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      <fieldset className="kp-order-section">
        <legend>Sort by</legend>
        {showDefault && (
          <button
            type="button"
            aria-pressed={sort === "default"}
            className={
              "kp-order-option" + (sort === "default" ? " is-selected" : "")
            }
            onClick={() => onSort("default")}
          >
            {defaultSortLabel}
            <span aria-hidden="true">{sort === "default" ? "✓" : ""}</span>
          </button>
        )}
        {(
          [
            ["az", "Name: A–Z"],
            ["za", "Name: Z–A"],
          ] as const
        ).map(([value, title]) => (
          <button
            key={value}
            type="button"
            aria-pressed={sort === value}
            className={
              "kp-order-option" + (sort === value ? " is-selected" : "")
            }
            onClick={() => onSort(value)}
          >
            {title}
            <span aria-hidden="true">{sort === value ? "✓" : ""}</span>
          </button>
        ))}
      </fieldset>
      {canGroup && (
        <fieldset className="kp-order-section">
          <legend>Group by</legend>
          {(
            [
              ["none", "None"],
              ["category", "Category"],
            ] as const
          ).map(([value, title]) => (
            <button
              key={value}
              type="button"
              aria-pressed={group === value}
              className={
                "kp-order-option" + (group === value ? " is-selected" : "")
              }
              onClick={() => onGroup?.(value)}
            >
              {title}
              <span aria-hidden="true">{group === value ? "✓" : ""}</span>
            </button>
          ))}
        </fieldset>
      )}
      <button type="button" className="kp-order-done" onClick={onClose}>
        Done
      </button>
    </ModalLayer>
  );
}
