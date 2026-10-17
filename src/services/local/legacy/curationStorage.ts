import { CURATION_WORKSPACE_SCHEMA_VERSION, CURATION_WORKSPACE_STORAGE_KEY, createEmptyCurationWorkspace, type CurationWorkspace } from "../../../lib/curationWorkspace";

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
