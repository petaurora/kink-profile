import { useMemo, useState } from "react";
import { kinkCatalog } from "./data/kinkCatalog.generated";
import {
  getRewardPunishmentAction,
  rewardPunishmentCategories,
  rewardPunishmentPrimitiveKey,
  rewardPunishmentPrimitives,
  type RewardPunishmentPrimitive,
} from "./lib/rewardPunishmentLibrary";
import {
  getContextualUseState,
  type RewardPunishmentContext,
  type RewardPunishmentProfileState,
} from "./lib/rewardPunishmentProfile";
import {
  buildRewardPunishmentRandomPool,
  pickRewardPunishmentRandomPrimitive,
} from "./lib/rewardPunishmentRandomizer";
import "./rewardPunishmentRandomizer.css";

const catalogById = new Map<string, (typeof kinkCatalog)[number]>(
  kinkCatalog.map((item) => [item.id, item]),
);

function contextLabel(context: RewardPunishmentContext) {
  return context === "reward" ? "Reward" : "Punishment";
}

function primitiveDescription(primitive: RewardPunishmentPrimitive) {
  if (primitive.ref.kind === "catalog") {
    return catalogById.get(primitive.ref.id)?.description;
  }
  return getRewardPunishmentAction(primitive.ref.id)?.description;
}

function primitiveCategoryLabels(primitive: RewardPunishmentPrimitive) {
  return primitive.contextCategories
    .slice()
    .sort((left, right) => right.weight - left.weight)
    .slice(0, 3)
    .map(
      (mapping) =>
        rewardPunishmentCategories.find(
          (category) => category.id === mapping.id,
        )?.label ?? mapping.id,
    );
}

function sourceOriginText(primitive: RewardPunishmentPrimitive) {
  if (primitive.sourceOrigins.length > 0) {
    return primitive.sourceOrigins
      .map((origin) => {
        const row = origin.sourceRow ? ` · row ${origin.sourceRow}` : "";
        return `${origin.sourceSheet ?? "reference"}${row}`;
      })
      .join(" · ");
  }

  return primitive.sourceType === "catalog"
    ? "M6 kink catalog"
    : "Normalized M11 action library";
}

export function RewardPunishmentRandomizer({
  profile,
  onOpenDetails,
}: {
  profile: RewardPunishmentProfileState;
  onOpenDetails: (
    primitive: RewardPunishmentPrimitive | undefined,
    context: RewardPunishmentContext,
  ) => void;
}) {
  const pools = useMemo(
    () => ({
      reward: buildRewardPunishmentRandomPool(
        profile,
        rewardPunishmentPrimitives,
        "reward",
      ),
      punishment: buildRewardPunishmentRandomPool(
        profile,
        rewardPunishmentPrimitives,
        "punishment",
      ),
    }),
    [profile],
  );

  const [context, setContext] =
    useState<RewardPunishmentContext>("reward");
  const [result, setResult] =
    useState<RewardPunishmentPrimitive | null>(null);
  const [previousKeys, setPreviousKeys] = useState<
    Partial<Record<RewardPunishmentContext, string>>
  >({});

  const pick = (target: RewardPunishmentContext) => {
    const next = pickRewardPunishmentRandomPrimitive(pools[target], {
      previousPrimitiveKey: previousKeys[target],
    });
    setContext(target);
    setResult(next);

    if (next) {
      setPreviousKeys((current) => ({
        ...current,
        [target]: rewardPunishmentPrimitiveKey(next.ref),
      }));
    }
  };

  const state = result
    ? getContextualUseState(profile, result.ref, context)
    : undefined;
  const description = result ? primitiveDescription(result) : undefined;
  const categoryLabels = result
    ? primitiveCategoryLabels(result)
    : [];

  return (
    <section className="rp-randomizer-stack">
      <section className="rp-randomizer-intro panel">
        <div>
          <p className="eyebrow">Just pick one</p>
          <h2>No weighting. No assignment. Just a suggestion.</h2>
        </div>
        <p>
          Every explicitly included item has an equal chance in its own
          context pool. Contextual rank and inferred proposals do not change
          the odds.
        </p>
      </section>

      <div className="rp-randomizer-pools">
        {(["reward", "punishment"] as const).map((target) => {
          const pool = pools[target];
          return (
            <article className="rp-randomizer-pool panel" key={target}>
              <div>
                <p className="eyebrow">
                  {target === "reward"
                    ? "Random reward"
                    : "Random punishment"}
                </p>
                <h2>{pool.length} ready</h2>
                <p>
                  Only direct Strong/Works items you explicitly added to the
                  random pool.
                </p>
              </div>
              <button
                className="primary"
                disabled={pool.length === 0}
                onClick={() => pick(target)}
              >
                {target === "reward"
                  ? "Pick a reward"
                  : "Pick a punishment"}
              </button>
              {pool.length === 0 && (
                <button
                  className="text-button"
                  onClick={() => onOpenDetails(undefined, target)}
                >
                  Set up this pool
                </button>
              )}
            </article>
          );
        })}
      </div>

      {result ? (
        <article className="rp-randomizer-result panel" aria-live="polite">
          <div className="rp-randomizer-result-top">
            <span className="rp-source-badge">
              {result.sourceType === "catalog" ? "Catalog" : "Action"}
            </span>
            <span>{contextLabel(context)} suggestion</span>
          </div>

          <h2>{result.label}</h2>

          {categoryLabels.length > 0 && (
            <div className="rp-randomizer-categories">
              {categoryLabels.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
          )}

          {description && (
            <p className="rp-randomizer-description">{description}</p>
          )}

          {state?.note && (
            <div className="rp-randomizer-note">
              <span className="eyebrow">Your context note</span>
              <p>{state.note}</p>
            </div>
          )}

          <div className="rp-randomizer-actions">
            <button className="primary" onClick={() => pick(context)}>
              Pick again
            </button>
            <button
              className="secondary"
              onClick={() => onOpenDetails(result, context)}
            >
              View details
            </button>
          </div>

          <details className="rp-randomizer-source">
            <summary>View source</summary>
            <dl>
              <div>
                <dt>Primitive</dt>
                <dd>
                  {result.ref.kind}:{result.ref.id}
                </dd>
              </div>
              <div>
                <dt>Runtime source</dt>
                <dd>
                  {result.sourceType === "catalog"
                    ? "M6 catalog primitive"
                    : "M11 action primitive"}
                </dd>
              </div>
              <div>
                <dt>Reference origin</dt>
                <dd>{sourceOriginText(result)}</dd>
              </div>
              <div>
                <dt>Random eligibility</dt>
                <dd>
                  Explicitly included · {state?.suitability ?? "unset"}
                </dd>
              </div>
            </dl>
          </details>

          <p className="rp-randomizer-disclaimer">
            This is a suggestion only. The app does not mark it assigned,
            earned, owed, due, or completed.
          </p>
        </article>
      ) : (
        <section className="rp-randomizer-placeholder panel">
          <p className="eyebrow">Waiting for a pool</p>
          <h2>Pick Reward or Punishment above.</h2>
          <p>
            Nothing is chosen until you ask. Rerolls avoid the immediately
            previous result when another eligible option exists.
          </p>
        </section>
      )}
    </section>
  );
}
