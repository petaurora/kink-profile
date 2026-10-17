import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { SegmentedControl } from "../../components/SegmentedControl";
import { answerOptions } from "../../data/quizScale";
import { dsSignals } from "../../data/dsQuiz";
import {
  bondageDisciplineSignalIds,
  bondageRadarSignalIds,
  disciplineRadarSignalIds,
} from "../../data/bondageDisciplineQuiz";
import {
  givingSmRadarSignalIds,
  receivingSmRadarSignalIds,
  sadismMasochismSignalIds,
} from "../../data/sadismMasochismQuiz";
import {
  headspaceSignalIds,
  partnerPositionedRoleHeadspaceIds,
  roleHeadspaces,
  selfPositionedRoleHeadspaceIds,
} from "../../data/headspacesQuiz";
import { getSignals } from "../../data/signals";
import { isWeightedQuestion } from "../../data/quizQuestions";
import type { QuizDefinition } from "../../data/quizzes";
import {
  loadProfile,
  saveProfile,
  type StoredProfile,
} from "../../lib/profileStorage";
import {
  scoreDsSignals,
  scoreHeadspaces,
  scoreSignals,
} from "../../lib/scoring";
import {
  quizHomeRoute,
  quizResultsPath,
  quizRoutePath,
} from "../../app/routes";
import {
  answerQuizQuestion,
  canViewQuizResults,
  getAnsweredCount,
  getQuestionsForQuiz,
  getQuizAttemptAnswers,
  getQuizDataIssue,
  initialQuestionIndex,
  resolveAvailableQuiz,
  resolveQuizDimensionState,
  resolveQuizLifecycle,
  startQuizRetake,
  type QuizDataIssue,
} from "./quizRuntime";

type QuizRouteMode = "quiz" | "results";

type Score = {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  percentage: number;
  coverage: number;
};

type RadarView = {
  id: string;
  tabLabel: string;
  eyebrow: string;
  title: string;
  ariaLabel: string;
  scores: Score[];
};

function scoreLabel(score: number, weighted = false) {
  if (score >= 80) return weighted ? "Very strong" : "Core";
  if (score >= 60) return "Strong";
  if (score >= 40) return weighted ? "Contextual" : "Curious";
  if (score >= 20) return "Low";
  return weighted ? "Little signal" : "Not for me";
}

function RadarChart({
  scores,
  ariaLabel = "Preference radar chart",
}: {
  scores: Score[];
  ariaLabel?: string;
}) {
  const measuredScores = scores.filter(
    (score) => resolveQuizDimensionState(score.coverage).state !== "unexplored",
  );
  const unmeasuredCount = scores.length - measuredScores.length;

  if (measuredScores.length < 3) {
    return (
      <div className="radar-wrap">
        <p>
          Not enough information is available to draw this radar yet. Unmeasured
          dimensions are left unknown rather than plotted as zero.
        </p>
      </div>
    );
  }

  const size = 360;
  const center = size / 2;
  const radius = 118;

  const pointFor = (index: number, scale = 1) => {
    const angle =
      -Math.PI / 2 + (index * Math.PI * 2) / measuredScores.length;
    return [
      center + Math.cos(angle) * radius * scale,
      center + Math.sin(angle) * radius * scale,
    ];
  };

  const polygon = (scale: number) =>
    measuredScores
      .map((_, index) => pointFor(index, scale).join(","))
      .join(" ");

  const scorePolygon = measuredScores
    .map((score, index) =>
      pointFor(index, score.percentage / 100).join(","),
    )
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

        {measuredScores.map((score, index) => {
          const [x, y] = pointFor(index, 1);
          const [labelX, labelY] = pointFor(index, 1.28);

          return (
            <g key={score.id}>
              <line
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                className="radar-axis"
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
                className="radar-label"
              >
                {score.shortLabel}
              </text>
            </g>
          );
        })}

        <polygon points={scorePolygon} className="radar-score" />
        {measuredScores.map((score, index) => {
          const [x, y] = pointFor(index, score.percentage / 100);
          return (
            <circle
              key={score.id}
              cx={x}
              cy={y}
              r="4"
              className="radar-point"
            />
          );
        })}
      </svg>
      {unmeasuredCount > 0 && (
        <p>
          {unmeasuredCount} dimension{unmeasuredCount === 1 ? " is" : "s are"}{" "}
          still unmeasured and omitted from the shape rather than shown as 0%.
        </p>
      )}
    </div>
  );
}

function RankedResults({ scores }: { scores: Score[] }) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(),
  );
  const orderedScores = [...scores].sort((left, right) => {
    const leftState = resolveQuizDimensionState(left.coverage).state;
    const rightState = resolveQuizDimensionState(right.coverage).state;
    if (leftState === "unexplored" && rightState !== "unexplored") return 1;
    if (rightState === "unexplored" && leftState !== "unexplored") return -1;
    return right.percentage - left.percentage;
  });

  const toggle = (scoreId: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(scoreId)) {
        next.delete(scoreId);
      } else {
        next.add(scoreId);
      }
      return next;
    });
  };

  return (
    <div className="ranked-list">
      {orderedScores.map((score, index) => {
        const dimensionState = resolveQuizDimensionState(score.coverage);
        const isUnmeasured = dimensionState.state === "unexplored";
        const isDeveloping = dimensionState.state === "developing";
        const expanded = expandedIds.has(score.id);
        const stateText = isUnmeasured
          ? "Not enough information"
          : isDeveloping
            ? "Developing"
            : scoreLabel(score.percentage, true);

        return (
          <div
            className={expanded ? "result-row is-expanded" : "result-row"}
            key={score.id}
          >
            <button
              type="button"
              className="result-row-toggle"
              onClick={() => toggle(score.id)}
              aria-expanded={expanded}
            >
              <span className="result-rank">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="result-main">
                <span className="result-title">
                  <strong>{score.label}</strong>
                  <span>{isUnmeasured ? "—" : `${score.percentage}%`}</span>
                </span>
                <span className="result-caption">{stateText}</span>
              </span>
              <span className="result-row-chevron" aria-hidden="true">
                ›
              </span>
            </button>

            {expanded && (
              <div className="result-detail">
                <p>{score.description}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function strongestSignalEyebrow(quiz: QuizDefinition) {
  if (quiz.id === "roles-headspaces") return "Strongest roles & headspaces";
  if (quiz.id === "bondage-discipline") return "Strongest B&D signals";
  if (quiz.id === "sadism-masochism") return "Strongest S/M signals";
  if (quiz.id === "dominance-submission") return "Strongest D/s signals";
  return "Strongest signals";
}

function TopSignalSummary({
  quiz,
  scores,
}: {
  quiz: QuizDefinition;
  scores: Score[];
}) {
  const topScores = [...scores]
    .filter(
      (score) =>
        resolveQuizDimensionState(score.coverage).state !== "unexplored",
    )
    .sort((left, right) => right.percentage - left.percentage)
    .slice(0, 3);

  return (
    <article className="panel results-summary-panel">
      <div className="section-heading">
        <p className="eyebrow">{strongestSignalEyebrow(quiz)}</p>
        <h2>At a glance</h2>
      </div>

      {topScores.length > 0 ? (
        <div className="results-top-signals">
          {topScores.map((score, index) => (
            <div className="results-top-signal" key={score.id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{score.label}</strong>
              <span>{score.percentage}%</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="results-summary-empty">
          No measured dimensions are available yet.
        </p>
      )}
    </article>
  );
}

function RadarExplorer({ views }: { views: RadarView[] }) {
  const [activeId, setActiveId] = useState(views[0]?.id ?? "");
  const activeView =
    views.find((view) => view.id === activeId) ?? views[0];

  if (!activeView) return null;

  return (
    <article className="panel chart-panel results-radar-panel">
      {views.length > 1 && (
        <div className="results-radar-tabs">
          <SegmentedControl
            value={activeView.id}
            options={views.map((view) => ({
              value: view.id,
              label: view.tabLabel,
            }))}
            onChange={setActiveId}
            ariaLabel="Result radar view"
          />
        </div>
      )}

      <div className="section-heading">
        <p className="eyebrow">{activeView.eyebrow}</p>
        <h2>{activeView.title}</h2>
      </div>

      <RadarChart
        scores={activeView.scores}
        ariaLabel={activeView.ariaLabel}
      />
    </article>
  );
}

function ResultsBody({ quiz, scores }: { quiz: QuizDefinition; scores: Score[] }) {
  const isHeadspaceQuiz = quiz.id === "roles-headspaces";
  const isBdQuiz = quiz.id === "bondage-discipline";
  const isSmQuiz = quiz.id === "sadism-masochism";
  let radarViews: RadarView[];

  if (isHeadspaceQuiz) {
    const selfPositionedScores = selfPositionedRoleHeadspaceIds
      .map((id) => scores.find((score) => score.id === id))
      .filter((score): score is Score => score !== undefined);
    const partnerPositionedScores = partnerPositionedRoleHeadspaceIds
      .map((id) => scores.find((score) => score.id === id))
      .filter((score): score is Score => score !== undefined);

    radarViews = [
      {
        id: "self-positioned",
        tabLabel: "Self-positioned",
        eyebrow: "Self-positioned roles",
        title: "Headspace radar",
        ariaLabel: "Self-positioned roles and headspaces radar chart",
        scores: selfPositionedScores,
      },
      {
        id: "partner-positioned",
        tabLabel: "Partner-positioned",
        eyebrow: "Partner-positioned roles",
        title: "Headspace radar",
        ariaLabel: "Partner-positioned roles and headspaces radar chart",
        scores: partnerPositionedScores,
      },
    ];
  } else if (isBdQuiz) {
    const bondageScores = bondageRadarSignalIds
      .map((id) => scores.find((score) => score.id === id))
      .filter((score): score is Score => score !== undefined);
    const disciplineScores = disciplineRadarSignalIds
      .map((id) => scores.find((score) => score.id === id))
      .filter((score): score is Score => score !== undefined);

    radarViews = [
      {
        id: "physical-control",
        tabLabel: "Physical control",
        eyebrow: "Bondage / physical control",
        title: "Restraint radar",
        ariaLabel: "Bondage and physical control radar chart",
        scores: bondageScores,
      },
      {
        id: "structural-control",
        tabLabel: "Structural control",
        eyebrow: "Discipline / structural control",
        title: "Discipline radar",
        ariaLabel: "Discipline and structural control radar chart",
        scores: disciplineScores,
      },
    ];
  } else if (isSmQuiz) {
    const receivingScores = receivingSmRadarSignalIds
      .map((id) => scores.find((score) => score.id === id))
      .filter((score): score is Score => score !== undefined);
    const givingScores = givingSmRadarSignalIds
      .map((id) => scores.find((score) => score.id === id))
      .filter((score): score is Score => score !== undefined);

    radarViews = [
      {
        id: "receiving",
        tabLabel: "Receiving",
        eyebrow: "Receiving / masochistic",
        title: "Receiving radar",
        ariaLabel: "Receiving and masochistic pain and intensity radar chart",
        scores: receivingScores,
      },
      {
        id: "giving",
        tabLabel: "Giving",
        eyebrow: "Giving / sadistic",
        title: "Giving radar",
        ariaLabel: "Giving and sadistic pain and intensity radar chart",
        scores: givingScores,
      },
    ];
  } else {
    const radarScores = dsSignals
      .map((signal) => scores.find((score) => score.id === signal.id))
      .filter((score): score is Score => score !== undefined);

    radarViews = [
      {
        id: "preference-shape",
        tabLabel: "Preference shape",
        eyebrow: "Preference shape",
        title: "Radar profile",
        ariaLabel: "Dominance and submission preference radar chart",
        scores: radarScores,
      },
    ];
  }

  return (
    <>
      <TopSignalSummary quiz={quiz} scores={scores} />
      <RadarExplorer views={radarViews} />

      <article className="panel ranked-panel results-ranked-panel">
        <div className="section-heading">
          <p className="eyebrow">{strongestSignalEyebrow(quiz)}</p>
          <h2>All signals</h2>
        </div>
        <RankedResults scores={scores} />
      </article>
    </>
  );
}

function resultsDescription(quiz: QuizDefinition) {
  if (quiz.id === "roles-headspaces") {
    return "These role and headspace affinities can overlap. Pet, Slave, Little, Middle, Brat, Caregiver, Owner / Handler, and others can all resonate in different contexts — the result is a profile, not one assigned identity.";
  }
  if (quiz.id === "bondage-discipline") {
    return "Bondage and discipline are scored as distinct physical and structural preferences. Restraint, positioning, constraint control, discipline, accountability, ritual, anticipation, and challenge can all vary independently — and discipline is not treated as pain.";
  }
  if (quiz.id === "sadism-masochism") {
    return "Pain, physical intensity, endurance, challenge, anticipation, and emotional intensity are scored independently. Receiving and giving can differ sharply, and this section does not assign a Sadist or Masochist identity label.";
  }
  if (quiz.id === "dominance-submission") {
    return "These signals are scored independently. High receiving control, giving control, and autonomy can coexist — the shape is the result, not a forced role label.";
  }
  return "This section shows your scored signals from the answers you provided.";
}

function questionContext(quiz: QuizDefinition) {
  if (quiz.id === "roles-headspaces") return "Roles & inner experience";
  if (quiz.id === "bondage-discipline") return "Physical & structural control";
  if (quiz.id === "sadism-masochism") return "Pain & intensity";
  return "Power exchange";
}

function QuizDataErrorPanel({
  quiz,
  issue,
}: {
  quiz: QuizDefinition;
  issue: QuizDataIssue;
}) {
  const navigate = useNavigate();
  const detail =
    issue.kind === "missing-questions"
      ? "Some question definitions could not be loaded."
      : "This quiz does not currently have a usable question bank.";

  return (
    <main className="app-shell">
      <section className="results-stack">
        <article className="panel results-heading">
          <div>
            <p className="eyebrow">{quiz.title} · Recovery needed</p>
            <h1>This quiz is unavailable right now.</h1>
            <p>
              {detail} This is a data error, not an empty quiz result, so the
              app has not interpreted missing questions as zero interest or
              changed any existing profile evidence.
            </p>
          </div>
          <div className="results-heading-actions">
            <button
              className="primary"
              onClick={() => navigate(quizHomeRoute.path)}
            >
              Back to quizzes
            </button>
            <button
              className="secondary"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </div>
        </article>
      </section>
    </main>
  );
}

function ResolvedQuizRoute({
  quiz,
  mode,
}: {
  quiz: QuizDefinition;
  mode: QuizRouteMode;
}) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StoredProfile>(() => loadProfile());
  // The resume target comes from persisted attempt answers (or a retake draft),
  // never from a temporary UI step that may have been left open on another device.
  const resumeIndex = useRef(initialQuestionIndex(quiz, profile));
  const [questionIndex, setQuestionIndex] = useState(resumeIndex.current);
  const runnerRef = useRef<HTMLDivElement>(null);
  const focusedResume = useRef(false);
  const [desktopBatch, setDesktopBatch] = useState(() =>
    typeof window !== "undefined" && window.innerWidth > 700,
  );
  useEffect(() => {
    const syncViewport = () => setDesktopBatch(window.innerWidth > 700);
    window.addEventListener("resize", syncViewport);
    return () => window.removeEventListener("resize", syncViewport);
  }, []);

  const activeQuestions = useMemo(() => getQuestionsForQuiz(quiz), [quiz]);
  const responseOptions = useMemo(
    () => Array.from(new Map(answerOptions.map((option) => [option.value, option])).values()),
    [],
  );
  const lifecycle = resolveQuizLifecycle(quiz, profile);
  const attemptAnswers = getQuizAttemptAnswers(quiz, profile);
  const establishedAnswers = profile.quizzes[quiz.id]?.answers ?? {};
  const answeredCount = getAnsweredCount(quiz, attemptAnswers);
  const currentQuestion = activeQuestions[questionIndex];
  const batchStart = Math.floor(questionIndex / 3) * 3;
  const visibleQuestions = desktopBatch
    ? activeQuestions.slice(batchStart, batchStart + 3).map((question, offset) => ({ question, index: batchStart + offset }))
    : currentQuestion
      ? [{ question: currentQuestion, index: questionIndex }]
      : [];
  const atLastBatch = batchStart + 3 >= activeQuestions.length;
  const canViewResults = canViewQuizResults(quiz, profile);

  // On Continue, desktop opens the batch containing the first unanswered
  // question; focusing that exact card avoids making users scan the batch.
  // The same focus target is the sole question on mobile.
  useEffect(() => {
    if (mode !== "quiz" || focusedResume.current) return;
    const target = runnerRef.current?.querySelector<HTMLElement>("[data-quiz-resume-target]");
    if (!target) return;
    focusedResume.current = true;
    target.focus({ preventScroll: true });
    target.scrollIntoView?.({ block: "nearest" });
  }, [mode, desktopBatch, questionIndex]);

  const scores = useMemo<Score[]>(() => {
    if (quiz.id === "roles-headspaces") {
      const signalScores = scoreSignals(
        activeQuestions.filter(isWeightedQuestion),
        establishedAnswers,
        getSignals(headspaceSignalIds),
      );
      return scoreHeadspaces(signalScores, roleHeadspaces).sort(
        (a, b) => b.percentage - a.percentage,
      );
    }

    if (quiz.id === "bondage-discipline") {
      return scoreSignals(
        activeQuestions.filter(isWeightedQuestion),
        establishedAnswers,
        getSignals(bondageDisciplineSignalIds),
      ).sort((a, b) => b.percentage - a.percentage);
    }

    if (quiz.id === "sadism-masochism") {
      return scoreSignals(
        activeQuestions.filter(isWeightedQuestion),
        establishedAnswers,
        getSignals(sadismMasochismSignalIds),
      ).sort((a, b) => b.percentage - a.percentage);
    }

    if (quiz.id === "dominance-submission") {
      return scoreDsSignals(
        activeQuestions.filter(isWeightedQuestion),
        establishedAnswers,
        dsSignals,
      ).sort((a, b) => b.percentage - a.percentage);
    }

    return [];
  }, [activeQuestions, establishedAnswers, quiz.id]);

  const saveNextProfile = (next: StoredProfile) => {
    saveProfile(next);
    setProfile(next);
  };

  const answerQuestion = (questionId: string, index: number, value: number) => {
    const nextProfile = answerQuizQuestion(quiz, profile, questionId, value);
    saveNextProfile(nextProfile);

    // Only the newly completed attempt may replace an established result;
    // an unfinished retake must never redirect just because old results exist.
    if (resolveQuizLifecycle(quiz, nextProfile).state === "complete") {
      navigate(quizResultsPath(quiz.id));
      return;
    }

    // Desktop presents three independently answerable question cards per page.
    // Mobile preserves the existing one-question-at-a-time advance.
    if (!desktopBatch) {
      setQuestionIndex(
        index < activeQuestions.length - 1
          ? index + 1
          : initialQuestionIndex(quiz, nextProfile),
      );
    }
  };

  const beginRetake = () => {
    const nextProfile = startQuizRetake(quiz, profile);
    saveNextProfile(nextProfile);
    setQuestionIndex(initialQuestionIndex(quiz, nextProfile));
    navigate(quizRoutePath(quiz.id));
  };

  const resetQuiz = () => {
    const nextQuizzes = { ...profile.quizzes };
    delete nextQuizzes[quiz.id];
    saveNextProfile({ ...profile, quizzes: nextQuizzes });
    navigate(quizHomeRoute.path);
  };

  if (mode === "results" && !canViewResults) {
    return <Navigate to={quizRoutePath(quiz.id)} replace />;
  }

  if (mode === "quiz" && lifecycle.state === "complete") {
    return <Navigate to={quizResultsPath(quiz.id)} replace />;
  }

  if (mode === "quiz" && !currentQuestion) {
    return <Navigate to={quizHomeRoute.path} replace />;
  }

  return (
    <main className="app-shell">
      {mode === "quiz" && currentQuestion ? (
        <section className="quiz-layout quiz-layout-compact">
          <div ref={runnerRef} className={`quiz-run-container ${desktopBatch ? "quiz-run-batch" : "quiz-run-single"}`}>
            <header className="quiz-question-header quiz-run-header">
              <div className="quiz-question-topline">
                <button
                  className="text-button quiz-question-back"
                  onClick={() => navigate(quizHomeRoute.path)}
                >
                  ← Quizzes
                </button>
                <div className="quiz-question-position">
                  <span>
                    {lifecycle.state === "retake-in-progress"
                      ? `${quiz.shortTitle} · Retake`
                      : quiz.shortTitle}
                  </span>
                  <strong>
                    {desktopBatch
                      ? `${batchStart + 1}–${Math.min(batchStart + 3, activeQuestions.length)} / ${activeQuestions.length}`
                      : `${questionIndex + 1} / ${activeQuestions.length}`}
                  </strong>
                </div>
              </div>
              {desktopBatch && <h1 className="quiz-run-title">{quiz.title}</h1>}
              <div
                className="progress-track quiz-question-progress"
                role="progressbar"
                aria-label="Quiz questions answered"
                aria-valuemin={0}
                aria-valuemax={activeQuestions.length}
                aria-valuenow={answeredCount}
                aria-valuetext={`${answeredCount} of ${activeQuestions.length} answered`}
              >
                <span
                  style={{
                    width: `${(answeredCount / activeQuestions.length) * 100}%`,
                  }}
                />
              </div>
              {lifecycle.state === "retake-in-progress" && (
                <p className="quiz-question-retake-note">
                  Your previous completed result stays active until this retake
                  is finished.
                </p>
              )}
            </header>
            <div className="quiz-batch-layout">
              {visibleQuestions.map(({ question, index }) => (
                <article
                  className="question-card panel question-card-compact"
                  key={question.id}
                >
                  <div className="question-meta question-context-meta">
                    <span>{questionContext(quiz)}</span>
                    {desktopBatch && <span>Question {index + 1}</span>}
                  </div>
                  {desktopBatch
                    ? <h2 tabIndex={-1} data-quiz-resume-target={index === resumeIndex.current ? "" : undefined}>{question.prompt}</h2>
                    : <h1 tabIndex={-1} data-quiz-resume-target={index === resumeIndex.current ? "" : undefined}>{question.prompt}</h1>}
                  <div className="answers" role="group" aria-label={`Answer question ${index + 1}`}>
                    {responseOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={
                          attemptAnswers[question.id] === option.value
                            ? "answer selected"
                            : "answer"
                        }
                        aria-pressed={attemptAnswers[question.id] === option.value}
                        onClick={() => answerQuestion(question.id, index, option.value)}
                      >
                        <span className="answer-value">{option.value}</span>
                        <span>{option.label}</span>
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </div>
            <nav className="quiz-nav quiz-run-nav" aria-label="Quiz navigation">
              <button
                className="text-button"
                onClick={() => setQuestionIndex((index) =>
                  desktopBatch ? Math.max(0, Math.floor(index / 3) * 3 - 3) : Math.max(0, index - 1)
                )}
                disabled={questionIndex === 0 || (desktopBatch && batchStart === 0)}
              >
                ← Back
              </button>
              <button
                className="text-button"
                onClick={() => navigate(quizHomeRoute.path)}
              >
                Save & exit
              </button>
              {desktopBatch && (
                <button
                  className="text-button"
                  onClick={() => setQuestionIndex(
                    atLastBatch
                      ? initialQuestionIndex(quiz, profile)
                      : Math.min(batchStart + 3, activeQuestions.length - 1)
                  )}
                >
                  {atLastBatch ? "Review unanswered" : "Next questions →"}
                </button>
              )}
            </nav>
          </div>
        </section>
      ) : (
        <section className="results-stack results-stack-compact">
          <header className="results-heading results-heading-compact">
            <div className="results-heading-copy">
              <button
                className="text-button results-back-link"
                onClick={() => navigate(quizHomeRoute.path)}
              >
                ← Quizzes
              </button>
              <p className="eyebrow">{quiz.title}</p>
              <h1>Your results</h1>
              <p className="results-principle">
                The shape matters more than any single score.
              </p>
              <p className="results-description">{resultsDescription(quiz)}</p>
              {lifecycle.state === "retake-in-progress" && (
                <p className="results-retake-note">
                  A retake is in progress. These remain your last completed
                  results until the new attempt is complete.
                </p>
              )}
            </div>
            <div className="results-heading-actions">
              <button
                className="secondary compact"
                onClick={
                  lifecycle.state === "retake-in-progress"
                    ? () => navigate(quizRoutePath(quiz.id))
                    : beginRetake
                }
              >
                {lifecycle.state === "retake-in-progress"
                  ? "Continue retake"
                  : "Retake quiz"}
              </button>
            </div>
          </header>

          <ResultsBody quiz={quiz} scores={scores} />

          <div className="results-actions">
            <button className="secondary compact" onClick={resetQuiz}>
              Reset this quiz
            </button>
          </div>
        </section>
      )}
    </main>
  );
}

export function QuizRoutePage({ mode }: { mode: QuizRouteMode }) {
  const { quizId } = useParams();
  const quiz = resolveAvailableQuiz(quizId);

  if (!quiz) {
    return <Navigate to={quizHomeRoute.path} replace />;
  }

  const dataIssue = getQuizDataIssue(quiz);
  if (dataIssue) {
    return <QuizDataErrorPanel quiz={quiz} issue={dataIssue} />;
  }

  return (
    <ResolvedQuizRoute
      key={`${quiz.id}:${mode}`}
      quiz={quiz}
      mode={mode}
    />
  );
}
