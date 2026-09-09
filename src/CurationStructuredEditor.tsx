import { useEffect, useMemo, useState } from "react";
import {
  IconAlertTriangle,
  IconCirclePlus,
  IconInfoCircle,
  IconTrash,
} from "@tabler/icons-react";
import type {
  CurationInventoryEntry,
} from "./data/curationInventory";
import {
  buildCurationChangeSet,
  buildCurationEditorModel,
  createCurationDraft,
  getCurationConsequences,
  validateCurationDraft,
  type CurationDraft,
  type CurationEditorField,
} from "./lib/curationEditor";
import type {
  CurationChange,
  CurationChangeValue,
  CurationWeightedRelation,
} from "./lib/curationWorkspace";

type CurationStructuredEditorProps = {
  entry: CurationInventoryEntry;
  change?: CurationChange;
  onSave: (
    changes: Record<string, CurationChangeValue>,
    note: string,
  ) => void;
};

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

function updateDraft(
  current: CurationDraft,
  key: string,
  value: CurationChangeValue,
) {
  return {
    ...current,
    [key]: value,
  };
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
    <div className="curation-editor-field curation-relation-field">
      <div className="curation-editor-label">
        <strong>{field.label}</strong>
        {field.helper && <small>{field.helper}</small>}
      </div>

      <div className="curation-relation-columns" aria-hidden="true">
        <span>Relationship</span>
        <span>Weight</span>
        {field.allowDirection && <span>Direction</span>}
        <span />
      </div>

      <div className="curation-relation-list">
        {value.map((relation, index) => (
          <div className="curation-relation-row" key={relation.id}>
            <label>
              <span className="curation-visually-hidden">Relationship</span>
              <select
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
                  <option value="">Any</option>
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
          <p className="curation-editor-empty">No relationships currently defined.</p>
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

function CurationEditorFieldControl({
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
        <span>
          <strong>{field.label}</strong>
          {field.helper && <small>{field.helper}</small>}
        </span>
      </label>
    );
  }

  if (field.kind === "string-list") {
    const list = asStringList(value);

    return (
      <div className="curation-editor-field curation-editor-field-wide">
        <div className="curation-editor-label">
          <strong>{field.label}</strong>
          {field.helper && <small>{field.helper}</small>}
        </div>
        <textarea
          rows={Math.max(3, Math.min(8, list.length + 1))}
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
        <span className="curation-editor-label">
          <strong>{field.label}</strong>
          {field.helper && <small>{field.helper}</small>}
        </span>
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
        <span className="curation-editor-label">
          <strong>{field.label}</strong>
          {field.helper && <small>{field.helper}</small>}
        </span>
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

  return (
    <label
      className={`curation-editor-field ${
        field.kind === "textarea"
          ? "curation-editor-field-wide"
          : "curation-editor-field-compact"
      }`}
    >
      <span className="curation-editor-label">
        <strong>{field.label}</strong>
        {field.helper && <small>{field.helper}</small>}
      </span>
      {field.kind === "textarea" ? (
        <textarea
          rows={4}
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

export function CurationStructuredEditor({
  entry,
  change,
  onSave,
}: CurationStructuredEditorProps) {
  const model = useMemo(() => buildCurationEditorModel(entry), [entry]);
  const [draft, setDraft] = useState<CurationDraft>({});
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!model) {
      setDraft({});
      setNote(change?.note ?? "");
      return;
    }

    setDraft(createCurationDraft(model, change?.changes));
    setNote(change?.note ?? "");
  }, [entry.entityId, entry.entityType, change?.reviewedAt, model]);

  if (!model) {
    return (
      <div className="curation-validation is-warning">
        <IconAlertTriangle size={18} stroke={2} aria-hidden="true" />
        <p>This primitive does not have a structured editor yet.</p>
      </div>
    );
  }

  const validation = validateCurationDraft(model, draft);
  const changes = buildCurationChangeSet(model, draft);
  const consequences = getCurationConsequences(entry, changes);

  return (
    <div className="curation-structured-editor">
      <div className="curation-editor-fields">
        {model.fields.map((field) => (
          <CurationEditorFieldControl
            key={field.key}
            field={field}
            value={draft[field.key]}
            onChange={(value) =>
              setDraft((previous) => updateDraft(previous, field.key, value))
            }
          />
        ))}
      </div>

      {(validation.errors.length > 0 || validation.warnings.length > 0) && (
        <div className="curation-validation-stack">
          {validation.errors.map((error) => (
            <div className="curation-validation is-error" key={error}>
              <IconAlertTriangle size={17} stroke={2} aria-hidden="true" />
              <p>{error}</p>
            </div>
          ))}
          {validation.warnings.map((warning) => (
            <div className="curation-validation is-warning" key={warning}>
              <IconInfoCircle size={17} stroke={2} aria-hidden="true" />
              <p>{warning}</p>
            </div>
          ))}
        </div>
      )}

      {consequences.length > 0 && (
        <div className="curation-consequences">
          <div className="curation-editor-label">
            <strong>What this can affect</strong>
            <small>Preview only — nothing here mutates runtime data.</small>
          </div>
          <ul>
            {consequences.map((consequence) => (
              <li key={consequence}>{consequence}</li>
            ))}
          </ul>
        </div>
      )}

      <details className="curation-note-details">
        <summary>
          <span>Curator note</span>
          <small>Optional</small>
        </summary>
        <textarea
          rows={3}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Why does this make the model better?"
        />
      </details>

      <div className="curation-editor-save-row">
        <span>
          {Object.keys(changes).length} changed field
          {Object.keys(changes).length === 1 ? "" : "s"}
        </span>
        <button
          className="primary"
          type="button"
          disabled={
            validation.errors.length > 0 || Object.keys(changes).length === 0
          }
          onClick={() => onSave(changes, note.trim())}
        >
          Save structured proposal
        </button>
      </div>
    </div>
  );
}
