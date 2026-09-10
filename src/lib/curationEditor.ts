import {
  dynamicModes,
  roleHeadspaces,
} from "../data/headspacesQuiz";
import {
  kinkCatalog,
  kinkCategories,
} from "../data/kinkCatalog.generated";
import { overallFacetDefinitions } from "../data/overallFacets";
import { quizQuestions } from "../data/quizQuestions";
import { quizzes } from "../data/quizzes";
import { signalDefinitions } from "../data/signals";
import type {
  CurationInventoryEntry,
  CurationPrimitiveType,
} from "../data/curationInventory";
import {
  rewardPunishmentActions,
  rewardPunishmentCategories,
} from "./rewardPunishmentLibrary";
import type {
  CurationChangeValue,
  CurationFacetRelationship,
  CurationWeightedRelation,
} from "./curationWorkspace";

export type CurationEditorOption = {
  value: string;
  label: string;
};

type CurationEditorFieldBase = {
  key: string;
  label: string;
  helper?: string;
};

export type CurationEditorField =
  | (CurationEditorFieldBase & {
      kind: "text" | "textarea";
      value: string;
      required?: boolean;
    })
  | (CurationEditorFieldBase & {
      kind: "number";
      value: number;
      min?: number;
      max?: number;
      step?: number;
      required?: boolean;
    })
  | (CurationEditorFieldBase & {
      kind: "boolean";
      value: boolean;
    })
  | (CurationEditorFieldBase & {
      kind: "select";
      value: string;
      options: readonly CurationEditorOption[];
      required?: boolean;
    })
  | (CurationEditorFieldBase & {
      kind: "string-list";
      value: readonly string[];
    })
  | (CurationEditorFieldBase & {
      kind: "weighted-relations";
      value: readonly CurationWeightedRelation[];
      options: readonly CurationEditorOption[];
      required?: boolean;
      allowDirection?: boolean;
      allowRelationship?: boolean;
    })
  | (CurationEditorFieldBase & {
      kind: "facet-matrix";
      value: readonly CurationFacetRelationship[];
      options: readonly CurationEditorOption[];
    });

export type CurationEditorModel = {
  fields: readonly CurationEditorField[];
};

export type CurationDraft = Record<string, CurationChangeValue>;

export type CurationValidationResult = {
  errors: readonly string[];
  warnings: readonly string[];
};

const signalOptions = signalDefinitions.map((signal) => ({
  value: signal.id,
  label: signal.label,
}));

const overallFacetOptions = overallFacetDefinitions.map((facet) => ({
  value: facet.id,
  label: facet.label,
}));

const catalogCategoryOptions = kinkCategories.map((category) => ({
  value: category.id,
  label: category.label,
}));

const rewardPunishmentCategoryOptions = rewardPunishmentCategories.map(
  (category) => ({
    value: category.id,
    label: category.label,
  }),
);

const typicalRoleOptions = ["Receiving", "Giving", "Both"].map((value) => ({
  value,
  label: value,
}));

const availabilityOptions = ["available", "coming-soon"].map((value) => ({
  value,
  label: value === "available" ? "Available" : "Coming soon",
}));

function weightsToRelations(
  weights: Partial<Record<string, number>>,
): CurationWeightedRelation[] {
  return Object.entries(weights)
    .filter((entry): entry is [string, number] => entry[1] !== undefined)
    .map(([id, weight]) => ({ id, weight }))
    .sort((left, right) => left.id.localeCompare(right.id));
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

function relationField(
  key: string,
  label: string,
  value: readonly CurationWeightedRelation[],
  options: readonly CurationEditorOption[],
  settings: {
    helper?: string;
    required?: boolean;
    allowDirection?: boolean;
    allowRelationship?: boolean;
  } = {},
): CurationEditorField {
  return {
    kind: "weighted-relations",
    key,
    label,
    value,
    options,
    ...settings,
  };
}

export function buildCurationEditorModel(
  entry: CurationInventoryEntry,
): CurationEditorModel | null {
  switch (entry.entityType) {
    case "catalog-item": {
      const item = kinkCatalog.find((candidate) => candidate.id === entry.entityId);
      if (!item) return null;

      return {
        fields: [
          {
            kind: "text",
            key: "label",
            label: "Label",
            value: item.label,
            required: true,
          },
          {
            kind: "textarea",
            key: "description",
            label: "Description",
            value: item.description,
          },
          {
            kind: "select",
            key: "categoryId",
            label: "Category",
            value: item.categoryId,
            options: catalogCategoryOptions,
            required: true,
            helper:
              "Changing category also changes the derived domain and category-default signal mappings when the proposal is applied.",
          },
          {
            kind: "select",
            key: "typicalRole",
            label: "Typical role / activity side",
            value: item.typicalRole,
            options: typicalRoleOptions,
            required: true,
          },
          {
            kind: "text",
            key: "intensity",
            label: "Intensity",
            value: item.intensity,
          },
          {
            kind: "text",
            key: "riskLevel",
            label: "Risk level",
            value: item.riskLevel,
          },
          {
            kind: "string-list",
            key: "aliases",
            label: "Aliases",
            value: [...item.aliases],
            helper: "Aliases are alternate search/display terms, not separate catalog rows.",
          },
          relationField(
            "signalMappings",
            "Resolved signal mappings",
            item.signalMappings.map((mapping) => ({
              id: mapping.signalId,
              weight: mapping.weight,
            })),
            signalOptions,
            {
              helper:
                "This proposes the item's effective signal relationships. Applying it later must reconcile category defaults vs item overrides.",
            },
          ),
        ],
      };
    }

    case "catalog-category": {
      const category = kinkCategories.find(
        (candidate) => candidate.id === entry.entityId,
      );
      if (!category) return null;

      return {
        fields: [
          {
            kind: "text",
            key: "label",
            label: "Label",
            value: category.label,
            required: true,
          },
          {
            kind: "text",
            key: "domain",
            label: "Domain",
            value: category.domain,
            required: true,
          },
          {
            kind: "number",
            key: "displayOrder",
            label: "Display order",
            value: category.displayOrder,
            min: 1,
            step: 1,
            required: true,
          },
          relationField(
            "signalMappings",
            "Category signal mappings",
            category.signalMappings.map((mapping) => ({
              id: mapping.signalId,
              weight: mapping.weight,
              direction:
                mapping.appliesTo === "any"
                  ? undefined
                  : mapping.appliesTo,
            })),
            signalOptions,
            {
              allowDirection: true,
              helper:
                "These authored category defaults are the semantic bridge into Signals. Overall Facet affinity is derived from them; direction is activity-side only.",
            },
          ),
        ],
      };
    }

    case "reward-punishment-action": {
      const action = rewardPunishmentActions.find(
        (candidate) => candidate.id === entry.entityId,
      );
      if (!action) return null;

      return {
        fields: [
          {
            kind: "text",
            key: "label",
            label: "Label",
            value: action.label,
            required: true,
          },
          {
            kind: "textarea",
            key: "description",
            label: "Description",
            value: action.description,
          },
          {
            kind: "textarea",
            key: "notes",
            label: "Notes",
            value: action.notes,
          },
          relationField(
            "contextCategories",
            "Context categories",
            action.contextCategories.map((mapping) => ({
              id: mapping.id,
              weight: mapping.weight,
            })),
            rewardPunishmentCategoryOptions,
            {
              required: true,
              helper:
                "These mappings drive inferred reward/punishment fit, randomization and builder organization.",
            },
          ),
        ],
      };
    }

    case "reward-punishment-category": {
      const category = rewardPunishmentCategories.find(
        (candidate) => candidate.id === entry.entityId,
      );
      if (!category) return null;

      return {
        fields: [
          {
            kind: "text",
            key: "label",
            label: "Label",
            value: category.label,
            required: true,
          },
          {
            kind: "number",
            key: "displayOrder",
            label: "Display order",
            value: category.displayOrder,
            min: 1,
            step: 1,
            required: true,
          },
          relationField(
            "signalMappings",
            "Signal mappings",
            category.signalMappings.map((mapping) => ({
              id: mapping.signalId,
              weight: mapping.weight,
            })),
            signalOptions,
            {
              helper:
                "This is the authored semantic bridge for the R/P context category. Individual actions inherit/blend these Signals through their context-category weights; Overall Facets are derived downstream.",
            },
          ),
        ],
      };
    }

    case "quiz-question": {
      const question = quizQuestions.find(
        (candidate) => candidate.id === entry.entityId,
      );
      if (!question) return null;

      const fields: CurationEditorField[] = [
        {
          kind: "textarea",
          key: "prompt",
          label: "Question wording",
          value: question.prompt,
          required: true,
        },
      ];

      fields.push(
        relationField(
          "weights",
          "Signal weights",
          weightsToRelations(question.weights),
          signalOptions,
          {
            required: true,
            helper:
              "Changing scoring inputs changes what this question measures and may require a quiz version bump.",
          },
        ),
      );

      return { fields };
    }

    case "quiz-definition": {
      const quiz = quizzes.find((candidate) => candidate.id === entry.entityId);
      if (!quiz) return null;

      return {
        fields: [
          {
            kind: "text",
            key: "title",
            label: "Title",
            value: quiz.title,
            required: true,
          },
          {
            kind: "text",
            key: "shortTitle",
            label: "Short title",
            value: quiz.shortTitle,
            required: true,
          },
          {
            kind: "text",
            key: "eyebrow",
            label: "Eyebrow",
            value: quiz.eyebrow,
          },
          {
            kind: "textarea",
            key: "description",
            label: "Description",
            value: quiz.description,
            required: true,
          },
          {
            kind: "number",
            key: "estimatedMinutes",
            label: "Estimated minutes",
            value: quiz.estimatedMinutes,
            min: 1,
            step: 1,
            required: true,
          },
          {
            kind: "number",
            key: "version",
            label: "Version",
            value: quiz.version,
            min: 1,
            step: 1,
            required: true,
          },
          {
            kind: "select",
            key: "availability",
            label: "Availability",
            value: quiz.availability,
            options: availabilityOptions,
            required: true,
          },
          {
            kind: "boolean",
            key: "contributesToOverall",
            label: "Contributes to overall profile",
            value: quiz.contributesToOverall,
          },
          {
            kind: "string-list",
            key: "questionIds",
            label: "Question IDs",
            value: [...quiz.questionIds],
            helper:
              "Structural quiz membership. Removing/reordering questions can invalidate stored completion assumptions.",
          },
        ],
      };
    }

    case "signal": {
      const signal = signalDefinitions.find(
        (candidate) => candidate.id === entry.entityId,
      );
      if (!signal) return null;

      const facetRelationships: CurationFacetRelationship[] =
        overallFacetDefinitions.map((facet) => {
          const existing = facet.signals.find(
            (mapping) => mapping.signalId === signal.id,
          );

          return {
            id: facet.id,
            relationship: existing?.relationship ?? (existing ? "supports" : "neutral"),
            weight: existing?.weight ?? 1,
          };
        });

      return {
        fields: [
          {
            kind: "text",
            key: "label",
            label: "Label",
            value: signal.label,
            required: true,
          },
          {
            kind: "text",
            key: "shortLabel",
            label: "Short label",
            value: signal.shortLabel,
            required: true,
          },
          {
            kind: "textarea",
            key: "description",
            label: "Description",
            value: signal.description,
            required: true,
          },
          {
            kind: "facet-matrix",
            key: "facetRelationships",
            label: "Overall Facet relationships",
            value: facetRelationships,
            options: overallFacetOptions,
            helper:
              "All nine Overall Facets are broad themes. Classify how this Signal relates to each theme as Supports, Neutral, or Opposes. Giving/receiving and Dom/sub remain below the facet layer.",
          },
        ],
      };
    }

    case "dynamic-mode": {
      const mode = dynamicModes.find((candidate) => candidate.id === entry.entityId);
      if (!mode) return null;

      return {
        fields: [
          {
            kind: "text",
            key: "label",
            label: "Label",
            value: mode.label,
            required: true,
          },
          {
            kind: "text",
            key: "shortLabel",
            label: "Short label",
            value: mode.shortLabel,
            required: true,
          },
          {
            kind: "textarea",
            key: "description",
            label: "Description",
            value: mode.description,
            required: true,
          },
          relationField(
            "weights",
            "Signal composition",
            weightsToRelations(mode.weights),
            signalOptions,
            { required: true },
          ),
        ],
      };
    }

    case "role-headspace": {
      const role = roleHeadspaces.find((candidate) => candidate.id === entry.entityId);
      if (!role) return null;

      return {
        fields: [
          {
            kind: "text",
            key: "label",
            label: "Label",
            value: role.label,
            required: true,
          },
          {
            kind: "text",
            key: "shortLabel",
            label: "Short label",
            value: role.shortLabel,
            required: true,
          },
          {
            kind: "textarea",
            key: "description",
            label: "Description",
            value: role.description,
            required: true,
          },
          relationField(
            "weights",
            "Signal composition",
            weightsToRelations(role.weights),
            signalOptions,
            { required: true },
          ),
        ],
      };
    }

    case "overall-facet": {
      const facet = overallFacetDefinitions.find(
        (candidate) => candidate.id === entry.entityId,
      );
      if (!facet) return null;

      return {
        fields: [
          {
            kind: "text",
            key: "label",
            label: "Label",
            value: facet.label,
            required: true,
          },
          {
            kind: "text",
            key: "shortLabel",
            label: "Short label",
            value: facet.shortLabel,
            required: true,
          },
          {
            kind: "textarea",
            key: "description",
            label: "Description",
            value: facet.description,
            required: true,
          },
          relationField(
            "signals",
            "Signal relationships",
            facet.signals.map((signal) => ({
              id: signal.signalId,
              weight: signal.weight,
              relationship: signal.relationship ?? "supports",
            })),
            signalOptions,
            {
              required: true,
              allowRelationship: true,
              helper:
                "Overall Facets are broad themes. Signals may support or oppose a theme; omitted Signals are neutral. Activity side and authority orientation stay in the granular Signal/mode/headspace layers.",
            },
          ),
        ],
      };
    }

    default:
      return null;
  }
}

export function createCurationDraft(
  model: CurationEditorModel,
  savedChanges?: Record<string, CurationChangeValue>,
): CurationDraft {
  const draft: CurationDraft = {};
  for (const field of model.fields) {
    draft[field.key] =
      savedChanges?.[field.key] !== undefined
        ? cloneValue(savedChanges[field.key])
        : fieldValue(field);
  }
  return draft;
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
      direction: "direction" in relation ? relation.direction : undefined,
      relationship:
        "relationship" in relation ? relation.relationship : undefined,
    }))
    .sort(
      (left, right) =>
        left.id.localeCompare(right.id) ||
        String(left.relationship ?? "").localeCompare(
          String(right.relationship ?? ""),
        ) ||
        String(left.direction ?? "").localeCompare(String(right.direction ?? "")),
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

export function buildCurationChangeSet(
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

export function validateCurationDraft(
  model: CurationEditorModel,
  draft: CurationDraft,
): CurationValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const field of model.fields) {
    const value = draft[field.key];

    if (field.kind === "text" || field.kind === "textarea") {
      if (field.required && (!String(value ?? "").trim())) {
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
      if (new Set(items.map((item) => item.toLocaleLowerCase())).size !== items.length) {
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

      const ids = new Set<string>();
      for (const relation of value) {
        if (!field.options.some((option) => option.value === relation.id)) {
          errors.push(`${field.label} references unknown ID "${relation.id}".`);
        }
        if (ids.has(relation.id)) {
          errors.push(`${field.label} contains duplicate "${relation.id}".`);
        }
        ids.add(relation.id);

        if (
          !Number.isFinite(relation.weight) ||
          relation.weight <= 0 ||
          relation.weight > 1
        ) {
          errors.push(
            `${field.label} weight for "${relation.id}" must be greater than 0 and no more than 1.`,
          );
        }

        if (
          relation.direction &&
          (!field.allowDirection ||
            !["receiving", "giving"].includes(relation.direction))
        ) {
          errors.push(
            `${field.label} has an invalid direction for "${relation.id}".`,
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

function countSignalReferences(signalId: string) {
  const weightedQuestions = quizQuestions.filter(
    (question) =>
      question.kind === "weighted" &&
      Object.prototype.hasOwnProperty.call(question.weights, signalId),
  ).length;
  const modes = dynamicModes.filter((mode) =>
    Object.prototype.hasOwnProperty.call(mode.weights, signalId),
  ).length;
  const roles = roleHeadspaces.filter((role) =>
    Object.prototype.hasOwnProperty.call(role.weights, signalId),
  ).length;
  const facets = overallFacetDefinitions.filter((facet) =>
    facet.signals.some((signal) => signal.signalId === signalId),
  ).length;
  const catalogItems = kinkCatalog.filter((item) =>
    item.signalMappings.some((mapping) => mapping.signalId === signalId),
  ).length;

  return { weightedQuestions, modes, roles, facets, catalogItems };
}

export function getCurationConsequences(
  entry: CurationInventoryEntry,
  changes: Record<string, CurationChangeValue>,
): string[] {
  const keys = new Set(Object.keys(changes));
  if (keys.size === 0) return [];

  const consequences: string[] = [];

  switch (entry.entityType) {
    case "catalog-item":
      if (keys.has("categoryId")) {
        consequences.push(
          "Moving categories changes the item's derived domain and may change category-default signal mappings.",
        );
      }
      if (keys.has("signalMappings") || keys.has("categoryId")) {
        consequences.push(
          "Catalog signal changes can move recommendations, M7 aggregate facets, interest areas and scene candidate ranking.",
        );
      }
      if (keys.has("aliases") || keys.has("label")) {
        consequences.push("Search/display terminology will change for this catalog item.");
      }
      break;

    case "catalog-category":
      consequences.push(
        "Category changes affect every catalog item assigned here and may require taxonomy/mapping review before application.",
      );
      if (keys.has("signalMappings")) {
        consequences.push(
          "Changing category Signal mappings changes the derived Overall Facet affinity for this category and any item that inherits these defaults.",
        );
      }
      break;

    case "reward-punishment-action":
      if (keys.has("contextCategories")) {
        consequences.push(
          "M11 contextual inference, sorter suggestions, randomizer pools and recipe-builder organization may change.",
        );
      }
      break;

    case "reward-punishment-category":
      consequences.push(
        "Changing this taxonomy category may affect M11 mappings and any action or catalog-category relationship pointing to it.",
      );
      if (keys.has("signalMappings")) {
        consequences.push(
          "Changing these Signal mappings changes the semantic/facet projection inherited by every R/P action mapped to this category.",
        );
      }
      break;

    case "quiz-question":
      if (keys.has("weights")) {
        consequences.push(
          "This changes scoring semantics. Review the affected quiz version and synthetic result fixtures before applying it.",
        );
      }
      if (keys.has("prompt")) {
        consequences.push(
          "Question wording changes should be checked for meaning drift against its scoring inputs.",
        );
      }
      break;

    case "quiz-definition":
      consequences.push(
        "Quiz-definition changes can affect completion assumptions, stored results and overall-profile coverage.",
      );
      break;

    case "signal": {
      const counts = countSignalReferences(entry.entityId);
      consequences.push(
        `This signal is currently referenced by ${counts.weightedQuestions} weighted questions, ${counts.modes} dynamic modes, ${counts.roles} roles/headspaces, ${counts.facets} overall facets and ${counts.catalogItems} catalog items.`,
      );
      if (keys.has("facetRelationships")) {
        consequences.push(
          "Changing Overall Facet memberships updates the reverse Signal → Facet view by modifying the canonical facet signal compositions.",
        );
      }
      consequences.push(
        "Changing signal meaning is cross-system taxonomy work; labels can be cheap, semantic redefinition is not.",
      );
      break;
    }

    case "dynamic-mode":
    case "role-headspace":
      if (keys.has("weights")) {
        consequences.push(
          "Changing signal composition will move derived M3 role/headspace results and downstream profile presentation.",
        );
      }
      break;

    case "overall-facet":
      if (keys.has("signals")) {
        consequences.push(
          "This changes M7 overall aggregation/radar semantics and should be sanity-checked against representative profiles.",
        );
      }
      break;
  }

  return consequences;
}

export function validateMergeTarget(
  entry: CurationInventoryEntry,
  replacementId: string,
): string[] {
  const normalized = replacementId.trim();
  if (!normalized) return ["Choose a replacement stable ID."];
  if (normalized === entry.entityId) {
    return ["An entity cannot be merged into itself."];
  }

  const targetExists = (() => {
    switch (entry.entityType as CurationPrimitiveType) {
      case "catalog-item":
        return kinkCatalog.some((item) => item.id === normalized);
      case "catalog-category":
        return kinkCategories.some((category) => category.id === normalized);
      case "reward-punishment-action":
        return rewardPunishmentActions.some((action) => action.id === normalized);
      case "reward-punishment-category":
        return rewardPunishmentCategories.some((category) => category.id === normalized);
      case "quiz-question":
        return quizQuestions.some((question) => question.id === normalized);
      case "quiz-definition":
        return quizzes.some((quiz) => quiz.id === normalized);
      case "signal":
        return signalDefinitions.some((signal) => signal.id === normalized);
      case "dynamic-mode":
        return dynamicModes.some((mode) => mode.id === normalized);
      case "role-headspace":
        return roleHeadspaces.some((role) => role.id === normalized);
      case "overall-facet":
        return overallFacetDefinitions.some((facet) => facet.id === normalized);
    }
  })();

  return targetExists
    ? []
    : [`No existing ${entry.entityType} has stable ID "${normalized}".`];
}

export function getDestructiveActionConsequences(
  entry: CurationInventoryEntry,
  action: "merge" | "archive" | "remove",
): string[] {
  const base = [
    "Persisted user evidence may already reference this stable ID. Applying this proposal later requires an explicit migration/archive decision.",
  ];

  if (action === "merge") {
    base.push(
      "A merge must preserve compatible historical evidence under the replacement ID and record the old→new identity mapping.",
    );
  } else if (action === "remove") {
    base.push(
      "Removal must not silently discard stored evidence; prefer archive/replacement when historical data still matters.",
    );
  } else {
    base.push(
      "Archived entities should remain recognizable to migration/import code while disappearing from current decision surfaces.",
    );
  }

  if (entry.entityType === "signal") {
    base.push(
      "Signals are cross-system primitives. Removing/merging one requires updating every question, role/headspace, facet and catalog mapping that references it.",
    );
  }

  return base;
}
