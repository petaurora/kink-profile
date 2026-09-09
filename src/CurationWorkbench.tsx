import { useEffect, useMemo, useState } from "react";
import {
  IconArrowRight,
  IconDownload,
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
import {
  createEmptyCurationWorkspace,
  exportCurationWorkspace,
  findCurationChange,
  loadCurationWorkspace,
  removeCurationChange,
  saveCurationWorkspace,
  upsertCurationChange,
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
  const [selectedKey, setSelectedKey] = useState("");
  const [draftAction, setDraftAction] =
    useState<CurationReviewAction | null>(null);
  const [draftLabel, setDraftLabel] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [draftReplacementId, setDraftReplacementId] = useState("");
  const [draftNote, setDraftNote] = useState("");

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
  }, [reviewFilter, reviewedKeys, search, typeFilter]);

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
      setDraftLabel("");
      setDraftDescription("");
      setDraftReplacementId("");
      setDraftNote("");
      return;
    }

    setDraftAction(currentChange?.action ?? null);
    setDraftLabel(currentChange?.changes?.label ?? currentEntry.label);
    setDraftDescription(
      currentChange?.changes?.description ?? currentEntry.summary,
    );
    setDraftReplacementId(currentChange?.replacementId ?? "");
    setDraftNote(currentChange?.note ?? "");
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

  const saveDecision = (action: CurationReviewAction) => {
    if (!currentEntry) return;

    const changes =
      action === "modify"
        ? {
            label: draftLabel.trim(),
            description: draftDescription.trim(),
          }
        : undefined;

    setWorkspace((previous) =>
      upsertCurationChange(previous, {
        entityType: currentEntry.entityType,
        entityId: currentEntry.entityId,
        action,
        changes,
        replacementId:
          action === "merge" ? draftReplacementId.trim() || undefined : undefined,
        note: draftNote.trim() || undefined,
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

          <div className="curation-current-values">
            <span className="catalog-kicker">Current repo value</span>
            <div className="curation-field-grid">
              {currentEntry.fields.map((field) => (
                <div key={field.key}>
                  <span>{field.label}</span>
                  <p>{field.value || "—"}</p>
                </div>
              ))}
            </div>
            <small>Source: {currentEntry.source}</small>
          </div>

          <div className="curation-action-grid">
            {(Object.keys(actionLabels) as CurationReviewAction[]).map(
              (action) => (
                <button
                  type="button"
                  key={action}
                  className={draftAction === action ? "is-active" : ""}
                  onClick={() => {
                    setDraftAction(action);
                    if (action === "keep" || action === "archive" || action === "remove") {
                      saveDecision(action);
                    }
                  }}
                >
                  {actionLabels[action]}
                </button>
              ),
            )}
          </div>

          {(draftAction === "modify" || draftAction === "merge") && (
            <div className="curation-proposal panel">
              <span className="catalog-kicker">Local proposal</span>

              {draftAction === "modify" && (
                <div className="curation-proposal-fields">
                  <label>
                    <span>Proposed label</span>
                    <input
                      value={draftLabel}
                      onChange={(event) => setDraftLabel(event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Proposed description / meaning</span>
                    <textarea
                      rows={4}
                      value={draftDescription}
                      onChange={(event) =>
                        setDraftDescription(event.target.value)
                      }
                    />
                  </label>
                </div>
              )}

              {draftAction === "merge" && (
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
              )}

              <label>
                <span>Curator note</span>
                <textarea
                  rows={3}
                  value={draftNote}
                  onChange={(event) => setDraftNote(event.target.value)}
                  placeholder="Why does this change make the model better?"
                />
              </label>

              <button
                className="primary"
                type="button"
                onClick={() => saveDecision(draftAction)}
                disabled={
                  draftAction === "merge" && !draftReplacementId.trim()
                }
              >
                Save proposal
              </button>
            </div>
          )}

          {currentChange && draftAction !== "modify" && draftAction !== "merge" && (
            <div className="curation-saved-note">
              <span>
                Saved as <strong>{actionLabels[currentChange.action]}</strong>
              </span>
              <button type="button" className="link-button" onClick={clearCurrentReview}>
                Clear this review
              </button>
            </div>
          )}

          <div className="curation-card-footer">
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
