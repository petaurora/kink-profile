import { useEffect, useMemo, useState } from "react";
import {
  IconAdjustmentsHeart,
  IconBolt,
  IconHeart,
  IconMasksTheater,
  IconPaw,
  IconTransfer,
} from "@tabler/icons-react";
import { KinkCatalogPreferences } from "./KinkCatalogPreferences";
import { KinkThisOrThat } from "./KinkThisOrThat";
import {
  answerOptions,
  dimensions,
} from "./data/questions";
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
  givingRoleHeadspaceIds,
  headspaceSignalIds,
  receivingRoleHeadspaceIds,
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
import {
  loadProfile,
  saveProfile,
  type AnswerMap,
  type StoredProfile,
} from "./lib/profileStorage";
import {
  scoreDsSignals,
  scoreHeadspaces,
  scoreSignals,
} from "./lib/scoring";

type Screen = "hub" | "quiz" | "results" | "profile" | "catalog" | "ranking";
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
          <p className="eyebrow">{quiz.eyebrow}</p>
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
        <p className="eyebrow">{quiz.eyebrow}</p>
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

export default function App() {
  const [profile, setProfile] = useState<StoredProfile>(() => loadProfile());
  const [screen, setScreen] = useState<Screen>("hub");
  const [activeQuizId, setActiveQuizId] = useState<QuizId>(defaultQuiz.id);
  const [questionIndex, setQuestionIndex] = useState(0);

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
  const isWeightedQuiz = activeQuestions.some(isWeightedQuestion);
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

    return dimensions
      .map((dimension) => {
        const items = activeQuestions.filter(
          (question) =>
            question.kind === "legacy" && question.dimension === dimension.id,
        );
        const values = items
          .map((question) => answers[question.id])
          .filter((value): value is number => value !== undefined);
        const total = values.reduce((sum, value) => sum + value, 0);
        const percentage = values.length
          ? Math.round((total / (values.length * 4)) * 100)
          : 0;

        return { ...dimension, percentage };
      })
      .filter((dimension) =>
        activeQuestions.some(
          (question) =>
            question.kind === "legacy" && question.dimension === dimension.id,
        ),
      )
      .sort((a, b) => b.percentage - a.percentage);
  }, [activeQuestions, answers, isBdQuiz, isDsQuiz, isHeadspaceQuiz, isSmQuiz]);

  const radarScores = useMemo(() => {
    if (isDsQuiz) {
      return dsSignals
        .map((signal) => scores.find((score) => score.id === signal.id))
        .filter((score): score is Score => score !== undefined);
    }

    return dimensions
      .map((dimension) => scores.find((score) => score.id === dimension.id))
      .filter((score): score is Score => score !== undefined);
  }, [isDsQuiz, scores]);

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

  const receivingHeadspaceRadarScores = useMemo(
    () =>
      receivingRoleHeadspaceIds
        .map((id) => scores.find((score) => score.id === id))
        .filter((score): score is Score => score !== undefined),
    [scores],
  );

  const givingHeadspaceRadarScores = useMemo(
    () =>
      givingRoleHeadspaceIds
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
  const completedCore = coreQuizzes.filter(
    (quiz) => getQuizState(quiz, profile) === "complete",
  ).length;

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

  return (
    <main className="app-shell">
      <header className="site-header">
        <button className="brand" onClick={() => setScreen("hub")}>
          <span className="brand-mark">
            <IconPaw size={18} stroke={2} aria-hidden="true" />
          </span>
          <span>Pet Profile</span>
        </button>

        <div className="header-actions">
          <button className="header-link" onClick={() => setScreen("profile")}>
            My profile
          </button>
        </div>
      </header>

      {screen === "hub" && (
        <section className="hub-stack">
          <div className="hub-hero">
            <div>
              <p className="eyebrow">Build it your way</p>
              <h1>Not one giant fucking test.</h1>
              <p className="hero-copy">
                Use guided quizzes to spot patterns, This or That to compare what actually wins,
                and the catalog to get specific. Start anywhere, revisit anything, and refine as
                much or as little as you want.
              </p>
            </div>

            <button className="profile-summary" onClick={() => setScreen("profile")}>
              <span className="eyebrow">Your profile</span>
              <span>
                {completedCore === 0
                  ? "Ready when you are"
                  : `${completedCore} of ${coreQuizzes.length} quiz sections complete`}
              </span>
              <span className="summary-arrow">→</span>
            </button>
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
              <p className="eyebrow">02 · Rank & compare</p>
              <h2>Figure out what actually rises to the top.</h2>
            </div>
            <p>
              Quick pairwise choices help reveal preference order without asking you to rate
              everything in isolation.
            </p>
          </div>

          <div className="catalog-hub-grid catalog-hub-grid-single">
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
          </div>

          <div className="hub-section-heading catalog-hub-heading">
            <div>
              <p className="eyebrow">03 · Detailed refinement</p>
              <h2>Get specific.</h2>
            </div>
            <p>
              Fine-tune individual interests, curiosity, uncertainty, and limits directly in
              the full catalog.
            </p>
          </div>

          <div className="catalog-hub-grid catalog-hub-grid-single">
            <article className="catalog-hub-card panel">
              <div>
                <span className="catalog-kicker">Fine-tune directly</span>
                <h3>Browse & set preferences</h3>
                <p>
                  Search all 551 items and explicitly mark Love, Like, Curious, Unsure,
                  Not Interested, Hard Limit, or N/A. Change anything whenever you want.
                </p>
              </div>
              <button className="secondary" onClick={() => setScreen("catalog")}>
                Browse preferences
              </button>
            </article>
          </div>

        </section>
      )}

      {screen === "catalog" && (
        <KinkCatalogPreferences
          onClose={() => setScreen("hub")}
          onPlayRanking={() => setScreen("ranking")}
        />
      )}

      {screen === "ranking" && (
        <KinkThisOrThat onClose={() => setScreen("hub")} />
      )}

      {screen === "profile" && (
        <section className="profile-stack">
          <div className="results-heading panel">
            <div>
              <p className="eyebrow">Your overall profile</p>
              <h1>Built a section at a time.</h1>
              <p>
                Unexplored sections stay unknown instead of quietly becoming zeroes. Completed
                core quizzes accumulate here as each section becomes available.
              </p>
            </div>
            <button className="secondary" onClick={() => setScreen("hub")}>
              Explore quizzes
            </button>
          </div>

          <div className="profile-overview panel">
            <div className="profile-number">
              <strong>{completedCore}</strong>
              <span>of {coreQuizzes.length} sections explored</span>
            </div>
            <div className="profile-section-list">
              {coreQuizzes.map((quiz) => {
                const state = getQuizState(quiz, profile);
                return (
                  <div className="profile-section-row" key={quiz.id}>
                    <span className="quiz-icon small">
                      <QuizGlyph name={quiz.icon} size={19} />
                    </span>
                    <div>
                      <strong>{quiz.title}</strong>
                      <span>{stateLabel(state)}</span>
                    </div>
                    <span className={`status-dot status-${state}`} />
                  </div>
                );
              })}
            </div>
          </div>

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
                {currentQuestion.kind === "weighted"
                  ? isHeadspaceQuiz
                    ? "Roles & inner experience"
                    : isBdQuiz
                      ? "Physical & structural control"
                      : isSmQuiz
                        ? "Pain & intensity"
                        : "Power exchange"
                  : dimensions.find((item) => item.id === currentQuestion.dimension)?.label}
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
                    <p className="eyebrow">Receiving / submissive</p>
                    <h2>Headspace radar</h2>
                  </div>
                  <RadarChart
                    scores={receivingHeadspaceRadarScores}
                    ariaLabel="Receiving and submissive roles and headspaces radar chart"
                  />
                </article>

                <article className="panel chart-panel">
                  <div className="section-heading">
                    <p className="eyebrow">Giving / dominant</p>
                    <h2>Headspace radar</h2>
                  </div>
                  <RadarChart
                    scores={givingHeadspaceRadarScores}
                    ariaLabel="Giving and dominant roles and headspaces radar chart"
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
                          <span>{scoreLabel(score.percentage, isWeightedQuiz)}</span>
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
  );
}
