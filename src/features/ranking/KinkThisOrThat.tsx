import { useEffect, useMemo, useState } from "react";
import { PairwiseComparisonPanel } from "../../components/PairwiseComparisonPanel";
import { RankingMovementIndicator } from "../../components/RankingMovementIndicator";
import {
  kinkCatalog,
  kinkCategories,
  type KinkCatalogItem,
} from "../../data/kinkCatalog.generated";
import {
  calculateRanking,
  confidenceLabel,
  countOrderingComparisonsForScope,
  isOrderingResult,
  selectCategoryFinalists,
  selectNextPair,
  selectOverallCandidates,
  type ComparisonResult,
  type KinkComparison,
  type RankingScope,
} from "../../lib/kinkRanking";
import {
  filterEligibleCatalogItems,
  getActiveKinkRankingComparisons,
  getActiveKinkRankingRunId,
} from "../../lib/catalogProfile";
import {
  loadCatalogProfile,
  saveCatalogProfile,
} from "../../lib/catalogProfileStorage";
import {
  buildCatalogResultView,
  catalogPreferenceLabels,
} from "../../lib/catalogResults";
import { startNewKinkRankingRun } from "../../lib/kinkRankingHistory";
import {
  calculateViewRelativeRankingMovements,
  getPreviousComparableRankingSnapshot,
} from "../../lib/kinkRankingMovement";
import type { StoredProfile } from "../../lib/profileStorage";
import "./KinkThisOrThat.activity.css";

type RankingMode = "category" | "overall";

type CategoryRankingSummary = {
  id: string;
  comparisons: number;
  confidence: number;
};

const CHECKPOINT_SIZE = 25;

function randomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `comparison-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function randomRunId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `ranking-run-${crypto.randomUUID()}`;
  }

  return `ranking-run-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function randomizePair(pair: [KinkCatalogItem, KinkCatalogItem] | null) {
  if (!pair) return null;
  return Math.random() < 0.5
    ? pair
    : ([pair[1], pair[0]] as [KinkCatalogItem, KinkCatalogItem]);
}

function comparisonCountForScope(
  comparisons: readonly KinkComparison[],
  scope: RankingScope,
) {
  return comparisons.filter((comparison) => {
    if (comparison.scope.type !== scope.type) return false;
    return (
      scope.type === "overall" ||
      (comparison.scope.type === "category" &&
        comparison.scope.categoryId === scope.categoryId)
    );
  }).length;
}

export function mostRecentRankedCategoryId(
  comparisons: readonly KinkComparison[],
) {
  const latest = comparisons
    .filter(
      (comparison) =>
        comparison.scope.type === "category" &&
        isOrderingResult(comparison.result),
    )
    .slice()
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];

  return latest?.scope.type === "category" ? latest.scope.categoryId : null;
}

export function suggestedRankingCategoryId(
  summaries: readonly CategoryRankingSummary[],
  currentCategoryId?: string,
) {
  const alternatives = summaries.filter(
    (summary) => summary.id !== currentCategoryId,
  );
  const pool = alternatives.length > 0 ? alternatives : summaries;

  const inProgress = pool
    .filter((summary) => summary.comparisons > 0 && summary.confidence < 0.45)
    .slice()
    .sort(
      (a, b) =>
        a.confidence - b.confidence || a.comparisons - b.comparisons,
    )[0];
  if (inProgress) return inProgress.id;

  const notStarted = pool.find((summary) => summary.comparisons === 0);
  if (notStarted) return notStarted.id;

  return (
    pool.slice().sort((a, b) => a.confidence - b.confidence)[0]?.id ?? null
  );
}

export function KinkThisOrThat({
  quizProfile,
}: {
  quizProfile: StoredProfile;
  onClose: () => void;
}) {
  const [profile, setProfile] = useState(() => loadCatalogProfile());
  const initialComparisons = getActiveKinkRankingComparisons(profile);
  const initialCategoryId =
    mostRecentRankedCategoryId(initialComparisons) ?? kinkCategories[0]?.id ?? "";

  const [mode, setMode] = useState<RankingMode>("category");
  const [categoryId, setCategoryId] = useState<string>(initialCategoryId);
  const [checkpointStartCount, setCheckpointStartCount] = useState(() =>
    comparisonCountForScope(initialComparisons, {
      type: "category",
      categoryId: initialCategoryId,
    }),
  );
  const [showResults, setShowResults] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showNewRunConfirm, setShowNewRunConfirm] = useState(false);
  const [newRunNotice, setNewRunNotice] = useState(false);
  const [pairNonce, setPairNonce] = useState(0);
  const [openMovementId, setOpenMovementId] = useState<string | null>(null);
  const [hasStartedRanking, setHasStartedRanking] = useState(false);
  const [categoryFabOpen, setCategoryFabOpen] = useState(false);

  useEffect(() => {
    saveCatalogProfile(profile);
  }, [profile]);

  const eligibleCatalog = useMemo(
    () => filterEligibleCatalogItems(kinkCatalog, profile.preferences),
    [profile.preferences],
  );

  const activeComparisons = useMemo(
    () => getActiveKinkRankingComparisons(profile),
    [profile],
  );
  const activeRunId = getActiveKinkRankingRunId(profile);
  const hasMeaningfulRank = activeComparisons.some((comparison) =>
    isOrderingResult(comparison.result),
  );
  const rankingRunNumber = Object.keys(profile.rankingHistory?.runs ?? {}).length;

  const finalists = useMemo(
    () => selectCategoryFinalists(eligibleCatalog, activeComparisons, 5),
    [eligibleCatalog, activeComparisons],
  );

  const overallCandidates = useMemo(
    () =>
      selectOverallCandidates(eligibleCatalog, finalists, activeComparisons),
    [eligibleCatalog, finalists, activeComparisons],
  );

  const activeCatalog =
    mode === "overall"
      ? overallCandidates
      : eligibleCatalog.filter((item) => item.categoryId === categoryId);

  const scope: RankingScope =
    mode === "overall"
      ? { type: "overall" }
      : { type: "category", categoryId };

  const snapshot = useMemo(
    () => calculateRanking(activeCatalog, activeComparisons, scope),
    [activeCatalog, activeComparisons, mode, categoryId],
  );

  const previousComparableSnapshot = useMemo(
    () => getPreviousComparableRankingSnapshot(profile, scope),
    [profile, mode, categoryId],
  );

  const visibleRankingItems = useMemo(
    () => snapshot.items.slice(0, mode === "overall" ? 25 : 10),
    [mode, snapshot.items],
  );

  const visibleRankingMovements = useMemo(
    () =>
      calculateViewRelativeRankingMovements(
        visibleRankingItems,
        previousComparableSnapshot,
      ),
    [previousComparableSnapshot, visibleRankingItems],
  );

  const basePair = useMemo(
    () => selectNextPair(activeCatalog, activeComparisons, scope),
    [activeCatalog, activeComparisons, mode, categoryId, pairNonce],
  );
  const pair = useMemo(() => randomizePair(basePair), [basePair, pairNonce]);

  const totalInScope = comparisonCountForScope(activeComparisons, scope);
  const orderingInScope = countOrderingComparisonsForScope(
    activeComparisons,
    scope,
  );
  const checkpointAnswered = Math.max(0, totalInScope - checkpointStartCount);
  const checkpointComplete = checkpointAnswered >= CHECKPOINT_SIZE;

  const resultView = useMemo(
    () => (showResults ? buildCatalogResultView(quizProfile, profile) : null),
    [quizProfile, profile, showResults],
  );

  const activeCategory = kinkCategories.find(
    (category) => category.id === categoryId,
  );

  const categorySummaries = useMemo(
    () =>
      kinkCategories.map((category) => {
        const categoryScope: RankingScope = {
          type: "category",
          categoryId: category.id,
        };
        const comparisons = countOrderingComparisonsForScope(
          activeComparisons,
          categoryScope,
        );
        const categoryCatalog = eligibleCatalog.filter(
          (item) => item.categoryId === category.id,
        );
        const categorySnapshot = calculateRanking(
          categoryCatalog,
          activeComparisons,
          categoryScope,
        );

        return {
          ...category,
          comparisons,
          confidence: categorySnapshot.confidence,
          confidenceLabel:
            comparisons === 0
              ? "Not started"
              : confidenceLabel(categorySnapshot.confidence),
        };
      }),
    [eligibleCatalog, activeComparisons],
  );

  const lastRankedCategoryId = mostRecentRankedCategoryId(activeComparisons);

  const continueCheckpoint = () => {
    setCheckpointStartCount(totalInScope);
    setShowResults(false);
    setPairNonce((value) => value + 1);
  };

  const answer = (result: ComparisonResult) => {
    if (!hasStartedRanking || !pair || checkpointComplete) return;

    const comparison: KinkComparison = {
      id: randomId(),
      runId: activeRunId,
      leftKinkId: pair[0].id,
      rightKinkId: pair[1].id,
      scope,
      result,
      timestamp: new Date().toISOString(),
    };

    setProfile((current) => ({
      ...current,
      comparisons: [...current.comparisons, comparison],
    }));
    setPairNonce((value) => value + 1);
  };

  const changeCategory = (nextCategoryId: string) => {
    setMode("category");
    setCategoryId(nextCategoryId);
    setShowCategoryPicker(false);
    setCategoryFabOpen(false);
    setShowResults(false);
    setPairNonce((value) => value + 1);
    setCheckpointStartCount(
      comparisonCountForScope(activeComparisons, {
        type: "category",
        categoryId: nextCategoryId,
      }),
    );
  };

  const pickCategoryForMe = () => {
    const suggested = suggestedRankingCategoryId(categorySummaries, categoryId);
    if (suggested) changeCategory(suggested);
  };

  const openCategoryPicker = () => {
    setMode("category");
    setShowResults(false);
    setCategoryFabOpen(false);
    setShowCategoryPicker(true);
    setCheckpointStartCount(
      comparisonCountForScope(activeComparisons, {
        type: "category",
        categoryId,
      }),
    );
  };

  const openOverallRanking = () => {
    if (overallCandidates.length < 2) return;

    setMode("overall");
    setShowCategoryPicker(false);
    setCategoryFabOpen(false);
    setShowResults(false);
    setPairNonce((value) => value + 1);
    setCheckpointStartCount(
      comparisonCountForScope(activeComparisons, { type: "overall" }),
    );
  };

  const beginNewRankingRun = () => {
    const startedAt = new Date().toISOString();

    setProfile((current) =>
      startNewKinkRankingRun(
        current,
        filterEligibleCatalogItems(kinkCatalog, current.preferences),
        randomRunId(),
        startedAt,
      ),
    );
    setMode("category");
    setShowCategoryPicker(false);
    setCategoryFabOpen(false);
    setShowResults(false);
    setCheckpointStartCount(0);
    setPairNonce((value) => value + 1);
    setShowNewRunConfirm(false);
    setNewRunNotice(true);
  };

  const contextLabel =
    mode === "overall"
      ? "Overall ranking"
      : lastRankedCategoryId === categoryId && orderingInScope > 0
        ? "Continue ranking"
        : "Ranking";

  const openNextCategoryChoice = () => {
    setMode("category");
    setShowResults(false);
    setShowCategoryPicker(true);
    setCategoryFabOpen(false);
  };

  return (
    <section className="ranking-stack ranking-activity-stack">
      <section className="ranking-category-strip">
        <div>
          <p className="eyebrow">{contextLabel}</p>
          <h1>
            {mode === "overall" ? "Across everything" : activeCategory?.label}
          </h1>
        </div>
        <p className="ranking-category-strip-meta">
          {mode === "overall"
            ? `${overallCandidates.length} candidates · ${orderingInScope} comparisons`
            : `${orderingInScope} comparisons · ${confidenceLabel(snapshot.confidence)}`}
        </p>
      </section>

      {newRunNotice && (
        <div className="ranking-run-notice panel ranking-activity-notice" role="status">
          <div>
            <strong>Fresh ranking run started.</strong>
            <span>Your previous ranking is saved as history.</span>
          </div>
          <button className="text-button" onClick={() => setNewRunNotice(false)}>
            Dismiss
          </button>
        </div>
      )}

      {showCategoryPicker && mode === "category" && (
        <section className="ranking-category-picker panel">
          <div className="ranking-category-picker-heading">
            <div>
              <p className="eyebrow">Choose category</p>
              <h2>What sounds fun right now?</h2>
            </div>
            <button
              className="text-button"
              onClick={() => setShowCategoryPicker(false)}
            >
              Close
            </button>
          </div>
          <div className="ranking-category-picker-list">
            {categorySummaries.map((category) => (
              <button
                key={category.id}
                className={
                  category.id === categoryId
                    ? "ranking-category-picker-row is-current"
                    : "ranking-category-picker-row"
                }
                onClick={() => changeCategory(category.id)}
              >
                <span>
                  <strong>{category.label}</strong>
                  <small>{category.itemCount} items</small>
                </span>
                <span>
                  <strong>{category.comparisons}</strong>
                  <small>{category.confidenceLabel}</small>
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {!showResults && !checkpointComplete && pair && (
        <div
          className={
            hasStartedRanking
              ? "ranking-pair-stage"
              : "ranking-pair-stage is-gated"
          }
        >
          <PairwiseComparisonPanel
            ariaLabel="Kink comparison"
            metaStart={
              mode === "category"
                ? activeCategory?.label
                : "Cross-category finalists"
            }
            metaEnd={`${checkpointAnswered} / ${CHECKPOINT_SIZE}`}
            left={{
              id: pair[0].id,
              eyebrow: pair[0].categoryLabel,
              label: pair[0].label,
              description: pair[0].description,
            }}
            right={{
              id: pair[1].id,
              eyebrow: pair[1].categoryLabel,
              label: pair[1].label,
              description: pair[1].description,
            }}
            onPick={(side) => answer(side)}
            actions={
              <>
                <button className="secondary compact" onClick={() => answer("equal")}>
                  Both / equal
                </button>
                <button className="secondary compact" onClick={() => answer("neither")}>
                  Neither
                </button>
                <button className="text-button" onClick={() => answer("skip")}>
                  Skip / don't know
                </button>
              </>
            }
          />

          {!hasStartedRanking && (
            <button
              type="button"
              className="ranking-start-gate"
              onClick={() => setHasStartedRanking(true)}
              aria-label="Tap to start ranking"
            >
              <span>Tap to start</span>
              <small>Your first tap only unlocks the choices.</small>
            </button>
          )}
        </div>
      )}

      {!showResults && !checkpointComplete && !pair && (
        <article className="ranking-empty panel">
          <p className="eyebrow">
            {mode === "overall" ? "Overall ranking" : activeCategory?.label}
          </p>
          <h2>Nothing else to compare here.</h2>
          <p>
            Fewer than two eligible items remain in this scope. Existing comparisons are
            still saved, and excluded items stay out of new pairs.
          </p>
          <div className="ranking-empty-actions">
            <button className="primary" onClick={openCategoryPicker}>
              Choose another category
            </button>
          </div>
        </article>
      )}

      {checkpointComplete && !showResults && (
        <article className="ranking-checkpoint panel">
          <div>
            <p className="eyebrow">25 choices saved</p>
            <h2>Keep going or switch it up?</h2>
            <p>
              Your ranking is saved. Continue for another 25, or choose a new category.
            </p>
          </div>
          <div className="ranking-checkpoint-actions">
            {activeCatalog.length >= 2 && (
              <button className="primary" onClick={continueCheckpoint}>
                Keep going
              </button>
            )}
            <button className="secondary" onClick={openNextCategoryChoice}>
              New category
            </button>
          </div>
        </article>
      )}

      {showResults && (
        <article className="ranking-results panel">
          <div className="ranking-results-heading">
            <div>
              <p className="eyebrow">
                {mode === "category" ? activeCategory?.label : "Your general top likes"}
              </p>
              <h2>{confidenceLabel(snapshot.confidence)}</h2>
              <p>
                {orderingInScope} ordering comparisons shape this ranking.
                {totalInScope > orderingInScope
                  ? ` ${totalInScope - orderingInScope} Skip/Neither interactions are saved but do not raise confidence.`
                  : " Keep going whenever you want to refine it."}
              </p>
            </div>
            <div className="ranking-results-actions">
              <button className="primary" onClick={() => setShowResults(false)}>
                Back to ranking
              </button>
              <button className="secondary" onClick={openNextCategoryChoice}>
                New category
              </button>
            </div>
          </div>

          <div className="ranking-list">
            {visibleRankingItems.map((item, index) => {
              const result = resultView?.byCatalogId.get(item.id);
              const movement = visibleRankingMovements.get(item.id);
              const movementId = `${mode}:${categoryId}:${item.id}`;

              return (
                <div className="ranking-row" key={item.id}>
                  <span className="ranking-position">{index + 1}</span>
                  <div className="ranking-row-copy">
                    <div className="ranking-row-title">
                      <strong>{item.label}</strong>
                      {movement && (
                        <RankingMovementIndicator
                          movement={movement}
                          open={openMovementId === movementId}
                          onToggle={() =>
                            setOpenMovementId((current) =>
                              current === movementId ? null : movementId,
                            )
                          }
                        />
                      )}
                    </div>
                    <span>{item.categoryLabel}</span>
                    <div className="ranking-row-evidence">
                      {result?.explicitState && (
                        <span className="ranking-evidence-chip explicit">
                          Explicit: {catalogPreferenceLabels[result.explicitState]}
                        </span>
                      )}
                      {result?.inferred && (
                        <span className="ranking-evidence-chip inferred">
                          Quiz-derived {Math.round(result.inferred.affinity)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <span>{item.comparisons} comps</span>
                </div>
              );
            })}
          </div>
        </article>
      )}

      <details className="ranking-secondary panel">
        <summary>
          <span>
            <strong>Progress & history</strong>
            <small>Ranking details and saved runs</small>
          </span>
          <span aria-hidden="true">⌄</span>
        </summary>

        <div className="ranking-secondary-content">
          <div className="ranking-secondary-summary">
            <span>
              <strong>{categorySummaries.filter((item) => item.comparisons > 0).length}</strong>
              <small>categories started</small>
            </span>
            <span>
              <strong>{overallCandidates.length}</strong>
              <small>overall candidates</small>
            </span>
            <span>
              <strong>Run {rankingRunNumber}</strong>
              <small>current pulse</small>
            </span>
          </div>

          <div className="ranking-secondary-actions">
            {snapshot.items.length > 0 && (
              <button
                className="secondary compact"
                onClick={() => setShowResults(true)}
              >
                View current ranking
              </button>
            )}
            <button
              className="secondary compact"
              onClick={openOverallRanking}
              disabled={overallCandidates.length < 2}
            >
              Open overall ranking
            </button>
          </div>

          {hasMeaningfulRank &&
            (showNewRunConfirm ? (
              <div className="ranking-new-run-confirm">
                <div>
                  <strong>Start a fresh ranking run?</strong>
                  <p>
                    Run {rankingRunNumber} is saved as history. Quiz results and direct
                    catalog preferences stay exactly as they are.
                  </p>
                </div>
                <div>
                  <button
                    className="secondary compact"
                    onClick={() => setShowNewRunConfirm(false)}
                  >
                    Cancel
                  </button>
                  <button className="primary compact" onClick={beginNewRankingRun}>
                    Start new run
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="text-button ranking-new-run-link"
                onClick={() => setShowNewRunConfirm(true)}
              >
                Start a new ranking run
              </button>
            ))}
        </div>
      </details>

      {mode === "category" && (
        <div
          className={
            categoryFabOpen
              ? "ranking-category-fab is-open"
              : "ranking-category-fab"
          }
        >
          <div className="ranking-category-fab-menu" aria-hidden={!categoryFabOpen}>
            <button
              type="button"
              className="ranking-category-fab-action"
              onClick={pickCategoryForMe}
              tabIndex={categoryFabOpen ? 0 : -1}
            >
              <span aria-hidden="true">↻</span>
              Pick for me
            </button>
            <button
              type="button"
              className="ranking-category-fab-action"
              onClick={openCategoryPicker}
              tabIndex={categoryFabOpen ? 0 : -1}
            >
              <span aria-hidden="true">≡</span>
              Choose category
            </button>
          </div>
          <button
            type="button"
            className="ranking-category-fab-trigger"
            aria-label="Category actions"
            aria-expanded={categoryFabOpen}
            onClick={() => setCategoryFabOpen((open) => !open)}
          >
            <span aria-hidden="true">{categoryFabOpen ? "×" : "+"}</span>
          </button>
        </div>
      )}
    </section>
  );
}
