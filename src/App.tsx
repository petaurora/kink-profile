import { useEffect, useMemo, useState } from "react";
import {
  IconAdjustmentsHeart,
  IconBolt,
  IconHeart,
  IconMasksTheater,
  IconTransfer,
} from "@tabler/icons-react";
import { RankingMovementIndicator } from "./RankingMovementIndicator";
import { KinkCatalogPreferences } from "./KinkCatalogPreferences";
import { KinkThisOrThat } from "./KinkThisOrThat";
import { RewardPunishmentProfiles } from "./RewardPunishmentProfiles";
import { RewardPunishmentProfileSummary } from "./RewardPunishmentProfileSummary";
import { SceneBuilder } from "./SceneBuilder";
import { ProfileComparisonPage } from "./ProfileComparisonPage";
import { CurationWorkbench } from "./CurationWorkbench";
import {
  SiteHeader,
  type SiteHeaderDestination,
} from "./SiteHeader";
import { answerOptions } from "./data/quizScale";
import { dsSignals } from "./data/dsQuiz";
import {
  bondageDisciplineSignalIds,
  bondageRadarSignalIds,
  disciplineRadarSignalIds,
} from "./data/bondageDisciplineQuiz";
import {
  givingSmRadarSignalIds,
  receivingSmRadarSignalIds,
  sadismMasochismSignalIds,
} from "./data/sadismMasochismQuiz";
import {
  dynamicModes,
  partnerPositionedRoleHeadspaceIds,
  headspaceSignalIds,
  selfPositionedRoleHeadspaceIds,
  roleHeadspaces,
} from "./data/headspacesQuiz";
import { getSignals } from "./data/signals";
import {
  isWeightedQuestion,
  quizQuestions,
  type QuizQuestion,
} from "./data/quizQuestions";
import {
  getQuiz,
  quizzes,
  type QuizDefinition,
  type QuizId,
} from "./data/quizzes";
import { kinkCategories } from "./data/kinkCatalog.generated";
import {
  loadProfile,
  saveProfile,
  type AnswerMap,
  type StoredProfile,
} from "./lib/profileStorage";
import { loadCatalogProfile } from "./lib/catalogProfileStorage";
import { buildCanonicalSignalProfile } from "./lib/overallProfileSignals";
import { scoreOverallFacets } from "./lib/overallProfileFacets";
import { buildProfileHeaderModel } from "./lib/profileHeader";
import {
  buildOverallRadarModel,
  calculateOverallFacetProminence,
  getKnownRadarRuns,
  type OverallRadarAxis,
} from "./lib/overallRadar";
import type { OverallFacetId } from "./data/overallFacets";
import { buildProfileRoleDetails } from "./lib/profileRoleDetails";
import {
  buildProfileExplainability,
  type ProfileExplainabilityAction,
} from "./lib/profileExplainability";
import {
  buildCatalogResultView,
  catalogPreferenceLabels,
} from "./lib/catalogResults";
import { buildProfileTopInterests } from "./lib/profileTopInterests";
import {
  calculateRankingMovement,
  getPreviousComparableRankingSnapshot,
} from "./lib/kinkRankingMovement";
import { buildProfileHardLimits } from "./lib/profileHardLimits";
import { buildProfileInterestAreas } from "./lib/profileInterestAreas";
import {
  allCatalogDrilldown,
  categoryDrilldown,
  normalizeCatalogDrilldown,
  preferenceDrilldown,
  type CatalogDrilldownTarget,
} from "./lib/catalogDrilldown";
import {
  scoreDsSignals,
  scoreHeadspaces,
  scoreSignals,
} from "./lib/scoring";

export type Screen =
  | "hub"
  | "quiz"
  | "results"
  | "profile"
  | "catalog"
  | "ranking"
  | "rewards-punishments"
  | "scene-builder"
  | "compare-profiles"
  | "curation-workbench";

type AppProps = {
  initialScreen?: Screen;
  displayName: string;
  onOpenSettings: (returnScreen: Screen) => void;
};
type Score = {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  percentage: number;
  coverage?: number;
};
type QuizState = "not-started" | "in-progress" | "complete" | "coming-soon";

function QuizGlyph({ name, size = 26 }: { name: string; size?: number }) {
  const props = { size, stroke: 1.8, "aria-hidden": true as const };

  switch (name) {
    case "adjustments-heart":
      return <IconAdjustmentsHeart {...props} />;
    case "transfer":
      return <IconTransfer {...props} />;
    case "bolt":
      return <IconBolt {...props} />;
    case "masks-theater":
      return <IconMasksTheater {...props} />;
    default:
      return <IconHeart {...props} />;
  }
}

const kinkCategoryIds = new Set(kinkCategories.map((category) => category.id));

function scoreLabel(score: number, weighted = false) {
  if (score >= 80) return weighted ? "Very strong" : "Core";
  if (score >= 60) return "Strong";
  if (score >= 40) return weighted ? "Contextual" : "Curious";
  if (score >= 20) return "Low";
  return weighted ? "Little signal" : "Not for me";
}

function getQuestionsForQuiz(quiz: QuizDefinition): QuizQuestion[] {
  const ids = new Set(quiz.questionIds);
  return quizQuestions.filter((question) => ids.has(question.id));
}

function getAnsweredCount(quiz: QuizDefinition, answers: AnswerMap) {
  return quiz.questionIds.filter((questionId) => answers[questionId] !== undefined).length;
}

function getQuizState(quiz: QuizDefinition, profile: StoredProfile): QuizState {
  if (quiz.availability === "coming-soon") return "coming-soon";

  const answers = profile.quizzes[quiz.id]?.answers ?? {};
  const answeredCount = getAnsweredCount(quiz, answers);

  if (answeredCount === 0) return "not-started";
  if (quiz.questionIds.length > 0 && answeredCount >= quiz.questionIds.length) return "complete";
  return "in-progress";
}

function stateLabel(state: QuizState) {
  switch (state) {
    case "complete":
      return "Complete";
    case "in-progress":
      return "In progress";
    case "coming-soon":
      return "Coming soon";
    default:
      return "Not started";
  }
}

function RadarChart({
  scores,
  ariaLabel = "Preference radar chart",
}: {
  scores: Score[];
  ariaLabel?: string;
}) {
  const size = 360;
  const center = size / 2;
  const radius = 118;

  const pointFor = (index: number, scale = 1) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / scores.length;
    return [
      center + Math.cos(angle) * radius * scale,
      center + Math.sin(angle) * radius * scale,
    ];
  };

  const polygon = (scale: number) =>
    scores.map((_, index) => pointFor(index, scale).join(",")).join(" ");

  const scorePolygon = scores
    .map((score, index) => pointFor(index, score.percentage / 100).join(","))
    .join(" ");

  return (
    <div className="radar-wrap">
      <svg
        className="radar"
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={ariaLabel}
      >
        {[0.25, 0.5, 0.75, 1].map((ring) => (
          <polygon key={ring} points={polygon(ring)} className="radar-ring" />
        ))}

        {scores.map((score, index) => {
          const [x, y] = pointFor(index, 1);
          const [labelX, labelY] = pointFor(index, 1.28);

          return (
            <g key={score.id}>
              <line x1={center} y1={center} x2={x} y2={y} className="radar-axis" />
              <text
                x={labelX}
                y={labelY}
                textAnchor={
                  labelX < center - 8 ? "end" : labelX > center + 8 ? "start" : "middle"
                }
                dominantBaseline="middle"
                className="radar-label"
              >
                {score.shortLabel}
              </text>
            </g>
          );
        })}

        <polygon points={scorePolygon} className="radar-score" />
        {scores.map((score, index) => {
          const [x, y] = pointFor(index, score.percentage / 100);
          return <circle key={score.id} cx={x} cy={y} r="4" className="radar-point" />;
        })}
      </svg>
    </div>
  );
}

function OverallRadarChart({
  axes,
  onSelectFacet,
}: {
  axes: readonly OverallRadarAxis[];
  onSelectFacet: (facetId: OverallFacetId) => void;
}) {
  const size = 460;
  const center = size / 2;
  const radius = 148;

  const pointFor = (index: number, scale = 1) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / axes.length;
    return [
      center + Math.cos(angle) * radius * scale,
      center + Math.sin(angle) * radius * scale,
    ];
  };

  const ringPoints = (scale: number) =>
    axes.map((_, index) => pointFor(index, scale).join(",")).join(" ");
  const knownRuns = getKnownRadarRuns(axes);
  const completeShape =
    axes.length > 0 && axes.every((axis) => axis.state !== "unknown");

  const selectFromKeyboard = (
    event: React.KeyboardEvent<SVGGElement>,
    facetId: OverallFacetId,
  ) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onSelectFacet(facetId);
  };

  return (
    <div className="overall-radar-wrap">
      <svg
        className="overall-radar"
        viewBox={`0 0 ${size} ${size}`}
        role="group"
        aria-label="Overall profile radar. Each axis opens an explanation for that theme."
      >
        {[0.25, 0.5, 0.75, 1].map((ring) => (
          <polygon
            key={ring}
            points={ringPoints(ring)}
            className="overall-radar-ring"
          />
        ))}

        {axes.map((axis, index) => {
          const [x, y] = pointFor(index, 1);
          const [labelX, labelY] = pointFor(index, 1.25);

          return (
            <g
              key={axis.facetId}
              className={`overall-radar-axis-group state-${axis.state}`}
              role="button"
              tabIndex={0}
              aria-label={`${axis.label}: ${
                axis.affinity === null
                  ? "not explored yet"
                  : `${axis.affinity}% affinity, ${
                      axis.state === "limited"
                        ? "limited evidence"
                        : "evidence available"
                    }`
              }. Open theme explanation.`}
              onClick={() => onSelectFacet(axis.facetId)}
              onKeyDown={(event) => selectFromKeyboard(event, axis.facetId)}
            >
              <line
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                className="overall-radar-axis"
              />
              <text
                x={labelX}
                y={labelY}
                textAnchor={
                  labelX < center - 8
                    ? "end"
                    : labelX > center + 8
                      ? "start"
                      : "middle"
                }
                dominantBaseline="middle"
                className="overall-radar-label"
              >
                {axis.shortLabel}
              </text>
            </g>
          );
        })}

        {completeShape ? (
          <polygon
            points={axes
              .map((axis, index) =>
                pointFor(index, (axis.prominence ?? 0) / 100).join(","),
              )
              .join(" ")}
            className="overall-radar-score"
          />
        ) : (
          knownRuns.map((run, index) => (
            <polyline
              key={`run-${index}`}
              points={run
                .map((axisIndex) => {
                  const axis = axes[axisIndex];
                  return pointFor(
                    axisIndex,
                    (axis.prominence ?? 0) / 100,
                  ).join(",");
                })
                .join(" ")}
              className="overall-radar-score-partial"
            />
          ))
        )}

        {axes.map((axis, index) => {
          if (axis.prominence === null) return null;
          const [x, y] = pointFor(index, axis.prominence / 100);

          return (
            <circle
              key={`point-${axis.facetId}`}
              cx={x}
              cy={y}
              r={axis.state === "limited" ? 5 : 4}
              className={`overall-radar-point state-${axis.state}`}
            />
          );
        })}
      </svg>
    </div>
  );
}

function QuizCard({
  quiz,
  profile,
  onOpen,
}: {
  quiz: QuizDefinition;
  profile: StoredProfile;
  onOpen: (quiz: QuizDefinition) => void;
}) {
  const state = getQuizState(quiz, profile);
  const answers = profile.quizzes[quiz.id]?.answers ?? {};
  const answeredCount = getAnsweredCount(quiz, answers);
  const progress =
    quiz.questionIds.length > 0 ? Math.round((answeredCount / quiz.questionIds.length) * 100) : 0;

  if (state === "complete") {
    return (
      <article className="quiz-card quiz-card-complete panel quiz-state-complete">
        <span className="quiz-icon" aria-hidden="true">
          <QuizGlyph name={quiz.icon} />
        </span>

        <div className="quiz-card-complete-copy">
          {quiz.eyebrow !== "Core section" && (
            <p className="eyebrow">{quiz.eyebrow}</p>
          )}
          <h2>{quiz.title}</h2>
        </div>

        <span className="status-chip status-complete">Complete</span>

        <button className="secondary compact" onClick={() => onOpen(quiz)}>
          View results
        </button>
      </article>
    );
  }

  return (
    <article className={`quiz-card panel quiz-state-${state}`}>
      <div className="quiz-card-top">
        <span className="quiz-icon" aria-hidden="true">
          <QuizGlyph name={quiz.icon} />
        </span>
        <span className={`status-chip status-${state}`}>{stateLabel(state)}</span>
      </div>

      <div className="quiz-card-copy">
        {quiz.eyebrow !== "Core section" && (
          <p className="eyebrow">{quiz.eyebrow}</p>
        )}
        <h2>{quiz.title}</h2>
        <p>{quiz.description}</p>
      </div>

      <div className="quiz-card-footer">
        <div>
          <strong>
            {quiz.questionIds.length > 0 ? `${quiz.questionIds.length} questions` : "Question bank next"}
          </strong>
          <span>
            {quiz.availability === "available"
              ? `~${quiz.estimatedMinutes} min`
              : "Planned section"}
          </span>
        </div>

        {quiz.availability === "available" ? (
          <button className="primary compact" onClick={() => onOpen(quiz)}>
            {state === "in-progress" ? "Continue" : "Explore"}
          </button>
        ) : (
          <button className="secondary compact" disabled>
            Soon
          </button>
        )}
      </div>

      {state === "in-progress" && (
        <div className="card-progress" aria-label={`${progress}% complete`}>
          <span style={{ width: `${progress}%` }} />
        </div>
      )}
    </article>
  );
}

const defaultQuiz = quizzes.find((quiz) => quiz.contributesToOverall) ?? quizzes[0];

export default function App({
  initialScreen = "hub",
  displayName,
  onOpenSettings,
}: AppProps) {
  const [profile, setProfile] = useState<StoredProfile>(() => loadProfile());
  const [catalogProfileSnapshot, setCatalogProfileSnapshot] = useState(() =>
    loadCatalogProfile(),
  );
  const [screen, setScreen] = useState<Screen>(initialScreen);
  const [rewardPunishmentReturnScreen, setRewardPunishmentReturnScreen] =
    useState<"hub" | "profile">("hub");
  const [activeQuizId, setActiveQuizId] = useState<QuizId>(defaultQuiz.id);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [showAllHeadspaces, setShowAllHeadspaces] = useState(false);
  const [showAllHardLimits, setShowAllHardLimits] = useState(false);
  const [openProfileMovementId, setOpenProfileMovementId] =
    useState<string | null>(null);
  const [catalogDrilldown, setCatalogDrilldown] =
    useState<CatalogDrilldownTarget>(() => allCatalogDrilldown("hub"));

  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  const activeQuiz = getQuiz(activeQuizId) ?? defaultQuiz;
  const activeQuestions = useMemo(() => getQuestionsForQuiz(activeQuiz), [activeQuiz]);
  const answers = profile.quizzes[activeQuiz.id]?.answers ?? {};
  const answeredCount = getAnsweredCount(activeQuiz, answers);
  const currentQuestion = activeQuestions[questionIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const canViewResults =
    activeQuestions.length > 0 && answeredCount >= activeQuestions.length;
  const isHeadspaceQuiz = activeQuiz.id === "roles-headspaces";
  const isDsQuiz = activeQuiz.id === "dominance-submission";
  const isBdQuiz = activeQuiz.id === "bondage-discipline";
  const isSmQuiz = activeQuiz.id === "sadism-masochism";

  const scores = useMemo<Score[]>(() => {
    if (isHeadspaceQuiz) {
      const signalScores = scoreSignals(
        activeQuestions.filter(isWeightedQuestion),
        answers,
        getSignals(headspaceSignalIds),
      );

      return scoreHeadspaces(signalScores, roleHeadspaces).sort(
        (a, b) => b.percentage - a.percentage,
      );
    }

    if (isBdQuiz) {
      return scoreSignals(
        activeQuestions.filter(isWeightedQuestion),
        answers,
        getSignals(bondageDisciplineSignalIds),
      ).sort((a, b) => b.percentage - a.percentage);
    }

    if (isSmQuiz) {
      return scoreSignals(
        activeQuestions.filter(isWeightedQuestion),
        answers,
        getSignals(sadismMasochismSignalIds),
      ).sort((a, b) => b.percentage - a.percentage);
    }

    if (isDsQuiz) {
      return scoreDsSignals(
        activeQuestions.filter(isWeightedQuestion),
        answers,
        dsSignals,
      ).sort((a, b) => b.percentage - a.percentage);
    }

    return [];
  }, [activeQuestions, answers, isBdQuiz, isDsQuiz, isHeadspaceQuiz, isSmQuiz]);

  const radarScores = useMemo(
    () =>
      dsSignals
        .map((signal) => scores.find((score) => score.id === signal.id))
        .filter((score): score is Score => score !== undefined),
    [scores],
  );

  const bondageRadarScores = useMemo(
    () =>
      bondageRadarSignalIds
        .map((id) => scores.find((score) => score.id === id))
        .filter((score): score is Score => score !== undefined),
    [scores],
  );

  const disciplineRadarScores = useMemo(
    () =>
      disciplineRadarSignalIds
        .map((id) => scores.find((score) => score.id === id))
        .filter((score): score is Score => score !== undefined),
    [scores],
  );

  const receivingSmRadarScores = useMemo(
    () =>
      receivingSmRadarSignalIds
        .map((id) => scores.find((score) => score.id === id))
        .filter((score): score is Score => score !== undefined),
    [scores],
  );

  const givingSmRadarScores = useMemo(
    () =>
      givingSmRadarSignalIds
        .map((id) => scores.find((score) => score.id === id))
        .filter((score): score is Score => score !== undefined),
    [scores],
  );

  const selfPositionedHeadspaceRadarScores = useMemo(
    () =>
      selfPositionedRoleHeadspaceIds
        .map((id) => scores.find((score) => score.id === id))
        .filter((score): score is Score => score !== undefined),
    [scores],
  );

  const partnerPositionedHeadspaceRadarScores = useMemo(
    () =>
      partnerPositionedRoleHeadspaceIds
        .map((id) => scores.find((score) => score.id === id))
        .filter((score): score is Score => score !== undefined),
    [scores],
  );

  const dynamicModeScores = useMemo<Score[]>(() => {
    if (!isHeadspaceQuiz) return [];

    const signalScores = scoreSignals(
      activeQuestions.filter(isWeightedQuestion),
      answers,
      getSignals(headspaceSignalIds),
    );

    return scoreHeadspaces(signalScores, dynamicModes).sort(
      (a, b) => b.percentage - a.percentage,
    );
  }, [activeQuestions, answers, isHeadspaceQuiz]);

  const dynamicModeRadarScores = useMemo(
    () =>
      dynamicModes
        .map((mode) => dynamicModeScores.find((score) => score.id === mode.id))
        .filter((score): score is Score => score !== undefined),
    [dynamicModeScores],
  );

  const coreQuizzes = quizzes.filter((quiz) => quiz.contributesToOverall);
  const canonicalSignals = useMemo(
    () => buildCanonicalSignalProfile(profile, catalogProfileSnapshot),
    [catalogProfileSnapshot, profile],
  );

  const overallFacets = useMemo(
    () => scoreOverallFacets(canonicalSignals),
    [canonicalSignals],
  );

  const profileHeader = useMemo(
    () => buildProfileHeaderModel(canonicalSignals, overallFacets),
    [canonicalSignals, overallFacets],
  );

  const overallRadar = useMemo(
    () =>
      buildOverallRadarModel(
        overallFacets,
        profileHeader.strongestFacetIds,
      ),
    [overallFacets, profileHeader.strongestFacetIds],
  );

  const profileRoleDetails = useMemo(
    () => buildProfileRoleDetails(canonicalSignals),
    [canonicalSignals],
  );

  const profileExplainability = useMemo(
    () =>
      buildProfileExplainability(
        canonicalSignals,
        overallFacets,
        profile,
      ),
    [canonicalSignals, overallFacets, profile],
  );

  const visibleHeadspaces = showAllHeadspaces
    ? profileRoleDetails.headspaces
    : profileRoleDetails.featuredHeadspaces;

  const catalogResultView = useMemo(
    () =>
      buildCatalogResultView(
        profile,
        catalogProfileSnapshot,
      ),
    [catalogProfileSnapshot, profile],
  );

  const topOverallInterests = useMemo(
    () => buildProfileTopInterests(catalogResultView),
    [catalogResultView],
  );

  const previousOverallRankingSnapshot = useMemo(
    () =>
      getPreviousComparableRankingSnapshot(
        catalogProfileSnapshot,
        { type: "overall" },
      ),
    [catalogProfileSnapshot],
  );

  const profileHardLimits = useMemo(
    () => buildProfileHardLimits(catalogResultView),
    [catalogResultView],
  );

  const visibleHardLimits = showAllHardLimits
    ? profileHardLimits.all
    : profileHardLimits.featured;

  const profileInterestAreas = useMemo(
    () => buildProfileInterestAreas(catalogResultView, kinkCategories),
    [catalogResultView],
  );

  const openQuiz = (quiz: QuizDefinition) => {
    if (quiz.availability !== "available") return;

    setActiveQuizId(quiz.id);
    const quizAnswers = profile.quizzes[quiz.id]?.answers ?? {};
    const quizQuestions = getQuestionsForQuiz(quiz);
    const firstUnanswered = quizQuestions.findIndex(
      (question) => quizAnswers[question.id] === undefined,
    );

    if (
      firstUnanswered === -1 &&
      quizQuestions.length > 0 &&
      getQuizState(quiz, profile) === "complete"
    ) {
      setQuestionIndex(0);
      setScreen("results");
      return;
    }

    setQuestionIndex(firstUnanswered === -1 ? 0 : firstUnanswered);
    setScreen("quiz");
  };

  const answerQuestion = (value: number) => {
    if (!currentQuestion) return;

    const nextAnswers = { ...answers, [currentQuestion.id]: value };
    const isComplete =
      activeQuiz.questionIds.length > 0 &&
      getAnsweredCount(activeQuiz, nextAnswers) >= activeQuiz.questionIds.length;

    setProfile((previous) => ({
      ...previous,
      quizzes: {
        ...previous.quizzes,
        [activeQuiz.id]: {
          quizVersion: activeQuiz.version,
          answers: nextAnswers,
          completedAt: isComplete
            ? previous.quizzes[activeQuiz.id]?.completedAt ?? new Date().toISOString()
            : undefined,
        },
      },
    }));

    if (questionIndex < activeQuestions.length - 1) {
      setQuestionIndex((index) => index + 1);
    } else {
      setScreen("results");
    }
  };

  const resetActiveQuiz = () => {
    setProfile((previous) => {
      const nextQuizzes = { ...previous.quizzes };
      delete nextQuizzes[activeQuiz.id];

      return {
        ...previous,
        quizzes: nextQuizzes,
      };
    });
    setQuestionIndex(0);
    setScreen("hub");
  };

  const openProfile = () => {
    setCatalogProfileSnapshot(loadCatalogProfile());
    setScreen("profile");
  };

  const openCatalog = (target: CatalogDrilldownTarget) => {
    setCatalogDrilldown(
      normalizeCatalogDrilldown(target, kinkCategoryIds),
    );
    setScreen("catalog");
  };

  const openRewardsPunishments = (
    returnTo: "hub" | "profile" = "hub",
  ) => {
    setCatalogProfileSnapshot(loadCatalogProfile());
    setRewardPunishmentReturnScreen(returnTo);
    setScreen("rewards-punishments");
  };

  const openSceneBuilder = () => {
    setCatalogProfileSnapshot(loadCatalogProfile());
    setScreen("scene-builder");
  };

  const openProfileComparison = () => {
    setCatalogProfileSnapshot(loadCatalogProfile());
    setScreen("compare-profiles");
  };

  const closeCatalog = () => {
    if (catalogDrilldown.returnTo === "profile") {
      openProfile();
      return;
    }

    setScreen("hub");
  };

  const openExplainabilityAction = (
    action: ProfileExplainabilityAction,
  ) => {
    if (action.type === "quiz") {
      const quiz = getQuiz(action.quizId);
      if (quiz) openQuiz(quiz);
      return;
    }

    openCatalog(allCatalogDrilldown());
  };

  const navigateFromHeader = (destination: SiteHeaderDestination) => {
    if (destination === "profile") {
      openProfile();
      return;
    }

    if (destination === "catalog") {
      openCatalog(allCatalogDrilldown("hub"));
      return;
    }

    if (destination === "rewards-punishments") {
      openRewardsPunishments(screen === "profile" ? "profile" : "hub");
      return;
    }

    if (destination === "scene-builder") {
      openSceneBuilder();
      return;
    }

    if (destination === "compare-profiles") {
      openProfileComparison();
      return;
    }

    if (destination === "curation-workbench") {
      setScreen("curation-workbench");
      return;
    }

    setScreen(destination);
  };

  const openFacetDetail = (facetId: OverallFacetId) => {
    const element = document.getElementById(`facet-detail-${facetId}`);
    if (element instanceof HTMLDetailsElement) {
      element.open = true;
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => {
        element
          .querySelector<HTMLElement>("summary")
          ?.focus({ preventScroll: true });
      }, 250);
    }
  };

  return (
    <>
      <SiteHeader
        displayName={displayName}
        activeDestination={
          screen === "quiz" || screen === "results" ? undefined : screen
        }
        onNavigate={navigateFromHeader}
        onOpenSettings={() => onOpenSettings(screen)}
      />

      <main className="app-shell">
      {screen === "hub" && (
        <section className="hub-stack">
          <div className="hub-hero">
            <div>
              <p className="eyebrow">Build it your way</p>
              <h1>Not one giant fucking test.</h1>
              <p className="hero-copy hub-hero-copy-desktop">
                Use guided quizzes to spot patterns, This or That to compare what actually wins,
                and the catalog to get specific. Start anywhere, revisit anything, and refine as
                much or as little as you want.
              </p>
              <p className="hero-copy hub-hero-copy-mobile">
                Explore broadly, configure what works for you, then add context where it matters.
                Revisit anything whenever you want.
              </p>
            </div>
          </div>

          <div className="hub-section-heading">
            <div>
              <p className="eyebrow">01 · Guided exploration</p>
              <h2>Start broad.</h2>
            </div>
            <p>
              Short, focused quizzes help surface the kinds of dynamics and experiences that
              resonate with you. Do one, do them all, or come back later.
            </p>
          </div>

          <div className="quiz-card-grid">
            {coreQuizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} profile={profile} onOpen={openQuiz} />
            ))}
          </div>

          <div className="hub-section-heading catalog-hub-heading">
            <div>
              <p className="eyebrow">02 · Configure your kinks</p>
              <h2>Define what works for you.</h2>
            </div>
            <p>
              Compare interests to discover preference order, then fine-tune individual
              interests and limits directly. Use either path, or both.
            </p>
          </div>

          <div className="catalog-hub-preference-stack">
            <article className="catalog-hub-card catalog-hub-game panel">
              <div>
                <span className="catalog-kicker">Comparative discovery</span>
                <h3>Play This or That</h3>
                <p>
                  Make quick pairwise choices to see what wins when two interests compete.
                  Work within categories first, then compare the strongest choices overall.
                </p>
              </div>
              <button className="primary" onClick={() => setScreen("ranking")}>
                Play This or That
              </button>
            </article>

            <article className="catalog-hub-card catalog-hub-card-compact panel">
              <div className="catalog-hub-compact-copy">
                <span className="catalog-kicker">Detailed refinement</span>
                <h3>Browse & set preferences</h3>
                <p>
                  Fine-tune individual interests, curiosity, uncertainty, and limits directly
                  in the full catalog.
                </p>
              </div>
              <button
                className="secondary compact"
                onClick={() => openCatalog(allCatalogDrilldown("hub"))}
              >
                Browse catalog
              </button>
            </article>
          </div>

          <div className="hub-section-heading catalog-hub-heading">
            <div>
              <p className="eyebrow">03 · Contextual toolbox</p>
              <h2>What works as a reward or punishment?</h2>
            </div>
            <p>
              Classify contextual use separately from your general kink preference. The same
              activity can work as a reward, punishment, both, or neither.
            </p>
          </div>

          <div className="catalog-hub-grid catalog-hub-grid-single">
            <article className="catalog-hub-card panel">
              <div>
                <span className="catalog-kicker">Rewards & Punishments</span>
                <h3>Build the contextual profiles</h3>
                <p>
                  Sort contextual use, rank confirmed options, roll from approved pools,
                  and build reusable reward/punishment recipes without changing general kink preference.
                </p>
              </div>
              <button
                className="primary"
                onClick={() => openRewardsPunishments("hub")}
              >
                Open rewards & punishments
              </button>
            </article>
          </div>

          <div className="hub-section-heading catalog-hub-heading">
            <div>
              <p className="eyebrow">04 · Put it together</p>
              <h2>Build a scene without remembering everything.</h2>
            </div>
            <p>
              Pick the themes that fit the moment and shrink your profile into a
              small, relevant play space. Nothing inferred becomes automatic.
            </p>
          </div>

          <div className="catalog-hub-grid catalog-hub-grid-single">
            <article className="catalog-hub-card panel">
              <div>
                <span className="catalog-kicker">Scene Builder</span>
                <h3>What sounds good right now?</h3>
                <p>
                  Combine themes like Pain + Surrender or Pet + Playful, tune the
                  current vibe, and get a small menu backed by your actual profile.
                </p>
              </div>
              <button
                className="primary"
                onClick={openSceneBuilder}
              >
                Build a scene
              </button>
            </article>
          </div>

          <div className="hub-section-heading catalog-hub-heading">
            <div>
              <p className="eyebrow">05 · Compare profiles</p>
              <h2>See where two profiles overlap and complement.</h2>
            </div>
            <p>
              Upload someone else's Full Profile Export for a temporary,
              non-destructive comparison. Their data is not imported into yours.
            </p>
          </div>

          <div className="catalog-hub-grid catalog-hub-grid-single">
            <article className="catalog-hub-card panel">
              <div>
                <span className="catalog-kicker">Shared profile</span>
                <h3>Compare with someone else</h3>
                <p>
                  Keep both people independent while surfacing mutual interests,
                  complementary patterns, curiosity, different contexts, and boundaries.
                </p>
              </div>
              <button
                className="primary"
                onClick={openProfileComparison}
              >
                Compare profiles
              </button>
            </article>
          </div>
        </section>
      )}

      {screen === "catalog" && (
        <KinkCatalogPreferences
          quizProfile={profile}
          initialFocus={catalogDrilldown}
          closeLabel={
            catalogDrilldown.returnTo === "profile"
              ? "Back to profile"
              : "Back to hub"
          }
          onClose={closeCatalog}
          onPlayRanking={() => setScreen("ranking")}
        />
      )}

      {screen === "ranking" && (
        <KinkThisOrThat
          quizProfile={profile}
          onClose={() => setScreen(rewardPunishmentReturnScreen)}
        />
      )}

      {screen === "rewards-punishments" && (
        <RewardPunishmentProfiles
          catalogProfile={catalogProfileSnapshot}
          catalogResultView={catalogResultView}
          canonicalSignals={canonicalSignals}
          onClose={() => setScreen("hub")}
        />
      )}

      {screen === "scene-builder" && (
        <SceneBuilder
          catalogResultView={catalogResultView}
          onClose={() => setScreen("hub")}
        />
      )}

      {screen === "compare-profiles" && (
        <ProfileComparisonPage
          current={{
            displayName,
            profile,
            catalogProfile: catalogProfileSnapshot,
          }}
          onClose={() => setScreen("hub")}
        />
      )}

      {screen === "curation-workbench" && (
        <CurationWorkbench onClose={() => setScreen("hub")} />
      )}

      {screen === "profile" && (
        <section className="profile-stack">
          <article className="profile-identity-header panel">
            <div className="profile-identity-top">
              <div>
                <p className="eyebrow">Your kink profile</p>
                <h1>{profileHeader.summary}</h1>
              </div>
            </div>

            <div className="profile-trait-grid">
              <section className="profile-trait-group">
                <span className="profile-trait-label">Orientation</span>
                <strong className="profile-orientation">
                  {profileHeader.orientation.label}
                </strong>
              </section>

              <section className="profile-trait-group">
                <span className="profile-trait-label">Headspaces</span>
                {profileHeader.headspaces.length > 0 ? (
                  <div className="profile-trait-chips">
                    {profileHeader.headspaces.map((trait) => (
                      <span className="profile-trait-chip" key={trait.id}>
                        <strong>{trait.label}</strong>
                      </span>
                    ))}
                  </div>
                ) : (
                  <strong className="profile-trait-emerging">Still emerging</strong>
                )}
              </section>

              <section className="profile-trait-group">
                <span className="profile-trait-label">Dynamic modes</span>
                {profileHeader.dynamicModes.length > 0 ? (
                  <div className="profile-trait-chips">
                    {profileHeader.dynamicModes.map((trait) => (
                      <span className="profile-trait-chip" key={trait.id}>
                        <strong>{trait.label}</strong>
                      </span>
                    ))}
                  </div>
                ) : (
                  <strong className="profile-trait-emerging">Still emerging</strong>
                )}
              </section>
            </div>
          </article>

          <article className="overall-radar-panel panel">
            <div className="overall-radar-heading">
              <div>
                <p className="eyebrow">Overall profile</p>
                <h2>The shape of your profile.</h2>
              </div>
              <p>
                Each axis is one broad theme. Shape uses affinity adjusted by
                evidence coverage; unexplored axes stay blank instead of being
                treated as zero.
              </p>
            </div>

            <OverallRadarChart
              axes={overallRadar.axes}
              onSelectFacet={openFacetDetail}
            />

            <div className="overall-radar-footer">
              <div>
                <span className="profile-trait-label">Strongest themes</span>
                {overallRadar.strongestThemes.length > 0 ? (
                  <div className="overall-radar-theme-list">
                    {overallRadar.strongestThemes.map((theme) => (
                      <button
                        key={theme.facetId}
                        type="button"
                        className="overall-radar-theme"
                        onClick={() => openFacetDetail(theme.facetId)}
                      >
                        {theme.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <strong className="profile-trait-emerging">Still emerging</strong>
                )}
              </div>

              {!overallRadar.hasCompleteShape && (
                <p className="overall-radar-partial-note">
                  Some facets are still emerging. Blank spokes remain genuinely
                  unknown; outlined points mark results with limited evidence.
                </p>
              )}
            </div>
          </article>

          <section className="profile-role-detail-grid">
            <article className="profile-role-panel panel">
              <div className="profile-role-heading">
                <div>
                  <p className="eyebrow">Recognizable roles</p>
                  <h2>Headspaces</h2>
                </div>
                <p>
                  These scores can overlap. They describe recognizable role and
                  headspace patterns, not one assigned identity or authority position.
                </p>
              </div>

              {visibleHeadspaces.length > 0 ? (
                <div className="profile-role-list">
                  {visibleHeadspaces.map((item, index) => (
                    <div className="profile-role-row" key={item.id}>
                      <span className="profile-role-rank">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="profile-role-main">
                        <div className="profile-role-title">
                          <strong>{item.label}</strong>
                          <span>{item.affinity}%</span>
                        </div>
                        <div className="profile-role-track" aria-hidden="true">
                          <span style={{ width: `${item.affinity}%` }} />
                        </div>
                        {item.state === "limited" && (
                          <small>Limited evidence so far</small>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="profile-role-empty">
                  These headspace patterns are still emerging.
                </p>
              )}

              {profileRoleDetails.headspaces.length >
                profileRoleDetails.featuredHeadspaces.length && (
                <button
                  className="text-button profile-role-toggle"
                  onClick={() =>
                    setShowAllHeadspaces((shown) => !shown)
                  }
                >
                  {showAllHeadspaces ? "Show less" : "Show all headspaces"}
                </button>
              )}
            </article>

            <article className="profile-role-panel panel">
              <div className="profile-role-heading">
                <div>
                  <p className="eyebrow">How it tends to feel</p>
                  <h2>Dynamic modes</h2>
                </div>
                <p>
                  These are overlapping patterns that help explain how different
                  parts of the profile tend to come together.
                </p>
              </div>

              {profileRoleDetails.featuredDynamicModes.length > 0 ? (
                <div className="profile-mode-list">
                  {profileRoleDetails.featuredDynamicModes.map((item) => (
                    <div className="profile-mode-card" key={item.id}>
                      <div>
                        <strong>{item.label}</strong>
                        <span>{item.affinity}%</span>
                      </div>
                      <div className="profile-role-track" aria-hidden="true">
                        <span style={{ width: `${item.affinity}%` }} />
                      </div>
                      {item.state === "limited" && (
                        <small>Limited evidence so far</small>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="profile-role-empty">
                  Dynamic modes are still emerging.
                </p>
              )}
            </article>
          </section>

          <article className="profile-top-interests panel">
            <div className="profile-top-interests-heading">
              <div>
                <p className="eyebrow">Concrete preferences</p>
                <h2>Top Overall</h2>
              </div>
              <p>
                Built only from things you directly marked or ranked. Quiz-derived
                suggestions cannot put something on this list by themselves.
              </p>
            </div>

            {topOverallInterests.length > 0 ? (
              <div className="profile-top-interest-list">
                {topOverallInterests.map((item, index) => (
                  <div className="profile-top-interest-row" key={item.catalogId}>
                    <span className="profile-top-interest-rank">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="profile-top-interest-main">
                      <strong>{item.label}</strong>
                      <div className="profile-top-interest-sources">
                        {item.explicitState && (
                          <span className="profile-source-chip">
                            {catalogPreferenceLabels[item.explicitState]}
                          </span>
                        )}
                        {item.overallRank && (
                          <span className="profile-source-chip profile-source-chip-ranking">
                            <span>This or That · #{item.overallRank.rank}</span>
                            {(() => {
                              const movement = calculateRankingMovement(
                                {
                                  id: item.catalogId,
                                  rank: item.overallRank.rank,
                                  comparisons: item.overallRank.comparisons,
                                },
                                previousOverallRankingSnapshot,
                              );
                              if (!movement) return null;

                              return (
                                <RankingMovementIndicator
                                  movement={movement}
                                  open={openProfileMovementId === item.catalogId}
                                  onToggle={() =>
                                    setOpenProfileMovementId((current) =>
                                      current === item.catalogId
                                        ? null
                                        : item.catalogId,
                                    )
                                  }
                                />
                              );
                            })()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="profile-top-interests-empty">
                No direct Top Overall results yet. Set a few catalog preferences or
                compare finalists in This or That to start building this list.
              </p>
            )}

            <div className="profile-top-interests-footer">
              <span>
                {topOverallInterests.length === 10
                  ? "Showing your current top 10 direct-evidence interests."
                  : `Showing ${topOverallInterests.length} direct-evidence ${
                      topOverallInterests.length === 1 ? "interest" : "interests"
                    } — no filler added.`}
              </span>
              <button
                type="button"
                className="secondary compact"
                onClick={() => openCatalog(allCatalogDrilldown())}
              >
                Refine preferences
              </button>
            </div>
          </article>

          <RewardPunishmentProfileSummary
            canonicalSignals={canonicalSignals}
            catalogResultView={catalogResultView}
            onOpenToolbox={() => openRewardsPunishments("profile")}
          />

          <article className="profile-limits panel">
            <div className="profile-limits-heading">
              <div>
                <p className="eyebrow">Boundaries</p>
                <h2>Hard Limits</h2>
              </div>
              <p>
                Only things you explicitly marked Hard Limit appear here. Low rank,
                uncertainty, and disinterest are not treated as limits.
              </p>
            </div>

            {visibleHardLimits.length > 0 ? (
              <div className="profile-limit-list">
                {visibleHardLimits.map((item) => (
                  <div className="profile-limit-item" key={item.catalogId}>
                    <strong>{item.label}</strong>
                    <span>Hard Limit</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="profile-limits-empty">No hard limits marked.</p>
            )}

            {profileHardLimits.hiddenCount > 0 && (
              <button
                className="text-button profile-limits-toggle"
                onClick={() => setShowAllHardLimits((shown) => !shown)}
              >
                {showAllHardLimits
                  ? "Show less"
                  : `Show all limits (+${profileHardLimits.hiddenCount})`}
              </button>
            )}
          </article>

          <article className="profile-interest-areas panel">
            <div className="profile-interest-areas-heading">
              <div>
                <p className="eyebrow">Category themes</p>
                <h2>Interest Areas</h2>
              </div>
              <p>
                A compact view of the catalog areas with the strongest direct
                evidence. Only a few representative interests are shown here.
              </p>
            </div>

            {profileInterestAreas.length > 0 ? (
              <div className="profile-interest-area-grid">
                {profileInterestAreas.map((area) => (
                  <button
                    type="button"
                    className="profile-interest-area"
                    key={area.categoryId}
                    onClick={() => openCatalog(categoryDrilldown(area.categoryId))}
                  >
                    <span>
                      <strong>{area.label}</strong>
                      <small>Explore category →</small>
                    </span>
                    <p>
                      {area.representativeItems
                        .map((item) => item.label)
                        .join(" · ")}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <p className="profile-interest-areas-empty">
                Interest areas will appear as you directly mark or rank catalog
                items.
              </p>
            )}

            <div className="profile-interest-area-actions">
              <button
                type="button"
                className="secondary compact"
                onClick={() => openCatalog(allCatalogDrilldown())}
              >
                Explore all categories
              </button>

              <div className="profile-interest-shortcuts">
                <span>Quick filters</span>
                <button
                  className="text-button"
                  onClick={() => openCatalog(preferenceDrilldown("curious"))}
                >
                  Curious
                </button>
                <button
                  className="text-button"
                  onClick={() => openCatalog(preferenceDrilldown("unsure"))}
                >
                  Unsure
                </button>
                <button
                  className="text-button"
                  onClick={() => openCatalog(preferenceDrilldown("hard_limit"))}
                >
                  Hard Limits
                </button>
              </div>
            </div>
          </article>

          <article className="profile-explainability panel">
            <div className="profile-explainability-heading">
              <div>
                <p className="eyebrow">Behind the profile</p>
                <h2>Why these themes show up.</h2>
                <p>
                  Affinity describes how strongly a theme currently resonates.
                  Evidence describes how much relevant information is behind that
                  result. A strong score can still be lightly explored.
                </p>
              </div>
            </div>

            <div className="profile-explainability-list">
              {profileExplainability.facets.map((facet) => (
                <details
                  className={`profile-explanation profile-explanation-${facet.evidenceState}`}
                  id={`facet-detail-${facet.facetId}`}
                  key={facet.facetId}
                >
                  <summary>
                    <div className="profile-explanation-name">
                      <strong>{facet.label}</strong>
                      <span>{facet.description}</span>
                    </div>
                    <div className="profile-explanation-summary">
                      <span>
                        <strong>
                          {facet.affinity === null ? "—" : `${facet.affinity}%`}
                        </strong>
                        affinity
                      </span>
                      <span className="profile-evidence-state">
                        {facet.evidenceLabel}
                      </span>
                    </div>
                  </summary>

                  <div className="profile-explanation-detail">
                    <p className="profile-evidence-message">
                      {facet.evidenceMessage}
                      {facet.coverage > 0 && (
                        <span>
                          {" "}Evidence coverage: {facet.coverage}%.
                          {facet.affinity !== null && (
                            <>
                              {" "}Profile-shape prominence:{" "}
                              {calculateOverallFacetProminence(
                                facet.affinity,
                                facet.coverage,
                              )}
                              %.
                            </>
                          )}
                        </span>
                      )}
                    </p>

                    {facet.hasSourceConflict && facet.conflictMessage && (
                      <p className="profile-evidence-conflict">
                        {facet.conflictMessage}
                      </p>
                    )}

                    {facet.contributingSignals.length > 0 && (
                      <section className="profile-explanation-section">
                        <span className="profile-trait-label">
                          What contributes
                        </span>
                        <div className="profile-explanation-signals">
                          {facet.contributingSignals.map((signal) => (
                            <div
                              className="profile-explanation-signal"
                              key={signal.signalId}
                            >
                              <strong>{signal.label}</strong>
                              <span>
                                {signal.affinity}% affinity · {signal.coverage}% evidence
                              </span>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {facet.sources.length > 0 && (
                      <section className="profile-explanation-section">
                        <span className="profile-trait-label">
                          Evidence sources
                        </span>
                        <div className="profile-explanation-sources">
                          {facet.sources.map((source) => (
                            <div
                              className="profile-explanation-source"
                              key={source.id}
                            >
                              <div>
                                <strong>{source.label}</strong>
                                <span>{source.detail}</span>
                              </div>
                              <span>
                                {source.affinity}% signal · {source.evidence}% evidence
                              </span>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {facet.nextStep && (
                      <button
                        className="secondary compact profile-explanation-action"
                        onClick={() =>
                          openExplainabilityAction(facet.nextStep!)
                        }
                      >
                        {facet.nextStep.label}
                      </button>
                    )}
                  </div>
                </details>
              ))}
            </div>

            <details className="profile-exploration-status">
              <summary>
                <div>
                  <strong>Exploration status</strong>
                  <span>
                    Guided sections are shown here only as context for evidence,
                    not as part of your identity.
                  </span>
                </div>
                <strong>
                  {profileExplainability.exploredQuizCount} of{" "}
                  {profileExplainability.totalQuizCount}
                </strong>
              </summary>

              <div className="profile-exploration-list">
                {coreQuizzes.map((quiz) => {
                  const state = getQuizState(quiz, profile);
                  return (
                    <div className="profile-exploration-row" key={quiz.id}>
                      <span className="quiz-icon small">
                        <QuizGlyph name={quiz.icon} size={19} />
                      </span>
                      <div>
                        <strong>{quiz.title}</strong>
                        <span>{stateLabel(state)}</span>
                      </div>
                      {state !== "complete" && (
                        <button
                          className="text-button"
                          onClick={() => openQuiz(quiz)}
                        >
                          {state === "in-progress" ? "Continue" : "Explore"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </details>
          </article>

        </section>
      )}

      {screen === "quiz" && currentQuestion && (
        <section className="quiz-layout">
          <aside className="progress-card panel">
            <button className="back-to-hub" onClick={() => setScreen("hub")}>
              ← Quiz hub
            </button>
            <p className="eyebrow">{activeQuiz.shortTitle}</p>
            <strong>
              {Math.round((answeredCount / activeQuestions.length) * 100)}%
            </strong>
            <div className="progress-track">
              <span
                style={{ width: `${(answeredCount / activeQuestions.length) * 100}%` }}
              />
            </div>
            <p>
              {answeredCount} of {activeQuestions.length} answered
            </p>
          </aside>

          <article className="question-card panel">
            <div className="question-meta">
              <span>
                {isHeadspaceQuiz
                  ? "Roles & inner experience"
                  : isBdQuiz
                    ? "Physical & structural control"
                    : isSmQuiz
                      ? "Pain & intensity"
                      : "Power exchange"}
              </span>
              <span>
                {questionIndex + 1} / {activeQuestions.length}
              </span>
            </div>

            <h1>{currentQuestion.prompt}</h1>

            <div className="answers">
              {answerOptions.map((option) => (
                <button
                  key={option.value}
                  className={currentAnswer === option.value ? "answer selected" : "answer"}
                  onClick={() => answerQuestion(option.value)}
                >
                  <span className="answer-value">{option.value}</span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>

            <div className="quiz-nav">
              <button
                className="text-button"
                onClick={() => setQuestionIndex((index) => Math.max(0, index - 1))}
                disabled={questionIndex === 0}
              >
                ← Back
              </button>
              <button className="text-button" onClick={() => setScreen("hub")}>
                Save & exit
              </button>
            </div>
          </article>
        </section>
      )}

      {screen === "results" && canViewResults && (
        <section className="results-stack">
          <div className="results-heading panel">
            <div>
              <p className="eyebrow">{activeQuiz.title}</p>
              <h1>The shape matters more than any single score.</h1>
              <p>
                {isHeadspaceQuiz
                  ? "These role and headspace affinities can overlap. Pet, Slave, Little, Middle, Brat, Caregiver, Owner, Trainer, and others can all resonate in different contexts — the result is a profile, not one assigned identity."
                  : isBdQuiz
                    ? "Bondage and discipline are scored as distinct physical and structural preferences. Restraint, positioning, constraint control, discipline, accountability, ritual, anticipation, and challenge can all vary independently — and discipline is not treated as pain."
                    : isSmQuiz
                      ? "Pain, physical intensity, endurance, challenge, anticipation, and emotional intensity are scored independently. Receiving and giving can differ sharply, and this section does not assign a Sadist or Masochist identity label."
                      : isDsQuiz
                        ? "These signals are scored independently. High receiving control, giving control, and autonomy can coexist — the shape is the result, not a forced role label."
                        : "This section shows your scored signals from the answers you provided."}
              </p>
            </div>
            <div className="results-heading-actions">
              <button className="secondary" onClick={() => setScreen("quiz")}>
                Edit answers
              </button>
              <button className="primary" onClick={() => setScreen("hub")}>
                Back to hub
              </button>
            </div>
          </div>

          {isHeadspaceQuiz ? (
            <>
              <div className="multi-radar-grid">
                <article className="panel chart-panel">
                  <div className="section-heading">
                    <p className="eyebrow">Self-positioned roles</p>
                    <h2>Headspace radar</h2>
                  </div>
                  <RadarChart
                    scores={selfPositionedHeadspaceRadarScores}
                    ariaLabel="Self-positioned roles and headspaces radar chart"
                  />
                </article>

                <article className="panel chart-panel">
                  <div className="section-heading">
                    <p className="eyebrow">Partner-positioned roles</p>
                    <h2>Headspace radar</h2>
                  </div>
                  <RadarChart
                    scores={partnerPositionedHeadspaceRadarScores}
                    ariaLabel="Partner-positioned roles and headspaces radar chart"
                  />
                </article>

                <article className="panel chart-panel dynamic-radar-panel">
                  <div className="section-heading">
                    <p className="eyebrow">Psychological ingredients</p>
                    <h2>Underlying dynamic modes</h2>
                  </div>
                  <RadarChart
                    scores={dynamicModeRadarScores}
                    ariaLabel="Underlying dynamic modes radar chart"
                  />
                </article>
              </div>

              <article className="panel ranked-panel">
                <div className="section-heading">
                  <p className="eyebrow">Strongest roles & headspaces</p>
                  <h2>Ranked results</h2>
                </div>

                <div className="ranked-list">
                  {scores.map((score, index) => (
                    <div className="result-row" key={score.id}>
                      <div className="result-rank">{String(index + 1).padStart(2, "0")}</div>
                      <div className="result-main">
                        <div className="result-title">
                          <strong>{score.label}</strong>
                          <span>{score.percentage}%</span>
                        </div>
                        <div className="score-track">
                          <span style={{ width: `${score.percentage}%` }} />
                        </div>
                        <div className="result-caption">
                          <span>{scoreLabel(score.percentage, true)}</span>
                          <p>{score.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </>
          ) : isBdQuiz ? (
            <>
              <div className="multi-radar-grid">
                <article className="panel chart-panel">
                  <div className="section-heading">
                    <p className="eyebrow">Bondage / physical control</p>
                    <h2>Restraint radar</h2>
                  </div>
                  <RadarChart
                    scores={bondageRadarScores}
                    ariaLabel="Bondage and physical control radar chart"
                  />
                </article>

                <article className="panel chart-panel">
                  <div className="section-heading">
                    <p className="eyebrow">Discipline / structural control</p>
                    <h2>Discipline radar</h2>
                  </div>
                  <RadarChart
                    scores={disciplineRadarScores}
                    ariaLabel="Discipline and structural control radar chart"
                  />
                </article>
              </div>

              <article className="panel ranked-panel">
                <div className="section-heading">
                  <p className="eyebrow">Strongest B&D signals</p>
                  <h2>Ranked results</h2>
                </div>

                <div className="ranked-list">
                  {scores.map((score, index) => (
                    <div className="result-row" key={score.id}>
                      <div className="result-rank">{String(index + 1).padStart(2, "0")}</div>
                      <div className="result-main">
                        <div className="result-title">
                          <strong>{score.label}</strong>
                          <span>{score.percentage}%</span>
                        </div>
                        <div className="score-track">
                          <span style={{ width: `${score.percentage}%` }} />
                        </div>
                        <div className="result-caption">
                          <span>{scoreLabel(score.percentage, true)}</span>
                          <p>{score.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </>
          ) : isSmQuiz ? (
            <>
              <div className="multi-radar-grid">
                <article className="panel chart-panel">
                  <div className="section-heading">
                    <p className="eyebrow">Receiving / masochistic</p>
                    <h2>Receiving radar</h2>
                  </div>
                  <RadarChart
                    scores={receivingSmRadarScores}
                    ariaLabel="Receiving and masochistic pain and intensity radar chart"
                  />
                </article>

                <article className="panel chart-panel">
                  <div className="section-heading">
                    <p className="eyebrow">Giving / sadistic</p>
                    <h2>Giving radar</h2>
                  </div>
                  <RadarChart
                    scores={givingSmRadarScores}
                    ariaLabel="Giving and sadistic pain and intensity radar chart"
                  />
                </article>
              </div>

              <article className="panel ranked-panel">
                <div className="section-heading">
                  <p className="eyebrow">Strongest S/M signals</p>
                  <h2>Ranked results</h2>
                </div>

                <div className="ranked-list">
                  {scores.map((score, index) => (
                    <div className="result-row" key={score.id}>
                      <div className="result-rank">{String(index + 1).padStart(2, "0")}</div>
                      <div className="result-main">
                        <div className="result-title">
                          <strong>{score.label}</strong>
                          <span>{score.percentage}%</span>
                        </div>
                        <div className="score-track">
                          <span style={{ width: `${score.percentage}%` }} />
                        </div>
                        <div className="result-caption">
                          <span>{scoreLabel(score.percentage, true)}</span>
                          <p>{score.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </>
          ) : (
            <div className="results-grid">
              <article className="panel chart-panel">
                <div className="section-heading">
                  <p className="eyebrow">Preference shape</p>
                  <h2>Radar profile</h2>
                </div>
                <RadarChart scores={radarScores} />
              </article>

              <article className="panel ranked-panel">
                <div className="section-heading">
                  <p className="eyebrow">Strongest signals</p>
                  <h2>Ranked results</h2>
                </div>

                <div className="ranked-list">
                  {scores.map((score, index) => (
                    <div className="result-row" key={score.id}>
                      <div className="result-rank">{String(index + 1).padStart(2, "0")}</div>
                      <div className="result-main">
                        <div className="result-title">
                          <strong>{score.label}</strong>
                          <span>{score.percentage}%</span>
                        </div>
                        <div className="score-track">
                          <span style={{ width: `${score.percentage}%` }} />
                        </div>
                        <div className="result-caption">
                          <span>{scoreLabel(score.percentage, true)}</span>
                          <p>{score.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          )}

          {isHeadspaceQuiz && (
            <article className="panel ranked-panel">
              <div className="section-heading">
                <p className="eyebrow">Why these roles resonate</p>
                <h2>Underlying dynamic modes</h2>
              </div>

              <div className="ranked-list">
                {dynamicModeScores.map((score, index) => (
                  <div className="result-row" key={score.id}>
                    <div className="result-rank">{String(index + 1).padStart(2, "0")}</div>
                    <div className="result-main">
                      <div className="result-title">
                        <strong>{score.label}</strong>
                        <span>{score.percentage}%</span>
                      </div>
                      <div className="score-track">
                        <span style={{ width: `${score.percentage}%` }} />
                      </div>
                      <div className="result-caption">
                        <span>{scoreLabel(score.percentage, true)}</span>
                        <p>{score.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          )}

          <div className="results-actions">
            <button className="secondary" onClick={resetActiveQuiz}>
              Reset this quiz
            </button>
          </div>
        </section>
      )}
      </main>
    </>
  );
}
