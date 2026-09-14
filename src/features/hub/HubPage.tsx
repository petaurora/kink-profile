import {
  IconArrowRight,
  IconArrowsExchange,
  IconBook2,
  IconChecklist,
  IconDice5,
  IconFlame,
  IconHeart,
  IconHeartHandshake,
  IconKey,
  IconLock,
  IconMoodSmile,
  IconPaw,
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
import {
  overallFacetDefinitions,
  type OverallFacetId,
} from "../../data/overallFacets";
import { quizzes } from "../../data/quizzes";
import {
  getCatalogPreference,
  type CatalogPreferenceState,
} from "../../lib/catalogProfile";
import { catalogPreferenceLabels } from "../../lib/catalogResults";
import { scoreOverallFacets } from "../../lib/overallProfileFacets";
import { buildProfileHeaderModel } from "../../lib/profileHeader";
import { loadProfileSettings } from "../../lib/profileSettings";
import { resolveQuizLifecycle } from "../quizzes/quizRuntime";
import {
  buildHubComposition,
  hubHasModule,
  type HubIntentDoorId,
} from "./hubComposition";
import { buildHubMetrics } from "./hubMetrics";
import "./HubPage.css";

const facetDefinitionById = new Map(
  overallFacetDefinitions.map((definition) => [definition.id, definition]),
);

const facetIconById: Record<OverallFacetId, typeof IconSparkles> = {
  power_exchange: IconArrowsExchange,
  structure_protocol: IconChecklist,
  ownership_belonging: IconKey,
  service_devotion: IconHeartHandshake,
  care_nurture: IconHeart,
  play_resistance: IconMoodSmile,
  primal_instinctive: IconPaw,
  restraint_physical_control: IconLock,
  intensity_pain: IconFlame,
};

type LatestPreference = {
  label: string;
  state: CatalogPreferenceState;
  updatedAt: string;
};

function latestAmbientPreference(
  snapshot: ReturnType<typeof loadCurrentProfileSnapshot>,
): LatestPreference | null {
  return Object.entries(snapshot.catalogProfile.preferences).reduce<LatestPreference | null>(
    (latest, [catalogId, preference]) => {
      const state = getCatalogPreference(preference, "overall");
      // Hard limits protect downstream experiences but are never ambient Hub content.
      if (!state || state === "hard_limit") return latest;

      const candidate = {
        label:
          snapshot.catalogResultView.byCatalogId.get(catalogId)?.item.label ??
          "a catalog item",
        state,
        updatedAt: preference.updatedAt,
      } satisfies LatestPreference;

      return !latest || candidate.updatedAt > latest.updatedAt ? candidate : latest;
    },
    null,
  );
}

export function HubPage() {
  const navigate = useNavigate();
  const snapshot = useMemo(() => loadCurrentProfileSnapshot(), []);
  const settings = useMemo(() => loadProfileSettings(), []);
  const metrics = useMemo(() => buildHubMetrics(snapshot), [snapshot]);
  const latestPreference = useMemo(
    () => latestAmbientPreference(snapshot),
    [snapshot],
  );
  const overallFacets = useMemo(
    () => scoreOverallFacets(snapshot.canonicalSignals),
    [snapshot.canonicalSignals],
  );
  const profileHeader = useMemo(
    () => buildProfileHeaderModel(snapshot.canonicalSignals, overallFacets),
    [overallFacets, snapshot.canonicalSignals],
  );
  const strongestThemes = useMemo(
    () =>
      profileHeader.strongestFacetIds.flatMap((facetId) => {
        const facet = facetDefinitionById.get(facetId);
        return facet ? [facet] : [];
      }),
    [profileHeader.strongestFacetIds],
  );

  const quizSummaries = useMemo(
    () =>
      quizzes
        .filter((quiz) => quiz.availability === "available")
        .map((quiz) => {
          const lifecycle = resolveQuizLifecycle(quiz, snapshot.profile);
          return {
            quiz,
            state: lifecycle.state,
            answeredCount: lifecycle.answeredCount,
            totalQuestions: lifecycle.totalQuestions,
            hasEstablishedResult: lifecycle.hasEstablishedResult,
          };
        }),
    [snapshot.profile],
  );

  const completedQuizCount = quizSummaries.filter(
    (summary) => summary.hasEstablishedResult,
  ).length;
  const resumableQuiz = quizSummaries.find(
    (summary) =>
      summary.state === "in-progress" ||
      summary.state === "retake-in-progress",
  );
  const randomizerReady = metrics.readyChoiceCount > 0;
  const composition = useMemo(
    () =>
      buildHubComposition({
        maturity: profileHeader.maturity.kind,
        hasResumableQuiz: resumableQuiz !== undefined,
        hasLatestPreference: latestPreference !== null,
        randomizerReady,
      }),
    [
      latestPreference,
      profileHeader.maturity.kind,
      randomizerReady,
      resumableQuiz,
    ],
  );

  const renderIntentDoor = (doorId: HubIntentDoorId) => {
    switch (doorId) {
      case "profile":
        return (
          <button
            className="hub-home-door"
            type="button"
            key={doorId}
            onClick={() => navigate(profileRoute.path)}
          >
            <IconSparkles
              className="hub-home-door-icon"
              size={26}
              stroke={1.55}
              aria-hidden="true"
            />
            <span>
              <strong>Notice me</strong>
              See the patterns your current profile is reflecting back.
            </span>
            <IconArrowRight
              className="hub-home-door-arrow"
              size={18}
              aria-hidden="true"
            />
          </button>
        );
      case "compare":
        return (
          <button
            className="hub-home-door"
            type="button"
            key={doorId}
            onClick={() => navigate(compareRoute.path)}
          >
            <IconUsers
              className="hub-home-door-icon"
              size={26}
              stroke={1.55}
              aria-hidden="true"
            />
            <span>
              <strong>Look at us</strong>
              Put two profiles beside each other without erasing either person.
            </span>
            <IconArrowRight
              className="hub-home-door-arrow"
              size={18}
              aria-hidden="true"
            />
          </button>
        );
      case "scene-builder":
        return (
          <button
            className="hub-home-door"
            type="button"
            key={doorId}
            onClick={() => navigate(sceneBuilderRoute.path)}
          >
            <IconDice5
              className="hub-home-door-icon"
              size={26}
              stroke={1.55}
              aria-hidden="true"
            />
            <span>
              <strong>Give me something to do</strong>
              Turn what you already know into something playful right now.
            </span>
            <IconArrowRight
              className="hub-home-door-arrow"
              size={18}
              aria-hidden="true"
            />
          </button>
        );
      case "catalog":
        return (
          <button
            className="hub-home-door"
            type="button"
            key={doorId}
            onClick={() => navigate(catalogRoute.path)}
          >
            <IconRefresh
              className="hub-home-door-icon"
              size={26}
              stroke={1.55}
              aria-hidden="true"
            />
            <span>
              <strong>I learned something</strong>
              Update a preference instead of treating your profile like a completed test.
            </span>
            <IconArrowRight
              className="hub-home-door-arrow"
              size={18}
              aria-hidden="true"
            />
          </button>
        );
    }
  };

  const showPrimaryNowGrid =
    hubHasModule(composition, "quiz-resume") ||
    hubHasModule(composition, "latest-preference");

  return (
    <main className="app-shell hub-home">
      <section className="hub-home-stack">
        <header className="hub-home-intro">
          <div className="hub-home-intro-copy">
            <p className="eyebrow">Your home</p>
            <h1>Hey, {settings.displayName}.</h1>
            <p className="hub-home-question">What are you curious about today?</p>
          </div>
          <div className="hub-home-spark" aria-hidden="true">
            <IconSparkles size={38} stroke={1.5} />
          </div>
        </header>

        {hubHasModule(composition, "onboarding") ? (
          <article className="hub-home-empty">
            <div>
              <p className="eyebrow">Blank canvas</p>
              <h2>There is nothing to “complete” here.</h2>
              <p>
                Start wherever feels interesting. Guided quizzes are good for broad
                patterns; the catalog is good when you already know what you want to
                react to.
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
        ) : (
          <>
            {hubHasModule(composition, "reflection") && (
              <article className="hub-home-reflection">
                <div className="hub-home-reflection-top">
                  <div>
                    <p className="eyebrow">You, lately</p>
                    <h2>Your profile is a snapshot, not a finish line.</h2>
                    <p className="hub-home-reflection-copy">
                      {strongestThemes.length > 0
                        ? "These are the same strongest overall themes reflected on your Profile, balancing affinity with how much evidence supports them. Come back when something shifts, surprises you, or feels worth looking at again."
                        : "You have started leaving breadcrumbs. Keep exploring and this space will start reflecting patterns back to you."}
                    </p>
                  </div>
                </div>

                {strongestThemes.length > 0 && (
                  <div
                    className="hub-home-signal-list"
                    aria-label="Current profile themes"
                  >
                    {strongestThemes.map((theme) => {
                      const ThemeIcon = facetIconById[theme.id];
                      return (
                        <span className="hub-home-signal" key={theme.id}>
                          <ThemeIcon
                            className="hub-home-signal-icon"
                            size={30}
                            stroke={1.6}
                            aria-hidden="true"
                          />
                          <strong>{theme.label}</strong>
                        </span>
                      );
                    })}
                  </div>
                )}

                <div className="hub-home-evidence-block">
                  <p className="hub-home-evidence-label">Current evidence</p>
                  <div className="hub-home-evidence" aria-label="Current evidence">
                    <div className="hub-home-evidence-item">
                      <strong>
                        {completedQuizCount}/{quizSummaries.length}
                      </strong>
                      <span>quizzes with established results</span>
                    </div>
                    <div className="hub-home-evidence-item">
                      <strong>{metrics.catalogRatedCount}</strong>
                      <span>preferences rated</span>
                    </div>
                    <div className="hub-home-evidence-item">
                      <strong>{metrics.rankingChoiceCount}</strong>
                      <span>ranking choices</span>
                    </div>
                    <div className="hub-home-evidence-item">
                      <strong>{metrics.contextPreferenceCount}</strong>
                      <span>reward/punishment choices</span>
                    </div>
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
            )}

            {showPrimaryNowGrid && (
              <div className="hub-home-now-grid hub-home-now-grid-primary">
                {hubHasModule(composition, "quiz-resume") && resumableQuiz && (
                  <article className="hub-home-now">
                    <span className="hub-home-now-icon" aria-hidden="true">
                      <IconRefresh size={23} stroke={1.65} />
                    </span>
                    <div>
                      <p className="eyebrow">Pick it back up</p>
                      <h2>
                        {resumableQuiz.state === "retake-in-progress"
                          ? `Continue ${resumableQuiz.quiz.shortTitle} retake`
                          : `Continue ${resumableQuiz.quiz.shortTitle}`}
                      </h2>
                      <p className="hub-home-now-copy">
                        {resumableQuiz.answeredCount} of {resumableQuiz.totalQuestions}{" "}
                        {resumableQuiz.state === "retake-in-progress"
                          ? "retake answers saved. Your previous completed result stays active until this retake is finished."
                          : "questions already answered. No need to restart."}
                      </p>
                    </div>
                    <button
                      className="hub-home-inline-action"
                      type="button"
                      onClick={() => navigate(quizRoutePath(resumableQuiz.quiz.id))}
                    >
                      Keep going
                      <IconArrowRight size={18} stroke={1.8} aria-hidden="true" />
                    </button>
                  </article>
                )}

                {hubHasModule(composition, "latest-preference") &&
                  latestPreference && (
                    <article className="hub-home-now">
                      <span className="hub-home-now-icon" aria-hidden="true">
                        <IconBook2 size={23} stroke={1.65} />
                      </span>
                      <div>
                        <p className="eyebrow">Changed your mind?</p>
                        <h2>
                          {latestPreference.label} ·{" "}
                          {catalogPreferenceLabels[latestPreference.state]}
                        </h2>
                        <p className="hub-home-now-copy">
                          That is the most recently touched ambient-safe preference in
                          your profile. If experience changed the answer, update it.
                        </p>
                      </div>
                      <button
                        className="hub-home-inline-action"
                        type="button"
                        onClick={() => navigate(catalogRoute.path)}
                      >
                        Refine your catalog
                        <IconArrowRight
                          size={18}
                          stroke={1.8}
                          aria-hidden="true"
                        />
                      </button>
                    </article>
                  )}
              </div>
            )}

            {hubHasModule(composition, "intent-doors") && (
              <section
                className="hub-home-door-section"
                aria-labelledby="hub-home-door-title"
              >
                <div className="hub-home-door-heading">
                  <div>
                    <p className="eyebrow">Why did you open the app?</p>
                    <h2 id="hub-home-door-title">What kind of night is it?</h2>
                  </div>
                  <p>Pick the direction that matches the thought already in your head.</p>
                </div>

                <div className="hub-home-doors">
                  {composition.intentDoors.map(renderIntentDoor)}
                </div>
              </section>
            )}

            {hubHasModule(composition, "randomizer") && (
              <div className="hub-home-now-grid hub-home-now-grid-secondary">
                <article className="hub-home-now">
                  <span className="hub-home-now-icon" aria-hidden="true">
                    <IconDice5 size={23} stroke={1.65} />
                  </span>
                  <div>
                    <p className="eyebrow">Want something immediate?</p>
                    <h2>{metrics.readyChoiceCount} choices are ready to draw.</h2>
                    <p className="hub-home-now-copy">
                      You already have intentionally eligible choices, so the
                      randomizer can be useful right now without asking you to do setup
                      first.
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
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
