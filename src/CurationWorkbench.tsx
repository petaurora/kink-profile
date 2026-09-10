import { useEffect, useMemo, useState } from "react";
import {
  IconArrowRight,
  IconDownload,
  IconDots,
  IconRefresh,
  IconSearch,
  IconTrash,
} from "@tabler/icons-react";
import {
  curationInventory,
  curationInventoryCounts,
  curationPrimitiveLabels,
  curationReviewRubric,
  curationSurfaces,
  type CurationInventoryEntry,
  type CurationPrimitiveType,
} from "./data/curationInventory";
import { CurationCurrentValuePanel } from "./CurationCurrentValuePanel";
import { CurationStructuredEditor } from "./CurationStructuredEditor";
import {
  getDestructiveActionConsequences,
  validateMergeTarget,
} from "./lib/curationEditor";
import { getCurationPrimitiveFacetAffinities } from "./lib/curationSemanticProjection";
import {
  createEmptyCurationWorkspace,
  exportCurationWorkspace,
  findCurationChange,
  loadCurationWorkspace,
  removeCurationChange,
  saveCurationWorkspace,
  upsertCurationChange,
  type CurationChangeValue,
  type CurationReviewAction,
  type CurationWorkspace,
} from "./lib/curationWorkspace";
import "./curationWorkbench.css";

type ReviewFilter = "unreviewed" | "all" | "reviewed";
type TypeFilter = "all" | CurationPrimitiveType;

const actionLabels: Record<CurationReviewAction, string> = {
  keep: "Keep",
  modify: "Modify",
  merge: "Merge",
  archive: "Archive",
  remove: "Remove",
};

function entryKey(entry: CurationInventoryEntry) {
  return `${entry.entityType}:${entry.entityId}`;
}

function downloadWorkspace(workspace: CurationWorkspace) {
  const blob = new Blob([exportCurationWorkspace(workspace)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "m16-curation-export.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

export function CurationWorkbench({ onClose }: { onClose: () => void }) {
  const [workspace, setWorkspace] = useState(() => loadCurationWorkspace());
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [reviewFilter, setReviewFilter] =
    useState<ReviewFilter>("unreviewed");
  const [search, setSearch] = useState("");
  const [facetGapOnly, setFacetGapOnly] = useState(false);
  const [selectedKey, setSelectedKey] = useState("");
  const [draftAction, setDraftAction] =
    useState<CurationReviewAction | null>(null);
  const [draftReplacementId, setDraftReplacementId] = useState("");
  const [draftNote, setDraftNote] = useState("");
  const [showLifecycleActions, setShowLifecycleActions] = useState(false);

  useEffect(() => {
    saveCurationWorkspace(workspace);
  }, [workspace]);

  const reviewedKeys = useMemo(
    () =>
      new Set(
        workspace.changes.map(
          (change) => `${change.entityType}:${change.entityId}`,
        ),
      ),
    [workspace],
  );

  const filteredEntries = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();

    return curationInventory.filter((entry) => {
      if (typeFilter !== "all" && entry.entityType !== typeFilter) {
        return false;
      }

      const reviewed = reviewedKeys.has(entryKey(entry));
      if (reviewFilter === "reviewed" && !reviewed) return false;
      if (reviewFilter === "unreviewed" && reviewed) return false;

      if (facetGapOnly) {
        if (entry.entityType === "signal") return false;
        if (
          getCurationPrimitiveFacetAffinities(
            entry.entityType,
            entry.entityId,
          ).length > 0
        ) {
          return false;
        }
      }

      if (!normalizedSearch) return true;

      return [
        entry.label,
        entry.entityId,
        entry.summary,
        entry.source,
        ...entry.fields.flatMap((field) => [field.label, field.value]),
      ].some((value) =>
        value.toLocaleLowerCase().includes(normalizedSearch),
      );
    });
  }, [facetGapOnly, reviewFilter, reviewedKeys, search, typeFilter]);

  const currentEntry =
    filteredEntries.find((entry) => entryKey(entry) === selectedKey) ??
    filteredEntries[0] ??
    null;

  const currentChange = currentEntry
    ? findCurationChange(
        workspace,
        currentEntry.entityType,
        currentEntry.entityId,
      )
    : undefined;

  useEffect(() => {
    if (!currentEntry) {
      setSelectedKey("");
      return;
    }

    if (selectedKey !== entryKey(currentEntry)) {
      setSelectedKey(entryKey(currentEntry));
    }
  }, [currentEntry, selectedKey]);

  useEffect(() => {
    if (!currentEntry) {
      setDraftAction(null);
      setDraftReplacementId("");
      setDraftNote("");
      setShowLifecycleActions(false);
      return;
    }

    setDraftAction(currentChange?.action ?? null);
    setDraftReplacementId(currentChange?.replacementId ?? "");
    setDraftNote(currentChange?.note ?? "");
    setShowLifecycleActions(
      currentChange?.action === "merge" ||
        currentChange?.action === "archive" ||
        currentChange?.action === "remove",
    );
  }, [
    currentEntry?.entityId,
    currentEntry?.entityType,
    currentChange?.reviewedAt,
  ]);

  const chooseRandom = () => {
    if (filteredEntries.length === 0) return;
    const currentIndex = currentEntry
      ? filteredEntries.findIndex(
          (entry) => entryKey(entry) === entryKey(currentEntry),
        )
      : -1;
    const pool =
      filteredEntries.length > 1
        ? filteredEntries.filter((_, index) => index !== currentIndex)
        : filteredEntries;
    const next = pool[Math.floor(Math.random() * pool.length)];
    setSelectedKey(entryKey(next));
  };

  const saveDecision = (
    action: CurationReviewAction,
    options?: {
      changes?: Record<string, CurationChangeValue>;
      note?: string;
    },
  ) => {
    if (!currentEntry) return;

    setWorkspace((previous) =>
      upsertCurationChange(previous, {
        entityType: currentEntry.entityType,
        entityId: currentEntry.entityId,
        action,
        changes: options?.changes,
        replacementId:
          action === "merge" ? draftReplacementId.trim() || undefined : undefined,
        note: (options?.note ?? draftNote).trim() || undefined,
        reviewedAt: new Date().toISOString(),
      }),
    );
    setDraftAction(action);

    window.setTimeout(() => {
      const remaining = filteredEntries.filter(
        (entry) => entryKey(entry) !== entryKey(currentEntry),
      );
      if (reviewFilter === "unreviewed" && remaining.length > 0) {
        const next = remaining[Math.floor(Math.random() * remaining.length)];
        setSelectedKey(entryKey(next));
      }
    }, 0);
  };

  const clearCurrentReview = () => {
    if (!currentEntry) return;

    setWorkspace((previous) =>
      removeCurationChange(
        previous,
        currentEntry.entityType,
        currentEntry.entityId,
      ),
    );
  };

  const reviewedCount = workspace.changes.length;
  const totalCount = curationInventory.length;

  return (
    <section className="curation-workbench">
      <div className="curation-hero panel">
        <div>
          <p className="eyebrow">M16 · Data & content curation</p>
          <h1>Curation Workbench</h1>
          <p>
            Review the app itself without touching your actual profile. Every
            decision here is a local proposal until you export it and apply it
            through the repo workflow.
          </p>
        </div>
        <div className="curation-hero-actions">
          <button className="secondary" type="button" onClick={onClose}>
            Back to explore
          </button>
          <button
            className="secondary"
            type="button"
            onClick={() => downloadWorkspace(workspace)}
            disabled={reviewedCount === 0}
          >
            <IconDownload size={17} stroke={2} aria-hidden="true" />
            Export proposals
          </button>
        </div>
      </div>

      <div className="curation-progress panel">
        <div>
          <span className="catalog-kicker">Review progress</span>
          <strong>
            {reviewedCount} / {totalCount}
          </strong>
          <span>primitives reviewed</span>
        </div>
        <div className="curation-progress-track" aria-hidden="true">
          <span
            style={{
              width: `${totalCount === 0 ? 0 : (reviewedCount / totalCount) * 100}%`,
            }}
          />
        </div>
      </div>

      <details className="curation-scope panel">
        <summary>
          <span>
            <strong>M16 inventory</strong>
            <small>{curationSurfaces.length} authored/derived surfaces tracked</small>
          </span>
        </summary>
        <div className="curation-surface-list">
          {curationSurfaces.map((surface) => (
            <div className="curation-surface-row" key={surface.id}>
              <div>
                <strong>{surface.label}</strong>
                <p>{surface.notes}</p>
              </div>
              <span className={`curation-status is-${surface.status}`}>
                {surface.status === "available"
                  ? "Workbench ready"
                  : surface.status === "source-only"
                    ? "Source review"
                    : "Later editor"}
              </span>
            </div>
          ))}
        </div>
      </details>

      <details className="curation-rubric panel">
        <summary>
          <span>
            <strong>Review rubric</strong>
            <small>What every primitive has to earn</small>
          </span>
        </summary>
        <div className="curation-rubric-grid">
          {curationReviewRubric.map((criterion) => (
            <article key={criterion.id}>
              <strong>{criterion.label}</strong>
              <p>{criterion.question}</p>
            </article>
          ))}
        </div>
      </details>

      <div className="curation-controls panel">
        <div className="curation-filter-row" aria-label="Primitive type filter">
          <button
            type="button"
            className={typeFilter === "all" ? "is-active" : ""}
            onClick={() => setTypeFilter("all")}
          >
            All <span>{totalCount}</span>
          </button>
          {(Object.keys(curationPrimitiveLabels) as CurationPrimitiveType[]).map(
            (type) => (
              <button
                type="button"
                key={type}
                className={typeFilter === type ? "is-active" : ""}
                onClick={() => setTypeFilter(type)}
              >
                {curationPrimitiveLabels[type]}
                <span>{curationInventoryCounts[type]}</span>
              </button>
            ),
          )}
        </div>

        <div className="curation-control-row">
          <div className="curation-review-filter">
            {(["unreviewed", "all", "reviewed"] as ReviewFilter[]).map(
              (filter) => (
                <button
                  type="button"
                  key={filter}
                  className={reviewFilter === filter ? "is-active" : ""}
                  onClick={() => setReviewFilter(filter)}
                >
                  {filter === "unreviewed"
                    ? "Needs review"
                    : filter === "reviewed"
                      ? "Reviewed"
                      : "Everything"}
                </button>
              ),
            )}
          </div>

          <label className="curation-search">
            <IconSearch size={17} stroke={2} aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search label, ID, mapping…"
            />
          </label>
        </div>

        <button
          type="button"
          className={`curation-gap-toggle${facetGapOnly ? " is-active" : ""}`}
          aria-pressed={facetGapOnly}
          onClick={() => setFacetGapOnly((enabled) => !enabled)}
        >
          ⚠ Overall Facet gaps only
        </button>
      </div>

      {currentEntry ? (
        <article className="curation-card panel">
          <div className="curation-card-topline">
            <div>
              <span className="catalog-kicker">
                {curationPrimitiveLabels[currentEntry.entityType]}
              </span>
              <code>{currentEntry.entityId}</code>
            </div>
            {currentChange && (
              <span className="curation-reviewed-badge">
                {actionLabels[currentChange.action]}
              </span>
            )}
          </div>

          <div className="curation-card-heading">
            <h2>{currentEntry.label}</h2>
            <p>{currentEntry.summary}</p>
          </div>

          {draftAction !== "modify" && (
            <CurationCurrentValuePanel entry={currentEntry} />
          )}

          <div className="curation-primary-actions">
            <button
              type="button"
              className={draftAction === "keep" ? "is-active" : ""}
              onClick={() => {
                setDraftAction("keep");
                saveDecision("keep");
              }}
            >
              Keep
            </button>
            <button
              type="button"
              className={draftAction === "modify" ? "is-active" : ""}
              onClick={() => setDraftAction("modify")}
            >
              Modify
            </button>
            <button
              type="button"
              className={
                showLifecycleActions ||
                draftAction === "merge" ||
                draftAction === "archive" ||
                draftAction === "remove"
                  ? "is-active"
                  : ""
              }
              aria-expanded={showLifecycleActions}
              onClick={() => setShowLifecycleActions((visible) => !visible)}
            >
              <IconDots size={18} stroke={2} aria-hidden="true" />
              More
            </button>
          </div>

          {showLifecycleActions && (
            <div className="curation-lifecycle-actions">
              {(["merge", "archive", "remove"] as const).map((action) => (
                <button
                  type="button"
                  key={action}
                  className={draftAction === action ? "is-active" : ""}
                  onClick={() => setDraftAction(action)}
                >
                  {actionLabels[action]}
                </button>
              ))}
            </div>
          )}

          <div className="curation-card-footer curation-card-nav">
            <button className="secondary" type="button" onClick={chooseRandom}>
              <IconRefresh size={17} stroke={2} aria-hidden="true" />
              Surprise me
            </button>
            <button
              className="secondary"
              type="button"
              onClick={() => {
                const index = filteredEntries.findIndex(
                  (entry) => entryKey(entry) === entryKey(currentEntry),
                );
                const next = filteredEntries[(index + 1) % filteredEntries.length];
                setSelectedKey(entryKey(next));
              }}
            >
              Next
              <IconArrowRight size={17} stroke={2} aria-hidden="true" />
            </button>
          </div>

          {draftAction === "modify" && (
            <div className="curation-proposal panel">
              <span className="catalog-kicker">Structured local proposal</span>
              <CurationStructuredEditor
                entry={currentEntry}
                change={currentChange}
                onSave={(changes, note) =>
                  saveDecision("modify", { changes, note })
                }
              />
            </div>
          )}

          {(draftAction === "merge" ||
            draftAction === "archive" ||
            draftAction === "remove") && (
            <div className="curation-proposal panel">
              <span className="catalog-kicker">Identity / lifecycle proposal</span>

              <div className="curation-consequences">
                <div className="curation-editor-label">
                  <strong>Before this can be applied</strong>
                  <small>
                    These are proposal-time warnings; the workbench still does not
                    mutate runtime or profile data.
                  </small>
                </div>
                <ul>
                  {getDestructiveActionConsequences(
                    currentEntry,
                    draftAction,
                  ).map((consequence) => (
                    <li key={consequence}>{consequence}</li>
                  ))}
                </ul>
              </div>

              {draftAction === "merge" && (
                <>
                  <label>
                    <span>Replacement stable ID</span>
                    <input
                      value={draftReplacementId}
                      onChange={(event) =>
                        setDraftReplacementId(event.target.value)
                      }
                      placeholder="existing-stable-id"
                    />
                  </label>
                  {validateMergeTarget(currentEntry, draftReplacementId).map(
                    (error) => (
                      <div className="curation-validation is-error" key={error}>
                        <p>{error}</p>
                      </div>
                    ),
                  )}
                </>
              )}

              <label>
                <span>Curator note</span>
                <textarea
                  rows={3}
                  value={draftNote}
                  onChange={(event) => setDraftNote(event.target.value)}
                  placeholder="Why should this identity be changed?"
                />
              </label>

              <button
                className="primary"
                type="button"
                onClick={() => saveDecision(draftAction)}
                disabled={
                  draftAction === "merge" &&
                  validateMergeTarget(currentEntry, draftReplacementId).length > 0
                }
              >
                Save {actionLabels[draftAction]} proposal
              </button>
            </div>
          )}

          {currentChange && draftAction === "keep" && (
            <div className="curation-saved-note">
              <span>
                Saved as <strong>{actionLabels[currentChange.action]}</strong>
              </span>
              <button type="button" className="link-button" onClick={clearCurrentReview}>
                Clear this review
              </button>
            </div>
          )}

        </article>
      ) : (
        <div className="curation-empty panel">
          <h2>Nothing in this view.</h2>
          <p>
            Change the filters, or switch to Reviewed if you already chewed
            through everything here. 🫡
          </p>
        </div>
      )}

      {reviewedCount > 0 && (
        <div className="curation-danger-zone panel">
          <div>
            <strong>Local curation workspace</strong>
            <p>
              This only clears M16 proposal/review state. It does not touch your
              profile, rankings, scenes, rewards, punishments, or quiz answers.
            </p>
          </div>
          <button
            className="secondary"
            type="button"
            onClick={() => {
              if (!window.confirm("Clear all local M16 curation proposals?")) return;
              setWorkspace(createEmptyCurationWorkspace());
            }}
          >
            <IconTrash size={17} stroke={2} aria-hidden="true" />
            Clear proposals
          </button>
        </div>
      )}
    </section>
  );
}
