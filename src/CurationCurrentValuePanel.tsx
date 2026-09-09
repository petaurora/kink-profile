import type { CurationInventoryEntry } from "./data/curationInventory";

function isEmptyValue(value: string) {
  const normalized = value.trim();
  return normalized.length === 0 || normalized === "—";
}

function isExpandableField(key: string, value: string) {
  return (
    value.length > 64 ||
    /mapping|weights|signals|questionIds|contextCategories/i.test(key)
  );
}

function valueCount(value: string) {
  if (!value.trim()) return 0;
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean).length;
}

export function CurationCurrentValuePanel({
  entry,
}: {
  entry: CurationInventoryEntry;
}) {
  const visibleFields = entry.fields.filter((field) => !isEmptyValue(field.value));
  const compactFields = visibleFields.filter(
    (field) => !isExpandableField(field.key, field.value),
  );
  const expandableFields = visibleFields.filter((field) =>
    isExpandableField(field.key, field.value),
  );

  return (
    <div className="curation-current-values">
      <span className="catalog-kicker">Current repo value</span>

      {compactFields.length > 0 && (
        <div className="curation-current-grid">
          {compactFields.map((field) => (
            <div className="curation-current-item" key={field.key}>
              <span>{field.label}</span>
              <p>{field.value}</p>
            </div>
          ))}
        </div>
      )}

      {expandableFields.length > 0 && (
        <div className="curation-current-details-list">
          {expandableFields.map((field) => {
            const count = valueCount(field.value);

            return (
              <details className="curation-current-details" key={field.key}>
                <summary>
                  <span>{field.label}</span>
                  {count > 1 && <small>{count} values</small>}
                </summary>
                <p>{field.value}</p>
              </details>
            );
          })}
        </div>
      )}

      <small className="curation-current-source">Source: {entry.source}</small>
    </div>
  );
}
