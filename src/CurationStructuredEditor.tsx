import { useEffect, useMemo, useState } from "react";
import {
  IconAlertTriangle,
  IconInfoCircle,
} from "@tabler/icons-react";
import { CurationEditorFieldControl } from "./CurationEditorField";
import type { CurationInventoryEntry } from "./data/curationInventory";
import {
  buildCurationEditorModel,
  createCurationDraft,
  getCurationConsequences,
  type CurationDraft,
} from "./lib/curationEditor";
import {
  buildCanonicalCurationChangeSet,
  canonicalizeCurationEditorModel,
  validateCanonicalCurationDraft,
} from "./lib/curationCanonicalEditorModel";
import type {
  CurationChange,
  CurationChangeValue,
} from "./lib/curationWorkspace";

type CurationStructuredEditorProps = {
  entry: CurationInventoryEntry;
  change?: CurationChange;
  onSave: (
    changes: Record<string, CurationChangeValue>,
    note: string,
  ) => void;
};

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

export function CurationStructuredEditor({
  entry,
  change,
  onSave,
}: CurationStructuredEditorProps) {
  const sourceModel = useMemo(() => buildCurationEditorModel(entry), [entry]);
  const model = useMemo(
    () => canonicalizeCurationEditorModel(entry, sourceModel),
    [entry, sourceModel],
  );
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

  const validation = validateCanonicalCurationDraft(model, draft);
  const changes = buildCanonicalCurationChangeSet(model, draft);
  const consequences = getCurationConsequences(entry, changes);
  const changedFieldCount = Object.keys(changes).length;

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
        <details className="curation-consequence-details">
          <summary>
            <span>What this can affect</span>
            <small>{consequences.length}</small>
          </summary>
          <ul>
            {consequences.map((consequence) => (
              <li key={consequence}>{consequence}</li>
            ))}
          </ul>
        </details>
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
          {changedFieldCount} changed field{changedFieldCount === 1 ? "" : "s"}
        </span>
        <button
          className="primary"
          type="button"
          disabled={validation.errors.length > 0 || changedFieldCount === 0}
          onClick={() => onSave(changes, note.trim())}
        >
          Save proposal
        </button>
      </div>
    </div>
  );
}
