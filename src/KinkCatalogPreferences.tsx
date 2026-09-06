import { useEffect, useMemo, useState } from "react";
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

type PreferenceFilter = "all" | "unanswered" | CatalogPreferenceState;

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
}: {
  quizProfile: StoredProfile;
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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    () => new Set(),
  );
  const [showReturnToTop, setShowReturnToTop] = useState(false);

  useEffect(() => {
    const updateReturnToTop = () => setShowReturnToTop(window.scrollY > 600);
    updateReturnToTop();
    window.addEventListener("scroll", updateReturnToTop, { passive: true });
    return () => window.removeEventListener("scroll", updateReturnToTop);
  }, []);

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
    setExpandedCategories(new Set());
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((current) => {
      const next = new Set(current);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  };

  const expandVisibleCategories = () => {
    setExpandedCategories(
      new Set(visibleByCategory.map(({ category }) => category.id)),
    );
  };

  const collapseAllCategories = () => {
    setExpandedCategories(new Set());
  };

  const returnToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
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
            onChange={(event) => {
              const nextCategory = event.target.value;
              setCategoryFilter(nextCategory);
              setExpandedCategories(
                nextCategory === "all" ? new Set() : new Set([nextCategory]),
              );
            }}
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
                {catalogPreferenceLabels[state]}
              </option>
            ))}
          </select>
        </label>

        <button className="text-button catalog-clear-filters" onClick={resetFilters}>
          Clear filters
        </button>
      </div>

      <div className="catalog-table-summary">
        <div className="catalog-table-summary-copy">
          <strong>{visibleItems.length}</strong>
          <span>matching items</span>
          <span aria-hidden="true">·</span>
          <strong>{explicitlySetCount}</strong>
          <span>with explicit preferences</span>
        </div>
        <div className="catalog-category-actions">
          <button className="text-button" onClick={expandVisibleCategories}>
            Expand all
          </button>
          <button className="text-button" onClick={collapseAllCategories}>
            Collapse all
          </button>
        </div>
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
          visibleByCategory.map(({ category, items }) => {
            const isExpanded = expandedCategories.has(category.id);

            return (
              <section
                className={
                  isExpanded
                    ? "catalog-category-group expanded"
                    : "catalog-category-group"
                }
                key={category.id}
              >
                <button
                  type="button"
                  className="catalog-category-heading"
                  aria-expanded={isExpanded}
                  onClick={() => toggleCategory(category.id)}
                >
                  <div>
                    <span className="eyebrow">
                      {category.domain.replaceAll("-", " ")}
                    </span>
                    <h2>{category.label}</h2>
                  </div>
                  <span className="catalog-category-meta">
                    {items.length} shown
                    <span className="catalog-category-chevron" aria-hidden="true">
                      {isExpanded ? "−" : "+"}
                    </span>
                  </span>
                </button>

                {isExpanded && (
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
                            {categoryRank || overallRank ? (
                              <>
                                {categoryRank && (
                                  <span>Category #{categoryRank}</span>
                                )}
                                {overallRank && <span>Overall #{overallRank}</span>}
                              </>
                            ) : (
                              <span className="catalog-not-ranked">
                                Not ranked yet
                              </span>
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
                )}
              </section>
            );
          })
        )}
      </div>

      {showReturnToTop && (
        <button
          type="button"
          className="catalog-return-top"
          onClick={returnToTop}
          aria-label="Return to top of kink catalog"
        >
          ↑ Return to top
        </button>
      )}
    </section>
  );
}
