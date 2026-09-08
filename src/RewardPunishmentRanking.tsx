import { useMemo, useState } from "react";
import { kinkCatalog } from "./data/kinkCatalog.generated";
import {
  getRewardPunishmentAction,
  rewardPunishmentCategories,
  rewardPunishmentPrimitiveKey,
  rewardPunishmentPrimitives,
  type RewardPunishmentPrimitive,
} from "./lib/rewardPunishmentLibrary";
import type {
  RewardPunishmentContext,
  RewardPunishmentProfileState,
} from "./lib/rewardPunishmentProfile";
import {
  calculateRewardPunishmentRanking,
  historicalRewardPunishmentComparisonCount,
  rewardPunishmentRankingConfidenceLabel,
  selectNextRewardPunishmentPair,
  type RewardPunishmentComparisonResult,
} from "./lib/rewardPunishmentRanking";
import {
  loadRewardPunishmentRankingState,
  saveRewardPunishmentRankingState,
} from "./lib/rewardPunishmentRankingStorage";

function randomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `rp-comparison-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function contextTitle(context: RewardPunishmentContext) {
  return context === "reward" ? "Rewards" : "Punishments";
}

function primaryCategoryLabel(primitive: RewardPunishmentPrimitive) {
  const mapping = primitive.contextCategories
    .slice()
    .sort((left, right) => right.weight - left.weight)[0];
  if (!mapping) return primitive.sourceType === "catalog" ? "Catalog" : "Action";
  return (
    rewardPunishmentCategories.find(
      (category) => category.id === mapping.id,
    )?.label ?? mapping.id
  );
}

const catalogDescriptionById = new Map<string, string | undefined>(
  kinkCatalog.map((item) => [item.id, item.description]),
);

function primitiveDescription(primitive: RewardPunishmentPrimitive) {
  if (primitive.ref.kind === "catalog") {
    return catalogDescriptionById.get(primitive.ref.id);
  }
  return getRewardPunishmentAction(primitive.ref.id)?.description;
}

export function RewardPunishmentRanking({
  profile,
  onReclassify,
}: {
  profile: RewardPunishmentProfileState;
  onReclassify: (
    primitive: RewardPunishmentPrimitive,
    context: RewardPunishmentContext,
  ) => void;
}) {
  const [rankingState, setRankingState] = useState(() =>
    loadRewardPunishmentRankingState(),
  );
  const [context, setContext] =
    useState<RewardPunishmentContext>("reward");
  const [pairNonce, setPairNonce] = useState(0);

  const rewardSnapshot = useMemo(
    () =>
      calculateRewardPunishmentRanking(
        profile,
        rewardPunishmentPrimitives,
        rankingState.comparisons,
        "reward",
      ),
    [profile, rankingState.comparisons],
  );
  const punishmentSnapshot = useMemo(
    () =>
      calculateRewardPunishmentRanking(
        profile,
        rewardPunishmentPrimitives,
        rankingState.comparisons,
        "punishment",
      ),
    [profile, rankingState.comparisons],
  );

  const activeSnapshot =
    context === "reward" ? rewardSnapshot : punishmentSnapshot;

  const pair = useMemo(
    () =>
      selectNextRewardPunishmentPair(
        profile,
        rewardPunishmentPrimitives,
        rankingState.comparisons,
        context,
      ),
    [context, pairNonce, profile, rankingState.comparisons],
  );

  const historicalCount = historicalRewardPunishmentComparisonCount(
    rankingState.comparisons,
    context,
  );
  const inactiveHistoricalCount = Math.max(
    0,
    historicalCount - activeSnapshot.totalInteractions,
  );

  const answer = (result: RewardPunishmentComparisonResult) => {
    if (!pair) return;

    const next = {
      ...rankingState,
      comparisons: [
        ...rankingState.comparisons,
        {
          id: randomId(),
          context,
          leftPrimitiveKey: rewardPunishmentPrimitiveKey(pair[0].ref),
          rightPrimitiveKey: rewardPunishmentPrimitiveKey(pair[1].ref),
          result,
          timestamp: new Date().toISOString(),
        },
      ],
    };
    saveRewardPunishmentRankingState(next);
    setRankingState(next);
    setPairNonce((value) => value + 1);
  };

  const renderTop = (
    target: RewardPunishmentContext,
    snapshot: typeof rewardSnapshot,
  ) => (
    <button
      type="button"
      className={
        context === target
          ? "rp-ranking-lane panel is-active"
          : "rp-ranking-lane panel"
      }
      onClick={() => {
        setContext(target);
        setPairNonce((value) => value + 1);
      }}
    >
      <div className="rp-ranking-lane-heading">
        <div>
          <p className="eyebrow">Rank {contextTitle(target)}</p>
          <h2>
            {snapshot.items.length} eligible ·{" "}
            {snapshot.orderingComparisons} comparisons
          </h2>
        </div>
        <strong>
          {rewardPunishmentRankingConfidenceLabel(snapshot.confidence)}
        </strong>
      </div>
      {snapshot.items.some((item) => item.comparisons > 0) ? (
        <ol>
          {snapshot.items
            .filter((item) => item.comparisons > 0)
            .slice(0, 3)
            .map((item) => (
              <li key={rewardPunishmentPrimitiveKey(item.primitive.ref)}>
                <span>{item.rank}</span>
                <strong>{item.primitive.label}</strong>
              </li>
            ))}
        </ol>
      ) : (
        <p>No ordering evidence yet. Start anywhere.</p>
      )}
    </button>
  );

  return (
    <section className="rp-ranking-stack">
      <div className="rp-ranking-lanes">
        {renderTop("reward", rewardSnapshot)}
        {renderTop("punishment", punishmentSnapshot)}
      </div>

      <section className="rp-ranking-status panel">
        <div>
          <p className="eyebrow">
            {contextTitle(context)} · Contextual This or That
          </p>
          <h2>
            {rewardPunishmentRankingConfidenceLabel(
              activeSnapshot.confidence,
            )}
          </h2>
        </div>
        <p>
          {activeSnapshot.orderingComparisons} active ordering comparisons
          shape this ranking.
          {inactiveHistoricalCount > 0
            ? ` ${inactiveHistoricalCount} older interaction${
                inactiveHistoricalCount === 1 ? "" : "s"
              } remain stored but involve items no longer eligible in this context.`
            : ""}
        </p>
      </section>

      {activeSnapshot.items.length < 2 ? (
        <section className="rp-ranking-empty panel">
          <p className="eyebrow">Need two confirmed candidates</p>
          <h2>
            Classify at least two direct positive {context === "reward" ? "reward" : "punishment"} items first.
          </h2>
          <p>
            Strong, Works, and Depends are eligible. No, Never, and Unset
            stay out of new pairs.
          </p>
        </section>
      ) : pair ? (
        <article className="rp-ranking-versus panel">
          <div className="rp-ranking-versus-meta">
            <span>{contextTitle(context)}</span>
            <span>
              {activeSnapshot.items.length} eligible ·{" "}
              {activeSnapshot.orderingComparisons} ordering comps
            </span>
          </div>

          <div className="rp-ranking-pair">
            {pair.map((primitive, index) => (
              <button
                key={rewardPunishmentPrimitiveKey(primitive.ref)}
                type="button"
                className="rp-ranking-choice"
                onClick={() => answer(index === 0 ? "left" : "right")}
              >
                <span>{primaryCategoryLabel(primitive)}</span>
                <strong>{primitive.label}</strong>
                {primitiveDescription(primitive) && (
                  <p className="rp-ranking-choice-description">
                    {primitiveDescription(primitive)}
                  </p>
                )}
                <small>Pick this</small>
              </button>
            ))}
            <div className="rp-ranking-or" aria-hidden="true">
              OR
            </div>
          </div>

          <div className="rp-ranking-actions">
            <button
              className="secondary compact"
              onClick={() => answer("equal")}
            >
              Equal
            </button>
            <button
              className="text-button"
              onClick={() => answer("skip")}
            >
              Skip / don't know
            </button>
          </div>

          <div className="rp-ranking-reclassify">
            <span>Wrong pool?</span>
            <button
              className="text-button"
              onClick={() => onReclassify(pair[0], context)}
            >
              Reclassify {pair[0].label}
            </button>
            <button
              className="text-button"
              onClick={() => onReclassify(pair[1], context)}
            >
              Reclassify {pair[1].label}
            </button>
          </div>
        </article>
      ) : (
        <section className="rp-ranking-empty panel">
          <p className="eyebrow">Current pool exhausted</p>
          <h2>No useful pair is available right now.</h2>
          <p>
            Existing evidence stays saved. Add or reclassify candidates if
            you want more items in this context.
          </p>
        </section>
      )}

      <section className="rp-ranking-results panel">
        <div className="rp-ranking-results-heading">
          <div>
            <p className="eyebrow">Top {contextTitle(context)}</p>
            <h2>Pairwise order only.</h2>
          </div>
          <p>
            Suitability gets an item into the pool; it does not seed this
            ordering. M6 rank, M7 affinity, and M11 inference do not seed it
            either.
          </p>
        </div>

        {activeSnapshot.items.some((item) => item.comparisons > 0) ? (
          <div className="rp-ranking-list">
            {activeSnapshot.items
              .filter((item) => item.comparisons > 0)
              .slice(0, 15)
              .map((item) => (
                <div
                  className="rp-ranking-row"
                  key={rewardPunishmentPrimitiveKey(item.primitive.ref)}
                >
                  <span>{item.rank}</span>
                  <div>
                    <strong>{item.primitive.label}</strong>
                    <small>{primaryCategoryLabel(item.primitive)}</small>
                  </div>
                  <span>
                    {item.comparisons} comp
                    {item.comparisons === 1 ? "" : "s"}
                  </span>
                  <span>
                    {Math.round(item.confidence * 100)}% refined
                  </span>
                </div>
              ))}
          </div>
        ) : (
          <p className="rp-ranking-no-results">
            Make a left/right/equal choice to start the Top{" "}
            {contextTitle(context)} list.
          </p>
        )}
      </section>
    </section>
  );
}
