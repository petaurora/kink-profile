import type { CurationPrimitiveType } from "../data/curationInventory";
import type { SignalChannel } from "../data/canonicalSignals";

export const CURATION_WORKSPACE_SCHEMA_VERSION = 2;
export const CURATION_WORKSPACE_STORAGE_KEY =
  "kink-profile:m16-curation-workspace:v2";

export type CurationReviewAction =
  | "keep"
  | "modify"
  | "merge"
  | "archive"
  | "remove";

export type CurationWeightedRelation = {
  id: string;
  weight: number;
  /** Canonical Signal channel used by the M16.2 Workbench authoring model. */
  channel?: SignalChannel;
  /**
   * Catalog source applicability is not a Signal channel. This preserves the
   * old TSV `Applies To` condition independently so a curator can edit both
   * concepts without conflating them.
   */
  catalogAppliesTo?: "any" | "receiving" | "giving";
  /**
   * Deprecated compatibility field used only by the legacy editor adapter.
   * New Workbench proposals must not emit this field.
   */
  direction?: "receiving" | "giving";
  relationship?: "supports" | "opposes";
};

export type CurationFacetRelationship = {
  id: string;
  relationship: "supports" | "neutral" | "opposes";
  weight: number;
};

export type CurationChangeListItem =
  | string
  | CurationWeightedRelation
  | CurationFacetRelationship;

export type CurationChangeValue =
  | string
  | number
  | boolean
  | CurationChangeListItem[];

export type CurationChange = {
  entityType: CurationPrimitiveType;
  entityId: string;
  action: CurationReviewAction;
  changes?: Record<string, CurationChangeValue>;
  replacementId?: string;
  note?: string;
  reviewedAt: string;
};

export type CurationWorkspace = {
  schemaVersion: number;
  sourceRevision?: string;
  changes: CurationChange[];
};

export function createEmptyCurationWorkspace(): CurationWorkspace {
  return {
    schemaVersion: CURATION_WORKSPACE_SCHEMA_VERSION,
    changes: [],
  };
}

export function curationChangeKey(
  entityType: CurationPrimitiveType,
  entityId: string,
) {
  return `${entityType}:${entityId}`;
}

export function findCurationChange(
  workspace: CurationWorkspace,
  entityType: CurationPrimitiveType,
  entityId: string,
) {
  return workspace.changes.find(
    (change) =>
      change.entityType === entityType && change.entityId === entityId,
  );
}

export function upsertCurationChange(
  workspace: CurationWorkspace,
  change: CurationChange,
): CurationWorkspace {
  const key = curationChangeKey(change.entityType, change.entityId);
  const nextChanges = workspace.changes.filter(
    (existing) =>
      curationChangeKey(existing.entityType, existing.entityId) !== key,
  );

  return {
    ...workspace,
    changes: [...nextChanges, change].sort((left, right) =>
      curationChangeKey(left.entityType, left.entityId).localeCompare(
        curationChangeKey(right.entityType, right.entityId),
      ),
    ),
  };
}

export function removeCurationChange(
  workspace: CurationWorkspace,
  entityType: CurationPrimitiveType,
  entityId: string,
): CurationWorkspace {
  const key = curationChangeKey(entityType, entityId);

  return {
    ...workspace,
    changes: workspace.changes.filter(
      (change) =>
        curationChangeKey(change.entityType, change.entityId) !== key,
    ),
  };
}

function isCurationWorkspace(value: unknown): value is CurationWorkspace {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<CurationWorkspace>;
  return (
    candidate.schemaVersion === CURATION_WORKSPACE_SCHEMA_VERSION &&
    Array.isArray(candidate.changes)
  );
}

export function loadCurationWorkspace(): CurationWorkspace {
  if (typeof window === "undefined") return createEmptyCurationWorkspace();

  try {
    const raw = window.localStorage.getItem(CURATION_WORKSPACE_STORAGE_KEY);
    if (!raw) return createEmptyCurationWorkspace();

    const parsed = JSON.parse(raw) as unknown;
    return isCurationWorkspace(parsed)
      ? parsed
      : createEmptyCurationWorkspace();
  } catch {
    return createEmptyCurationWorkspace();
  }
}

export function saveCurationWorkspace(workspace: CurationWorkspace) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    CURATION_WORKSPACE_STORAGE_KEY,
    JSON.stringify(workspace),
  );
}

export function exportCurationWorkspace(workspace: CurationWorkspace) {
  return JSON.stringify(
    {
      ...workspace,
      exportedAt: new Date().toISOString(),
    },
    null,
    2,
  );
}
