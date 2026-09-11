import { useMemo, useState } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  SiteHeader,
  type SiteHeaderDestination,
} from "../../SiteHeader";
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
import { useProfileSettings } from "../../lib/profileSettingsContext";
import {
  scoreDsSignals,
  scoreHeadspaces,
  scoreSignals,
} from "../../lib/scoring";
import {
  quizResultsPath,
  quizRoutePath,
  siteHeaderRoutePaths,
} from "../../app/routes";
import {
  getAnsweredCount,
  getQuestionsForQuiz,
  initialQuestionIndex,
  resolveAvailableQuiz,
} from "./quizRuntime";

type QuizRouteMode = "quiz" | "results";

type Score = {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  percentage: number;
  coverage?: number;
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

        {scores.map((score, index) => {
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
        {scores.map((score, index) => {
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
    </div>
  );
}

function RankedResults({ scores }: { scores: Score[] }) {
  return (
    <div className="ranked-list">
      {scores.map((score, index) => (
        <div className="result-row" key={score.id}>
          <div className="result-rank">
            {String(index + 1).padStart(2, "0")}
          </div>
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
  );
}

function ResultsBody({ quiz, scores }: { quiz: QuizDefinition; scores: Score[] }) {
  const isHeadspaceQuiz = quiz.id === "roles-headspaces";
  const isBdQuiz = quiz.id === "bondage-discipline";
  const isSmQuiz = quiz.id === "sadism-masochism";

  if (isHeadspaceQuiz) {
    const selfPositionedScores = selfPositionedRoleHeadspaceIds
      .map((id) => scores.find((score) => score.id === id))
      .filter((score): score is Score => score !== undefined);
    const partnerPositionedScores = partnerPositionedRoleHeadspaceIds
      .map((id) => scores.find((score) => score.id === id))
      .filter((score): score is Score => score !== undefined);

    return (
      <>
        <div className="multi-radar-grid">
          <article className="panel chart-panel">
            <div className="section-heading">
              <p className="eyebrow">Self-positioned roles</p>
              <h2>Headspace radar</h2>
            </div>
            <RadarChart
              scores={selfPositionedScores}
              ariaLabel="Self-positioned roles and headspaces radar chart"
            />
          </article>

          <article className="panel chart-panel">
            <div className="section-heading">
              <p className="eyebrow">Partner-positioned roles</p>
              <h2>Headspace radar</h2>
            </div>
            <RadarChart
              scores={partnerPositionedScores}
              ariaLabel="Partner-positioned roles and headspaces radar chart"
            />
          </article>
        </div>

        <article className="panel ranked-panel">
          <div className="section-heading">
            <p className="eyebrow">Strongest roles & headspaces</p>
            <h2>Ranked results</h2>
          </div>
          <RankedResults scores={scores} />
        </article>
      </>
    );
  }

  if (isBdQuiz) {
    const bondageScores = bondageRadarSignalIds
      .map((id) => scores.find((score) => score.id === id))
      .filter((score): score is Score => score !== undefined);
    const disciplineScores = disciplineRadarSignalIds
      .map((id) => scores.find((score) => score.id === id))
      .filter((score): score is Score => score !== undefined);

    return (
      <>
        <div className="multi-radar-grid">
          <article className="panel chart-panel">
            <div className="section-heading">
              <p className="eyebrow">Bondage / physical control</p>
              <h2>Restraint radar</h2>
            </div>
            <RadarChart
              scores={bondageScores}
              ariaLabel="Bondage and physical control radar chart"
            />
          </article>

          <article className="panel chart-panel">
            <div className="section-heading">
              <p className="eyebrow">Discipline / structural control</p>
              <h2>Discipline radar</h2>
            </div>
            <RadarChart
              scores={disciplineScores}
              ariaLabel="Discipline and structural control radar chart"
            />
          </article>
        </div>

        <article className="panel ranked-panel">
          <div className="section-heading">
            <p className="eyebrow">Strongest B&D signals</p>
            <h2>Ranked results</h2>
          </div>
          <RankedResults scores={scores} />
        </article>
      </>
    );
  }

  if (isSmQuiz) {
    const receivingScores = receivingSmRadarSignalIds
      .map((id) => scores.find((score) => score.id === id))
      .filter((score): score is Score => score !== undefined);
    const givingScores = givingSmRadarSignalIds
      .map((id) => scores.find((score) => score.id === id))
      .filter((score): score is Score => score !== undefined);

    return (
      <>
        <div className="multi-radar-grid">
          <article className="panel chart-panel">
            <div className="section-heading">
              <p className="eyebrow">Receiving / masochistic</p>
              <h2>Receiving radar</h2>
            </div>
            <RadarChart
              scores={receivingScores}
              ariaLabel="Receiving and masochistic pain and intensity radar chart"
            />
          </article>

          <article className="panel chart-panel">
            <div className="section-heading">
              <p className="eyebrow">Giving / sadistic</p>
              <h2>Giving radar</h2>
            </div>
            <RadarChart
              scores={givingScores}
              ariaLabel="Giving and sadistic pain and intensity radar chart"
            />
          </article>
        </div>

        <article className="panel ranked-panel">
          <div className="section-heading">
            <p className="eyebrow">Strongest S/M signals</p>
            <h2>Ranked results</h2>
          </div>
          <RankedResults scores={scores} />
        </article>
      </>
    );
  }

  const radarScores = dsSignals
    .map((signal) => scores.find((score) => score.id === signal.id))
    .filter((score): score is Score => score !== undefined);

  return (
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
        <RankedResults scores={scores} />
      </article>
    </div>
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

function ResolvedQuizRoute({
  quiz,
  mode,
}: {
  quiz: QuizDefinition;
  mode: QuizRouteMode;
}) {
  const { settings } = useProfileSettings();
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StoredProfile>(() => loadProfile());
  const [questionIndex, setQuestionIndex] = useState(() =>
    initialQuestionIndex(quiz, profile),
  );

  const activeQuestions = useMemo(() => getQuestionsForQuiz(quiz), [quiz]);
  const answers = profile.quizzes[quiz.id]?.answers ?? {};
  const answeredCount = getAnsweredCount(quiz, answers);
  const currentQuestion = activeQuestions[questionIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const canViewResults =
    activeQuestions.length > 0 && answeredCount >= activeQuestions.length;

  const scores = useMemo<Score[]>(() => {
    if (quiz.id === "roles-headspaces") {
      const signalScores = scoreSignals(
        activeQuestions.filter(isWeightedQuestion),
        answers,
        getSignals(headspaceSignalIds),
      );
      return scoreHeadspaces(signalScores, roleHeadspaces).sort(
        (a, b) => b.percentage - a.percentage,
      );
    }

    if (quiz.id === "bondage-discipline") {
      return scoreSignals(
        activeQuestions.filter(isWeightedQuestion),
        answers,
        getSignals(bondageDisciplineSignalIds),
      ).sort((a, b) => b.percentage - a.percentage);
    }

    if (quiz.id === "sadism-masochism") {
      return scoreSignals(
        activeQuestions.filter(isWeightedQuestion),
        answers,
        getSignals(sadismMasochismSignalIds),
      ).sort((a, b) => b.percentage - a.percentage);
    }

    if (quiz.id === "dominance-submission") {
      return scoreDsSignals(
        activeQuestions.filter(isWeightedQuestion),
        answers,
        dsSignals,
      ).sort((a, b) => b.percentage - a.percentage);
    }

    return [];
  }, [activeQuestions, answers, quiz.id]);

  const navigateFromHeader = (destination: SiteHeaderDestination) => {
    navigate(siteHeaderRoutePaths[destination]);
  };

  const openSettings = () => {
    navigate("/settings", {
      state: { from: `${location.pathname}${location.search}` },
    });
  };

  const saveNextProfile = (next: StoredProfile) => {
    saveProfile(next);
    setProfile(next);
  };

  const answerQuestion = (value: number) => {
    if (!currentQuestion) return;

    const nextAnswers = { ...answers, [currentQuestion.id]: value };
    const isComplete =
      quiz.questionIds.length > 0 &&
      getAnsweredCount(quiz, nextAnswers) >= quiz.questionIds.length;
    const nextProfile: StoredProfile = {
      ...profile,
      quizzes: {
        ...profile.quizzes,
        [quiz.id]: {
          quizVersion: quiz.version,
          answers: nextAnswers,
          completedAt: isComplete
            ? profile.quizzes[quiz.id]?.completedAt ?? new Date().toISOString()
            : undefined,
        },
      },
    };

    saveNextProfile(nextProfile);

    if (questionIndex < activeQuestions.length - 1) {
      setQuestionIndex((index) => index + 1);
    } else {
      navigate(quizResultsPath(quiz.id));
    }
  };

  const resetQuiz = () => {
    const nextQuizzes = { ...profile.quizzes };
    delete nextQuizzes[quiz.id];
    saveNextProfile({ ...profile, quizzes: nextQuizzes });
    navigate("/");
  };

  if (mode === "results" && !canViewResults) {
    return <Navigate to={quizRoutePath(quiz.id)} replace />;
  }

  if (mode === "quiz" && !currentQuestion) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <SiteHeader
        displayName={settings.displayName}
        onNavigate={navigateFromHeader}
        onOpenSettings={openSettings}
      />

      <main className="app-shell">
        {mode === "quiz" && currentQuestion ? (
          <section className="quiz-layout">
            <aside className="progress-card panel">
              <button className="back-to-hub" onClick={() => navigate("/")}>
                ← Quiz hub
              </button>
              <p className="eyebrow">{quiz.shortTitle}</p>
              <strong>
                {Math.round((answeredCount / activeQuestions.length) * 100)}%
              </strong>
              <div className="progress-track">
                <span
                  style={{
                    width: `${(answeredCount / activeQuestions.length) * 100}%`,
                  }}
                />
              </div>
              <p>
                {answeredCount} of {activeQuestions.length} answered
              </p>
            </aside>

            <article className="question-card panel">
              <div className="question-meta">
                <span>{questionContext(quiz)}</span>
                <span>
                  {questionIndex + 1} / {activeQuestions.length}
                </span>
              </div>

              <h1>{currentQuestion.prompt}</h1>

              <div className="answers">
                {answerOptions.map((option) => (
                  <button
                    key={option.value}
                    className={
                      currentAnswer === option.value
                        ? "answer selected"
                        : "answer"
                    }
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
                  onClick={() =>
                    setQuestionIndex((index) => Math.max(0, index - 1))
                  }
                  disabled={questionIndex === 0}
                >
                  ← Back
                </button>
                <button className="text-button" onClick={() => navigate("/")}>
                  Save & exit
                </button>
              </div>
            </article>
          </section>
        ) : (
          <section className="results-stack">
            <div className="results-heading panel">
              <div>
                <p className="eyebrow">{quiz.title}</p>
                <h1>The shape matters more than any single score.</h1>
                <p>{resultsDescription(quiz)}</p>
              </div>
              <div className="results-heading-actions">
                <button
                  className="secondary"
                  onClick={() => navigate(quizRoutePath(quiz.id))}
                >
                  Edit answers
                </button>
                <button className="primary" onClick={() => navigate("/")}>
                  Back to hub
                </button>
              </div>
            </div>

            <ResultsBody quiz={quiz} scores={scores} />

            <div className="results-actions">
              <button className="secondary" onClick={resetQuiz}>
                Reset this quiz
              </button>
            </div>
          </section>
        )}
      </main>
    </>
  );
}

export function QuizRoutePage({ mode }: { mode: QuizRouteMode }) {
  const { quizId } = useParams();
  const quiz = resolveAvailableQuiz(quizId);

  if (!quiz || quiz.questionIds.length === 0) {
    return <Navigate to="/" replace />;
  }

  return <ResolvedQuizRoute key={`${quiz.id}:${mode}`} quiz={quiz} mode={mode} />;
}
