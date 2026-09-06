import { useMemo, useState } from "react";
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
  loadCatalogProfile,
  saveCatalogProfile,
} from "./lib/catalogProfileStorage";
import { calculateRanking } from "./lib/kinkRanking";

type PreferenceFilter = "all" | "unanswered" | CatalogPreferenceState;

const preferenceLabels: Record<CatalogPreferenceState, string> = {
  love: "Love",
  like: "Like",
  curious: "Curious",
  unsure: "Unsure",
  not_interested: "Not Interested",
  hard_limit: "Hard Limit",
  not_applicable: "Not Applicable",
};

function preferenceClass(state: CatalogPreferenceState | undefined) {
  return state ? `preference-${state.replaceAll("_", "-")}` : "preference-unanswered";
}

function buildRankingContext(profile: CatalogProfileState) {
  const categoryRanks = new Map<string, number>();
  const overallRanks = new Map<string, number>();

  for (const category of kinkCategories) {
    const snapshot = calculateRanking(kinkCatalog, profile.comparisons, {
      type: "category",
      categoryId: category.id,
    });

    for (const item of snapshot.items) {
      if (item.comparisons > 0) categoryRanks.set(item.id, item.rank);
    }
  }

  const overallParticipantIds = new Set<string>();
  for (const comparison of profile.comparisons) {
    if (comparison.scope.type !== "overall") continue;
    overallParticipantIds.add(comparison.leftKinkId);
    overallParticipantIds.add(comparison.rightKinkId);
  }

  if (overallParticipantIds.size >= 2) {
    const participantCatalog = kinkCatalog.filter((item) =>
      overallParticipantIds.has(item.id),
    );
    const snapshot = calculateRanking(participantCatalog, profile.comparisons, {
      type: "overall",
    });

    for (const item of snapshot.items) {
      if (item.comparisons > 0) overallRanks.set(item.id, item.rank);
    }
  }

  return { categoryRanks, overallRanks };
}

function matchesSearch(item: KinkCatalogItem, query: string) {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return true;

  return [item.label, ...item.aliases].some((value) =>
    value.toLocaleLowerCase().includes(normalized),
  );
}

export function KinkCatalogPreferences({
  onClose,
  onPlayRanking,
}: {
  onClose: () => void;
  onPlayRanking: () => void;
}) {
  const [profile, setProfile] = useState<CatalogProfileState>(() =>
    loadCatalogProfile(),
  );
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [preferenceFilter, setPreferenceFilter] =
    useState<PreferenceFilter>("all");

  const rankingContext = useMemo(
    () => buildRankingContext(profile),
    [profile.comparisons],
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
            Back to hub
          </button>
        </div>
      </div>

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
              setPreferenceFilter(event.target.value as PreferenceFilter)
            }
          >
            <option value="all">All states</option>
            <option value="unanswered">Not set</option>
            {catalogPreferenceStates.map((state) => (
              <option key={state} value={state}>
                {preferenceLabels[state]}
              </option>
            ))}
          </select>
        </label>

        <button className="text-button catalog-clear-filters" onClick={resetFilters}>
          Clear filters
        </button>
      </div>

      <div className="catalog-table-summary">
        <strong>{visibleItems.length}</strong>
        <span>matching items</span>
        <span aria-hidden="true">·</span>
        <strong>{explicitlySetCount}</strong>
        <span>with explicit preferences</span>
      </div>

      <div className="catalog-table panel">
        <div className="catalog-table-head" aria-hidden="true">
          <span>Kink</span>
          <span>Preference</span>
          <span>Ranking context</span>
          <span>More</span>
        </div>

        {visibleByCategory.length === 0 ? (
          <div className="catalog-empty">
            <h2>No matches.</h2>
            <p>Try clearing a filter or searching another term.</p>
            <button className="secondary compact" onClick={resetFilters}>
              Clear filters
            </button>
          </div>
        ) : (
          visibleByCategory.map(({ category, items }) => (
            <section className="catalog-category-group" key={category.id}>
              <div className="catalog-category-heading">
                <div>
                  <span className="eyebrow">{category.domain.replaceAll("-", " ")}</span>
                  <h2>{category.label}</h2>
                </div>
                <span>{items.length} shown</span>
              </div>

              <div className="catalog-rows">
                {items.map((item) => {
                  const preference = getCatalogPreference(
                    profile.preferences[item.id],
                    "overall",
                  );
                  const categoryRank = rankingContext.categoryRanks.get(item.id);
                  const overallRank = rankingContext.overallRanks.get(item.id);

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
                        <span className="sr-only">Preference for {item.label}</span>
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
                              {preferenceLabels[state]}
                            </option>
                          ))}
                        </select>
                      </label>

                      <div className="catalog-ranking-context">
                        {categoryRank || overallRank ? (
                          <>
                            {categoryRank && <span>Category #{categoryRank}</span>}
                            {overallRank && <span>Overall #{overallRank}</span>}
                          </>
                        ) : (
                          <span className="catalog-not-ranked">Not ranked yet</span>
                        )}
                      </div>

                      <details className="catalog-row-details">
                        <summary>Details</summary>
                        <div>
                          {item.description && <p>{item.description}</p>}
                          <dl>
                            <div>
                              <dt>Direction</dt>
                              <dd>{item.direction}</dd>
                            </div>
                            {item.primaryMode && (
                              <div>
                                <dt>Mode</dt>
                                <dd>{item.primaryMode}</dd>
                              </div>
                            )}
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
                })}
              </div>
            </section>
          ))
        )}
      </div>
    </section>
  );
}
