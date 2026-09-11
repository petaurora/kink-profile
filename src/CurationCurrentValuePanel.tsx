import { canonicalSignalDefinitions } from "./data/canonicalSignals";
import { overallFacetDefinitions } from "./data/overallFacets";
import type { CurationInventoryEntry } from "./data/curationInventory";
import { rewardPunishmentCategories } from "./lib/rewardPunishmentLibrary";
import { getCurationPrimitiveFacetAffinities } from "./lib/curationSemanticProjection";
import {
  canonicalizeCurationSignalRef,
  getCurationSignalChannelOptions,
  isCanonicalSignalId,
  isLegacySignalId,
} from "./lib/curationCanonicalSignals";

const relationshipLabels = new Map<string, string>([
  ...canonicalSignalDefinitions.map((signal) => [signal.id, signal.label] as const),
  ...rewardPunishmentCategories.map(
    (category) => [category.id, category.label] as const,
  ),
]);

type ParsedRelationship = {
  id: string;
  label: string;
  weight: string;
  channel?: string;
  relationship?: string;
  sourceScope?: string;
};

function isEmptyValue(value: string) {
  const normalized = value.trim();
  return normalized.length === 0 || normalized === "—";
}

function isRelationshipField(key: string) {
  return /signalMappings|contextCategories|weights|signals/i.test(key);
}

function isSignalRelationshipField(entry: CurationInventoryEntry, key: string) {
  switch (entry.entityType) {
    case "catalog-item":
    case "catalog-category":
    case "reward-punishment-category":
      return key === "signalMappings";
    case "reward-punishment-action":
      return key === "derivedSignalMappings";
    case "quiz-question":
    case "dynamic-mode":
    case "role-headspace":
      return key === "weights";
    case "overall-facet":
      return key === "signals";
    default:
      return false;
  }
}

function isExpandableField(key: string, value: string) {
  return (
    isRelationshipField(key) ||
    value.length > 64 ||
    /questionIds|notes|description/i.test(key)
  );
}

function valueCount(value: string) {
  if (!value.trim()) return 0;
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean).length;
}

function humanizeId(id: string) {
  return id
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function parseRelationships(value: string): ParsedRelationship[] | null {
  const entries = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const parsed: ParsedRelationship[] = [];

  for (const entry of entries) {
    const match = entry.match(
      /^(.+?):\s*(-?\d+(?:\.\d+)?)(?:\s*\(([^)]+)\))?$/,
    );
    if (!match) return null;

    const [, id, weight, qualifier] = match;
    parsed.push({
      id,
      label: relationshipLabels.get(id) ?? humanizeId(id),
      weight,
      sourceScope: qualifier || undefined,
    });
  }

  return parsed;
}

function channelLabel(signalId: string, channel: string) {
  if (!isCanonicalSignalId(signalId)) return humanizeId(channel);
  return (
    getCurationSignalChannelOptions(signalId).find(
      (option) => option.value === channel,
    )?.label ?? humanizeId(channel)
  );
}

function canonicalizeParsedRelationships(
  entry: CurationInventoryEntry,
  fieldKey: string,
  relationships: readonly ParsedRelationship[],
): ParsedRelationship[] {
  if (!isSignalRelationshipField(entry, fieldKey)) return [...relationships];

  if (entry.entityType === "overall-facet") {
    const facet = overallFacetDefinitions.find(
      (candidate) => candidate.id === entry.entityId,
    );
    if (!facet) return [...relationships];

    return facet.signals.map((signal) => ({
      id: signal.signalId,
      label: relationshipLabels.get(signal.signalId) ?? humanizeId(signal.signalId),
      weight: String(signal.weight),
      channel: signal.channel ?? "overall",
      relationship: signal.relationship ?? "supports",
    }));
  }

  return relationships.map((relationship) => {
    if (
      !isLegacySignalId(relationship.id) &&
      !isCanonicalSignalId(relationship.id)
    ) {
      return relationship;
    }

    const canonical = canonicalizeCurationSignalRef(
      relationship.id,
      Number(relationship.weight),
      {
        quizQuestionId:
          entry.entityType === "quiz-question" ? entry.entityId : undefined,
      },
    );

    return {
      id: canonical.signalId,
      label:
        relationshipLabels.get(canonical.signalId) ??
        humanizeId(canonical.signalId),
      weight: relationship.weight,
      channel: canonical.channel,
      sourceScope:
        entry.entityType === "catalog-category"
          ? relationship.sourceScope
          : undefined,
    };
  });
}

function CurationRelationshipDetails({
  entry,
  fieldKey,
  label,
  value,
}: {
  entry: CurationInventoryEntry;
  fieldKey: string;
  label: string;
  value: string;
}) {
  const parsed = parseRelationships(value);
  const relationships = parsed
    ? canonicalizeParsedRelationships(entry, fieldKey, parsed)
    : null;

  return (
    <details className="curation-current-details curation-current-relationships">
      <summary>
        <span>{label}</span>
        <small>
          {relationships?.length ?? valueCount(value)}{" "}
          {(relationships?.length ?? valueCount(value)) === 1 ? "value" : "values"}
        </small>
      </summary>

      {relationships ? (
        <div className="curation-current-mapping-list">
          {relationships.map((relationship, index) => (
            <div
              className="curation-current-mapping-row"
              key={`${relationship.id}-${relationship.channel ?? "overall"}-${index}`}
            >
              <div>
                <strong>{relationship.label}</strong>
                <code>{relationship.id}</code>
              </div>
              {relationship.channel && (
                <small className="curation-current-mapping-direction">
                  {channelLabel(relationship.id, relationship.channel)}
                </small>
              )}
              {relationship.relationship && (
                <small className="curation-current-mapping-direction">
                  {humanizeId(relationship.relationship)}
                </small>
              )}
              {relationship.sourceScope &&
                entry.entityType === "catalog-category" && (
                  <small className="curation-current-mapping-direction">
                    Catalog scope: {humanizeId(relationship.sourceScope)}
                  </small>
                )}
              <span className="curation-current-mapping-weight">
                {relationship.weight}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p>{value}</p>
      )}
    </details>
  );
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
        <dl className="curation-current-properties">
          {compactFields.map((field) => (
            <div className="curation-current-property" key={field.key}>
              <dt>{field.label}</dt>
              <dd>{field.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {expandableFields.length > 0 && (
        <div className="curation-current-details-list">
          {expandableFields.map((field) =>
            isRelationshipField(field.key) ? (
              <CurationRelationshipDetails
                key={field.key}
                entry={entry}
                fieldKey={field.key}
                label={field.label}
                value={field.value}
              />
            ) : (
              <details className="curation-current-details" key={field.key}>
                <summary>
                  <span>{field.label}</span>
                </summary>
                <p>{field.value}</p>
              </details>
            ),
          )}
        </div>
      )}

      {entry.entityType !== "signal" &&
        (() => {
          const facets = getCurationPrimitiveFacetAffinities(
            entry.entityType,
            entry.entityId,
          );

          if (facets.length === 0) {
            return (
              <div className="curation-facet-gap">
                <strong>⚠ No Overall Facet route yet</strong>
                <small>
                  This primitive currently has no honest Signal → Overall Facet
                  projection. Treat it as an M16 semantic coverage gap.
                </small>
              </div>
            );
          }

          const topFacet = facets[0];
          return (
            <details className="curation-facet-affinity">
              <summary>
                <span>Derived Overall Facets</span>
                <small>
                  {topFacet.label} · {Math.round(topFacet.affinity * 100)}%
                </small>
              </summary>
              <div className="curation-facet-affinity-list">
                {facets.map((facet) => (
                  <div className="curation-facet-affinity-row" key={facet.facetId}>
                    <span>{facet.label}</span>
                    <strong>{Math.round(facet.affinity * 100)}%</strong>
                  </div>
                ))}
              </div>
            </details>
          );
        })()}

      <small className="curation-current-source">Source: {entry.source}</small>
    </div>
  );
}
