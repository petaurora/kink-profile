import { useEffect, useMemo, useState } from "react";
import { ExpandableGroupedList } from "../../components/ExpandableGroupedList";
import {
  kinkCatalog,
  kinkCategories,
  type KinkCatalogItem,
} from "../../data/kinkCatalog.generated";
import {
  catalogPreferenceStates,
  clearCatalogPreference,
  getCatalogPreference,
  setCatalogPreference,
  type CatalogPreferenceState,
  type CatalogProfileState,
} from "../../lib/catalogProfile";
import {
  buildCatalogResultView,
  catalogPreferenceLabels,
} from "../../lib/catalogResults";
import {
  loadCatalogProfile,
  saveCatalogProfile,
} from "../../lib/catalogProfileStorage";
import type { StoredProfile } from "../../lib/profileStorage";
import type {
  CatalogDrilldownFocus,
  CatalogPreferenceFilter,
} from "../../lib/catalogDrilldown";
import "./KinkCatalogPreferences.compact.css";
import "./KinkCatalogPreferences.disclosure.css";

function preferenceClass(state: CatalogPreferenceState | undefined) {
  return state
    ? `preference-${state.replaceAll("_", "-")}`
    : "preference-unanswered";
}

function matchesSearch(item: KinkCatalogItem, query: string) {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return true;

  return [item.label, ...item.aliases].some((value) =>
    value.toLocaleLowerCase().includes(normalized),
  );
}

export function KinkCatalogPreferences({
  quizProfile,
  onClose,
  onPlayRanking,
  initialFocus = {},
  closeLabel = "Back to hub",
}: {
  quizProfile: StoredProfile;
  onClose: () => void;
  onPlayRanking: () => void;
  initialFocus?: CatalogDrilldownFocus;
  closeLabel?: string;
}) {
  const [profile, setProfile] = useState<CatalogProfileState>(() =>
    loadCatalogProfile(),
  );
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(
    initialFocus.categoryId ?? "all",
  );
  const [preferenceFilter, setPreferenceFilter] =
    useState<CatalogPreferenceFilter>(
      initialFocus.preferenceFilter ?? "all",
    );
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const [showBoundaries, setShowBoundaries] = useState(false);

  const resultView = useMemo(
    () => buildCatalogResultView(quizProfile, profile),
    [quizProfile, profile],
  );

  const visibleItems = useMemo(
    () =>
      kinkCatalog.filter((item) => {
        if (categoryFilter !== "all" && item.categoryId !== categoryFilter) {
          return false;
        }

        if (!matchesSearch(item, query)) return false;

        const preference = getCatalogPreference(
          profile.preferences[item.id],
          "overall",
        );

        if (preferenceFilter === "unanswered") return preference === undefined;
        if (preferenceFilter !== "all") return preference === preferenceFilter;
        return true;
      }),
    [categoryFilter, preferenceFilter, profile.preferences, query],
  );

  const visibleByCategory = useMemo(
    () =>
      kinkCategories
        .map((category) => ({
          category,
          items: visibleItems
            .filter((item) => item.categoryId === category.id)
            .slice()
            .sort((a, b) => a.label.localeCompare(b.label)),
        }))
        .filter((group) => group.items.length > 0),
    [visibleItems],
  );

  const explicitlySetCount = Object.values(profile.preferences).filter(
    (preference) => getCatalogPreference(preference, "overall") !== undefined,
  ).length;

  const openItem = openItemId
    ? kinkCatalog.find((item) => item.id === openItemId) ?? null
    : null;
  const openResult = openItem
    ? resultView.byCatalogId.get(openItem.id)
    : undefined;
  const openPreference = openItem
    ? openResult?.explicitState ??
      getCatalogPreference(profile.preferences[openItem.id], "overall")
    : undefined;
  const openCategoryRank = openResult?.categoryRank;
  const openOverallRank = openResult?.overallRank;
  const openInferred = openResult?.inferred;
  const openComparisonCount =
    openResult?.meaningfulPairwiseComparisons ?? 0;

  const boundaryGroups = [
    {
      state: "hard_limit" as const,
      label: "Hard limits",
      count: resultView.exclusions.hardLimits.length,
      items: resultView.exclusions.hardLimits,
    },
    {
      state: "not_interested" as const,
      label: "Not interested",
      count: resultView.exclusions.notInterested.length,
      items: resultView.exclusions.notInterested,
    },
    {
      state: "not_applicable" as const,
      label: "Not applicable",
      count: resultView.exclusions.notApplicable.length,
      items: resultView.exclusions.notApplicable,
    },
  ];

  useEffect(() => {
    if (!openItemId || typeof document === "undefined") return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenItemId(null);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openItemId]);

  const updatePreference = (
    catalogId: string,
    state: CatalogPreferenceState | undefined,
  ) => {
    setProfile((current) => {
      const next =
        state === undefined
          ? clearCatalogPreference(current, catalogId, "overall")
          : setCatalogPreference(current, catalogId, "overall", state);

      saveCatalogProfile(next);
      return next;
    });
  };

  const resetFilters = () => {
    setQuery("");
    setCategoryFilter("all");
    setPreferenceFilter("all");
  };

  const applyBoundaryFilter = (state: CatalogPreferenceState) => {
    setQuery("");
    setCategoryFilter("all");
    setPreferenceFilter(state);
    setShowBoundaries(false);
    setOpenItemId(null);
  };

  return (
    <section className="catalog-preferences-stack">
      <div className="catalog-preferences-heading panel">
        <div>
          <p className="eyebrow">Kink catalog · Direct preferences</p>
          <h1>Browse the list without making it homework.</h1>
          <p>
            Search, filter, and explicitly mark anything you want. This is
            separate from This-or-That: manual states do not create ranking wins,
            and ranking choices do not manufacture manual states.
          </p>
        </div>
        <div className="catalog-heading-actions">
          <button className="primary" onClick={onPlayRanking}>
            Play This or That
          </button>
          <button className="secondary" onClick={onClose}>
            {closeLabel}
          </button>
        </div>
      </div>

      {(categoryFilter !== "all" || preferenceFilter !== "all") && (
        <div className="catalog-focus-bar panel">
          <div>
            <span className="eyebrow">Focused catalog view</span>
            <div className="catalog-focus-chips">
              {categoryFilter !== "all" && (
                <span>
                  {kinkCategories.find(
                    (category) => category.id === categoryFilter,
                  )?.label ?? categoryFilter}
                </span>
              )}
              {preferenceFilter !== "all" && (
                <span>
                  {preferenceFilter === "unanswered"
                    ? "Not set"
                    : catalogPreferenceLabels[preferenceFilter]}
                </span>
              )}
            </div>
          </div>
          <button className="text-button" onClick={resetFilters}>
            Explore full catalog
          </button>
        </div>
      )}

      <div className="catalog-toolbar panel">
        <label className="catalog-search">
          <span>Search kinks or aliases</span>
          <input
            type="search"
            value={query}
            placeholder="rope, praise, pet play…"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <label>
          <span>Category</span>
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="all">All categories</option>
            {kinkCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Preference</span>
          <select
            value={preferenceFilter}
            onChange={(event) =>
              setPreferenceFilter(
                event.target.value as CatalogPreferenceFilter,
              )
            }
          >
            <option value="all">All states</option>
            <option value="unanswered">Not set</option>
            {catalogPreferenceStates.map((state) => (
              <option key={state} value={state}>
                {catalogPreferenceLabels[state]}
              </option>
            ))}
          </select>
        </label>

        <button
          className="text-button catalog-clear-filters"
          onClick={resetFilters}
        >
          Clear filters
        </button>
      </div>

      <section className="catalog-boundaries-disclosure">
        <button
          type="button"
          className="catalog-boundaries-toggle panel"
          aria-expanded={showBoundaries}
          aria-controls="catalog-boundaries-panel"
          onClick={() => setShowBoundaries((current) => !current)}
        >
          <span>
            <span className="eyebrow">Direct boundaries</span>
            <strong>Boundaries</strong>
          </span>
          <span className="catalog-boundaries-summary">
            {resultView.exclusions.hardLimits.length} hard ·{" "}
            {resultView.exclusions.notInterested.length} not interested ·{" "}
            {resultView.exclusions.notApplicable.length} N/A
            <span className="catalog-boundaries-chevron" aria-hidden="true">
              ›
            </span>
          </span>
        </button>

        {showBoundaries && (
          <div
            className="catalog-boundaries-panel panel"
            id="catalog-boundaries-panel"
          >
            <div className="catalog-boundaries-heading">
              <div>
                <p className="eyebrow">Intentional boundary view</p>
                <h2>Limits & exclusions</h2>
              </div>
              <p>
                These are explicit states, not low rankings. Choose a group to
                filter Explore to those items.
              </p>
            </div>

            <div className="catalog-boundary-grid">
              {boundaryGroups.map((group) => (
                <button
                  type="button"
                  className={`catalog-boundary-card boundary-${group.state.replaceAll("_", "-")}`}
                  key={group.state}
                  onClick={() => applyBoundaryFilter(group.state)}
                >
                  <span className="catalog-boundary-card-heading">
                    <strong>{group.label}</strong>
                    <span>{group.count}</span>
                  </span>
                  <span className="catalog-boundary-card-items">
                    {group.items.length > 0
                      ? group.items
                          .slice(0, 4)
                          .map((result) => result.item.label)
                          .join(" · ")
                      : "No explicit items recorded"}
                    {group.items.length > 4
                      ? ` · +${group.items.length - 4} more`
                      : ""}
                  </span>
                  <span className="catalog-boundary-card-action">
                    Show in Explore ›
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      <ExpandableGroupedList
        groups={visibleByCategory.map(({ category, items }) => ({
          id: category.id,
          title: category.label,
          eyebrow: category.domain.replaceAll("-", " "),
          items,
        }))}
        columnHeadings={["Kink", "Preference", "Evidence", "More"]}
        headClassName="catalog-table-head"
        listClassName="catalog-table"
        focusGroupId={categoryFilter === "all" ? undefined : categoryFilter}
        expansionKey={categoryFilter}
        summary={
          <>
            <strong>{visibleItems.length}</strong>
            <span>matching items</span>
            <span aria-hidden="true">·</span>
            <strong>{explicitlySetCount}</strong>
            <span>with explicit preferences</span>
          </>
        }
        emptyTitle="No matches."
        emptyCopy="Try clearing a filter or searching another term."
        onClearFilters={resetFilters}
        renderItem={(item) => {
          const result = resultView.byCatalogId.get(item.id);
          const preference =
            result?.explicitState ??
            getCatalogPreference(profile.preferences[item.id], "overall");
          const categoryRank = result?.categoryRank;
          const overallRank = result?.overallRank;
          const inferred = result?.inferred;
          const comparisonCount =
            result?.meaningfulPairwiseComparisons ?? 0;
          const compactEvidence = [
            categoryRank ? `Category #${categoryRank.rank}` : null,
            overallRank ? `Overall #${overallRank.rank}` : null,
            comparisonCount > 0 ? `${comparisonCount} comps` : null,
            result?.excludedFromNewRanking
              ? "Excluded from new pairs"
              : null,
          ]
            .filter(Boolean)
            .join(" · ");
          const isOpen = openItemId === item.id;

          return (
            <article
              className={`catalog-row catalog-row-compact ${preferenceClass(preference)}${isOpen ? " is-open" : ""}`}
              key={item.id}
            >
              <div className="catalog-row-summary">
                <button
                  type="button"
                  className="catalog-row-open"
                  aria-expanded={isOpen}
                  aria-controls={
                    isOpen ? "catalog-item-detail-sheet" : undefined
                  }
                  aria-label={`Open details for ${item.label}`}
                  onClick={() => setOpenItemId(item.id)}
                >
                  <span className="catalog-row-copy">
                    <strong className="catalog-row-title">{item.label}</strong>
                    <span className="catalog-row-meta">
                      {compactEvidence ||
                        (inferred
                          ? `Quiz-derived ${Math.round(inferred.affinity)}%`
                          : "No direct ranking evidence yet")}
                    </span>
                  </span>
                  <span
                    className="catalog-row-open-chevron"
                    aria-hidden="true"
                  >
                    ›
                  </span>
                </button>

                <label className="catalog-preference-editor">
                  <span className="sr-only">
                    Preference for {item.label}
                  </span>
                  <select
                    value={preference ?? ""}
                    onChange={(event) =>
                      updatePreference(
                        item.id,
                        event.target.value
                          ? (event.target.value as CatalogPreferenceState)
                          : undefined,
                      )
                    }
                  >
                    <option value="">Not set</option>
                    {catalogPreferenceStates.map((state) => (
                      <option key={state} value={state}>
                        {catalogPreferenceLabels[state]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </article>
          );
        }}
      />

      {openItem && (
        <div
          className="catalog-detail-layer"
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpenItemId(null);
          }}
        >
          <section
            className="catalog-detail-sheet panel"
            id="catalog-item-detail-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="catalog-detail-title"
          >
            <div className="catalog-detail-handle" aria-hidden="true" />
            <header className="catalog-detail-header">
              <div>
                <p className="eyebrow">Kink details</p>
                <h2 id="catalog-detail-title">{openItem.label}</h2>
              </div>
              <button
                type="button"
                className="secondary compact"
                onClick={() => setOpenItemId(null)}
                autoFocus
              >
                Close
              </button>
            </header>

            <div className="catalog-detail-scroll">
              {openItem.description && (
                <p className="catalog-detail-description">
                  {openItem.description}
                </p>
              )}

              <section className="catalog-detail-section">
                <div className="catalog-detail-section-heading">
                  <div>
                    <span className="eyebrow">Direct preference</span>
                    <strong>
                      {openPreference
                        ? catalogPreferenceLabels[openPreference]
                        : "Not set"}
                    </strong>
                  </div>
                  <label className="catalog-preference-editor catalog-detail-preference">
                    <span className="sr-only">
                      Preference for {openItem.label}
                    </span>
                    <select
                      value={openPreference ?? ""}
                      onChange={(event) =>
                        updatePreference(
                          openItem.id,
                          event.target.value
                            ? (event.target.value as CatalogPreferenceState)
                            : undefined,
                        )
                      }
                    >
                      <option value="">Not set</option>
                      {catalogPreferenceStates.map((state) => (
                        <option key={state} value={state}>
                          {catalogPreferenceLabels[state]}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="catalog-detail-facts">
                  <div>
                    <span>Category rank</span>
                    <strong>
                      {openCategoryRank
                        ? `#${openCategoryRank.rank}`
                        : "Not ranked"}
                    </strong>
                    <small>
                      {openCategoryRank
                        ? `${openCategoryRank.comparisons} ordering comps`
                        : openComparisonCount > 0
                          ? `${openComparisonCount} stored comparisons`
                          : "No direct comparison evidence"}
                    </small>
                  </div>
                  <div>
                    <span>Overall rank</span>
                    <strong>
                      {openOverallRank
                        ? `#${openOverallRank.rank}`
                        : "Not ranked"}
                    </strong>
                    <small>
                      {openOverallRank
                        ? `${openOverallRank.comparisons} ordering comps`
                        : "No overall ordering yet"}
                    </small>
                  </div>
                </div>
              </section>

              <section className="catalog-detail-section">
                <span className="eyebrow">Quiz-derived evidence</span>
                {openInferred ? (
                  <>
                    <strong className="catalog-detail-evidence-title">
                      {Math.round(openInferred.affinity)}% affinity ·{" "}
                      {openInferred.coverage}% coverage
                    </strong>
                    <p>
                      Derived from quiz signals only. This does not create or
                      override an explicit preference or pairwise rank.
                    </p>
                    <ul className="catalog-evidence-sources catalog-detail-sources">
                      {openInferred.matchedSignals.map((signal) => (
                        <li key={signal.signalId}>
                          <strong>{signal.signalLabel}</strong>
                          <span>
                            {Math.round(signal.signalAffinity)}% signal
                            {signal.sourceQuizLabels.length > 0
                              ? ` · via ${signal.sourceQuizLabels.join(", ")}`
                              : ""}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p>No mapped quiz evidence for this item yet.</p>
                )}
              </section>

              {openInferred && openResult?.excludedFromNewRanking && (
                <p className="catalog-evidence-conflict-note">
                  Quiz-derived affinity is shown for explainability only. Your
                  explicit exclusion remains authoritative.
                </p>
              )}

              <section className="catalog-detail-section">
                <span className="eyebrow">Item context</span>
                <dl className="catalog-detail-metadata">
                  <div>
                    <dt>Direction</dt>
                    <dd>{openItem.direction}</dd>
                  </div>
                  {openItem.intensity && (
                    <div>
                      <dt>Intensity</dt>
                      <dd>{openItem.intensity}</dd>
                    </div>
                  )}
                  {openItem.riskLevel && (
                    <div>
                      <dt>Risk</dt>
                      <dd>{openItem.riskLevel}</dd>
                    </div>
                  )}
                  {openItem.aliases.length > 0 && (
                    <div>
                      <dt>Aliases</dt>
                      <dd>{openItem.aliases.join(", ")}</dd>
                    </div>
                  )}
                </dl>
              </section>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
