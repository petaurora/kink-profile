import { useMemo, useState } from "react";
import { ExpandableGroupedList } from "./ExpandableGroupedList";
import { RewardPunishmentSorter } from "./RewardPunishmentSorter";
import {
  kinkCatalog,
  type KinkCatalogItem,
} from "./data/kinkCatalog.generated";
import {
  rewardPunishmentActions,
  rewardPunishmentCategories,
  rewardPunishmentPrimitiveKey,
  rewardPunishmentPrimitives,
  type RewardPunishmentPrimitive,
} from "./lib/rewardPunishmentLibrary";
import type { RewardPunishmentActionDefinition } from "./data/rewardPunishmentLibrary.generated";
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
import {
  catalogPreferenceLabels,
  type CatalogResultView,
} from "./lib/catalogResults";
import type { CanonicalSignalResult } from "./lib/overallProfileSignals";
import {
  buildInferredContextProposals,
  buildRewardPunishmentCategoryProfile,
  type InferredContextProposal,
} from "./lib/rewardPunishmentInference";
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

const categoryOrderById = new Map(
  rewardPunishmentCategories.map((category) => [
    category.id,
    category.displayOrder,
  ]),
);

function primaryContextCategoryId(
  primitive: RewardPunishmentPrimitive,
) {
  return primitive.contextCategories
    .slice()
    .sort(
      (left, right) =>
        right.weight - left.weight ||
        (categoryOrderById.get(left.id) ?? Number.MAX_SAFE_INTEGER) -
          (categoryOrderById.get(right.id) ?? Number.MAX_SAFE_INTEGER),
    )[0]?.id;
}

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

function contextNoun(context: RewardPunishmentContext) {
  return context === "reward" ? "reward" : "punishment";
}

function categoryAffinityLabel(affinity: number, coverage: number) {
  if (coverage < 0.2) return "Emerging";
  if (affinity >= 0.8) return "Very strong";
  if (affinity >= 0.65) return "Strong";
  if (affinity >= 0.45) return "Mixed";
  return "Low";
}

function proposalBandLabel(
  proposal: InferredContextProposal,
  context: RewardPunishmentContext,
) {
  const band =
    proposal.band === "likely"
      ? "Likely"
      : proposal.band === "possible"
        ? "Possible"
        : "Weak";
  return `${band} ${contextNoun(context)}`;
}

export function RewardPunishmentProfiles({
  catalogProfile,
  catalogResultView,
  canonicalSignals,
  onClose,
}: {
  catalogProfile: CatalogProfileState;
  catalogResultView: CatalogResultView;
  canonicalSignals: readonly CanonicalSignalResult[];
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
  const [view, setView] = useState<"sorter" | "details">("sorter");

  const commitProfile = (next: RewardPunishmentProfileState) => {
    saveRewardPunishmentProfile(next);
    setProfile(next);
  };

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

  const categoryProfile = useMemo(
    () => buildRewardPunishmentCategoryProfile(profile, context),
    [context, profile],
  );

  const proposals = useMemo(
    () =>
      buildInferredContextProposals(
        profile,
        context,
        canonicalSignals,
        catalogResultView,
      ),
    [canonicalSignals, catalogResultView, context, profile],
  );

  const proposalByKey = useMemo(
    () =>
      new Map(
        proposals.map((proposal) => [
          rewardPunishmentPrimitiveKey(proposal.ref),
          proposal,
        ]),
      ),
    [proposals],
  );

  const featuredProposals = useMemo(
    () =>
      proposals
        .filter(
          (proposal) =>
            proposal.band === "likely" || proposal.band === "possible",
        )
        .slice(0, 6),
    [proposals],
  );

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

  const visibleByCategory = useMemo(() => {
    if (categoryFilter !== "all") {
      const category = rewardPunishmentCategories.find(
        (candidate) => candidate.id === categoryFilter,
      );
      return category && visiblePrimitives.length > 0
        ? [{ category, items: visiblePrimitives }]
        : [];
    }

    return rewardPunishmentCategories
      .map((category) => ({
        category,
        items: visiblePrimitives.filter(
          (primitive) =>
            primaryContextCategoryId(primitive) === category.id,
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [categoryFilter, visiblePrimitives]);

  const resetFilters = () => {
    setQuery("");
    setCategoryFilter("all");
    setSourceFilter("all");
    setSuitabilityFilter("all");
    setRandomOnly(false);
  };

  const activeCounts = contextCounts[context];

  const acceptProposal = (proposal: InferredContextProposal) => {
    updateProfile((current) =>
      setContextSuitability(
        current,
        proposal.ref,
        proposal.context,
        "works",
      ),
    );
  };

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

      <div className="rp-view-tabs" role="group" aria-label="Rewards and punishments view">
        <button
          type="button"
          className={view === "sorter" ? "rp-view-tab is-active" : "rp-view-tab"}
          aria-pressed={view === "sorter"}
          onClick={() => setView("sorter")}
        >
          <strong>Quick sorter</strong>
          <span>Reward · Punishment · Both · Neither</span>
        </button>
        <button
          type="button"
          className={view === "details" ? "rp-view-tab is-active" : "rp-view-tab"}
          aria-pressed={view === "details"}
          onClick={() => setView("details")}
        >
          <strong>Detailed profiles</strong>
          <span>Search · notes · nuanced suitability</span>
        </button>
      </div>

      {view === "sorter" ? (
        <RewardPunishmentSorter
          profile={profile}
          onProfileChange={commitProfile}
          canonicalSignals={canonicalSignals}
          catalogResultView={catalogResultView}
          onExit={() => setView("details")}
        />
      ) : (
        <>

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

      <section className="rp-patterns panel">
        <div className="rp-patterns-heading">
          <div>
            <p className="eyebrow">Direct category profile</p>
            <h2>What your confirmed answers are actually showing.</h2>
          </div>
          <p>
            Affinity and evidence breadth are separate. One strong answer can start
            a pattern, but it cannot fake the confidence of a well-explored category.
          </p>
        </div>

        {categoryProfile.length === 0 ? (
          <div className="rp-patterns-empty">
            Rate a few {contextNoun(context)} items and category patterns will
            start appearing here.
          </div>
        ) : (
          <div className="rp-pattern-grid">
            {categoryProfile.slice(0, 6).map((category) => (
              <article className="rp-pattern-card" key={category.categoryId}>
                <div>
                  <span>
                    {categoryById.get(category.categoryId)?.label ??
                      category.categoryId}
                  </span>
                  <strong>
                    {categoryAffinityLabel(
                      category.affinity,
                      category.coverage,
                    )}
                  </strong>
                </div>
                <div className="rp-pattern-stats">
                  <span>{Math.round(category.affinity * 100)}% affinity</span>
                  <span>{Math.round(category.coverage * 100)}% evidence</span>
                  <span>{category.evidenceCount} direct</span>
                </div>
                <div
                  className="rp-pattern-track"
                  aria-label={`${Math.round(category.coverage * 100)}% evidence coverage`}
                >
                  <span style={{ width: `${category.coverage * 100}%` }} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rp-suggestions panel">
        <div className="rp-suggestions-heading">
          <div>
            <p className="eyebrow">Profile suggestions</p>
            <h2>Worth sorting next.</h2>
          </div>
          <p>
            These are derived proposals, not answers. Accepting one records a
            conservative <strong>Works</strong> state and does not add it to the
            random pool.
          </p>
        </div>

        {featuredProposals.length === 0 ? (
          <div className="rp-suggestions-empty">
            {activeCounts.direct === 0
              ? `Direct ${contextNoun(context)} answers will make these suggestions more personal.`
              : "No likely or possible proposals yet. Keep refining and the model will surface stronger candidates."}
          </div>
        ) : (
          <div className="rp-suggestion-grid">
            {featuredProposals.map((proposal) => {
              const primitive = rewardPunishmentPrimitives.find(
                (candidate) =>
                  rewardPunishmentPrimitiveKey(candidate.ref) ===
                  rewardPunishmentPrimitiveKey(proposal.ref),
              );
              if (!primitive) return null;

              return (
                <article
                  className="rp-suggestion-card"
                  key={rewardPunishmentPrimitiveKey(proposal.ref)}
                >
                  <div className="rp-suggestion-top">
                    <span>Profile suggestion</span>
                    <strong>{proposalBandLabel(proposal, context)}</strong>
                  </div>
                  <h3>{primitive.label}</h3>
                  <div className="rp-suggestion-score">
                    <span>{Math.round(proposal.score * 100)}% fit</span>
                    <span>{Math.round(proposal.confidence * 100)}% confidence</span>
                  </div>
                  {proposal.categoryContributions.length > 0 && (
                    <div className="rp-suggestion-categories">
                      {proposal.categoryContributions
                        .slice(0, 2)
                        .map(
                          (item) =>
                            categoryById.get(item.categoryId)?.label ??
                            item.categoryId,
                        )
                        .join(" · ")}
                    </div>
                  )}
                  {proposal.reasons[0] && <p>{proposal.reasons[0]}</p>}
                  <button
                    className="secondary compact"
                    onClick={() => acceptProposal(proposal)}
                  >
                    Accept as {contextNoun(context)}
                  </button>
                </article>
              );
            })}
          </div>
        )}
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

      <ExpandableGroupedList
        groups={visibleByCategory.map(({ category, items }) => ({
          id: category.id,
          title: category.label,
          eyebrow: "Context category",
          items,
        }))}
        columnHeadings={[
          "Item",
          context === "reward" ? "Reward use" : "Punishment use",
          "Random pool",
          "More",
        ]}
        headClassName="rp-table-head"
        listClassName="rp-table"
        focusGroupId={
          categoryFilter === "all" ? undefined : categoryFilter
        }
        expansionKey={context + ":" + categoryFilter}
        summary={
          <>
            <strong>{visiblePrimitives.length}</strong>
            <span>matching primitives</span>
            <span aria-hidden="true">·</span>
            <strong>{activeCounts.direct}</strong>
            <span>directly rated in this context</span>
          </>
        }
        emptyTitle="No matches."
        emptyCopy="Try another search or clear one of the filters."
        onClearFilters={resetFilters}
        getGroupMeta={(group) => {
          const directCount = group.items.filter(
            (primitive) =>
              getContextualUseState(
                profile,
                primitive.ref,
                context,
              ).suitability !== "unset",
          ).length;
          return `${group.items.length} shown · ${directCount} rated`;
        }}
        renderItem={(primitive) => {
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
          const proposal = proposalByKey.get(
            rewardPunishmentPrimitiveKey(primitive.ref),
          );

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
                {proposal && (
                  <div className="rp-proposal-hint">
                    Profile suggestion:{" "}
                    {proposalBandLabel(proposal, context)}
                    {" · "}
                    {Math.round(proposal.score * 100)}% fit
                    {" · "}
                    {Math.round(proposal.confidence * 100)}% confidence
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
        }}
      />
        </>
      )}
    </section>
  );
}
