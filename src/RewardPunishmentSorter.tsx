import { useEffect, useMemo, useState } from "react";
import {
  rewardPunishmentCategories,
  rewardPunishmentPrimitiveKey,
  rewardPunishmentPrimitives,
  type RewardPunishmentPrimitive,
} from "./lib/rewardPunishmentLibrary";
import {
  buildInferredContextProposals,
  buildRewardPunishmentCategoryProfile,
} from "./lib/rewardPunishmentInference";
import {
  applySorterChoice,
  buildSorterCounts,
  buildSorterFeedback,
  buildSorterQueue,
  crossedSorterCheckpoint,
  deriveSorterSuggestion,
  deterministicSorterCadenceInterval,
  isSorterProtected,
  previousSorterPreference,
  primitivesForSorterScope,
  restoreSorterPreference,
  sorterBucketForPrimitive,
  type RewardPunishmentSorterChoice,
  type RewardPunishmentSorterFeedback,
  type RewardPunishmentSorterFeedbackType,
  type RewardPunishmentSorterScope,
} from "./lib/rewardPunishmentSorter";
import {
  loadRewardPunishmentSorterUiState,
  saveRewardPunishmentSorterUiState,
} from "./lib/rewardPunishmentSorterStorage";
import type { RewardPunishmentProfileState } from "./lib/rewardPunishmentProfile";
import type { CatalogResultView } from "./lib/catalogResults";
import type { CanonicalSignalResult } from "./lib/overallProfileSignals";

type HistoryEntry = {
  primitive: RewardPunishmentPrimitive;
  previous: ReturnType<typeof previousSorterPreference>;
};

function scopeValue(scope: RewardPunishmentSorterScope) {
  if (scope.type === "source") return `source:${scope.sourceType}`;
  if (scope.type === "category") return `category:${scope.categoryId}`;
  return scope.type;
}

function parseScope(value: string): RewardPunishmentSorterScope {
  if (value === "review") return { type: "review" };
  if (value === "source:catalog") {
    return { type: "source", sourceType: "catalog" };
  }
  if (value === "source:action") {
    return { type: "source", sourceType: "action" };
  }
  if (value.startsWith("category:")) {
    return { type: "category", categoryId: value.slice("category:".length) };
  }
  return { type: "unsorted" };
}

function suggestionLabel(
  suggestion: ReturnType<typeof deriveSorterSuggestion>,
) {
  if (suggestion === "both") return "Both";
  if (suggestion === "reward") return "Reward";
  if (suggestion === "punishment") return "Punishment";
  return undefined;
}

function choiceLabel(choice: Exclude<RewardPunishmentSorterChoice, "skip">) {
  if (choice === "both") return "Both";
  if (choice === "reward") return "Reward";
  if (choice === "punishment") return "Punishment";
  return "Neither";
}

function currentClassificationLabel(
  profile: RewardPunishmentProfileState,
  primitive: RewardPunishmentPrimitive,
) {
  const bucket = sorterBucketForPrimitive(profile, primitive.ref);
  if (bucket === "both") return "Both";
  if (bucket === "reward") return "Reward";
  if (bucket === "punishment") return "Punishment";
  if (bucket === "neither") return "Neither";
  if (bucket === "partial") return "Partially refined";
  return "Unsorted";
}

export function RewardPunishmentSorter({
  profile,
  onProfileChange,
  canonicalSignals,
  catalogResultView,
  onExit,
}: {
  profile: RewardPunishmentProfileState;
  onProfileChange: (profile: RewardPunishmentProfileState) => void;
  canonicalSignals: readonly CanonicalSignalResult[];
  catalogResultView: CatalogResultView;
  onExit: () => void;
}) {
  const [scope, setScope] =
    useState<RewardPunishmentSorterScope>({ type: "unsorted" });
  const [sessionSeenKeys, setSessionSeenKeys] = useState<Set<string>>(
    () => new Set(),
  );
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [revisitKey, setRevisitKey] = useState<string>();
  const [allowProtectedReplace, setAllowProtectedReplace] =
    useState(false);
  const [feedback, setFeedback] =
    useState<RewardPunishmentSorterFeedback>();
  const [lastFeedbackType, setLastFeedbackType] =
    useState<RewardPunishmentSorterFeedbackType>();
  const [feedbackSequence, setFeedbackSequence] = useState(0);

  const overallCounts = useMemo(
    () => buildSorterCounts(profile, rewardPunishmentPrimitives),
    [profile],
  );

  const [nextFeedbackAt, setNextFeedbackAt] = useState(
    () =>
      overallCounts.classified +
      deterministicSorterCadenceInterval(
        `start:${overallCounts.classified}`,
      ),
  );
  const [uiState, setUiState] = useState(() =>
    loadRewardPunishmentSorterUiState(overallCounts.classified),
  );
  const [checkpoint, setCheckpoint] = useState<number>();

  const rewardCategories = useMemo(
    () => buildRewardPunishmentCategoryProfile(profile, "reward"),
    [profile],
  );
  const punishmentCategories = useMemo(
    () => buildRewardPunishmentCategoryProfile(profile, "punishment"),
    [profile],
  );
  const rewardProposals = useMemo(
    () =>
      buildInferredContextProposals(
        profile,
        "reward",
        canonicalSignals,
        catalogResultView,
      ),
    [canonicalSignals, catalogResultView, profile],
  );
  const punishmentProposals = useMemo(
    () =>
      buildInferredContextProposals(
        profile,
        "punishment",
        canonicalSignals,
        catalogResultView,
      ),
    [canonicalSignals, catalogResultView, profile],
  );
  const rewardProposalByKey = useMemo(
    () =>
      new Map(
        rewardProposals.map((proposal) => [
          rewardPunishmentPrimitiveKey(proposal.ref),
          proposal,
        ]),
      ),
    [rewardProposals],
  );
  const punishmentProposalByKey = useMemo(
    () =>
      new Map(
        punishmentProposals.map((proposal) => [
          rewardPunishmentPrimitiveKey(proposal.ref),
          proposal,
        ]),
      ),
    [punishmentProposals],
  );

  const scopePrimitives = useMemo(
    () => primitivesForSorterScope(rewardPunishmentPrimitives, scope),
    [scope],
  );
  const scopeCounts = useMemo(
    () => buildSorterCounts(profile, scopePrimitives),
    [profile, scopePrimitives],
  );

  const queue = useMemo(
    () =>
      buildSorterQueue(
        profile,
        rewardPunishmentPrimitives,
        scope,
        rewardProposalByKey,
        punishmentProposalByKey,
        sessionSeenKeys,
      ),
    [
      profile,
      punishmentProposalByKey,
      rewardProposalByKey,
      scope,
      sessionSeenKeys,
    ],
  );

  const currentPrimitive =
    (revisitKey
      ? queue.find(
          (primitive) =>
            rewardPunishmentPrimitiveKey(primitive.ref) === revisitKey,
        )
      : undefined) ?? queue[0];

  const currentKey = currentPrimitive
    ? rewardPunishmentPrimitiveKey(currentPrimitive.ref)
    : undefined;
  const currentRewardProposal = currentKey
    ? rewardProposalByKey.get(currentKey)
    : undefined;
  const currentPunishmentProposal = currentKey
    ? punishmentProposalByKey.get(currentKey)
    : undefined;
  const currentSuggestion = deriveSorterSuggestion(
    currentRewardProposal,
    currentPunishmentProposal,
  );
  const currentSuggestionLabel = suggestionLabel(currentSuggestion);
  const currentProtected = currentPrimitive
    ? isSorterProtected(profile, currentPrimitive.ref)
    : false;
  const blockedProtected =
    currentProtected &&
    scope.type === "review" &&
    !allowProtectedReplace;

  const overallPercent =
    overallCounts.total > 0
      ? (overallCounts.classified / overallCounts.total) * 100
      : 0;
  const scopePercent =
    scopeCounts.total > 0
      ? (scopeCounts.classified / scopeCounts.total) * 100
      : 0;

  const changeScope = (value: string) => {
    setScope(parseScope(value));
    setSessionSeenKeys(new Set());
    setHistory([]);
    setRevisitKey(undefined);
    setAllowProtectedReplace(false);
    setFeedback(undefined);
    setCheckpoint(undefined);
  };

  const answer = (
    choice: Exclude<RewardPunishmentSorterChoice, "skip">,
  ) => {
    if (!currentPrimitive || blockedProtected) return;

    const beforeCounts = overallCounts;
    const previous = previousSorterPreference(
      profile,
      currentPrimitive.ref,
    );
    const next = applySorterChoice(
      profile,
      currentPrimitive.ref,
      choice,
      { allowProtected: allowProtectedReplace },
    );

    if (next === profile) return;

    const afterCounts = buildSorterCounts(
      next,
      rewardPunishmentPrimitives,
    );

    setHistory((current) => [
      ...current,
      { primitive: currentPrimitive, previous },
    ]);
    setSessionSeenKeys((current) => {
      const nextKeys = new Set(current);
      nextKeys.add(rewardPunishmentPrimitiveKey(currentPrimitive.ref));
      return nextKeys;
    });
    setRevisitKey(undefined);
    setAllowProtectedReplace(false);
    onProfileChange(next);

    const crossed = crossedSorterCheckpoint(
      beforeCounts.classified,
      afterCounts.classified,
    );
    if (
      crossed !== undefined &&
      crossed > uiState.lastCelebratedCheckpoint
    ) {
      const nextUiState = {
        schemaVersion: 1 as const,
        lastCelebratedCheckpoint: crossed,
      };
      setUiState(nextUiState);
      saveRewardPunishmentSorterUiState(nextUiState);
      setCheckpoint(crossed);
      setFeedback(undefined);
      return;
    }

    setCheckpoint(undefined);
    if (
      afterCounts.classified > beforeCounts.classified &&
      afterCounts.classified >= nextFeedbackAt
    ) {
      const nextFeedback = buildSorterFeedback({
        primitive: currentPrimitive,
        choice,
        sequence: feedbackSequence,
        previousType: lastFeedbackType,
        catalogResultView,
        rewardCategories: buildRewardPunishmentCategoryProfile(
          next,
          "reward",
        ),
        punishmentCategories: buildRewardPunishmentCategoryProfile(
          next,
          "punishment",
        ),
        counts: afterCounts,
      });
      setFeedback(nextFeedback);
      setLastFeedbackType(nextFeedback.type);
      setFeedbackSequence((value) => value + 1);
      setNextFeedbackAt(
        afterCounts.classified +
          deterministicSorterCadenceInterval(
            `${rewardPunishmentPrimitiveKey(currentPrimitive.ref)}:${afterCounts.classified}`,
          ),
      );
    }
  };

  const skip = () => {
    if (!currentPrimitive) return;
    setSessionSeenKeys((current) => {
      const next = new Set(current);
      next.add(rewardPunishmentPrimitiveKey(currentPrimitive.ref));
      return next;
    });
    setRevisitKey(undefined);
    setAllowProtectedReplace(false);
  };

  const undo = () => {
    const last = history.at(-1);
    if (!last) return;

    const restored = restoreSorterPreference(
      profile,
      last.primitive.ref,
      last.previous,
    );
    const key = rewardPunishmentPrimitiveKey(last.primitive.ref);
    setHistory((current) => current.slice(0, -1));
    setSessionSeenKeys((current) => {
      const next = new Set(current);
      next.delete(key);
      return next;
    });
    setRevisitKey(key);
    setAllowProtectedReplace(false);
    setFeedback(undefined);
    setCheckpoint(undefined);
    onProfileChange(restored);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        ["INPUT", "SELECT", "TEXTAREA"].includes(target.tagName)
      ) {
        return;
      }

      if (event.key === "1") answer("reward");
      else if (event.key === "2") answer("punishment");
      else if (event.key === "3") answer("both");
      else if (event.key === "4") answer("neither");
      else if (event.key.toLocaleLowerCase() === "s") skip();
      else if (event.key.toLocaleLowerCase() === "u") undo();
      else return;

      event.preventDefault();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  return (
    <section className="rp-sorter-stack">
      <section className="rp-sorter-toolbar panel">
        <div>
          <p className="eyebrow">Quick sorter</p>
          <h2>Tiny decisions. One card at a time.</h2>
          <p>
            Reward, Punishment, Both, Neither, or skip it for later.
            Quick choices stay coarse; detailed refinement keeps the nuance.
          </p>
        </div>

        <label>
          <span>Run</span>
          <select
            value={scopeValue(scope)}
            onChange={(event) => changeScope(event.target.value)}
          >
            <option value="unsorted">Continue unsorted</option>
            <option value="source:catalog">Catalog items</option>
            <option value="source:action">Action ideas</option>
            <option value="review">Review previous choices</option>
            <optgroup label="Browse by category">
              {rewardPunishmentCategories.map((category) => (
                <option
                  key={category.id}
                  value={`category:${category.id}`}
                >
                  {category.label}
                </option>
              ))}
            </optgroup>
          </select>
        </label>

        <button className="secondary" onClick={onExit}>
          Detailed editor
        </button>
      </section>

      <section className="rp-sorter-progress panel">
        <div className="rp-sorter-progress-block">
          <div>
            <span>Overall</span>
            <strong>
              {overallCounts.classified} classified ·{" "}
              {overallCounts.remaining} remaining
            </strong>
          </div>
          <div className="rp-sorter-progress-track">
            <span style={{ width: `${overallPercent}%` }} />
          </div>
        </div>

        {scope.type !== "unsorted" && (
          <div className="rp-sorter-progress-block">
            <div>
              <span>Focused run</span>
              <strong>
                {scopeCounts.classified} / {scopeCounts.total} classified
              </strong>
            </div>
            <div className="rp-sorter-progress-track">
              <span style={{ width: `${scopePercent}%` }} />
            </div>
          </div>
        )}

        <div className="rp-sorter-counts">
          <span>Reward {overallCounts.reward}</span>
          <span>Punishment {overallCounts.punishment}</span>
          <span>Both {overallCounts.both}</span>
          <span>Neither {overallCounts.neither}</span>
        </div>

        {overallCounts.protectedIncomplete > 0 && (
          <p className="rp-sorter-protected-note">
            {overallCounts.protectedIncomplete} nuanced item
            {overallCounts.protectedIncomplete === 1 ? "" : "s"} protected
            from quick-sort.
          </p>
        )}
      </section>

      {checkpoint && (
        <aside
          className="rp-sorter-checkpoint panel"
          aria-live="polite"
        >
          <span className="eyebrow">Checkpoint</span>
          <h2>{checkpoint} mapped 🎉</h2>
          <p>
            Reward {overallCounts.reward} · Punishment{" "}
            {overallCounts.punishment} · Both {overallCounts.both} ·
            Neither {overallCounts.neither}
          </p>
        </aside>
      )}

      {feedback && !checkpoint && (
        <aside className="rp-sorter-feedback panel" aria-live="polite">
          <span className="eyebrow">
            {feedback.type.replaceAll("_", " ")}
          </span>
          <p>{feedback.message}</p>
          {feedback.provenance && (
            <small>{feedback.provenance}</small>
          )}
        </aside>
      )}

      {currentPrimitive ? (
        <article className="rp-sorter-card panel">
          <div className="rp-sorter-card-meta">
            <span className="rp-source-badge">
              {currentPrimitive.sourceType === "catalog"
                ? "Catalog"
                : "Action"}
            </span>
            <span>{currentClassificationLabel(profile, currentPrimitive)}</span>
          </div>

          <h2>{currentPrimitive.label}</h2>

          <div className="rp-sorter-categories">
            {currentPrimitive.contextCategories
              .slice()
              .sort((left, right) => right.weight - left.weight)
              .slice(0, 3)
              .map((mapping) => (
                <span key={mapping.id}>
                  {rewardPunishmentCategories.find(
                    (category) => category.id === mapping.id,
                  )?.label ?? mapping.id}
                </span>
              ))}
          </div>

          {currentSuggestionLabel && (
            <div className="rp-sorter-suggestion">
              <span className="eyebrow">Profile suggestion</span>
              <strong>Suggested: {currentSuggestionLabel}</strong>
              <p>
                Inference is only ordering this deck and offering a hint.
                Nothing is selected until you tap it.
              </p>
            </div>
          )}

          {blockedProtected && (
            <div className="rp-sorter-warning">
              <strong>This item has nuanced direct data.</strong>
              <p>
                A quick-sort choice would replace its Strong / Depends /
                Never / note / random-pool detail with coarse Works/No
                values.
              </p>
              <button
                className="secondary compact"
                onClick={() => setAllowProtectedReplace(true)}
              >
                Allow coarse replacement for this item
              </button>
            </div>
          )}

          <div className="rp-sorter-choices">
            {(
              [
                ["reward", "1"],
                ["punishment", "2"],
                ["both", "3"],
                ["neither", "4"],
              ] as const
            ).map(([choice, shortcut]) => (
              <button
                key={choice}
                className={
                  choice === "both"
                    ? "primary rp-sorter-choice"
                    : "secondary rp-sorter-choice"
                }
                disabled={blockedProtected}
                onClick={() => answer(choice)}
              >
                <span>{choiceLabel(choice)}</span>
                <kbd>{shortcut}</kbd>
              </button>
            ))}
          </div>

          <div className="rp-sorter-secondary-actions">
            <button className="text-button" onClick={skip}>
              Skip for now <kbd>S</kbd>
            </button>
            <button
              className="text-button"
              disabled={history.length === 0}
              onClick={undo}
            >
              Back / Undo <kbd>U</kbd>
            </button>
          </div>
        </article>
      ) : (
        <section className="rp-sorter-complete panel">
          <span className="eyebrow">Run complete</span>
          <h2>Nothing else in this slice needs a quick decision.</h2>
          <p>
            Switch runs to another category/source, review previous
            choices, or use the detailed editor for protected nuanced
            items.
          </p>
          <button className="secondary" onClick={onExit}>
            Open detailed editor
          </button>
        </section>
      )}
    </section>
  );
}
