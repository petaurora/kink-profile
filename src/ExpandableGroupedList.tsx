import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type ExpandableListGroup<T> = {
  id: string;
  title: string;
  eyebrow?: string;
  items: readonly T[];
};

export function ExpandableGroupedList<T>({
  groups,
  columnHeadings,
  renderItem,
  summary,
  emptyTitle,
  emptyCopy,
  onClearFilters,
  focusGroupId,
  expansionKey,
  headClassName,
  listClassName,
  getGroupMeta,
}: {
  groups: readonly ExpandableListGroup<T>[];
  columnHeadings: readonly string[];
  renderItem: (item: T) => ReactNode;
  summary: ReactNode;
  emptyTitle: string;
  emptyCopy: string;
  onClearFilters: () => void;
  focusGroupId?: string;
  expansionKey?: string;
  headClassName: string;
  listClassName?: string;
  getGroupMeta?: (group: ExpandableListGroup<T>) => string;
}) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => (focusGroupId ? new Set([focusGroupId]) : new Set()),
  );

  useEffect(() => {
    setExpandedGroups(
      focusGroupId ? new Set([focusGroupId]) : new Set(),
    );
  }, [expansionKey, focusGroupId]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((current) => {
      const next = new Set(current);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedGroups(new Set(groups.map((group) => group.id)));
  };

  const collapseAll = () => {
    setExpandedGroups(new Set());
  };

  return (
    <>
      <div className="grouped-list-summary">
        <div className="grouped-list-summary-copy">{summary}</div>
        <div className="grouped-list-actions">
          <button className="text-button" onClick={expandAll}>
            Expand all
          </button>
          <button className="text-button" onClick={collapseAll}>
            Collapse all
          </button>
        </div>
      </div>

      <div
        className={
          "grouped-list panel" +
          (listClassName ? " " + listClassName : "")
        }
      >
        <div className={headClassName} aria-hidden="true">
          {columnHeadings.map((heading) => (
            <span key={heading}>{heading}</span>
          ))}
        </div>

        {groups.length === 0 ? (
          <div className="grouped-list-empty">
            <h2>{emptyTitle}</h2>
            <p>{emptyCopy}</p>
            <button
              className="secondary compact"
              onClick={onClearFilters}
            >
              Clear filters
            </button>
          </div>
        ) : (
          groups.map((group) => {
            const isExpanded = expandedGroups.has(group.id);

            return (
              <section
                className={
                  isExpanded
                    ? "grouped-list-group expanded"
                    : "grouped-list-group"
                }
                key={group.id}
              >
                <button
                  type="button"
                  className="grouped-list-heading"
                  aria-expanded={isExpanded}
                  onClick={() => toggleGroup(group.id)}
                >
                  <div>
                    {group.eyebrow && (
                      <span className="eyebrow">{group.eyebrow}</span>
                    )}
                    <h2>{group.title}</h2>
                  </div>
                  <span className="grouped-list-meta">
                    {getGroupMeta?.(group) ?? `${group.items.length} shown`}
                    <span
                      className="grouped-list-chevron"
                      aria-hidden="true"
                    >
                      {isExpanded ? "−" : "+"}
                    </span>
                  </span>
                </button>

                {isExpanded && (
                  <div className="grouped-list-rows">
                    {group.items.map(renderItem)}
                  </div>
                )}
              </section>
            );
          })
        )}
      </div>
    </>
  );
}
