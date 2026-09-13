import {
  IconArrowRight,
  IconBook2,
  IconDice5,
  IconHeartHandshake,
  IconRefresh,
  IconSparkles,
  IconUsers,
} from "@tabler/icons-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { loadCurrentProfileSnapshot } from "../../app/currentProfileSnapshot";
import {
  catalogRoute,
  compareRoute,
  profileRoute,
  quizHomeRoute,
  quizRoutePath,
  rewardsToolsRandomizerRoute,
  sceneBuilderRoute,
} from "../../app/routes";
import { canonicalSignalDefinitions } from "../../data/canonicalSignals";
import { quizzes } from "../../data/quizzes";
import {
  getCatalogPreference,
  type CatalogPreferenceState,
} from "../../lib/catalogProfile";
import { catalogPreferenceLabels } from "../../lib/catalogResults";
import { loadProfileSettings } from "../../lib/profileSettings";
import { getAnsweredCount, getQuizState } from "../quizzes/quizRuntime";
import "./HubPage.css";

const signalDefinitionById = new Map(
  canonicalSignalDefinitions.map((definition) => [definition.id, definition]),
);

type LatestPreference = {
  label: string;
  state: CatalogPreferenceState;
  updatedAt: string;
};

function latestPreferenceFromSnapshot(
  snapshot: ReturnType<typeof loadCurrentProfileSnapshot>,
): LatestPreference | null {
  return Object.entries(snapshot.catalogProfile.preferences).reduce<LatestPreference | null>(
    (latest, [catalogId, preference]) => {
      const state = getCatalogPreference(preference, "overall");
      if (!state) return latest;

      const candidate = {
        label:
          snapshot.catalogResultView.byCatalogId.get(catalogId)?.item.label ??
          "a catalog item",
        state,
        updatedAt: preference.updatedAt,
      } satisfies LatestPreference;

      if (!latest || candidate.updatedAt > latest.updatedAt) return candidate;
      return latest;
    },
    null,
  );
}

export function HubPage() {
  const navigate = useNavigate();
  const snapshot = useMemo(() => loadCurrentProfileSnapshot(), []);
  const settings = useMemo(() => loadProfileSettings(), []);

  const quizSummaries = useMemo(
    () =>
      quizzes
        .filter((quiz) => quiz.availability === "available")
        .map((quiz) => {
          const answers = snapshot.profile.quizzes[quiz.id]?.answers ?? {};
          return {
            quiz,
            state: getQuizState(quiz, snapshot.profile),
            answeredCount: getAnsweredCount(quiz, answers),
          };
        }),
    [snapshot.profile],
  );

  const completedQuizCount = quizSummaries.filter(
    (summary) => summary.state === "complete",
  ).length;
  const startedQuizCount = quizSummaries.filter(
    (summary) => summary.state !== "not-started",
  ).length;
  const inProgressQuiz = quizSummaries.find(
    (summary) => summary.state === "in-progress",
  );
  const nextQuiz =
    inProgressQuiz ??
    quizSummaries.find((summary) => summary.state === "not-started") ??
    quizSummaries[0];

  const preferenceCount = Object.values(snapshot.catalogProfile.preferences).filter(
    (preference) => getCatalogPreference(preference, "overall") !== undefined,
  ).length;
  const comparisonCount = snapshot.catalogProfile.comparisons.length;
  const latestPreference = useMemo(
    () => latestPreferenceFromSnapshot(snapshot),
    [snapshot],
  );

  const signalsWithEvidence = snapshot.canonicalSignals.filter(
    (signal) => signal.overall.affinity !== null && signal.overall.coverage > 0,
  );
  const topSignals = [...signalsWithEvidence]
    .sort(
      (left, right) =>
        right.overall.coverage - left.overall.coverage ||
        (right.overall.affinity ?? 0) - (left.overall.affinity ?? 0),
    )
    .slice(0, 3);

  const hasProfileActivity =
    startedQuizCount > 0 || preferenceCount > 0 || comparisonCount > 0;

  return (
    <main className="app-shell hub-home">
      <section className="hub-home-stack">
        <header className="hub-home-intro">
          <div className="hub-home-intro-copy">
            <p className="eyebrow">Your home</p>
            <h1>Hey, {settings.displayName}.</h1>
            <p className="hub-home-question">
              What are you curious about today?
            </p>
          </div>
          <div className="hub-home-spark" aria-hidden="true">
            <IconSparkles size={38} stroke={1.5} />
          </div>
        </header>

        {hasProfileActivity ? (
          <>
            <article className="hub-home-reflection">
              <div className="hub-home-reflection-top">
                <div>
                  <p className="eyebrow">You, lately</p>
                  <h2>Your profile is a snapshot, not a finish line.</h2>
                  <p className="hub-home-reflection-copy">
                    {topSignals.length > 0
                      ? "These are the clearest themes in the evidence you have built so far. Come back when something shifts, surprises you, or just feels worth looking at again."
                      : "You have started leaving breadcrumbs. Keep exploring and this space will start reflecting patterns back to you."}
                  </p>
                </div>
                <IconHeartHandshake
                  size={34}
                  stroke={1.45}
                  aria-hidden="true"
                />
              </div>

              {topSignals.length > 0 && (
                <div className="hub-home-signal-list" aria-label="Current profile themes">
                  {topSignals.map((signal) => (
                    <span className="hub-home-signal" key={signal.signalId}>
                      {signalDefinitionById.get(signal.signalId)?.shortLabel ??
                        signal.signalId.replaceAll("_", " ")}
                    </span>
                  ))}
                </div>
              )}

              <div className="hub-home-evidence" aria-label="Profile depth">
                <div className="hub-home-evidence-item">
                  <strong>
                    {completedQuizCount}/{quizSummaries.length}
                  </strong>
                  <span>guided quizzes complete</span>
                </div>
                <div className="hub-home-evidence-item">
                  <strong>{preferenceCount}</strong>
                  <span>kinks explicitly rated</span>
                </div>
                <div className="hub-home-evidence-item">
                  <strong>{comparisonCount}</strong>
                  <span>ranking choices made</span>
                </div>
                <div className="hub-home-evidence-item">
                  <strong>{signalsWithEvidence.length}</strong>
                  <span>themes with evidence</span>
                </div>
              </div>

              <button
                className="hub-home-inline-action"
                type="button"
                onClick={() => navigate(profileRoute.path)}
              >
                See what your profile says
                <IconArrowRight size={18} stroke={1.8} aria-hidden="true" />
              </button>
            </article>

            <div className="hub-home-now-grid">
              <article className="hub-home-now">
                <span className="hub-home-now-icon" aria-hidden="true">
                  <IconRefresh size={23} stroke={1.65} />
                </span>
                <div>
                  <p className="eyebrow">Pick it back up</p>
                  <h2>
                    {inProgressQuiz
                      ? `Continue ${inProgressQuiz.quiz.shortTitle}`
                      : completedQuizCount === quizSummaries.length
                        ? "Your guided quizzes are caught up"
                        : `Try ${nextQuiz?.quiz.shortTitle ?? "a guided quiz"}`}
                  </h2>
                  <p className="hub-home-now-copy">
                    {inProgressQuiz
                      ? `${inProgressQuiz.answeredCount} of ${inProgressQuiz.quiz.questionIds.length} questions already answered. No need to restart.`
                      : completedQuizCount === quizSummaries.length
                        ? "Nothing is demanding your attention. Revisit a result only when you actually want to."
                        : "A short guided pass can add another angle to the picture without turning the app into homework."}
                  </p>
                </div>
                <button
                  className="hub-home-inline-action"
                  type="button"
                  onClick={() =>
                    navigate(
                      inProgressQuiz
                        ? quizRoutePath(inProgressQuiz.quiz.id)
                        : quizHomeRoute.path,
                    )
                  }
                >
                  {inProgressQuiz ? "Keep going" : "Open quizzes"}
                  <IconArrowRight size={18} stroke={1.8} aria-hidden="true" />
                </button>
              </article>

              <article className="hub-home-now">
                <span className="hub-home-now-icon" aria-hidden="true">
                  <IconBook2 size={23} stroke={1.65} />
                </span>
                <div>
                  <p className="eyebrow">Changed your mind?</p>
                  <h2>
                    {latestPreference
                      ? `${latestPreference.label} · ${catalogPreferenceLabels[latestPreference.state]}`
                      : "Your catalog can change with you"}
                  </h2>
                  <p className="hub-home-now-copy">
                    {latestPreference
                      ? "That is the most recently touched direct preference in your profile. If experience changed the answer, update it instead of preserving old-you forever."
                      : "Rate something when you learn something. The point is an honest current snapshot, not permanent answers."}
                  </p>
                </div>
                <button
                  className="hub-home-inline-action"
                  type="button"
                  onClick={() => navigate(catalogRoute.path)}
                >
                  Refine your catalog
                  <IconArrowRight size={18} stroke={1.8} aria-hidden="true" />
                </button>
              </article>
            </div>

            <section className="hub-home-door-section" aria-labelledby="hub-home-door-title">
              <div className="hub-home-door-heading">
                <div>
                  <p className="eyebrow">Why did you open the app?</p>
                  <h2 id="hub-home-door-title">What kind of night is it?</h2>
                </div>
                <p>
                  You do not need a task list. Pick the direction that matches the
                  thought already in your head.
                </p>
              </div>

              <div className="hub-home-doors">
                <button
                  className="hub-home-door"
                  type="button"
                  onClick={() => navigate(profileRoute.path)}
                >
                  <IconSparkles className="hub-home-door-icon" size={26} stroke={1.55} aria-hidden="true" />
                  <span>
                    <strong>Notice me</strong>
                    See the patterns your current profile is reflecting back.
                  </span>
                  <IconArrowRight className="hub-home-door-arrow" size={18} aria-hidden="true" />
                </button>

                <button
                  className="hub-home-door"
                  type="button"
                  onClick={() => navigate(compareRoute.path)}
                >
                  <IconUsers className="hub-home-door-icon" size={26} stroke={1.55} aria-hidden="true" />
                  <span>
                    <strong>Look at us</strong>
                    Put two profiles beside each other without erasing either person.
                  </span>
                  <IconArrowRight className="hub-home-door-arrow" size={18} aria-hidden="true" />
                </button>

                <button
                  className="hub-home-door"
                  type="button"
                  onClick={() => navigate(sceneBuilderRoute.path)}
                >
                  <IconDice5 className="hub-home-door-icon" size={26} stroke={1.55} aria-hidden="true" />
                  <span>
                    <strong>Give me something to do</strong>
                    Turn what you already know into something playful right now.
                  </span>
                  <IconArrowRight className="hub-home-door-arrow" size={18} aria-hidden="true" />
                </button>

                <button
                  className="hub-home-door"
                  type="button"
                  onClick={() => navigate(catalogRoute.path)}
                >
                  <IconRefresh className="hub-home-door-icon" size={26} stroke={1.55} aria-hidden="true" />
                  <span>
                    <strong>I learned something</strong>
                    Update a preference instead of treating your profile like a completed test.
                  </span>
                  <IconArrowRight className="hub-home-door-arrow" size={18} aria-hidden="true" />
                </button>
              </div>
            </section>

            <aside className="hub-home-playground">
              <span className="hub-home-playground-icon" aria-hidden="true">
                <IconDice5 size={24} stroke={1.6} />
              </span>
              <div className="hub-home-playground-copy">
                <p className="eyebrow">Future playful layer · prototype</p>
                <h2>Feeling nosy?</h2>
                <p>
                  This is where the profile stops only describing you and starts
                  becoming a toybox: tiny games that use your real curiosities,
                  preferences, and shared context as the material.
                </p>
                <div className="hub-home-playground-games" aria-label="Example future mini games">
                  <span>Mystery Kink</span>
                  <span>Vibe Check</span>
                  <span>Hear Me Out</span>
                  <span>Wheel of Maybe</span>
                </div>
              </div>
            </aside>

            <div className="hub-home-now-grid">
              <article className="hub-home-now">
                <span className="hub-home-now-icon" aria-hidden="true">
                  <IconDice5 size={23} stroke={1.65} />
                </span>
                <div>
                  <p className="eyebrow">Want something immediate?</p>
                  <h2>Use what you already know.</h2>
                  <p className="hub-home-now-copy">
                    Build a scene from your profile, or pull from the reward and
                    punishment tools without doing more self-analysis first.
                  </p>
                </div>
                <button
                  className="hub-home-inline-action"
                  type="button"
                  onClick={() => navigate(rewardsToolsRandomizerRoute.path)}
                >
                  Open the randomizer
                  <IconArrowRight size={18} stroke={1.8} aria-hidden="true" />
                </button>
              </article>

              <article className="hub-home-now">
                <span className="hub-home-now-icon" aria-hidden="true">
                  <IconUsers size={23} stroke={1.65} />
                </span>
                <div>
                  <p className="eyebrow">Together</p>
                  <h2>Your profile does not have to live alone.</h2>
                  <p className="hub-home-now-copy">
                    Compare independently-built profiles to surface overlap,
                    differences, and useful conversation without turning either
                    person into the other person's settings.
                  </p>
                </div>
                <button
                  className="hub-home-inline-action"
                  type="button"
                  onClick={() => navigate(compareRoute.path)}
                >
                  Compare profiles
                  <IconArrowRight size={18} stroke={1.8} aria-hidden="true" />
                </button>
              </article>
            </div>
          </>
        ) : (
          <article className="hub-home-empty">
            <div>
              <p className="eyebrow">Blank canvas</p>
              <h2>There is nothing to “complete” here.</h2>
              <p>
                Start wherever feels interesting. Guided quizzes are good for
                broad patterns; the catalog is good when you already know what
                you want to react to. Either path gives this home something real
                to reflect back later.
              </p>
            </div>
            <div className="hub-home-empty-actions">
              <button
                className="hub-home-empty-action"
                type="button"
                onClick={() => navigate(quizHomeRoute.path)}
              >
                <IconSparkles size={24} stroke={1.6} aria-hidden="true" />
                <strong>Start broad</strong>
                <span>Use guided quizzes to surface patterns.</span>
              </button>
              <button
                className="hub-home-empty-action"
                type="button"
                onClick={() => navigate(catalogRoute.path)}
              >
                <IconBook2 size={24} stroke={1.6} aria-hidden="true" />
                <strong>Start specific</strong>
                <span>Browse the catalog and react to whatever catches you.</span>
              </button>
            </div>
          </article>
        )}
      </section>
    </main>
  );
}
