import { useMemo, useState } from "react";
import {
  kinkCatalog,
  type KinkCatalogItem,
} from "./data/kinkCatalog.generated";
import {
  rewardPunishmentActions,
  rewardPunishmentCategories,
  rewardPunishmentPrimitives,
  type RewardPunishmentActionDefinition,
  type RewardPunishmentPrimitive,
} from "./lib/rewardPunishmentLibrary";
import {
  canBeRandomEligible,
  contextSuitabilities,
  getContextualUseState,
  setContextNote,
  setContextRandomEligible,
  setContextSuitability,
  type ContextSuitability,
  type RewardPunishmentContext,
  type RewardPunishmentProfileState,
} from "./lib/rewardPunishmentProfile";
import {
  loadRewardPunishmentProfile,
  saveRewardPunishmentProfile,
} from "./lib/rewardPunishmentProfileStorage";
import {
  getCatalogPreference,
  type CatalogProfileState,
} from "./lib/catalogProfile";
import { catalogPreferenceLabels } from "./lib/catalogResults";
import "./rewardPunishment.css";

type SourceFilter = "all" | "catalog" | "action";
type SuitabilityFilter = "all" | ContextSuitability;

const actionDefinitions = rewardPunishmentActions as readonly RewardPunishmentActionDefinition[];
const actionById = new Map(
  actionDefinitions.map((action) => [action.id, action]),
);
const catalogItems = kinkCatalog as readonly KinkCatalogItem[];
const catalogById = new Map(catalogItems.map((item) => [item.id, item]));
const categoryById = new Map(
  rewardPunishmentCategories.map((category) => [category.id, category]),
);

function suitabilityLabel(
  context: RewardPunishmentContext,
  suitability: ContextSuitability,
) {
  const labels: Record<
    ContextSuitability,
    { reward: string; punishment: string }
  > = {
    strong: {
      reward: "Strong reward",
      punishment: "Strong punishment",
    },
    works: {
      reward: "Works as a reward",
      punishment: "Works as a punishment",
    },
    depends: {
      reward: "Depends",
      punishment: "Depends",
    },
    no: {
      reward: "Not rewarding",
      punishment: "Not effective / not a fit",
    },
    never: {
      reward: "Never use as reward",
      punishment: "Never use as punishment",
    },
    unset: {
      reward: "Not rated",
      punishment: "Not rated",
    },
  };

  return labels[suitability][context];
}

function primitiveSearchText(primitive: RewardPunishmentPrimitive) {
  const categories = primitive.contextCategories
    .map((mapping) => categoryById.get(mapping.id)?.label ?? mapping.id)
    .join(" ");

  const action =
    primitive.ref.kind === "action"
      ? actionById.get(primitive.ref.id)
      : undefined;
  const catalog =
    primitive.ref.kind === "catalog"
      ? catalogById.get(primitive.ref.id)
      : undefined;

  return [
    primitive.label,
    categories,
    action?.description,
    action?.notes,
    catalog?.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase();
}

function contextTitle(context: RewardPunishmentContext) {
  return context === "reward" ? "Reward profile" : "Punishment profile";
}

export function RewardPunishmentProfiles({
  catalogProfile,
  onClose,
}: {
  catalogProfile: CatalogProfileState;
  onClose: () => void;
}) {
  const [profile, setProfile] = useState<RewardPunishmentProfileState>(() =>
    loadRewardPunishmentProfile(),
  );
  const [context, setContext] =
    useState<RewardPunishmentContext>("reward");
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sourceFilter, setSourceFilter] =
    useState<SourceFilter>("all");
  const [suitabilityFilter, setSuitabilityFilter] =
    useState<SuitabilityFilter>("all");
  const [randomOnly, setRandomOnly] = useState(false);

  const updateProfile = (
    updater: (
      current: RewardPunishmentProfileState,
    ) => RewardPunishmentProfileState,
  ) => {
    setProfile((current) => {
      const next = updater(current);
      saveRewardPunishmentProfile(next);
      return next;
    });
  };

  const contextCounts = useMemo(() => {
    const count = (target: RewardPunishmentContext) => {
      let direct = 0;
      let random = 0;
      for (const primitive of rewardPunishmentPrimitives) {
        const state = getContextualUseState(profile, primitive.ref, target);
        if (state.suitability !== "unset") direct += 1;
        if (state.randomEligible && canBeRandomEligible(state.suitability)) {
          random += 1;
        }
      }
      return { direct, random };
    };

    return {
      reward: count("reward"),
      punishment: count("punishment"),
    };
  }, [profile]);

  const visiblePrimitives = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    return rewardPunishmentPrimitives
      .filter((primitive) => {
        if (
          sourceFilter !== "all" &&
          primitive.sourceType !== sourceFilter
        ) {
          return false;
        }

        if (
          categoryFilter !== "all" &&
          !primitive.contextCategories.some(
            (mapping) => mapping.id === categoryFilter,
          )
        ) {
          return false;
        }

        if (
          normalizedQuery &&
          !primitiveSearchText(primitive).includes(normalizedQuery)
        ) {
          return false;
        }

        const state = getContextualUseState(
          profile,
          primitive.ref,
          context,
        );

        if (
          suitabilityFilter !== "all" &&
          state.suitability !== suitabilityFilter
        ) {
          return false;
        }

        if (
          randomOnly &&
          !(
            state.randomEligible &&
            canBeRandomEligible(state.suitability)
          )
        ) {
          return false;
        }

        return true;
      })
      .slice()
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [
    categoryFilter,
    context,
    profile,
    query,
    randomOnly,
    sourceFilter,
    suitabilityFilter,
  ]);

  const resetFilters = () => {
    setQuery("");
    setCategoryFilter("all");
    setSourceFilter("all");
    setSuitabilityFilter("all");
    setRandomOnly(false);
  };

  const activeCounts = contextCounts[context];

  return (
    <section className="rp-stack">
      <article className="rp-heading panel">
        <div>
          <p className="eyebrow">Rewards & Punishments · Direct context</p>
          <h1>Same activity. Different job.</h1>
          <p>
            Reward and punishment are separate contextual uses, not opposite ends
            of one scale. Something can work strongly as both, one, or neither
            without changing your general kink preference.
          </p>
        </div>
        <button className="secondary" onClick={onClose}>
          Back to hub
        </button>
      </article>

      <div className="rp-tabs" role="group" aria-label="Context profile">
        {(["reward", "punishment"] as const).map((target) => (
          <button
            type="button"
            key={target}
            className={
              context === target ? "rp-tab is-active" : "rp-tab"
            }
            aria-pressed={context === target}
            onClick={() => setContext(target)}
          >
            <span>{target === "reward" ? "Rewards" : "Punishments"}</span>
            <strong>{contextCounts[target].direct}</strong>
          </button>
        ))}
      </div>

      <section className="rp-summary panel">
        <div>
          <p className="eyebrow">{contextTitle(context)}</p>
          <h2>
            {activeCounts.direct} directly rated · {activeCounts.random} in
            random pool
          </h2>
        </div>
        <p>
          Only your direct choices live here. Source-list origin and your broader
          catalog preference are context, not answers.
        </p>
      </section>

      <div className="rp-toolbar panel">
        <label className="rp-search">
          <span>Search</span>
          <input
            type="search"
            value={query}
            placeholder="impact, massage, restraint…"
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
            {rewardPunishmentCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Source</span>
          <select
            value={sourceFilter}
            onChange={(event) =>
              setSourceFilter(event.target.value as SourceFilter)
            }
          >
            <option value="all">Catalog + actions</option>
            <option value="catalog">Catalog only</option>
            <option value="action">Action ideas only</option>
          </select>
        </label>

        <label>
          <span>Suitability</span>
          <select
            value={suitabilityFilter}
            onChange={(event) =>
              setSuitabilityFilter(
                event.target.value as SuitabilityFilter,
              )
            }
          >
            <option value="all">All states</option>
            {contextSuitabilities.map((state) => (
              <option key={state} value={state}>
                {suitabilityLabel(context, state)}
              </option>
            ))}
          </select>
        </label>

        <label className="rp-random-filter">
          <input
            type="checkbox"
            checked={randomOnly}
            onChange={(event) => setRandomOnly(event.target.checked)}
          />
          <span>Random pool only</span>
        </label>

        <button className="text-button" onClick={resetFilters}>
          Clear filters
        </button>
      </div>

      <div className="rp-list-summary">
        <strong>{visiblePrimitives.length}</strong>
        <span>matching primitives</span>
        <span aria-hidden="true">·</span>
        <span>
          {rewardPunishmentPrimitives.length} total across catalog + action
          library
        </span>
      </div>

      <div className="rp-table panel">
        <div className="rp-table-head" aria-hidden="true">
          <span>Item</span>
          <span>{context === "reward" ? "Reward use" : "Punishment use"}</span>
          <span>Random pool</span>
          <span>More</span>
        </div>

        {visiblePrimitives.length === 0 ? (
          <div className="rp-empty">
            <h2>No matches.</h2>
            <p>Try another search or clear one of the filters.</p>
            <button className="secondary compact" onClick={resetFilters}>
              Clear filters
            </button>
          </div>
        ) : (
          visiblePrimitives.map((primitive) => {
            const state = getContextualUseState(
              profile,
              primitive.ref,
              context,
            );
            const categoryLabels = primitive.contextCategories
              .map(
                (mapping) =>
                  categoryById.get(mapping.id)?.label ?? mapping.id,
              )
              .slice(0, 2);
            const generalPreference =
              primitive.ref.kind === "catalog"
                ? getCatalogPreference(
                    catalogProfile.preferences[primitive.ref.id],
                    "overall",
                  )
                : undefined;
            const action =
              primitive.ref.kind === "action"
                ? actionById.get(primitive.ref.id)
                : undefined;
            const catalog =
              primitive.ref.kind === "catalog"
                ? catalogById.get(primitive.ref.id)
                : undefined;

            return (
              <article
                className={
                  state.suitability === "never"
                    ? "rp-row is-never"
                    : "rp-row"
                }
                key={primitive.sourceType + ":" + primitive.ref.id}
              >
                <div className="rp-row-main">
                  <div className="rp-item-title">
                    <strong>{primitive.label}</strong>
                    <span className="rp-source-badge">
                      {primitive.sourceType === "catalog"
                        ? "Catalog"
                        : "Action"}
                    </span>
                  </div>
                  <div className="rp-category-line">
                    {categoryLabels.join(" · ")}
                  </div>
                  {generalPreference && (
                    <div className="rp-general-hint">
                      General preference:{" "}
                      {catalogPreferenceLabels[generalPreference]}
                    </div>
                  )}
                </div>

                <label className="rp-suitability-editor">
                  <span className="sr-only">
                    {contextTitle(context)} suitability for{" "}
                    {primitive.label}
                  </span>
                  <select
                    value={state.suitability}
                    onChange={(event) =>
                      updateProfile((current) =>
                        setContextSuitability(
                          current,
                          primitive.ref,
                          context,
                          event.target.value as ContextSuitability,
                        ),
                      )
                    }
                  >
                    {contextSuitabilities.map((suitability) => (
                      <option key={suitability} value={suitability}>
                        {suitabilityLabel(context, suitability)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="rp-random-toggle">
                  <input
                    type="checkbox"
                    checked={
                      state.randomEligible &&
                      canBeRandomEligible(state.suitability)
                    }
                    disabled={!canBeRandomEligible(state.suitability)}
                    onChange={(event) =>
                      updateProfile((current) =>
                        setContextRandomEligible(
                          current,
                          primitive.ref,
                          context,
                          event.target.checked,
                        ),
                      )
                    }
                  />
                  <span>
                    {canBeRandomEligible(state.suitability)
                      ? "Include"
                      : "Unavailable"}
                  </span>
                </label>

                <details className="rp-details">
                  <summary>Details</summary>
                  <div>
                    {(action?.description || catalog?.description) && (
                      <p>{action?.description || catalog?.description}</p>
                    )}

                    <dl>
                      <div>
                        <dt>Primitive</dt>
                        <dd>
                          {primitive.ref.kind}:{primitive.ref.id}
                        </dd>
                      </div>
                      <div>
                        <dt>Categories</dt>
                        <dd>
                          {primitive.contextCategories
                            .map(
                              (mapping) =>
                                categoryById.get(mapping.id)?.label ??
                                mapping.id,
                            )
                            .join(" · ")}
                        </dd>
                      </div>
                      <div>
                        <dt>Reference origin</dt>
                        <dd>
                          {primitive.sourceOrigins.length > 0
                            ? primitive.sourceOrigins
                                .map(
                                  (origin) =>
                                    origin.sourceSheet +
                                    " · row " +
                                    origin.sourceRow,
                                )
                                .join(" · ")
                            : primitive.sourceType === "catalog"
                              ? "M6 catalog"
                              : "Normalized action library"}
                        </dd>
                      </div>
                    </dl>

                    <label className="rp-note-editor">
                      <span>
                        {context === "reward"
                          ? "Reward-context note"
                          : "Punishment-context note"}
                      </span>
                      <textarea
                        value={state.note ?? ""}
                        placeholder="Optional context, boundaries, or why this works…"
                        onChange={(event) =>
                          updateProfile((current) =>
                            setContextNote(
                              current,
                              primitive.ref,
                              context,
                              event.target.value,
                            ),
                          )
                        }
                      />
                    </label>
                  </div>
                </details>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
