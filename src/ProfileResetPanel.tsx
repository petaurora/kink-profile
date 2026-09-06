import { useMemo, useState } from "react";
import { quizzes, type QuizId } from "./data/quizzes";
import {
  createEmptyResetSelection,
  createResetEverythingSelection,
  getProfileResetImpact,
  hasResetSelection,
  isResetEverythingSelection,
  resetProfileData,
  type ProfileResetSelection,
} from "./lib/profileReset";
import type { ProfileSettings } from "./lib/profileSettings";

type ProfileResetPanelProps = {
  onSettingsChange: (settings: ProfileSettings) => void;
  onClose: () => void;
};

type ResetStep = "select" | "review" | "complete";

function selectionLabels(selection: ProfileResetSelection) {
  const reset: string[] = [];
  const keep: string[] = [];

  const allQuizzesSelected = quizzes.every((quiz) =>
    selection.quizIds.includes(quiz.id),
  );

  if (allQuizzesSelected) {
    reset.push("All quiz answers, progress, and results");
  } else {
    for (const quiz of quizzes) {
      const label = `${quiz.title} quiz`;
      (selection.quizIds.includes(quiz.id) ? reset : keep).push(label);
    }
  }

  if (!allQuizzesSelected && selection.quizIds.length === 0) {
    keep.push("All quiz answers, progress, and results");
  }

  (selection.catalogPreferences ? reset : keep).push(
    "Explicit catalog preferences and limits",
  );
  (selection.rankingComparisons ? reset : keep).push(
    "This-or-That comparisons and rankings",
  );
  (selection.profileSettings ? reset : keep).push(
    "Profile name and settings",
  );

  return { reset, keep };
}

export function ProfileResetPanel({
  onSettingsChange,
  onClose,
}: ProfileResetPanelProps) {
  const [selection, setSelection] = useState<ProfileResetSelection>(
    createEmptyResetSelection,
  );
  const [step, setStep] = useState<ResetStep>("select");

  const allQuizIds = useMemo(() => quizzes.map((quiz) => quiz.id), []);
  const allQuizzesSelected = allQuizIds.every((quizId) =>
    selection.quizIds.includes(quizId),
  );
  const labels = useMemo(() => selectionLabels(selection), [selection]);
  const impact = useMemo(
    () => (step === "review" ? getProfileResetImpact(selection) : null),
    [selection, step],
  );

  const toggleQuiz = (quizId: QuizId, checked: boolean) => {
    setSelection((current) => ({
      ...current,
      quizIds: checked
        ? [...new Set([...current.quizIds, quizId])]
        : current.quizIds.filter((id) => id !== quizId),
    }));
  };

  const toggleAllQuizzes = (checked: boolean) => {
    setSelection((current) => ({
      ...current,
      quizIds: checked ? allQuizIds : [],
    }));
  };

  const confirmReset = () => {
    const result = resetProfileData(selection);
    if (selection.profileSettings) {
      onSettingsChange(result.settings);
    }
    setStep("complete");
  };

  if (step === "complete") {
    return (
      <section className="settings-reset-panel panel" aria-live="polite">
        <div className="settings-reset-complete">
          <p className="eyebrow">Reset complete</p>
          <h3>Selected data is cleared.</h3>
          <p>
            Everything you chose to keep is still there. Close Settings when you're ready;
            the profile app will reload from the remaining source data.
          </p>
          <button className="primary" onClick={onClose}>
            Done
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="settings-reset-panel panel" aria-labelledby="reset-profile-heading">
      <div className="settings-reset-heading">
        <div>
          <p className="eyebrow">Selective reset</p>
          <h3 id="reset-profile-heading">
            {step === "select" ? "Choose what to reset." : "Review before deleting."}
          </h3>
        </div>
        <button className="text-button" onClick={onClose}>
          Cancel
        </button>
      </div>

      {step === "select" ? (
        <>
          <div className="settings-reset-shortcut">
            <div>
              <strong>Reset everything</strong>
              <span>Select every profile-owned data source.</span>
            </div>
            <button
              className="secondary compact"
              onClick={() =>
                setSelection(
                  isResetEverythingSelection(selection)
                    ? createEmptyResetSelection()
                    : createResetEverythingSelection(),
                )
              }
            >
              {isResetEverythingSelection(selection) ? "Clear all selections" : "Select all"}
            </button>
          </div>

          <fieldset className="settings-reset-group">
            <legend>Quiz data</legend>
            <label className="settings-reset-option settings-reset-option-parent">
              <input
                type="checkbox"
                checked={allQuizzesSelected}
                onChange={(event) => toggleAllQuizzes(event.target.checked)}
              />
              <span>
                <strong>All quizzes</strong>
                <small>Answers, progress, completion, and section-local results.</small>
              </span>
            </label>

            <div className="settings-reset-quiz-list">
              {quizzes.map((quiz) => (
                <label className="settings-reset-option" key={quiz.id}>
                  <input
                    type="checkbox"
                    checked={selection.quizIds.includes(quiz.id)}
                    onChange={(event) => toggleQuiz(quiz.id, event.target.checked)}
                  />
                  <span>
                    <strong>{quiz.title}</strong>
                    <small>{quiz.contributesToOverall ? "Core profile quiz" : "Sampler"}</small>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="settings-reset-group">
            <legend>Catalog & ranking</legend>
            <label className="settings-reset-option">
              <input
                type="checkbox"
                checked={selection.catalogPreferences}
                onChange={(event) =>
                  setSelection((current) => ({
                    ...current,
                    catalogPreferences: event.target.checked,
                  }))
                }
              />
              <span>
                <strong>Explicit catalog preferences</strong>
                <small>Love, Like, Curious, Unsure, exclusions, limits, and directional overrides.</small>
              </span>
            </label>

            <label className="settings-reset-option">
              <input
                type="checkbox"
                checked={selection.rankingComparisons}
                onChange={(event) =>
                  setSelection((current) => ({
                    ...current,
                    rankingComparisons: event.target.checked,
                  }))
                }
              />
              <span>
                <strong>This-or-That & rankings</strong>
                <small>Raw pairwise comparisons, category ranking, and Overall ranking history.</small>
              </span>
            </label>
          </fieldset>

          <fieldset className="settings-reset-group">
            <legend>Profile settings</legend>
            <label className="settings-reset-option">
              <input
                type="checkbox"
                checked={selection.profileSettings}
                onChange={(event) =>
                  setSelection((current) => ({
                    ...current,
                    profileSettings: event.target.checked,
                  }))
                }
              />
              <span>
                <strong>Profile name & settings</strong>
                <small>Returns the display name to the default profile name.</small>
              </span>
            </label>
          </fieldset>

          <div className="settings-reset-actions">
            <button
              className="primary"
              disabled={!hasResetSelection(selection)}
              onClick={() => setStep("review")}
            >
              Review reset
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="settings-reset-review-grid">
            <section>
              <p className="eyebrow">Will reset</p>
              <ul>
                {labels.reset.map((label) => (
                  <li key={label}>{label}</li>
                ))}
              </ul>
            </section>
            <section>
              <p className="eyebrow">Will keep</p>
              <ul>
                {labels.keep.map((label) => (
                  <li key={label}>{label}</li>
                ))}
              </ul>
            </section>
          </div>

          {impact && (
            <div className="settings-reset-impact">
              <span>
                <strong>{impact.selectedQuizCount}</strong>
                quiz sections with saved data
              </span>
              <span>
                <strong>{impact.selectedQuizAnswerCount}</strong>
                saved quiz answers
              </span>
              <span>
                <strong>{impact.catalogPreferenceCount}</strong>
                catalog preferences
              </span>
              <span>
                <strong>{impact.rankingComparisonCount}</strong>
                pairwise comparisons
              </span>
            </div>
          )}

          <p className="settings-reset-warning">
            This changes only the selected authoritative sources. Derived profile views will
            recompute from whatever remains.
          </p>

          <div className="settings-reset-actions">
            <button className="secondary" onClick={() => setStep("select")}>
              Back
            </button>
            <button className="primary settings-reset-confirm" onClick={confirmReset}>
              Reset selected data
            </button>
          </div>
        </>
      )}
    </section>
  );
}
