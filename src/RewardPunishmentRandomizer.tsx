import { useEffect, useMemo, useState } from "react";
import { kinkCatalog } from "./data/kinkCatalog.generated";
import {
  getRewardPunishmentAction,
  getRewardPunishmentPrimitive,
  rewardPunishmentCategories,
  rewardPunishmentPrimitives,
  type RewardPunishmentPrimitive,
} from "./lib/rewardPunishmentLibrary";
import {
  getContextualUseState,
  type RewardPunishmentContext,
  type RewardPunishmentProfileState,
} from "./lib/rewardPunishmentProfile";
import {
  buildRewardPunishmentRandomEntries,
  pickRewardPunishmentRandomEntry,
  rewardPunishmentRandomEntryKey,
  type RewardPunishmentRandomEntry,
} from "./lib/rewardPunishmentRandomizer";
import {
  reconcileRewardPunishmentRecipeState,
  type RewardPunishmentRecipeComponent,
} from "./lib/rewardPunishmentRecipes";
import {
  loadRewardPunishmentRecipeState,
  saveRewardPunishmentRecipeState,
} from "./lib/rewardPunishmentRecipeStorage";
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

function primitiveSourceOriginText(primitive: RewardPunishmentPrimitive) {
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

function componentLabel(component: RewardPunishmentRecipeComponent) {
  if (component.kind === "custom") return component.label;
  return (
    getRewardPunishmentPrimitive(component.ref)?.label ??
    `Missing: ${component.ref.kind}:${component.ref.id}`
  );
}

function entryLabel(entry: RewardPunishmentRandomEntry) {
  return entry.kind === "recipe"
    ? entry.recipe.name
    : entry.primitive.label;
}

function entrySourceLabel(entry: RewardPunishmentRandomEntry) {
  if (entry.kind === "recipe") return "Recipe";
  return entry.primitive.sourceType === "catalog" ? "Catalog" : "Action";
}

type RandomizerSessionPick = {
  entry: RewardPunishmentRandomEntry;
  context: RewardPunishmentContext;
};

export function RewardPunishmentRandomizer({
  profile,
  onSetupPool,
}: {
  profile: RewardPunishmentProfileState;
  onSetupPool: (context: RewardPunishmentContext) => void;
}) {
  const [recipeState, setRecipeState] = useState(() => {
    const loaded = loadRewardPunishmentRecipeState();
    const reconciled = reconcileRewardPunishmentRecipeState(
      loaded,
      profile,
    );
    if (reconciled !== loaded) {
      saveRewardPunishmentRecipeState(reconciled);
    }
    return reconciled;
  });

  useEffect(() => {
    setRecipeState((current) => {
      const reconciled = reconcileRewardPunishmentRecipeState(
        current,
        profile,
      );
      if (reconciled !== current) {
        saveRewardPunishmentRecipeState(reconciled);
      }
      return reconciled;
    });
  }, [profile]);

  const pools = useMemo(
    () => ({
      reward: buildRewardPunishmentRandomEntries(
        profile,
        rewardPunishmentPrimitives,
        recipeState.recipes,
        "reward",
      ),
      punishment: buildRewardPunishmentRandomEntries(
        profile,
        rewardPunishmentPrimitives,
        recipeState.recipes,
        "punishment",
      ),
    }),
    [profile, recipeState.recipes],
  );

  const [context, setContext] =
    useState<RewardPunishmentContext>("reward");
  const [result, setResult] =
    useState<RewardPunishmentRandomEntry | null>(null);
  const [previousKeys, setPreviousKeys] = useState<
    Partial<Record<RewardPunishmentContext, string>>
  >({});
  const [sessionHistory, setSessionHistory] = useState<
    RandomizerSessionPick[]
  >([]);

  const pick = (target: RewardPunishmentContext) => {
    const next = pickRewardPunishmentRandomEntry(pools[target], {
      previousEntryKey: previousKeys[target],
    });

    if (result) {
      setSessionHistory((current) => [
        { entry: result, context },
        ...current,
      ]);
    }

    setContext(target);
    setResult(next);

    if (next) {
      setPreviousKeys((current) => ({
        ...current,
        [target]: rewardPunishmentRandomEntryKey(next),
      }));
    }
  };

  const primitive =
    result?.kind === "primitive" ? result.primitive : undefined;
  const recipe =
    result?.kind === "recipe" ? result.recipe : undefined;
  const primitiveState = primitive
    ? getContextualUseState(profile, primitive.ref, context)
    : undefined;
  const description = primitive
    ? primitiveDescription(primitive)
    : undefined;
  const categoryLabels = primitive
    ? primitiveCategoryLabels(primitive)
    : [];

  return (
    <section className="rp-randomizer-stack">
      <section className="rp-randomizer-intro panel">
        <div>
          <p className="eyebrow">Just pick one</p>
          <h2>No weighting. No assignment. Just a suggestion.</h2>
        </div>
        <p>
          Every explicitly approved primitive or valid saved recipe has one
          equal entry in its own context pool. Contextual rank and inferred
          proposals do not change the odds.
        </p>
      </section>

      <div className="rp-randomizer-pools">
        {(["reward", "punishment"] as const).map((target) => {
          const pool = pools[target];
          const recipeCount = pool.filter(
            (entry) => entry.kind === "recipe",
          ).length;
          const primitiveCount = pool.length - recipeCount;

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
                  {primitiveCount} primitive
                  {primitiveCount === 1 ? "" : "s"}
                  {" · "}
                  {recipeCount} recipe
                  {recipeCount === 1 ? "" : "s"}
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
                  onClick={() => onSetupPool(target)}
                >
                  Set up this pool
                </button>
              )}
            </article>
          );
        })}
      </div>

      {result ? (
        <>
          <article className="rp-randomizer-result panel" aria-live="polite">
            <button
              type="button"
              className="rp-randomizer-reroll-card"
              onClick={() => pick(context)}
              aria-label={`Pick another random ${context}`}
            >
              <div className="rp-randomizer-result-top">
                <span className="rp-source-badge">
                  {entrySourceLabel(result)}
                </span>
                <span>{contextLabel(context)} suggestion</span>
              </div>

              <div className="rp-randomizer-result-content">
                <h2>{entryLabel(result)}</h2>

                {primitive && categoryLabels.length > 0 && (
                  <div className="rp-randomizer-categories">
                    {categoryLabels.map((label) => (
                      <span key={label}>{label}</span>
                    ))}
                  </div>
                )}

                {recipe?.tags && recipe.tags.length > 0 && (
                  <div className="rp-randomizer-categories">
                    {recipe.tags.slice(0, 4).map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                )}

                {description && (
                  <p className="rp-randomizer-description">{description}</p>
                )}

                {recipe && (
                  <ol className="rp-randomizer-recipe-components">
                    {recipe.components.map((component, index) => (
                      <li
                        key={
                          component.kind === "custom"
                            ? component.id
                            : `${component.ref.kind}:${component.ref.id}:${index}`
                        }
                      >
                        {componentLabel(component)}
                      </li>
                    ))}
                  </ol>
                )}

                {primitiveState?.note && (
                  <div className="rp-randomizer-note">
                    <span className="eyebrow">Your context note</span>
                    <p>{primitiveState.note}</p>
                  </div>
                )}

                {recipe?.notes && (
                  <div className="rp-randomizer-note">
                    <span className="eyebrow">Recipe note</span>
                    <p>{recipe.notes}</p>
                  </div>
                )}
              </div>

              <div className="rp-randomizer-tap-hint">
                <strong>Tap card to pick again</strong>
                <span>Another eligible option will be suggested.</span>
              </div>
            </button>

            <details className="rp-randomizer-source">
              <summary>View source</summary>
              {primitive ? (
                <dl>
                  <div>
                    <dt>Primitive</dt>
                    <dd>
                      {primitive.ref.kind}:{primitive.ref.id}
                    </dd>
                  </div>
                  <div>
                    <dt>Runtime source</dt>
                    <dd>
                      {primitive.sourceType === "catalog"
                        ? "M6 catalog primitive"
                        : "M11 action primitive"}
                    </dd>
                  </div>
                  <div>
                    <dt>Reference origin</dt>
                    <dd>{primitiveSourceOriginText(primitive)}</dd>
                  </div>
                  <div>
                    <dt>Random eligibility</dt>
                    <dd>
                      Explicitly included ·{" "}
                      {primitiveState?.suitability ?? "unset"}
                    </dd>
                  </div>
                </dl>
              ) : (
                <dl>
                  <div>
                    <dt>Recipe</dt>
                    <dd>{recipe?.id}</dd>
                  </div>
                  <div>
                    <dt>Context</dt>
                    <dd>{contextLabel(context)}</dd>
                  </div>
                  <div>
                    <dt>Components</dt>
                    <dd>{recipe?.components.length ?? 0}</dd>
                  </div>
                  <div>
                    <dt>Random eligibility</dt>
                    <dd>Explicitly included · valid recipe</dd>
                  </div>
                </dl>
              )}
            </details>

            <p className="rp-randomizer-disclaimer">
              This is a suggestion only. The app does not mark it assigned,
              earned, owed, due, or completed.
            </p>
          </article>

          {sessionHistory.length > 0 && (
            <section className="rp-randomizer-history panel">
              <div className="rp-randomizer-history-heading">
                <div>
                  <p className="eyebrow">This session</p>
                  <h2>Already rolled</h2>
                </div>
                <span>{sessionHistory.length} previous</span>
              </div>

              <div className="rp-randomizer-history-list">
                {sessionHistory.map((entry, index) => (
                  <div
                    className="rp-randomizer-history-row"
                    key={`${rewardPunishmentRandomEntryKey(entry.entry)}:${entry.context}:${index}`}
                  >
                    <span className="rp-randomizer-history-index">
                      {sessionHistory.length - index}
                    </span>
                    <div>
                      <strong>{entryLabel(entry.entry)}</strong>
                      <span>
                        {contextLabel(entry.context)}
                        {" · "}
                        {entrySourceLabel(entry.entry)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <p className="rp-randomizer-history-note">
                Temporary reroll trail only. It clears when you leave the
                Randomizer.
              </p>
            </section>
          )}
        </>
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
