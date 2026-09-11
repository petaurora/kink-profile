import { overallFacetDefinitions } from "../data/overallFacets";
import type {
  CurationInventoryEntry,
  CurationPrimitiveType,
} from "../data/curationInventory";
import type {
  CurationDraft,
  CurationEditorField,
  CurationEditorModel,
  CurationValidationResult,
} from "./curationEditor";
import type {
  CurationChangeValue,
  CurationFacetRelationship,
  CurationWeightedRelation,
} from "./curationWorkspace";
import {
  canonicalizeCurationSignalRef,
  curationSignalOptions,
  curationSignalRefKey,
  isCanonicalSignalId,
  isLegacySignalId,
  isValidCurationSignalChannel,
} from "./curationCanonicalSignals";

const signalRelationKeys: Partial<
  Record<CurationPrimitiveType, readonly string[]>
> = {
  "catalog-item": ["signalMappings"],
  "catalog-category": ["signalMappings"],
  "reward-punishment-category": ["signalMappings"],
  "quiz-question": ["weights"],
  "dynamic-mode": ["weights"],
  "role-headspace": ["weights"],
  "overall-facet": ["signals"],
};

function isSignalRelationField(
  entry: CurationInventoryEntry,
  field: CurationEditorField,
) {
  return (
    field.kind === "weighted-relations" &&
    signalRelationKeys[entry.entityType]?.includes(field.key)
  );
}

function canonicalizeRelation(
  entry: CurationInventoryEntry,
  relation: CurationWeightedRelation,
): CurationWeightedRelation | null {
  if (isLegacySignalId(relation.id)) {
    const canonical = canonicalizeCurationSignalRef(relation.id, relation.weight, {
      quizQuestionId:
        entry.entityType === "quiz-question" ? entry.entityId : undefined,
    });

    return {
      id: canonical.signalId,
      channel: canonical.channel,
      weight: canonical.weight,
      relationship: relation.relationship,
    };
  }

  if (!isCanonicalSignalId(relation.id)) return null;

  const canonical = canonicalizeCurationSignalRef(relation.id, relation.weight, {
    channel: relation.channel,
  });

  return {
    id: canonical.signalId,
    channel: canonical.channel,
    weight: canonical.weight,
    relationship: relation.relationship,
  };
}

function collapseCanonicalRelations(
  relations: readonly CurationWeightedRelation[],
) {
  const byKey = new Map<string, CurationWeightedRelation>();

  for (const relation of relations) {
    const channel = relation.channel ?? "overall";
    const key = curationSignalRefKey({
      signalId: relation.id as never,
      channel,
    });
    const existing = byKey.get(key);

    if (!existing || relation.weight > existing.weight) {
      byKey.set(key, {
        ...relation,
        channel,
      });
    }
  }

  return [...byKey.values()].sort((left, right) => {
    const leftKey = `${left.id}::${left.channel ?? "overall"}`;
    const rightKey = `${right.id}::${right.channel ?? "overall"}`;
    return leftKey.localeCompare(rightKey);
  });
}

function canonicalOverallFacetRelations(entry: CurationInventoryEntry) {
  if (entry.entityType !== "overall-facet") return null;

  const facet = overallFacetDefinitions.find(
    (candidate) => candidate.id === entry.entityId,
  );
  if (!facet) return null;

  return facet.signals.map((signal) => ({
    id: signal.signalId,
    channel: signal.channel ?? "overall",
    weight: signal.weight,
    relationship: signal.relationship ?? "supports",
  })) satisfies CurationWeightedRelation[];
}

export function canonicalizeCurationEditorModel(
  entry: CurationInventoryEntry,
  model: CurationEditorModel | null,
): CurationEditorModel | null {
  if (!model) return null;

  return {
    fields: model.fields.map((field) => {
      if (!isSignalRelationField(entry, field)) return field;
      if (field.kind !== "weighted-relations") return field;

      const facetRelations = canonicalOverallFacetRelations(entry);
      const currentRelations = facetRelations ?? field.value;
      const value = collapseCanonicalRelations(
        currentRelations.flatMap((relation) => {
          const canonical = canonicalizeRelation(entry, relation);
          return canonical ? [canonical] : [];
        }),
      );

      return {
        ...field,
        value,
        options: curationSignalOptions,
        allowDirection: true,
        helper:
          entry.entityType === "catalog-category"
            ? "Author the canonical Signal concept and semantic channel. Legacy catalog applicability is handled at the source-translation boundary and is not a Signal channel."
            : field.helper,
      };
    }),
  };
}

function cloneValue(value: CurationChangeValue): CurationChangeValue {
  if (Array.isArray(value)) {
    return value.map((item) =>
      typeof item === "object" && item !== null ? { ...item } : item,
    ) as CurationChangeValue;
  }
  return value;
}

function fieldValue(field: CurationEditorField): CurationChangeValue {
  if (field.kind === "string-list") return [...field.value];
  if (field.kind === "weighted-relations" || field.kind === "facet-matrix") {
    return field.value.map((relation) => ({ ...relation }));
  }
  return field.value;
}

function normalizeRelations(value: CurationChangeValue | undefined) {
  if (!Array.isArray(value)) return [];

  return value
    .filter(
      (
        relation,
      ): relation is CurationWeightedRelation | CurationFacetRelationship =>
        typeof relation === "object" &&
        relation !== null &&
        "id" in relation &&
        "weight" in relation,
    )
    .map((relation) => ({
      id: relation.id,
      weight: relation.weight,
      channel: "channel" in relation ? relation.channel : undefined,
      relationship:
        "relationship" in relation ? relation.relationship : undefined,
    }))
    .sort(
      (left, right) =>
        left.id.localeCompare(right.id) ||
        String(left.channel ?? "overall").localeCompare(
          String(right.channel ?? "overall"),
        ) ||
        String(left.relationship ?? "").localeCompare(
          String(right.relationship ?? ""),
        ),
    );
}

function normalizedComparable(value: CurationChangeValue | undefined) {
  if (Array.isArray(value)) {
    if (
      value.every(
        (item) =>
          typeof item === "object" &&
          item !== null &&
          "id" in item &&
          "weight" in item,
      )
    ) {
      return normalizeRelations(value);
    }

    return [...value].map(String).sort((left, right) => left.localeCompare(right));
  }

  return value;
}

export function buildCanonicalCurationChangeSet(
  model: CurationEditorModel,
  draft: CurationDraft,
): Record<string, CurationChangeValue> {
  const changes: Record<string, CurationChangeValue> = {};

  for (const field of model.fields) {
    const original = normalizedComparable(fieldValue(field));
    const proposed = normalizedComparable(draft[field.key]);

    if (JSON.stringify(original) !== JSON.stringify(proposed)) {
      changes[field.key] = cloneValue(draft[field.key]);
    }
  }

  return changes;
}

function isRelationArray(
  value: CurationChangeValue | undefined,
): value is CurationWeightedRelation[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "id" in item &&
        "weight" in item,
    )
  );
}

export function validateCanonicalCurationDraft(
  model: CurationEditorModel,
  draft: CurationDraft,
): CurationValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const field of model.fields) {
    const value = draft[field.key];

    if (field.kind === "text" || field.kind === "textarea") {
      if (field.required && !String(value ?? "").trim()) {
        errors.push(`${field.label} cannot be empty.`);
      }
      continue;
    }

    if (field.kind === "number") {
      const numberValue = Number(value);
      if (!Number.isFinite(numberValue)) {
        errors.push(`${field.label} must be a number.`);
        continue;
      }
      if (field.min !== undefined && numberValue < field.min) {
        errors.push(`${field.label} must be at least ${field.min}.`);
      }
      if (field.max !== undefined && numberValue > field.max) {
        errors.push(`${field.label} must be at most ${field.max}.`);
      }
      continue;
    }

    if (field.kind === "select") {
      const stringValue = String(value ?? "");
      if (field.required && !stringValue) {
        errors.push(`${field.label} must be selected.`);
      } else if (
        stringValue &&
        !field.options.some((option) => option.value === stringValue)
      ) {
        errors.push(`${field.label} contains an unknown value.`);
      }
      continue;
    }

    if (field.kind === "string-list") {
      if (!Array.isArray(value)) {
        errors.push(`${field.label} must be a list.`);
        continue;
      }

      const items = value.map(String).map((item) => item.trim()).filter(Boolean);
      if (
        new Set(items.map((item) => item.toLocaleLowerCase())).size !==
        items.length
      ) {
        errors.push(`${field.label} contains duplicate values.`);
      }
      continue;
    }

    if (field.kind === "weighted-relations") {
      if (!isRelationArray(value)) {
        errors.push(`${field.label} must contain weighted relationships.`);
        continue;
      }

      if (field.required && value.length === 0) {
        errors.push(`${field.label} must contain at least one relationship.`);
      }

      const keys = new Set<string>();
      for (const relation of value) {
        if (!field.options.some((option) => option.value === relation.id)) {
          errors.push(`${field.label} references unknown ID "${relation.id}".`);
        }

        const channel = relation.channel ?? "overall";
        const key = field.allowDirection
          ? `${relation.id}::${channel}`
          : relation.id;
        if (keys.has(key)) {
          errors.push(`${field.label} contains duplicate "${key}".`);
        }
        keys.add(key);

        if (
          !Number.isFinite(relation.weight) ||
          relation.weight <= 0 ||
          relation.weight > 1
        ) {
          errors.push(
            `${field.label} weight for "${relation.id}" must be greater than 0 and no more than 1.`,
          );
        }

        if (field.allowDirection) {
          if (
            !isCanonicalSignalId(relation.id) ||
            !isValidCurationSignalChannel(relation.id, channel)
          ) {
            errors.push(
              `${field.label} has an invalid channel for "${relation.id}".`,
            );
          }
        } else if (relation.channel) {
          errors.push(
            `${field.label} does not support channels for "${relation.id}".`,
          );
        }

        if (
          relation.relationship &&
          (!field.allowRelationship ||
            !["supports", "opposes"].includes(relation.relationship))
        ) {
          errors.push(
            `${field.label} has an invalid semantic relationship for "${relation.id}".`,
          );
        }
      }
      continue;
    }

    if (field.kind === "facet-matrix") {
      if (!Array.isArray(value)) {
        errors.push(`${field.label} must contain every Overall Facet.`);
        continue;
      }

      const relationships = value.filter(
        (item): item is CurationFacetRelationship =>
          typeof item === "object" &&
          item !== null &&
          "id" in item &&
          "relationship" in item &&
          "weight" in item,
      );

      const ids = new Set(relationships.map((relationship) => relationship.id));
      if (
        relationships.length !== field.options.length ||
        ids.size !== field.options.length
      ) {
        errors.push(
          `${field.label} must classify all ${field.options.length} Overall Facets exactly once.`,
        );
      }

      for (const relationship of relationships) {
        if (!field.options.some((option) => option.value === relationship.id)) {
          errors.push(
            `${field.label} references unknown facet "${relationship.id}".`,
          );
        }
        if (
          !["supports", "neutral", "opposes"].includes(
            relationship.relationship,
          )
        ) {
          errors.push(
            `${field.label} has an invalid state for "${relationship.id}".`,
          );
        }
        if (
          relationship.relationship !== "neutral" &&
          (!Number.isFinite(relationship.weight) ||
            relationship.weight <= 0 ||
            relationship.weight > 1)
        ) {
          errors.push(
            `${field.label} weight for "${relationship.id}" must be greater than 0 and no more than 1.`,
          );
        }
      }
    }
  }

  return { errors, warnings };
}
