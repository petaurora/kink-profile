import { useState } from "react";
import {
  IconCirclePlus,
  IconInfoCircle,
  IconTrash,
} from "@tabler/icons-react";
import type { CurationEditorField } from "./lib/curationEditor";
import {
  getCurationSignalChannelOptions,
  isCanonicalSignalId,
} from "./lib/curationCanonicalSignals";
import type {
  CurationChangeValue,
  CurationFacetRelationship,
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

function asFacetRelationships(value: CurationChangeValue | undefined) {
  return Array.isArray(value)
    ? value.filter(
        (item): item is CurationFacetRelationship =>
          typeof item === "object" &&
          item !== null &&
          "id" in item &&
          "relationship" in item &&
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
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="curation-editor-label-block">
      <div className="curation-editor-label-row">
        <strong>{label}</strong>
        {helper && (
          <button
            className="curation-field-help-button"
            type="button"
            aria-label={`About ${label}`}
            aria-expanded={showHelp}
            onClick={() => setShowHelp((visible) => !visible)}
          >
            <IconInfoCircle size={15} stroke={2} aria-hidden="true" />
          </button>
        )}
      </div>
      {helper && showHelp && (
        <small className="curation-field-help-copy">{helper}</small>
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
  const [showAddRelationship, setShowAddRelationship] = useState(false);
  const [relationshipSearch, setRelationshipSearch] = useState("");

  const channelOptionsFor = (id: string) =>
    field.allowDirection && isCanonicalSignalId(id)
      ? getCurationSignalChannelOptions(id)
      : [];

  const relationUsesChannel = (id: string, channel: string) =>
    value.some(
      (relation) =>
        relation.id === id &&
        (relation.channel ?? "overall") === channel,
    );

  const available = field.options.filter((option) => {
    if (!field.allowDirection) {
      return !value.some((relation) => relation.id === option.value);
    }

    const channels = channelOptionsFor(option.value);
    if (channels.length === 0) {
      return !value.some((relation) => relation.id === option.value);
    }

    return channels.some(
      (channel) => !relationUsesChannel(option.value, channel.value),
    );
  });

  const relationshipNoun = /signal/i.test(field.label)
    ? "signal"
    : /categor/i.test(field.label)
      ? "category"
      : /facet/i.test(field.label)
        ? "facet"
        : "relationship";

  const filteredAvailable = available.filter((option) => {
    const query = relationshipSearch.trim().toLowerCase();
    if (!query) return true;
    return (
      option.label.toLowerCase().includes(query) ||
      option.value.toLowerCase().includes(query)
    );
  });

  const addRelationship = (relationshipId: string) => {
    const next = available.find((option) => option.value === relationshipId);
    if (!next) return;

    const channel = field.allowDirection
      ? channelOptionsFor(next.value).find(
          (candidate) => !relationUsesChannel(next.value, candidate.value),
        )?.value
      : undefined;

    onChange([
      ...value,
      {
        id: next.value,
        weight: 1,
        channel,
        relationship: field.allowRelationship ? "supports" : undefined,
      },
    ]);
    setRelationshipSearch("");
    setShowAddRelationship(false);
  };

  const optionLabel = (id: string) =>
    field.options.find((option) => option.value === id)?.label ?? id;

  return (
    <div className="curation-editor-field curation-editor-field-wide curation-relation-field">
      <CurationFieldHeader label={field.label} helper={field.helper} />

      <div className="curation-relation-list">
        {value.map((relation, index) => {
          const channelOptions = channelOptionsFor(relation.id);
          const showChannel = field.allowDirection && channelOptions.length > 1;

          return (
            <div
              className="curation-relation-card"
              key={`${relation.id}-${relation.channel ?? "overall"}-${index}`}
            >
              <div className="curation-relation-card-top">
                <div className="curation-relation-name">
                  <span>{optionLabel(relation.id)}</span>
                </div>

                <label className="curation-weight-input">
                  <span>Weight</span>
                  <input
                    aria-label={`${field.label} weight ${index + 1}`}
                    type="number"
                    min="0"
                    max="1"
                    step="any"
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

                <button
                  type="button"
                  className="curation-relation-remove"
                  aria-label={`Remove ${relation.id} relationship`}
                  onClick={() => {
                    onChange(
                      value.filter(
                        (_, candidateIndex) => candidateIndex !== index,
                      ),
                    );
                  }}
                >
                  <IconTrash size={16} stroke={2} aria-hidden="true" />
                </button>
              </div>

              {showChannel && (
                <label className="curation-relation-direction">
                  <span>Channel</span>
                  <select
                    aria-label={`${field.label} channel ${index + 1}`}
                    value={relation.channel ?? "overall"}
                    onChange={(event) => {
                      const next = [...value];
                      next[index] = {
                        ...relation,
                        channel: event.target.value as CurationWeightedRelation["channel"],
                        direction: undefined,
                      };
                      onChange(next);
                    }}
                  >
                    {channelOptions.map((channel) => (
                      <option value={channel.value} key={channel.value}>
                        {channel.label}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {field.allowDirection && channelOptions.length === 1 && (
                <small className="curation-current-mapping-direction">
                  Overall only
                </small>
              )}

              {field.allowRelationship && (
                <div
                  className="curation-relation-polarity"
                  role="group"
                  aria-label={`${field.label} semantic relationship ${index + 1}`}
                >
                  {(["supports", "opposes"] as const).map((relationship) => (
                    <button
                      type="button"
                      className={
                        (relation.relationship ?? "supports") === relationship
                          ? "is-active"
                          : ""
                      }
                      aria-pressed={
                        (relation.relationship ?? "supports") === relationship
                      }
                      key={relationship}
                      onClick={() => {
                        const next = [...value];
                        next[index] = { ...relation, relationship };
                        onChange(next);
                      }}
                    >
                      {relationship === "supports" ? "Supports" : "Opposes"}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {value.length === 0 && (
          <p className="curation-editor-empty">No relationships defined.</p>
        )}
      </div>

      <button
        className="secondary curation-add-relation"
        type="button"
        disabled={available.length === 0}
        aria-expanded={showAddRelationship}
        onClick={() => {
          setRelationshipSearch("");
          setShowAddRelationship((visible) => !visible);
        }}
      >
        <IconCirclePlus size={17} stroke={2} aria-hidden="true" />
        {showAddRelationship
          ? `Choose ${relationshipNoun}`
          : "Add relationship"}
      </button>

      {showAddRelationship && (
        <div
          className="curation-relation-choice-panel"
          role="listbox"
          aria-label={`Choose ${relationshipNoun} for ${field.label}`}
        >
          <div className="curation-relation-choice-header">
            <input
              className="curation-relation-choice-search"
              autoFocus
              type="search"
              value={relationshipSearch}
              onChange={(event) => setRelationshipSearch(event.target.value)}
              placeholder={`Search ${relationshipNoun}s…`}
              aria-label={`Search available ${relationshipNoun}s`}
            />
            <small>{available.length} available</small>
          </div>

          <div className="curation-relation-choice-list">
            {filteredAvailable.map((option) => (
              <button
                type="button"
                role="option"
                aria-selected="false"
                className="curation-relation-choice"
                key={option.value}
                onClick={() => addRelationship(option.value)}
              >
                <strong>{option.label}</strong>
                <small>{option.value}</small>
              </button>
            ))}

            {filteredAvailable.length === 0 && (
              <p className="curation-editor-empty">
                No matching {relationshipNoun}s.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CurationFacetMatrixEditor({
  field,
  value,
  onChange,
}: {
  field: Extract<CurationEditorField, { kind: "facet-matrix" }>;
  value: readonly CurationFacetRelationship[];
  onChange: (next: CurationFacetRelationship[]) => void;
}) {
  const byId = new Map(value.map((relationship) => [relationship.id, relationship]));
  const rows = field.options.map((option) => {
    return (
      byId.get(option.value) ?? {
        id: option.value,
        relationship: "neutral" as const,
        weight: 1,
      }
    );
  });

  const updateRow = (
    id: string,
    update: Partial<CurationFacetRelationship>,
  ) => {
    onChange(
      rows.map((row) => (row.id === id ? { ...row, ...update } : row)),
    );
  };

  return (
    <div className="curation-editor-field curation-editor-field-wide curation-facet-matrix">
      <CurationFieldHeader label={field.label} helper={field.helper} />

      <div className="curation-facet-matrix-list">
        {rows.map((row) => {
          const option = field.options.find((candidate) => candidate.value === row.id);
          return (
            <div className="curation-facet-matrix-row" key={row.id}>
              <strong>{option?.label ?? row.id}</strong>

              <div className="curation-facet-matrix-controls">
                <div
                  className="curation-facet-state"
                  role="group"
                  aria-label={`${option?.label ?? row.id} relationship`}
                >
                  {(["supports", "neutral", "opposes"] as const).map(
                    (relationship) => (
                      <button
                        type="button"
                        className={
                          row.relationship === relationship ? "is-active" : ""
                        }
                        aria-pressed={row.relationship === relationship}
                        key={relationship}
                        onClick={() =>
                          updateRow(row.id, {
                            relationship,
                            weight:
                              relationship === "neutral" && !row.weight
                                ? 1
                                : row.weight || 1,
                          })
                        }
                      >
                        {relationship === "supports"
                          ? "Supports"
                          : relationship === "opposes"
                            ? "Opposes"
                            : "Neutral"}
                      </button>
                    ),
                  )}
                </div>

                {row.relationship !== "neutral" && (
                  <label className="curation-facet-weight">
                    <span>Weight</span>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="any"
                      value={row.weight}
                      aria-label={`${option?.label ?? row.id} weight`}
                      onChange={(event) =>
                        updateRow(row.id, {
                          weight: Number(event.target.value),
                        })
                      }
                    />
                  </label>
                )}
              </div>
            </div>
          );
        })}
      </div>
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

  if (field.kind === "facet-matrix") {
    return (
      <CurationFacetMatrixEditor
        field={field}
        value={asFacetRelationships(value)}
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