import {
  IconCirclePlus,
  IconInfoCircle,
  IconTrash,
} from "@tabler/icons-react";
import type { CurationEditorField } from "./lib/curationEditor";
import type {
  CurationChangeValue,
  CurationWeightedRelation,
} from "./lib/curationWorkspace";

function asRelations(value: CurationChangeValue | undefined) {
  return Array.isArray(value)
    ? value.filter(
        (item): item is CurationWeightedRelation =>
          typeof item === "object" &&
          item !== null &&
          "id" in item &&
          "weight" in item,
      )
    : [];
}

function asStringList(value: CurationChangeValue | undefined) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function CurationFieldHeader({
  label,
  helper,
}: {
  label: string;
  helper?: string;
}) {
  return (
    <div className="curation-editor-label-row">
      <strong>{label}</strong>
      {helper && (
        <details className="curation-field-help">
          <summary aria-label={`About ${label}`}>
            <IconInfoCircle size={15} stroke={2} aria-hidden="true" />
          </summary>
          <small>{helper}</small>
        </details>
      )}
    </div>
  );
}

function CurationWeightedRelationsEditor({
  field,
  value,
  onChange,
}: {
  field: Extract<CurationEditorField, { kind: "weighted-relations" }>;
  value: readonly CurationWeightedRelation[];
  onChange: (next: CurationWeightedRelation[]) => void;
}) {
  const available = field.options.filter(
    (option) => !value.some((relation) => relation.id === option.value),
  );

  const addRelationship = () => {
    const next = available[0];
    if (!next) return;

    onChange([
      ...value,
      {
        id: next.value,
        weight: 1,
      },
    ]);
  };

  return (
    <div className="curation-editor-field curation-editor-field-wide curation-relation-field">
      <CurationFieldHeader label={field.label} helper={field.helper} />

      <div
        className={`curation-relation-columns${field.allowDirection ? " has-direction" : ""}`}
        aria-hidden="true"
      >
        <span>Relationship</span>
        <span>Weight</span>
        {field.allowDirection && <span>Direction</span>}
        <span />
      </div>

      <div className="curation-relation-list">
        {value.map((relation, index) => (
          <div
            className={`curation-relation-row${field.allowDirection ? " has-direction" : ""}`}
            key={relation.id}
          >
            <label>
              <span className="curation-visually-hidden">Relationship</span>
              <select
                aria-label={`${field.label} relationship ${index + 1}`}
                value={relation.id}
                onChange={(event) => {
                  const next = [...value];
                  next[index] = {
                    ...relation,
                    id: event.target.value,
                  };
                  onChange(next);
                }}
              >
                {field.options.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    disabled={
                      option.value !== relation.id &&
                      value.some((candidate) => candidate.id === option.value)
                    }
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="curation-weight-input">
              <span className="curation-visually-hidden">Weight</span>
              <input
                aria-label={`${field.label} weight ${index + 1}`}
                type="number"
                min="0.05"
                max="1"
                step="0.05"
                value={relation.weight}
                onChange={(event) => {
                  const next = [...value];
                  next[index] = {
                    ...relation,
                    weight: Number(event.target.value),
                  };
                  onChange(next);
                }}
              />
            </label>

            {field.allowDirection && (
              <label>
                <span className="curation-visually-hidden">Direction</span>
                <select
                  aria-label={`${field.label} direction ${index + 1}`}
                  value={relation.direction ?? ""}
                  onChange={(event) => {
                    const next = [...value];
                    const direction = event.target.value;
                    next[index] = {
                      ...relation,
                      direction:
                        direction === "receiving" || direction === "giving"
                          ? direction
                          : undefined,
                    };
                    onChange(next);
                  }}
                >
                  <option value="">Any direction</option>
                  <option value="receiving">Receiving</option>
                  <option value="giving">Giving</option>
                </select>
              </label>
            )}

            <button
              type="button"
              className="curation-relation-remove"
              aria-label={`Remove ${relation.id} relationship`}
              onClick={() =>
                onChange(
                  value.filter((_, candidateIndex) => candidateIndex !== index),
                )
              }
            >
              <IconTrash size={16} stroke={2} aria-hidden="true" />
            </button>
          </div>
        ))}

        {value.length === 0 && (
          <p className="curation-editor-empty">No relationships defined.</p>
        )}
      </div>

      <button
        className="secondary curation-add-relation"
        type="button"
        disabled={available.length === 0}
        onClick={addRelationship}
      >
        <IconCirclePlus size={17} stroke={2} aria-hidden="true" />
        Add relationship
      </button>
    </div>
  );
}

export function CurationEditorFieldControl({
  field,
  value,
  onChange,
}: {
  field: CurationEditorField;
  value: CurationChangeValue | undefined;
  onChange: (value: CurationChangeValue) => void;
}) {
  if (field.kind === "weighted-relations") {
    return (
      <CurationWeightedRelationsEditor
        field={field}
        value={asRelations(value)}
        onChange={onChange}
      />
    );
  }

  if (field.kind === "boolean") {
    return (
      <label className="curation-editor-field curation-editor-field-wide curation-checkbox-field">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span className="curation-checkbox-copy">
          <CurationFieldHeader label={field.label} helper={field.helper} />
        </span>
      </label>
    );
  }

  if (field.kind === "string-list") {
    const list = asStringList(value);

    return (
      <div className="curation-editor-field curation-editor-field-wide">
        <CurationFieldHeader label={field.label} helper={field.helper} />
        <textarea
          rows={Math.max(2, Math.min(5, list.length || 2))}
          value={list.join("\n")}
          onChange={(event) =>
            onChange(
              event.target.value
                .split("\n")
                .map((item) => item.trim())
                .filter(Boolean),
            )
          }
          placeholder="One value per line"
        />
      </div>
    );
  }

  if (field.kind === "select") {
    return (
      <label className="curation-editor-field curation-editor-field-compact">
        <CurationFieldHeader label={field.label} helper={field.helper} />
        <select
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
        >
          {field.options.map((option) => (
            <option value={option.value} key={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (field.kind === "number") {
    return (
      <label className="curation-editor-field curation-editor-field-compact">
        <CurationFieldHeader label={field.label} helper={field.helper} />
        <input
          type="number"
          value={Number(value ?? field.value)}
          min={field.min}
          max={field.max}
          step={field.step}
          onChange={(event) => onChange(Number(event.target.value))}
        />
      </label>
    );
  }

  const wide = field.kind === "textarea";

  return (
    <label
      className={`curation-editor-field ${
        wide ? "curation-editor-field-wide" : "curation-editor-field-compact"
      }`}
    >
      <CurationFieldHeader label={field.label} helper={field.helper} />
      {field.kind === "textarea" ? (
        <textarea
          rows={3}
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </label>
  );
}
