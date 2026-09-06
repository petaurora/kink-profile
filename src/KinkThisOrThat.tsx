import { useEffect, useMemo, useState } from "react";
import {
  kinkCatalog,
  kinkCategories,
  type KinkCatalogItem,
} from "./data/kinkCatalog.generated";
import {
  calculateRanking,
  confidenceLabel,
  selectCategoryFinalists,
  selectNextPair,
  type ComparisonResult,
  type KinkComparison,
  type RankingScope,
} from "./lib/kinkRanking";
import { filterEligibleCatalogItems } from "./lib/catalogProfile";
import {
  loadCatalogProfile,
  saveCatalogProfile,
} from "./lib/catalogProfileStorage";

type RankingMode = "category" | "overall";
type SessionSize = 10 | 25 | 50 | "gremlin";

const sessionOptions: Array<{ value: SessionSize; label: string; detail: string }> = [
  { value: 10, label: "Quick", detail: "10 comparisons" },
  { value: 25, label: "Standard", detail: "25 comparisons" },
  { value: 50, label: "Deep Dive", detail: "50 comparisons" },
  { value: "gremlin", label: "Gremlin Mode", detail: "keep going" },
];

function randomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `comparison-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function randomizePair(pair: [KinkCatalogItem, KinkCatalogItem] | null) {
  if (!pair) return null;
  return Math.random() < 0.5 ? pair : [pair[1], pair[0]] as [KinkCatalogItem, KinkCatalogItem];
}

function comparisonCountForScope(
  comparisons: readonly KinkComparison[],
  scope: RankingScope,
) {
  return comparisons.filter((comparison) => {
    if (comparison.scope.type !== scope.type) return false;
    return scope.type === "overall" ||
      (comparison.scope.type === "category" &&
        comparison.scope.categoryId === scope.categoryId);
  }).length;
}

export function KinkThisOrThat({ onClose }: { onClose: () => void }) {
  const [profile, setProfile] = useState(() => loadCatalogProfile());
  const [mode, setMode] = useState<RankingMode>("category");
  const [categoryId, setCategoryId] = useState<string>(kinkCategories[0]?.id ?? "");
  const [sessionSize, setSessionSize] = useState<SessionSize>(25);
  const [sessionStartCount, setSessionStartCount] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [pairNonce, setPairNonce] = useState(0);
  const [categoryOpen, setCategoryOpen] = useState(false);

  useEffect(() => {
    saveCatalogProfile(profile);
  }, [profile]);

  const eligibleCatalog = useMemo(
    () => filterEligibleCatalogItems(kinkCatalog, profile.preferences),
    [profile.preferences],
  );

  const finalists = useMemo(
    () => selectCategoryFinalists(eligibleCatalog, profile.comparisons, 5),
    [eligibleCatalog, profile.comparisons],
  );

  const activeCatalog = mode === "overall"
    ? finalists
    : eligibleCatalog.filter((item) => item.categoryId === categoryId);

  const scope: RankingScope = mode === "overall"
    ? { type: "overall" }
    : { type: "category", categoryId };

  const snapshot = useMemo(
    () => calculateRanking(activeCatalog, profile.comparisons, scope),
    [activeCatalog, profile.comparisons, mode, categoryId],
  );

  const basePair = useMemo(
    () => selectNextPair(activeCatalog, profile.comparisons, scope),
    [activeCatalog, profile.comparisons, mode, categoryId, pairNonce],
  );

  const pair = useMemo(() => randomizePair(basePair), [basePair, pairNonce]);

  const totalInScope = comparisonCountForScope(profile.comparisons, scope);
  const sessionAnswered = Math.max(0, totalInScope - sessionStartCount);
  const sessionLimit = sessionSize === "gremlin" ? Infinity : sessionSize;
  const sessionComplete = sessionAnswered >= sessionLimit;
  const activeCategory = kinkCategories.find((category) => category.id === categoryId);

  const categorySummaries = useMemo(
    () =>
      kinkCategories.map((category) => {
        const categoryScope: RankingScope = { type: "category", categoryId: category.id };
        const comparisons = comparisonCountForScope(profile.comparisons, categoryScope);
        const categoryCatalog = eligibleCatalog.filter(
          (item) => item.categoryId === category.id,
        );
        const categorySnapshot = calculateRanking(
          categoryCatalog,
          profile.comparisons,
          categoryScope,
        );

        return {
          ...category,
          comparisons,
          confidence: categorySnapshot.confidence,
          confidenceLabel: comparisons === 0 ? "Not started" : confidenceLabel(categorySnapshot.confidence),
        };
      }),
    [eligibleCatalog, profile.comparisons],
  );

  const lastRankedCategoryId = useMemo(() => {
    const latest = profile.comparisons
      .filter((comparison) => comparison.scope.type === "category")
      .slice()
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];

    return latest?.scope.type === "category" ? latest.scope.categoryId : null;
  }, [profile.comparisons]);

  const continueCategory = categorySummaries.find(
    (category) => category.id === lastRankedCategoryId,
  );

  const nextCategory = useMemo(() => {
    if (!activeCategory) return undefined;
    const currentIndex = kinkCategories.findIndex(
      (category) => category.id === activeCategory.id,
    );
    if (currentIndex === -1) return undefined;

    const laterUnstarted = kinkCategories
      .slice(currentIndex + 1)
      .find((category) =>
        categorySummaries.find((summary) => summary.id === category.id)?.comparisons === 0,
      );
    if (laterUnstarted) return laterUnstarted;

    const anyUnstarted = kinkCategories.find((category) =>
      categorySummaries.find((summary) => summary.id === category.id)?.comparisons === 0,
    );
    if (anyUnstarted && anyUnstarted.id !== activeCategory.id) return anyUnstarted;

    return kinkCategories[(currentIndex + 1) % kinkCategories.length];
  }, [activeCategory, categorySummaries]);

  const categorizedProgress = useMemo(
    () => ({
      inProgress: categorySummaries.filter(
        (category) => category.comparisons > 0 && category.confidence < 0.45,
      ),
      refined: categorySummaries.filter(
        (category) => category.comparisons > 0 && category.confidence >= 0.45,
      ),
      notStarted: categorySummaries.filter((category) => category.comparisons === 0),
    }),
    [categorySummaries],
  );

  const startSession = (nextSize: SessionSize) => {
    setSessionSize(nextSize);
    setSessionStartCount(totalInScope);
    setShowResults(false);
    setPairNonce((value) => value + 1);
  };

  const answer = (result: ComparisonResult) => {
    if (!pair || sessionComplete) return;

    const comparison: KinkComparison = {
      id: randomId(),
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

  const openOverallRanking = () => {
    if (finalists.length < 2) return;

    setMode("overall");
    setCategoryOpen(false);
    setShowResults(false);
    setPairNonce((value) => value + 1);
    setSessionStartCount(
      comparisonCountForScope(profile.comparisons, { type: "overall" }),
    );
  };

  const returnToCategories = () => {
    setMode("category");
    setCategoryOpen(false);
    setShowResults(false);
    setPairNonce((value) => value + 1);
  };

  const changeCategory = (nextCategoryId: string) => {
    setCategoryId(nextCategoryId);
    setCategoryOpen(true);
    setShowResults(false);
    setPairNonce((value) => value + 1);
    setSessionStartCount(
      comparisonCountForScope(profile.comparisons, {
        type: "category",
        categoryId: nextCategoryId,
      }),
    );
  };

  return (
    <section className="ranking-stack">
      <div className="ranking-heading panel">
        <div>
          <p className="eyebrow">Kink ranking</p>
          <h1>This or that. Giant list, tiny decisions.</h1>
          <p>
            Rank within a category first, then send that category's Top 5 into the overall
            fight. Only categories you've actually ranked contribute finalists. Your raw choices
            are saved locally so the ranking can be recalculated
            later without locking us to one algorithm.
          </p>
        </div>
        <button className="secondary" onClick={onClose}>Back to hub</button>
      </div>

      {(categoryOpen || mode === "overall") && (
        <div className="ranking-context">
          <button className="category-back" onClick={returnToCategories}>
            ← Categories
          </button>
          <div className="ranking-context-current">
            <span className="eyebrow">
              {mode === "overall" ? "Overall ranking" : "Current category"}
            </span>
            <strong>
              {mode === "overall"
                ? `${finalists.length} finalists · Top 5 from ranked categories`
                : activeCategory?.label}
            </strong>
          </div>
        </div>
      )}

      {mode === "category" && !categoryOpen ? (
        <section className="category-map">
          <button
            className={finalists.length >= 2 ? "overall-destination panel" : "overall-destination panel locked"}
            onClick={openOverallRanking}
            disabled={finalists.length < 2}
          >
            <div>
              <p className="eyebrow">Across everything you've ranked</p>
              <h2>Your overall ranking</h2>
              <p>
                {finalists.length >= 2
                  ? `${finalists.length} finalists ready · Compare your category favorites against each other.`
                  : "Rank at least one category to start building your finalist pool."}
              </p>
            </div>
            <span className="overall-destination-arrow">
              {finalists.length >= 2 ? "→" : "Locked"}
            </span>
          </button>

          {continueCategory && (
            <button
              className="category-continue panel"
              onClick={() => changeCategory(continueCategory.id)}
            >
              <div>
                <p className="eyebrow">Continue where you left off</p>
                <h2>{continueCategory.label}</h2>
                <p>
                  {continueCategory.comparisons} comparisons · {continueCategory.confidenceLabel}
                </p>
              </div>
              <span className="category-continue-arrow">→</span>
            </button>
          )}

          {categorizedProgress.inProgress.length > 0 && (
            <div className="category-map-section">
              <div className="category-map-heading">
                <div>
                  <p className="eyebrow">In progress</p>
                  <h2>Keep shaping these</h2>
                </div>
                <span>{categorizedProgress.inProgress.length}</span>
              </div>
              <div className="category-card-grid">
                {categorizedProgress.inProgress.map((category) => (
                  <button
                    key={category.id}
                    className="category-card panel"
                    onClick={() => changeCategory(category.id)}
                  >
                    <div className="category-card-top">
                      <strong>{category.label}</strong>
                      <span>{category.itemCount} items</span>
                    </div>
                    <div className="category-progress-track">
                      <span style={{ width: `${Math.max(6, category.confidence * 100)}%` }} />
                    </div>
                    <div className="category-card-meta">
                      <span>{category.comparisons} comparisons</span>
                      <span>{category.confidenceLabel}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {categorizedProgress.notStarted.length > 0 && (
            <div className="category-map-section">
              <div className="category-map-heading">
                <div>
                  <p className="eyebrow">Not started</p>
                  <h2>Pick anywhere</h2>
                </div>
                <span>{categorizedProgress.notStarted.length}</span>
              </div>
              <div className="category-card-grid">
                {categorizedProgress.notStarted.map((category) => (
                  <button
                    key={category.id}
                    className="category-card category-card-unstarted panel"
                    onClick={() => changeCategory(category.id)}
                  >
                    <div className="category-card-top">
                      <strong>{category.label}</strong>
                      <span>{category.itemCount} items</span>
                    </div>
                    <div className="category-card-meta">
                      <span>No comparisons yet</span>
                      <span>Start →</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {categorizedProgress.refined.length > 0 && (
            <div className="category-map-section">
              <div className="category-map-heading">
                <div>
                  <p className="eyebrow">Pretty confident</p>
                  <h2>Already taking shape</h2>
                </div>
                <span>{categorizedProgress.refined.length}</span>
              </div>
              <div className="category-card-grid">
                {categorizedProgress.refined.map((category) => (
                  <button
                    key={category.id}
                    className="category-card category-card-refined panel"
                    onClick={() => changeCategory(category.id)}
                  >
                    <div className="category-card-top">
                      <strong>{category.label}</strong>
                      <span>{category.itemCount} items</span>
                    </div>
                    <div className="category-progress-track">
                      <span style={{ width: `${category.confidence * 100}%` }} />
                    </div>
                    <div className="category-card-meta">
                      <span>{category.comparisons} comparisons</span>
                      <span>{category.confidenceLabel}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      ) : (
        <>
          <div className="session-picker panel">
            <div>
              <p className="eyebrow">Session size</p>
              <h2>How feral are we feeling?</h2>
            </div>
            <div className="session-options">
              {sessionOptions.map((option) => (
                <button
                  key={String(option.value)}
                  className={sessionSize === option.value ? "session-option active" : "session-option"}
                  onClick={() => startSession(option.value)}
                >
                  <strong>{option.label}</strong>
                  <span>{option.detail}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {(mode === "overall" || categoryOpen) && !showResults && !sessionComplete && pair && (
        <article className="versus-panel panel">
          <div className="versus-meta">
            <span>
              {mode === "category" ? activeCategory?.label : "Cross-category finalists"}
            </span>
            <span>
              {sessionSize === "gremlin"
                ? `${sessionAnswered} this session`
                : `${sessionAnswered} / ${sessionSize}`}
            </span>
          </div>

          <div className="versus-grid">
            <button className="kink-choice" onClick={() => answer("left")}>
              <span className="choice-category">{pair[0].categoryLabel}</span>
              <strong>{pair[0].label}</strong>
              {pair[0].description && <p>{pair[0].description}</p>}
              <span className="pick-label">Pick this</span>
            </button>

            <div className="versus-or" aria-hidden="true">OR</div>

            <button className="kink-choice" onClick={() => answer("right")}>
              <span className="choice-category">{pair[1].categoryLabel}</span>
              <strong>{pair[1].label}</strong>
              {pair[1].description && <p>{pair[1].description}</p>}
              <span className="pick-label">Pick this</span>
            </button>
          </div>

          <div className="comparison-actions">
            <button className="secondary compact" onClick={() => answer("equal")}>Both / equal</button>
            <button className="secondary compact" onClick={() => answer("neither")}>Neither</button>
            <button className="text-button" onClick={() => answer("skip")}>Skip / don't know</button>
          </div>
        </article>
      )}

      {(mode === "overall" || categoryOpen) &&
        !showResults &&
        !sessionComplete &&
        !pair && (
          <article className="ranking-empty panel">
            <p className="eyebrow">
              {mode === "overall" ? "Overall ranking" : activeCategory?.label}
            </p>
            <h2>Nothing else to compare here.</h2>
            <p>
              Fewer than two eligible items remain in this scope. Existing comparisons
              are still saved, and excluded items stay out of new pairs.
            </p>
            <div className="ranking-empty-actions">
              {snapshot.items.length > 0 && (
                <button className="secondary" onClick={() => setShowResults(true)}>
                  View current ranking
                </button>
              )}
              {mode === "category" &&
                nextCategory &&
                nextCategory.id !== activeCategory?.id && (
                  <button
                    className="primary"
                    onClick={() => changeCategory(nextCategory.id)}
                  >
                    Next category →
                  </button>
                )}
              {mode === "overall" && (
                <button className="secondary" onClick={returnToCategories}>
                  Back to categories
                </button>
              )}
            </div>
          </article>
        )}

      {(mode === "overall" || categoryOpen) && (sessionComplete || showResults) && (
        <article className="ranking-results panel">
          <div className="ranking-results-heading">
            <div>
              <p className="eyebrow">
                {mode === "category" ? activeCategory?.label : "Your general top likes"}
              </p>
              <h2>{confidenceLabel(snapshot.confidence)}</h2>
              <p>
                {totalInScope} comparisons recorded. Keep going whenever you want to refine it.
              </p>
            </div>
            <div className="ranking-results-actions">
              {activeCatalog.length >= 2 && (
                <button className="primary" onClick={() => startSession(sessionSize)}>
                  Keep ranking
                </button>
              )}
              {mode === "category" && nextCategory && nextCategory.id !== activeCategory?.id && (
                <button
                  className="secondary"
                  onClick={() => changeCategory(nextCategory.id)}
                >
                  Next category →
                </button>
              )}
            </div>
          </div>

          <div className="ranking-list">
            {snapshot.items.slice(0, mode === "overall" ? 25 : 10).map((item) => (
              <div className="ranking-row" key={item.id}>
                <span className="ranking-position">{item.rank}</span>
                <div>
                  <strong>{item.label}</strong>
                  <span>{item.categoryLabel}</span>
                </div>
                <span>{item.comparisons} comps</span>
              </div>
            ))}
          </div>
        </article>
      )}

      {(mode === "overall" || categoryOpen) &&
        !sessionComplete &&
        !showResults &&
        pair && (
        <div className="ranking-footer-actions">
          <button className="ranking-results-link" onClick={() => setShowResults(true)}>
            View current ranking
          </button>
          {mode === "category" && nextCategory && nextCategory.id !== activeCategory?.id && (
            <button
              className="ranking-results-link"
              onClick={() => changeCategory(nextCategory.id)}
            >
              Next category →
            </button>
          )}
        </div>
      )}
    </section>
  );
}
