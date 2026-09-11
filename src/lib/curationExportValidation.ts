import { curationInventory } from "../data/curationInventory";
import { buildCanonicalSignalEntityModel } from "./curationCanonicalSignalEntity";
import {
  canonicalizeCurationEditorModel,
  validateCanonicalCurationDraft,
} from "./curationCanonicalEditorModel";
import {
  buildCurationEditorModel,
  createCurationDraft,
} from "./curationEditor";
import type {
  CurationChange,
  CurationChangeValue,
  CurationWorkspace,
} from "./curationWorkspace";

export type CurationExportValidationResult = {
  errors: readonly string[];
  warnings: readonly string[];
};

const validActions = new Set(["keep", "modify", "merge", "archive", "remove"]);

function changeKey(change: Pick<CurationChange, "entityType" | "entityId">) {
  return `${change.entityType}:${change.entityId}`;
}

function prefixMessages(
  prefix: string,
  messages: readonly string[],
): string[] {
  return messages.map((message) => `${prefix}: ${message}`);
}

function validateRelationCompatibility(
  prefix: string,
  changes: Record<string, CurationChangeValue> | undefined,
) {
  const errors: string[] = [];
  if (!changes) return errors;

  for (const [fieldKey, value] of Object.entries(changes)) {
    if (!Array.isArray(value)) continue;

    for (const item of value) {
      if (typeof item !== "object" || item === null || !("id" in item)) continue;
      if ("direction" in item && item.direction !== undefined) {
        errors.push(
          `${prefix}: ${fieldKey} still contains deprecated direction metadata; use canonical Signal channel/catalog applicability instead.`,
        );
      }
    }
  }

  return errors;
}

function validateChange(change: CurationChange) {
  const errors: string[] = [];
  const warnings: string[] = [];
  const key = changeKey(change);
  const entry = curationInventory.find(
    (candidate) =>
      candidate.entityType === change.entityType &&
      candidate.entityId === change.entityId,
  );

  if (!entry) {
    errors.push(`${key}: entity does not exist in the current curation inventory.`);
    return { errors, warnings };
  }

  if (!validActions.has(change.action)) {
    errors.push(`${key}: unknown review action "${String(change.action)}".`);
    return { errors, warnings };
  }

  if (!Number.isFinite(Date.parse(change.reviewedAt))) {
    errors.push(`${key}: reviewedAt must be a valid timestamp.`);
  }

  errors.push(...validateRelationCompatibility(key, change.changes));

  if (change.action === "modify") {
    if (!change.changes || Object.keys(change.changes).length === 0) {
      errors.push(`${key}: Modify proposals must contain at least one changed field.`);
      return { errors, warnings };
    }

    const sourceModel =
      buildCanonicalSignalEntityModel(entry) ?? buildCurationEditorModel(entry);
    const model = canonicalizeCurationEditorModel(entry, sourceModel);

    if (!model) {
      errors.push(`${key}: no structured editor model exists for this entity.`);
      return { errors, warnings };
    }

    const knownFieldKeys = new Set(model.fields.map((field) => field.key));
    for (const fieldKey of Object.keys(change.changes)) {
      if (!knownFieldKeys.has(fieldKey)) {
        errors.push(`${key}: proposal contains unknown field "${fieldKey}".`);
      }
    }

    const draft = createCurationDraft(model, change.changes);
    const validation = validateCanonicalCurationDraft(model, draft);
    errors.push(...prefixMessages(key, validation.errors));
    warnings.push(...prefixMessages(key, validation.warnings));
  } else if (change.changes && Object.keys(change.changes).length > 0) {
    warnings.push(
      `${key}: ${change.action} proposal contains field changes that will not be applied as a Modify proposal.`,
    );
  }

  if (change.action === "merge") {
    const replacementId = change.replacementId?.trim();
    if (!replacementId) {
      errors.push(`${key}: merge proposals require a replacement stable ID.`);
    } else if (replacementId === change.entityId) {
      errors.push(`${key}: an entity cannot be merged into itself.`);
    } else if (
      !curationInventory.some(
        (candidate) =>
          candidate.entityType === change.entityType &&
          candidate.entityId === replacementId,
      )
    ) {
      errors.push(
        `${key}: replacement ID "${replacementId}" is not an existing ${change.entityType}.`,
      );
    }
  }

  return { errors, warnings };
}

export function validateCurationWorkspaceForExport(
  workspace: CurationWorkspace,
): CurationExportValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (workspace.schemaVersion !== 2) {
    errors.push(
      `Workspace schema version ${workspace.schemaVersion} cannot be exported; expected version 2.`,
    );
  }

  if (!Array.isArray(workspace.changes)) {
    return {
      errors: [...errors, "Workspace changes must be a list."],
      warnings,
    };
  }

  const keys = new Set<string>();
  for (const change of workspace.changes) {
    const key = changeKey(change);
    if (keys.has(key)) {
      errors.push(`${key}: duplicate proposal exists in the workspace.`);
    }
    keys.add(key);

    const validation = validateChange(change);
    errors.push(...validation.errors);
    warnings.push(...validation.warnings);
  }

  return { errors, warnings };
}

export function formatCurationExportErrors(errors: readonly string[]) {
  const visible = errors.slice(0, 8);
  const remaining = errors.length - visible.length;
  return [
    "Cannot export curation proposals until these errors are fixed:",
    ...visible.map((error) => `• ${error}`),
    ...(remaining > 0 ? [`• …and ${remaining} more.`] : []),
  ].join("\n");
}
