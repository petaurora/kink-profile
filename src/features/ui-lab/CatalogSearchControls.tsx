import { useEffect, useRef } from "react";

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
}: {
  onClick: () => void;
  active?: boolean;
  expanded?: boolean;
}) {
  return (
    <button
      type="button"
      className={"lab-search-filter-trigger" + (active ? " is-active" : "")}
      aria-label="Sort and group results"
      title="Sort and group results"
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
        <circle cx="8" cy="7" r="2" fill="var(--lab-search-bg, #17183f)" />
        <circle cx="15" cy="12" r="2" fill="var(--lab-search-bg, #17183f)" />
      </svg>
    </button>
  );
}

export function SearchChips({
  options,
  label,
  clear,
}: {
  options: ChipOption[];
  label: string;
  clear?: () => void;
}) {
  return (
    <div className="lab-search-chips" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          type="button"
          key={option.id}
          className={"lab-search-chip" + (option.active ? " is-active" : "")}
          aria-pressed={option.active}
          onClick={option.onClick}
        >
          {option.label}
        </button>
      ))}
      {clear && (
        <button type="button" className="lab-search-chips-clear" onClick={clear}>
          Clear
        </button>
      )}
    </div>
  );
}

/**
 * Shared, accessible sort/group sheet used by the global-search dialog and
 * all Catalog lists. Classification state lives outside this sheet.
 */
export function SortGroupSheet({
  open,
  onClose,
  sort,
  onSort,
  group,
  onGroup,
  defaultSortLabel = "Default order",
}: {
  open: boolean;
  onClose: () => void;
  sort: SortBy;
  onSort: (value: SortBy) => void;
  group: GroupBy;
  onGroup: (value: GroupBy) => void;
  defaultSortLabel?: string;
}) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    const returnFocusTo = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    titleRef.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onCloseRef.current();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("keydown", handleKey);
      requestAnimationFrame(() => returnFocusTo?.focus());
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="lab-order-layer">
      <button
        type="button"
        className="lab-order-backdrop"
        aria-label="Close sort and group options"
        onClick={onClose}
      />
      <section className="lab-order-sheet" role="dialog" aria-modal="true" aria-labelledby="lab-order-title">
        <div className="lab-order-header">
          <h2 id="lab-order-title" ref={titleRef} tabIndex={-1}>
            Sort & Group
          </h2>
          <button type="button" aria-label="Close" className="lab-order-close" onClick={onClose}>
            ×
          </button>
        </div>
        <fieldset className="lab-order-section">
          <legend>Sort by</legend>
          {([
            ["default", defaultSortLabel],
            ["az", "Name: A–Z"],
            ["za", "Name: Z–A"],
          ] as const).map(([value, title]) => (
            <button key={value} type="button" aria-pressed={sort === value}
              className={"lab-order-option" + (sort === value ? " is-selected" : "")}
              onClick={() => onSort(value)}
            >
              {title}<span aria-hidden="true">{sort === value ? "✓" : ""}</span>
            </button>
          ))}
        </fieldset>
        <fieldset className="lab-order-section">
          <legend>Group by</legend>
          {([
            ["none", "None"],
            ["category", "Category"],
          ] as const).map(([value, title]) => (
            <button key={value} type="button" aria-pressed={group === value}
              className={"lab-order-option" + (group === value ? " is-selected" : "")}
              onClick={() => onGroup(value)}
            >
              {title}<span aria-hidden="true">{group === value ? "✓" : ""}</span>
            </button>
          ))}
        </fieldset>
        <button type="button" className="lab-order-done" onClick={onClose}>Done</button>
      </section>
    </div>
  );
}
