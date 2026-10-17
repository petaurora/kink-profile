import { useEffect, useMemo, useRef, useState } from "react";
import { quizzes, type QuizDefinition } from "../../data/quizzes";
import { answerOptions } from "../../data/quizScale";
import { loadProfile, saveProfile, type StoredProfile } from "../../lib/profileStorage";
import { appIcons, appIconDefaults } from "../../components/ui/appIcons";
import {
  answerQuizQuestion, canViewQuizResults, getAnsweredCount, getQuestionsForQuiz,
  getQuizAttemptAnswers, getQuizDataIssue, initialQuestionIndex,
  resolveAvailableQuiz, resolveQuizDimensionState, resolveQuizLifecycle,
  startQuizRetake,
} from "../quizzes/quizRuntime";
import { QuizGlyph } from "../quizzes/QuizCard";
import { quizRadarViews, scoreQuizAnswers, type QuizSignalScore, type QuizRadarView } from "../quizzes/quizResultsModel";
import type { LabArea } from "./LabNavigation";
import "./labQuiz.css";

type Go = (area: LabArea, workspace?: string, params?: Record<string, string>) => void;
type QuizView = "" | "Question" | "Results";
type Props = { view: string; quizId: string | null; go: Go };

function chartPoints(scores: QuizSignalScore[], multiplier = 1) {
  const measured = scores.filter(score => resolveQuizDimensionState(score.coverage).state !== "unexplored");
  return measured.map((score, index) => {
    const theta = -Math.PI / 2 + index * Math.PI * 2 / measured.length;
    const radius = 98 * multiplier * (score.percentage / 100);
    return [140 + Math.cos(theta) * radius, 140 + Math.sin(theta) * radius].join(",");
  }).join(" ");
}
function NativeRadar({ view }: { view: QuizRadarView }) {
  const measured = view.scores.filter(score => resolveQuizDimensionState(score.coverage).state !== "unexplored");
  if (measured.length < 3) {
    return <p className="lab-quiz-no-chart">Not enough information to draw this chart yet. Unmeasured dimensions remain unknown, not zero.</p>;
  }
  const polygon = (ratio: number) => measured.map((_, i) => {
    const theta = -Math.PI / 2 + i * Math.PI * 2 / measured.length;
    return `${140 + Math.cos(theta) * 98 * ratio},${140 + Math.sin(theta) * 98 * ratio}`;
  }).join(" ");
  return (
    <div className="lab-quiz-radar">
      <svg viewBox="0 0 280 280" role="img" aria-label={`${view.title}; measured dimensions only`}>
        {[.25, .5, .75, 1].map(step =>
          <polygon key={step} className="lab-quiz-radar-ring" points={polygon(step)} />
        )}
        {measured.map((score, i) => {
          const theta = -Math.PI / 2 + i * Math.PI * 2 / measured.length;
          return <line key={score.id} className="lab-quiz-radar-axis" x1={140} y1={140}
            x2={140 + Math.cos(theta) * 98} y2={140 + Math.sin(theta) * 98} />;
        })}
        <polygon className="lab-quiz-radar-shape" points={chartPoints(view.scores)} />
        {measured.map((score, i) => {
          const theta = -Math.PI / 2 + i * Math.PI * 2 / measured.length;
          return <circle key={score.id} className="lab-quiz-radar-dot"
            cx={140 + Math.cos(theta) * 98 * score.percentage / 100}
            cy={140 + Math.sin(theta) * 98 * score.percentage / 100} r="3.5" />;
        })}
      </svg>
      <p>{view.scores.length - measured.length > 0
        ? `${view.scores.length - measured.length} unmeasured dimension(s) omitted from the chart.`
        : "A visualization of the measured dimensions, not a fixed identity."}</p>
    </div>
  );
}
function QuizLanding({ go }: { go: Go }) {
  const profile = loadProfile();
  const available = quizzes.filter(quiz => quiz.contributesToOverall);
  const completed = available.filter(quiz => resolveQuizLifecycle(quiz, profile).hasEstablishedResult).length;
  return (
    <section className="lab-quiz-landing" aria-label="Quiz selection">
      <div className="lab-quiz-intro">
        <p>Explore dynamics, roles and experiences. Choose any quiz and return to unfinished answers whenever you want.</p>
        <span className="lab-quiz-progress-label">{completed} of {available.length} completed</span>
      </div>
      <div className="lab-quiz-grid">
        {available.map(quiz => {
          const status = resolveQuizLifecycle(quiz, profile);
          const action = status.state === "complete" ? "View results"
            : status.state === "retake-in-progress" ? "Continue retake"
            : status.state === "in-progress" ? "Continue"
            : status.state === "error" ? "Unavailable" : "Explore quiz";
          const meta = status.state === "retake-in-progress"
            ? `${status.answeredCount} of ${status.totalQuestions} answered · previous result saved`
            : status.state === "in-progress"
              ? `${status.answeredCount} of ${status.totalQuestions} answered`
              : status.state === "complete" ? "Completed"
                : `${quiz.questionIds.length} questions · ~${quiz.estimatedMinutes} min`;
          const disabled = status.state === "error" || quiz.availability !== "available";
          return (
            <button
              type="button" key={quiz.id} className="lab-quiz-card"
              aria-label={`${quiz.title}: ${action}. ${meta}`}
              disabled={disabled}
              onClick={() => go("Quizzes", status.state === "complete" ? "Results" : "Question", { id: quiz.id })}
            >
              <span className="lab-quiz-card-top"><span className="lab-quiz-card-glyph"><QuizGlyph name={quiz.icon}/></span><appIcons.next aria-hidden="true" size={19}/></span>
              <span className="lab-quiz-card-name">{quiz.title}</span>
              <span className="lab-quiz-card-description">{quiz.description}</span>
              <span className="lab-quiz-card-bottom"><span>{meta}</span><strong>{action} →</strong></span>
              {(status.state === "in-progress" || status.state === "retake-in-progress") && (
                <span className="lab-quiz-progress-track" aria-hidden="true"><span style={{width:`${100 * status.answeredCount / status.totalQuestions}%`}} /></span>
              )}
            </button>
          );
        })}
      </div>
      <p className="lab-quiz-storage-note">Quiz answers are saved to your browser-local profile. They are not temporary Lab demo records.</p>
    </section>
  );
}

function QuizQuestions({ quiz, go }: { quiz: QuizDefinition; go: Go }) {
  const [profile, setProfile] = useState<StoredProfile>(loadProfile);
  const resumeIndex = useRef(initialQuestionIndex(quiz, profile));
  const [index, setIndex] = useState(resumeIndex.current);
  const [wide, setWide] = useState(() => window.innerWidth > 700);
  const focused = useRef(false);
  const container = useRef<HTMLDivElement>(null);
  const questions = useMemo(() => getQuestionsForQuiz(quiz), [quiz]);
  const state = resolveQuizLifecycle(quiz, profile);
  const answers = getQuizAttemptAnswers(quiz, profile);
  const answered = getAnsweredCount(quiz, answers);
  const start = Math.floor(index / 3) * 3;
  const visible = wide ? questions.slice(start, start + 3).map((q, n) => ({ q, i: start + n })) :
    questions[index] ? [{q: questions[index], i: index}] : [];
  useEffect(() => {
    const update = () => setWide(window.innerWidth > 700);
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  useEffect(() => {
    if (focused.current) return;
    const heading = container.current?.querySelector<HTMLElement>("[data-resume-question]");
    if (heading) {
      focused.current = true;
      heading.focus({preventScroll:true});
    }
  }, [wide, index]);

  if (state.state === "complete") {
    go("Quizzes", "Results", {id:quiz.id});
    return null;
  }
  function answer(questionId: string, questionIndex: number, choice: number) {
    const next = answerQuizQuestion(quiz, profile, questionId, choice);
    saveProfile(next);
    setProfile(next);
    if (resolveQuizLifecycle(quiz, next).state === "complete") {
      go("Quizzes", "Results", {id:quiz.id});
    } else if (!wide) {
      setIndex(questionIndex < questions.length - 1 ? questionIndex + 1 : initialQuestionIndex(quiz, next));
    }
  }
  return (
    <section ref={container} className="lab-quiz-runner" aria-label={quiz.title}>
      <div className="lab-quiz-run-header">
        <div className="lab-quiz-run-meta">
          <span>{state.state === "retake-in-progress" ? "Retake · previous result saved" : quiz.shortTitle}</span>
          <strong>{wide ? `${start + 1}–${Math.min(start + 3, questions.length)} / ${questions.length}` : `${index + 1} / ${questions.length}`}</strong>
        </div>
        <div role="progressbar" className="lab-quiz-progress-track" aria-label="Quiz answers saved" aria-valuenow={answered} aria-valuemin={0} aria-valuemax={questions.length} aria-valuetext={`${answered} of ${questions.length} answered`}>
          <span style={{width:`${100 * answered / questions.length}%`}}/>
        </div>
        <p>{answered} of {questions.length} answered. Your answers save as you select them.</p>
      </div>
      <div className="lab-quiz-question-stack">
        {visible.map(({q,i}) => (
          <article className="lab-quiz-question" key={q.id}>
            <span className="lab-quiz-question-meta">Question {i + 1} · {quiz.shortTitle}</span>
            <h2 tabIndex={-1} data-resume-question={i === resumeIndex.current ? "" : undefined}>{q.prompt}</h2>
            <div className="lab-quiz-options" role="group" aria-label={`Answer question ${i+1}`}>
              {answerOptions.map(option => (
                <button key={option.value} type="button"
                  aria-pressed={answers[q.id] === option.value}
                  className={answers[q.id] === option.value ? "selected" : ""}
                  onClick={() => answer(q.id, i, option.value)}>
                  <span className="lab-quiz-option-number">{option.value}</span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </article>
        ))}
      </div>
      <nav className="lab-quiz-run-actions" aria-label="Quiz navigation">
        <button type="button" disabled={index === 0} onClick={() => setIndex(wide ? Math.max(0,start-3) : Math.max(0,index-1))}>← Back</button>
        <button type="button" onClick={() => go("Quizzes")}>Save & exit</button>
        {wide && <button type="button" onClick={() => setIndex(start + 3 >= questions.length ? initialQuestionIndex(quiz,profile) : Math.min(start+3,questions.length-1))}>
          {start + 3 >= questions.length ? "Review unanswered" : "Next questions →"}
        </button>}
      </nav>
    </section>
  );
}

function QuizResults({ quiz, go }: { quiz:QuizDefinition; go:Go }) {
  const [profile, setProfile] = useState(loadProfile);
  const [activeView, setActiveView] = useState("");
  const answers = profile.quizzes[quiz.id]?.answers ?? {};
  const questions = useMemo(() => getQuestionsForQuiz(quiz), [quiz]);
  const scores = useMemo(() => scoreQuizAnswers(quiz, questions, answers), [quiz, questions, answers]);
  const views = useMemo(() => quizRadarViews(quiz, scores), [quiz, scores]);
  const current = views.find(view => view.id === activeView) ?? views[0];
  const measured = scores.filter(score => resolveQuizDimensionState(score.coverage).state !== "unexplored");
  const top = [...measured].sort((a,b) => b.percentage-a.percentage).slice(0,3);

  function retake() {
    const next = startQuizRetake(quiz, profile);
    saveProfile(next);
    setProfile(next);
    go("Quizzes","Question",{id:quiz.id});
  }
  return (
    <section className="lab-quiz-results" aria-label={`${quiz.title} results`}>
      <header className="lab-quiz-results-intro">
        <p>This is a shape of the signals you shared, not a fixed identity or a list of permissions.</p>
        {profile.quizzes[quiz.id]?.retake && <p className="lab-quiz-retake-note">A retake is in progress. These remain your last completed results until the new attempt is finished.</p>}
      </header>
      <div className="lab-quiz-results-overview" aria-label="Results at a glance">
        <article className="lab-quiz-panel">
          <span className="lab-quiz-panel-kicker">Your strongest measured patterns</span>
          <h2>At a glance</h2>
          {top.length ? <ol className="lab-quiz-top-list">{top.map(score=>
            <li key={score.id}><strong>{score.label}</strong><span>{score.percentage}%</span></li>
          )}</ol> : <p>There is not enough measured evidence to show strong patterns yet.</p>}
        </article>
        <article className="lab-quiz-panel lab-quiz-mini-chart">
          <span className="lab-quiz-panel-kicker">One view of your results</span>
          <h2>{views[0]?.title ?? "Your shape"}</h2>
          {views[0] && <NativeRadar view={views[0]}/>}
        </article>
      </div>
      <details className="lab-quiz-details">
        <summary><span><strong>Explore the full breakdown</strong><small>Chart perspectives, measurements and signal explanations</small></span><appIcons.expand {...appIconDefaults} aria-hidden="true"/></summary>
        <div className="lab-quiz-details-body">
          <section className="lab-quiz-panel" aria-label="Detailed chart">
            <h2>Explore the shape</h2>
            {views.length > 1 && <div className="lab-quiz-chart-tabs" role="group" aria-label="Chart perspective">
              {views.map(view => <button type="button" key={view.id} aria-pressed={current.id === view.id} onClick={()=>setActiveView(view.id)}>{view.label}</button>)}
            </div>}
            {current && <NativeRadar view={current}/>}
          </section>
          <section className="lab-quiz-panel" aria-label="All signals">
            <h2>All signals</h2>
            {[...scores].sort((a,b) => {
              const aUnknown=resolveQuizDimensionState(a.coverage).state === "unexplored";
              const bUnknown=resolveQuizDimensionState(b.coverage).state === "unexplored";
              return Number(aUnknown)-Number(bUnknown)||b.percentage-a.percentage;
            }).map(score => {
              const status = resolveQuizDimensionState(score.coverage).state;
              return <details key={score.id} className="lab-quiz-signal">
                <summary>
                  <span><strong>{score.label}</strong><small>{status === "unexplored" ? "Not enough information" : status === "developing" ? "Developing" : "Measured signal"}</small></span>
                  <span>{status === "unexplored" ? "—" : `${score.percentage}%`}</span>
                </summary>
                <p>{score.description}</p>
              </details>;
            })}
          </section>
        </div>
      </details>
      <nav className="lab-quiz-next" aria-label="Next steps after quiz results">
        <div><h2>Where would you like to go next?</h2><p>Choose whichever feels useful. Your results remain saved.</p></div>
        <div className="lab-quiz-next-grid">
          {([
            {id:"profile",label:"View Profile",detail:"View your other profile evidence",area:"Profile" as const,Icon:appIcons.profile},
            {id:"quizzes",label:"Explore another quiz",detail:"Browse all four quiz topics",area:"Quizzes" as const,Icon:appIcons.quiz},
            {id:"learn",label:"Learn",detail:"Explore educational guides",area:"Learn" as const,Icon:appIcons.education},
          ]).map(item=>
            <button type="button" key={item.id} data-quiz-next-step={item.id} onClick={()=>go(item.area)}>
              <item.Icon {...appIconDefaults} aria-hidden="true" />
              <strong>{item.label}</strong>
              <span>{item.detail}</span>
              <appIcons.next size={18} aria-hidden="true" />
            </button>)}
        </div>
      </nav>
      <div className="lab-quiz-result-controls">
        <button type="button" onClick={profile.quizzes[quiz.id]?.retake ? ()=>go("Quizzes","Question",{id:quiz.id}) : retake}>
          {profile.quizzes[quiz.id]?.retake ? "Continue retake" : "Retake this quiz"}
        </button>
      </div>
    </section>
  );
}

export function LabQuizWorkspace({ view, quizId, go }: Props) {
  if (!view) return <QuizLanding go={go}/>;
  const quiz = resolveAvailableQuiz(quizId ?? undefined);
  if (!quiz) return <p role="alert">That quiz is unavailable. <button type="button" onClick={()=>go("Quizzes")}>Back to Quizzes</button></p>;
  const issue = getQuizDataIssue(quiz);
  if (issue) return <p role="alert">This quiz's question data is unavailable. Your saved answers have not changed. <button type="button" onClick={()=>go("Quizzes")}>Back to Quizzes</button></p>;
  const profile = loadProfile();
  if (view === "Results" && !canViewQuizResults(quiz, profile)) {
    return <p role="alert">No completed results are available for this quiz yet. <button type="button" onClick={()=>go("Quizzes","Question",{id:quiz.id})}>Continue quiz</button></p>;
  }
  if (view === "Question" && resolveQuizLifecycle(quiz, profile).state === "complete") {
    return <p>You've finished this quiz. <button type="button" onClick={()=>go("Quizzes","Results",{id:quiz.id})}>View results</button></p>;
  }
  return view === "Results" ? <QuizResults key={quiz.id} quiz={quiz} go={go} /> :
    view === "Question" ? <QuizQuestions key={quiz.id} quiz={quiz} go={go} /> : null;
}
