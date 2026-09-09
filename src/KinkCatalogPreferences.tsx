import { useMemo, useState } from "react";
import { ExpandableGroupedList } from "./ExpandableGroupedList";
import {
  kinkCatalog,
  kinkCategories,
  type KinkCatalogItem,
} from "./data/kinkCatalog.generated";
import {
  catalogPreferenceStates,
  clearCatalogPreference,
  getCatalogPreference,
  setCatalogPreference,
  type CatalogPreferenceState,
  type CatalogProfileState,
} from "./lib/catalogProfile";
import {
  buildCatalogResultView,
  catalogPreferenceLabels,
} from "./lib/catalogResults";
import {
  loadCatalogProfile,
  saveCatalogProfile,
} from "./lib/catalogProfileStorage";
import type { StoredProfile } from "./lib/profileStorage";
import type {
  CatalogDrilldownFocus,
  CatalogPreferenceFilter,
} from "./lib/catalogDrilldown";

function preferenceClass(state: CatalogPreferenceState | undefined) {
  return state ? `preference-${state.replaceAll("_", "-")}` : "preference-unanswered";
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

  return (
    <section className="catalog-preferences-stack">
      <div className="catalog-preferences-heading panel">
        <div>
          <p className="eyebrow">Kink catalog · Direct preferences</p>
          <h1>Browse the list without making it homework.</h1>
          <p>
            Search, filter, and explicitly mark anything you want. This is separate from
            This-or-That: manual states do not create ranking wins, and ranking choices do
            not manufacture manual states.
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
                  {kinkCategories.find((category) => category.id === categoryFilter)
                    ?.label ?? categoryFilter}
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
              setPreferenceFilter(event.target.value as CatalogPreferenceFilter)
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

        <button className="text-button catalog-clear-filters" onClick={resetFilters}>
          Clear filters
        </button>
      </div>

      <section className="catalog-exclusion-summary panel">
        <div className="catalog-exclusion-heading">
          <div>
            <p className="eyebrow">Direct explicit boundaries</p>
            <h2>Limits & exclusions</h2>
          </div>
          <p>
            These are explicit states, not low rankings. Quiz-derived affinity never
            overrides them.
          </p>
        </div>

        <div className="catalog-exclusion-grid">
          <div className="catalog-exclusion-card hard-limit">
            <div>
              <span>Hard Limits</span>
              <strong>{resultView.exclusions.hardLimits.length}</strong>
            </div>
            <p>
              {resultView.exclusions.hardLimits.length > 0
                ? resultView.exclusions.hardLimits
                    .slice(0, 5)
                    .map((result) => result.item.label)
                    .join(" · ")
                : "None marked"}
              {resultView.exclusions.hardLimits.length > 5
                ? ` · +${resultView.exclusions.hardLimits.length - 5} more`
                : ""}
            </p>
          </div>

          <div className="catalog-exclusion-card">
            <div>
              <span>Not Interested</span>
              <strong>{resultView.exclusions.notInterested.length}</strong>
            </div>
            <p>
              {resultView.exclusions.notInterested.length > 0
                ? resultView.exclusions.notInterested
                    .slice(0, 5)
                    .map((result) => result.item.label)
                    .join(" · ")
                : "None marked"}
              {resultView.exclusions.notInterested.length > 5
                ? ` · +${resultView.exclusions.notInterested.length - 5} more`
                : ""}
            </p>
          </div>

          <div className="catalog-exclusion-card">
            <div>
              <span>Not Applicable</span>
              <strong>{resultView.exclusions.notApplicable.length}</strong>
            </div>
            <p>
              {resultView.exclusions.notApplicable.length > 0
                ? resultView.exclusions.notApplicable
                    .slice(0, 5)
                    .map((result) => result.item.label)
                    .join(" · ")
                : "None marked"}
              {resultView.exclusions.notApplicable.length > 5
                ? ` · +${resultView.exclusions.notApplicable.length - 5} more`
                : ""}
            </p>
          </div>
        </div>
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
        focusGroupId={
          categoryFilter === "all" ? undefined : categoryFilter
        }
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
            getCatalogPreference(
              profile.preferences[item.id],
              "overall",
            );
          const categoryRank = result?.categoryRank;
          const overallRank = result?.overallRank;
          const inferred = result?.inferred;
          const hasEvidence =
            Boolean(categoryRank) ||
            Boolean(overallRank) ||
            Boolean(inferred) ||
            (result?.meaningfulPairwiseComparisons ?? 0) > 0 ||
            Boolean(result?.excludedFromNewRanking);

          return (
            <article
              className={`catalog-row ${preferenceClass(preference)}`}
              key={item.id}
            >
              <div className="catalog-row-main">
                <strong>{item.label}</strong>
                {item.aliases.length > 0 && (
                  <span className="catalog-row-alias">
                    aka {item.aliases.slice(0, 2).join(" · ")}
                  </span>
                )}
              </div>

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

              <div className="catalog-ranking-context">
                {categoryRank && (
                  <span className="catalog-evidence-chip direct">
                    Category #{categoryRank.rank}
                  </span>
                )}
                {overallRank && (
                  <span className="catalog-evidence-chip direct">
                    Overall #{overallRank.rank}
                  </span>
                )}
                {inferred && (
                  <span className="catalog-evidence-chip inferred">
                    Quiz-derived {Math.round(inferred.affinity)}%
                  </span>
                )}
                {result?.excludedFromNewRanking && (
                  <span className="catalog-evidence-chip excluded">
                    Excluded from new pairs
                  </span>
                )}
                {!hasEvidence && (
                  <span className="catalog-not-ranked">
                    No ranking or quiz inference yet
                  </span>
                )}
              </div>

              <details className="catalog-row-details">
                <summary>Details</summary>
                <div>
                  {item.description && <p>{item.description}</p>}

                  <div className="catalog-evidence-details">
                    <section>
                      <span className="eyebrow">Direct evidence</span>
                      <strong>
                        {preference
                          ? `Explicit: ${catalogPreferenceLabels[preference]}`
                          : "No explicit preference set"}
                      </strong>
                      <p>
                        {categoryRank
                          ? `Category #${categoryRank.rank} · ${categoryRank.comparisons} ordering comps`
                          : "No active category rank"}
                        {overallRank
                          ? ` · Overall #${overallRank.rank} · ${overallRank.comparisons} ordering comps`
                          : ""}
                      </p>
                      {(result?.meaningfulPairwiseComparisons ?? 0) > 0 &&
                        !categoryRank &&
                        !overallRank && (
                          <p>
                            {result?.meaningfulPairwiseComparisons} historical
                            ordering comparisons remain stored.
                          </p>
                        )}
                    </section>

                    <section>
                      <span className="eyebrow">Quiz-derived evidence</span>
                      {inferred ? (
                        <>
                          <strong>
                            {Math.round(inferred.affinity)}% affinity ·{" "}
                            {inferred.coverage}% coverage
                          </strong>
                          <p>
                            Derived from quiz signals only. This does not create
                            or override an explicit preference or pairwise rank.
                          </p>
                          <ul className="catalog-evidence-sources">
                            {inferred.matchedSignals.map((signal) => (
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
                  </div>

                  {inferred && result?.excludedFromNewRanking && (
                    <p className="catalog-evidence-conflict-note">
                      The quiz-derived affinity is shown for explainability only.
                      Your explicit exclusion remains authoritative.
                    </p>
                  )}

                  <dl>
                    <div>
                      <dt>Direction</dt>
                      <dd>{item.direction}</dd>
                    </div>
                    {item.intensity && (
                      <div>
                        <dt>Intensity</dt>
                        <dd>{item.intensity}</dd>
                      </div>
                    )}
                    {item.riskLevel && (
                      <div>
                        <dt>Risk</dt>
                        <dd>{item.riskLevel}</dd>
                      </div>
                    )}
                    {item.aliases.length > 0 && (
                      <div>
                        <dt>Aliases</dt>
                        <dd>{item.aliases.join(", ")}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </details>
            </article>
          );
        }}
      />

    </section>
  );
}
