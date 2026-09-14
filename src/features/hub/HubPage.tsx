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
  catalogRewardsRoute,
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
import { getAnsweredCount, getQuizState } from "../quizzes/quizRuntime";
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

  const hasProfileActivity =
    startedQuizCount > 0 ||
    metrics.catalogRatedCount > 0 ||
    metrics.rankingChoiceCount > 0 ||
    metrics.contextPreferenceCount > 0;

  const randomizerReady = metrics.readyChoiceCount > 0;

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

        {hasProfileActivity ? (
          <>
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
                <div className="hub-home-signal-list" aria-label="Current profile themes">
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
                <p className="hub-home-evidence-label">Profile depth</p>
                <div className="hub-home-evidence" aria-label="Profile depth">
                  <div className="hub-home-evidence-item">
                    <strong>{completedQuizCount}/{quizSummaries.length}</strong>
                    <span>quizzes complete</span>
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

            <div className="hub-home-now-grid hub-home-now-grid-primary">
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
                      ? "That is the most recently touched ambient-safe preference in your profile. If experience changed the answer, update it."
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
                <p>Pick the direction that matches the thought already in your head.</p>
              </div>

              <div className="hub-home-doors">
                <button className="hub-home-door" type="button" onClick={() => navigate(profileRoute.path)}>
                  <IconSparkles className="hub-home-door-icon" size={26} stroke={1.55} aria-hidden="true" />
                  <span><strong>Notice me</strong>See the patterns your current profile is reflecting back.</span>
                  <IconArrowRight className="hub-home-door-arrow" size={18} aria-hidden="true" />
                </button>
                <button className="hub-home-door" type="button" onClick={() => navigate(compareRoute.path)}>
                  <IconUsers className="hub-home-door-icon" size={26} stroke={1.55} aria-hidden="true" />
                  <span><strong>Look at us</strong>Put two profiles beside each other without erasing either person.</span>
                  <IconArrowRight className="hub-home-door-arrow" size={18} aria-hidden="true" />
                </button>
                <button className="hub-home-door" type="button" onClick={() => navigate(sceneBuilderRoute.path)}>
                  <IconDice5 className="hub-home-door-icon" size={26} stroke={1.55} aria-hidden="true" />
                  <span><strong>Give me something to do</strong>Turn what you already know into something playful right now.</span>
                  <IconArrowRight className="hub-home-door-arrow" size={18} aria-hidden="true" />
                </button>
                <button className="hub-home-door" type="button" onClick={() => navigate(catalogRoute.path)}>
                  <IconRefresh className="hub-home-door-icon" size={26} stroke={1.55} aria-hidden="true" />
                  <span><strong>I learned something</strong>Update a preference instead of treating your profile like a completed test.</span>
                  <IconArrowRight className="hub-home-door-arrow" size={18} aria-hidden="true" />
                </button>
              </div>
            </section>

            <aside className="hub-home-playground">
              <span className="hub-home-playground-icon" aria-hidden="true">
                <IconDice5 size={24} stroke={1.6} />
              </span>
              <div className="hub-home-playground-copy">
                <p className="eyebrow">Future playful layer</p>
                <h2>Feeling nosy?</h2>
                <p>
                  Small profile-aware moments can live here without turning the Hub into a feature directory.
                </p>
                <div className="hub-home-playground-games" aria-label="Future playful ideas">
                  <span>Mystery pick</span>
                  <span>Vibe Check</span>
                  <span>Hear Me Out</span>
                  <span>Wheel of Maybe</span>
                </div>
              </div>
            </aside>

            <div className="hub-home-now-grid hub-home-now-grid-secondary">
              <article className="hub-home-now">
                <span className="hub-home-now-icon" aria-hidden="true">
                  <IconDice5 size={23} stroke={1.65} />
                </span>
                <div>
                  <p className="eyebrow">Want something immediate?</p>
                  <h2>
                    {randomizerReady
                      ? `${metrics.readyChoiceCount} choices are ready to draw.`
                      : metrics.contextPreferenceCount > 0
                        ? `${metrics.contextPreferenceCount} context choices are taking shape.`
                        : "Teach the randomizer what works for you."}
                  </h2>
                  <p className="hub-home-now-copy">
                    {randomizerReady
                      ? "You already have enough intentionally eligible choices to use the randomizer without doing more setup first."
                      : "Shape a few contextual preferences first, then the randomizer can use only the choices you explicitly made eligible."}
                  </p>
                </div>
                <button
                  className="hub-home-inline-action"
                  type="button"
                  onClick={() =>
                    navigate(
                      randomizerReady
                        ? rewardsToolsRandomizerRoute.path
                        : catalogRewardsRoute.path,
                    )
                  }
                >
                  {randomizerReady ? "Open the randomizer" : "Shape choices"}
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
                    Compare independently-built profiles to surface overlap and differences without turning either person into the other person's settings.
                  </p>
                </div>
                <button className="hub-home-inline-action" type="button" onClick={() => navigate(compareRoute.path)}>
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
                Start wherever feels interesting. Guided quizzes are good for broad patterns; the catalog is good when you already know what you want to react to.
              </p>
            </div>
            <div className="hub-home-empty-actions">
              <button className="hub-home-empty-action" type="button" onClick={() => navigate(quizHomeRoute.path)}>
                <IconSparkles size={24} stroke={1.6} aria-hidden="true" />
                <strong>Start broad</strong>
                <span>Use guided quizzes to surface patterns.</span>
              </button>
              <button className="hub-home-empty-action" type="button" onClick={() => navigate(catalogRoute.path)}>
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
