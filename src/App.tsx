import { useEffect, useMemo, useState } from "react";
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
import { getSignals, signalDefinitions } from "./data/signals";
import {
  isWeightedQuestion,
  quizQuestions,
  type QuizQuestion,
} from "./data/quizQuestions";
import {
  getQuiz,
  quizzes,
  starterQuiz,
  type QuizDefinition,
  type QuizId,
} from "./data/quizzes";
import {
  loadProfile,
  saveProfile,
  type AnswerMap,
  type StoredProfile,
} from "./lib/profileStorage";
import { loadCatalogProfile } from "./lib/catalogProfileStorage";
import {
  buildCanonicalSignalProfile,
  type CanonicalSignalSourceType,
} from "./lib/overallProfileSignals";
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

const signalDefinitionById = new Map(
  signalDefinitions.map((signal) => [signal.id, signal]),
);

function evidenceSourceLabel(sourceType: CanonicalSignalSourceType) {
  switch (sourceType) {
    case "quiz":
      return "Quiz";
    case "catalog_explicit":
      return "Explicit catalog";
    case "catalog_pairwise":
      return "This or That";
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

  return (
    <article className={`quiz-card panel quiz-state-${state}`}>
      <div className="quiz-card-top">
        <span className="quiz-icon" aria-hidden="true">
          {quiz.icon}
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
            {state === "complete" ? "View / retake" : state === "in-progress" ? "Continue" : "Explore"}
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

export default function App() {
  const [profile, setProfile] = useState<StoredProfile>(() => loadProfile());
  const [catalogProfileForInspection, setCatalogProfileForInspection] = useState(() =>
    loadCatalogProfile(),
  );
  const [screen, setScreen] = useState<Screen>("hub");
  const [activeQuizId, setActiveQuizId] = useState<QuizId>(starterQuiz.id);
  const [questionIndex, setQuestionIndex] = useState(0);

  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  const activeQuiz = getQuiz(activeQuizId) ?? starterQuiz;
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

  const canonicalSignals = useMemo(
    () => buildCanonicalSignalProfile(profile, catalogProfileForInspection),
    [catalogProfileForInspection, profile],
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

  const refreshCanonicalEvidence = () => {
    setCatalogProfileForInspection(loadCatalogProfile());
  };

  const openProfile = () => {
    setCatalogProfileForInspection(loadCatalogProfile());
    setScreen("profile");
  };

  return (
    <main className="app-shell">
      <header className="site-header">
        <button className="brand" onClick={() => setScreen("hub")}>
          <span className="brand-mark">♡</span>
          <span>Pet Profile</span>
        </button>

        <div className="header-actions">
          <button className="header-link" onClick={openProfile}>
            My profile
          </button>
          <span className="privacy-pill">local only</span>
        </div>
      </header>

      {screen === "hub" && (
        <section className="hub-stack">
          <div className="hub-hero panel">
            <div>
              <p className="eyebrow">Explore at your own pace</p>
              <h1>Not one giant fucking test.</h1>
              <p className="hero-copy">
                Pick a section, learn something useful, leave, come back later. Each finished
                quiz adds another piece to your profile without treating unexplored areas as zero.
              </p>
            </div>

            <button className="profile-summary" onClick={openProfile}>
              <span className="eyebrow">Overall profile</span>
              <strong>
                {completedCore} / {coreQuizzes.length}
              </strong>
              <span>core areas explored</span>
              <span className="summary-arrow">→</span>
            </button>
          </div>

          <div className="hub-section-heading">
            <div>
              <p className="eyebrow">Core exploration</p>
              <h2>Choose a section</h2>
            </div>
            <p>Short, focused quizzes. Your profile grows as you do them.</p>
          </div>

          <div className="quiz-card-grid">
            {coreQuizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} profile={profile} onOpen={openQuiz} />
            ))}
          </div>

          <div className="hub-section-heading catalog-hub-heading">
            <div>
              <p className="eyebrow">551-item kink catalog</p>
              <h2>Browse it or play with it.</h2>
            </div>
            <p>
              Direct preferences and pairwise ranking are connected by the same catalog,
              without pretending they're the same answer.
            </p>
          </div>

          <div className="catalog-hub-grid">
            <article className="catalog-hub-card panel">
              <div>
                <span className="catalog-kicker">Direct preference management</span>
                <h3>Browse & set preferences</h3>
                <p>
                  Search the catalog, filter it, read details, and explicitly mark anything
                  you want as Love, Like, Curious, Unsure, Not Interested, Hard Limit, or N/A.
                </p>
              </div>
              <button className="primary" onClick={() => setScreen("catalog")}>
                Browse preferences
              </button>
            </article>

            <article className="catalog-hub-card catalog-hub-game panel">
              <div>
                <span className="catalog-kicker">Comparative discovery mini-game</span>
                <h3>Play This or That</h3>
                <p>
                  Make tiny choices instead of rating 551 things one by one. Use contrast to
                  discover what rises to the top within categories and overall.
                </p>
              </div>
              <button className="secondary" onClick={() => setScreen("ranking")}>
                Play This or That
              </button>
            </article>
          </div>

          <div className="hub-section-heading sampler-heading">
            <div>
              <p className="eyebrow">Original prototype</p>
              <h2>Starter sampler</h2>
            </div>
            <p>The first 16-question sampler stays available separately.</p>
          </div>

          <div className="sampler-grid sampler-grid-single">
            <QuizCard quiz={starterQuiz} profile={profile} onOpen={openQuiz} />
          </div>
        </section>
      )}

      {screen === "catalog" && (
        <KinkCatalogPreferences
          quizProfile={profile}
          onClose={() => setScreen("hub")}
          onPlayRanking={() => setScreen("ranking")}
        />
      )}

      {screen === "ranking" && (
        <KinkThisOrThat
          quizProfile={profile}
          onClose={() => setScreen("hub")}
        />
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
              <span>of {coreQuizzes.length} core areas explored</span>
            </div>
            <div className="profile-section-list">
              {coreQuizzes.map((quiz) => {
                const state = getQuizState(quiz, profile);
                return (
                  <div className="profile-section-row" key={quiz.id}>
                    <span className="quiz-icon small">{quiz.icon}</span>
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

          <article className="panel evidence-inspector">
            <div className="evidence-inspector-heading">
              <div>
                <p className="eyebrow">M7.1 inspection</p>
                <h2>Canonical signal evidence</h2>
                <p>
                  Temporary testing view. Each SignalId is merged by evidence channel first,
                  then the quiz, explicit catalog, and This-or-That channels contribute one
                  capped vote to the canonical result.
                </p>
              </div>
              <button className="secondary compact" onClick={refreshCanonicalEvidence}>
                Refresh evidence
              </button>
            </div>

            {canonicalSignals.length === 0 ? (
              <div className="evidence-empty">
                No canonical signal evidence yet. Answer part of a weighted quiz, set mapped
                catalog preferences, or make signal-discriminating This-or-That choices.
              </div>
            ) : (
              <div className="evidence-signal-list">
                {canonicalSignals.map((signal) => {
                  const definition = signalDefinitionById.get(signal.signalId);

                  return (
                    <details className="evidence-signal" key={signal.signalId}>
                      <summary>
                        <div className="evidence-signal-name">
                          <strong>{definition?.label ?? signal.signalId}</strong>
                          <code>{signal.signalId}</code>
                        </div>
                        <div className="evidence-signal-metrics">
                          <span>
                            <strong>{signal.affinity}%</strong>
                            affinity
                          </span>
                          <span>
                            <strong>{signal.coverage}%</strong>
                            evidence
                          </span>
                        </div>
                      </summary>

                      <div className="evidence-channel-list">
                        {signal.channels.map((channel) => (
                          <section
                            className="evidence-channel"
                            key={channel.sourceType}
                          >
                            <div className="evidence-channel-heading">
                              <div>
                                <strong>{evidenceSourceLabel(channel.sourceType)}</strong>
                                <span>
                                  {channel.affinity}% affinity · {channel.coverage}% channel
                                  coverage
                                </span>
                              </div>
                              <span className="evidence-channel-weight">
                                {Math.round(channel.effectiveWeight * 100)}% effective weight
                              </span>
                            </div>

                            <div className="evidence-contribution-list">
                              {channel.contributions.map((contribution, index) => (
                                <div
                                  className="evidence-contribution"
                                  key={`${channel.sourceType}-${contribution.sourceId}-${index}`}
                                >
                                  <div>
                                    <strong>{contribution.sourceId}</strong>
                                    {contribution.detail && (
                                      <span>{contribution.detail}</span>
                                    )}
                                  </div>
                                  <div className="evidence-contribution-values">
                                    <span>{contribution.affinity}%</span>
                                    <span>{contribution.coverage}% evidence</span>
                                  </div>
                                  <code>{contribution.sourceEvidenceIds.join(" · ")}</code>
                                </div>
                              ))}
                            </div>
                          </section>
                        ))}
                      </div>
                    </details>
                  );
                })}
              </div>
            )}
          </article>

          {getQuizState(starterQuiz, profile) !== "not-started" && (
            <div className="panel sampler-profile-row">
              <div>
                <p className="eyebrow">Prototype data</p>
                <h2>Starter Profile</h2>
                <p>
                  Your original sampler answers are preserved separately from future core quiz
                  results.
                </p>
              </div>
              <button className="secondary" onClick={() => openQuiz(starterQuiz)}>
                {getQuizState(starterQuiz, profile) === "complete"
                  ? "View sampler results"
                  : "Continue sampler"}
              </button>
            </div>
          )}
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
                        : "This sampler preserves the original prototype scoring model. Its results stay separate from the newer signal-weighted core quizzes."}
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
