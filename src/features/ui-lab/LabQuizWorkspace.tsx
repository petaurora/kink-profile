import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { profileRoute } from "../../app/routes";
import { answerOptions } from "../../data/quizScale";
import { appIcons, appIconDefaults } from "../../components/ui/appIcons";
import { resolveQuizDimensionState } from "../../services/domain/quizRuntime";
import type { QuizRecord, QuizService, QuizSnapshot } from "../../services/quizContracts";
import { useOptionalServices, ServiceQueryStatus } from "../../services/AppServicesProvider";
import { useServiceResource } from "../../services/useServiceResource";
import { QuizGlyph } from "../quizzes/QuizCard";
import { quizRadarViews, type QuizSignalScore, type QuizRadarView } from "../quizzes/quizResultsModel";
import { labPath, type LabArea } from "./LabNavigation";
import "./labQuiz.css";

type Go = (area: LabArea, workspace?: string, params?: Record<string, string>) => void;
type Props = { view: string; quizId: string | null; go: Go; service?: QuizService };

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
function QuizLanding({ go, snapshot }: { go: Go; snapshot: QuizSnapshot }) {
  const available = snapshot.quizzes;
  const completed = available.filter(record => record.lifecycle.hasEstablishedResult).length;
  return (
    <section className="lab-quiz-landing" aria-label="Quiz selection">
      <div className="lab-quiz-intro">
        <span className="lab-quiz-progress-label">{completed} of {available.length} completed</span>
      </div>
      <div className="lab-quiz-grid">
        {available.map(({definition:quiz,lifecycle:status}) => {
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
                <span className="lab-quiz-progress-track kp-progress-track" aria-hidden="true"><span style={{width:`${100 * status.answeredCount / status.totalQuestions}%`}} /></span>
              )}
            </button>
          );
        })}
      </div>
      <p className="lab-quiz-storage-note">Your answers save automatically. Leave and come back whenever you like.</p>
    </section>
  );
}

type Resource = ReturnType<typeof useServiceResource<QuizSnapshot>>;
function QuizQuestions({ record, go, service, resource }: { record: QuizRecord; go: Go; service: QuizService; resource: Resource }) {
  const quiz = record.definition;
  const resumeIndex = useRef(record.resumeIndex);
  const [index, setIndex] = useState(resumeIndex.current);
  const [wide, setWide] = useState(() => window.innerWidth > 700);
  const focused = useRef(false);
  const container = useRef<HTMLDivElement>(null);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Guard synchronously before React commits disabled controls.
  const answerTransitionLocked = useRef(false);
  const [confirmingQuestion, setConfirmingQuestion] = useState<string | null>(null);
  const {questions, lifecycle:state, attemptAnswers:answers} = record;
  const answered = state.answeredCount;
  const [selection, setSelection] = useState<{id:string;value:number} | null>(null);
  const start = Math.floor(index / 3) * 3;
  const visible = wide ? questions.slice(start, start + 3).map((q, n) => ({ q, i: start + n })) :
    questions[index] ? [{q: questions[index], i: index}] : [];
  const batchComplete = visible.length > 0 && visible.every(({q}) => answers[q.id] !== undefined);
  useEffect(() => {
    const update = () => setWide(window.innerWidth > 700);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
      if (transitionTimer.current !== null) clearTimeout(transitionTimer.current);
    };
  }, []);
  function focusQuestion(questionIndex: number) {
    const heading = container.current?.querySelector<HTMLElement>(
      `[data-quiz-question-index="${questionIndex}"]`,
    );
    if (!heading) return;
    // Keep the semantic heading as the focus target while scrolling the whole
    // card into view. "nearest" left the card mostly below the phone fold.
    heading.focus({preventScroll: true});
    const card = heading.closest<HTMLElement>(".lab-quiz-question");
    (card ?? heading).scrollIntoView?.({block: "start", behavior: "instant"});
    focused.current = true;
  }

  useLayoutEffect(() => {
    // Only the next visible question unlocks answers; re-rendering the same
    // question after saving must not unlock its confirmation.
    answerTransitionLocked.current = false;
    // Resume targets the first unanswered question, even within a desktop
    // batch. Later navigation focuses the heading for the newly visible card.
    const focusIndex = !focused.current ? resumeIndex.current : wide ? start : index;
    focusQuestion(focusIndex);
  }, [wide, index, start]);

  // A completed deep link goes straight to results. During final-answer
  // confirmation, retain the question until the timer navigates to results.
  if (state.state === "complete" && confirmingQuestion === null && selection === null) {
    return <Navigate to={labPath("Quizzes", "Results", {id:quiz.id})} replace />;
  }
  function answer(questionId: string, questionIndex: number, choice: number) {
    if (confirmingQuestion !== null || answerTransitionLocked.current || resource.pending || resource.failed) return;
    answerTransitionLocked.current = true;
    setSelection({id:questionId,value:choice});
    resource.run(options => service.answerQuestion(quiz.id, questionId, choice, options), next => {
      const nextRecord = next.quizzes.find(value => value.definition.id === quiz.id)!;
      const complete = nextRecord.lifecycle.state === "complete";
      const advance = () => {
        if (complete) go("Quizzes", "Results", {id:quiz.id});
        else if (!wide) setIndex(questionIndex < questions.length - 1 ? questionIndex + 1 : nextRecord.resumeIndex);
      };
      const reducedMotion = typeof window.matchMedia !== "function" || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (wide || reducedMotion) {
        answerTransitionLocked.current = false;
        setSelection(null);
        advance();
        return;
      }
      setConfirmingQuestion(questionId);
      transitionTimer.current = setTimeout(() => {
        transitionTimer.current = null;
        advance();
        if (!complete) {setConfirmingQuestion(null);setSelection(null);}
      }, 390);
    });
  }
  return (
    <section ref={container} className="lab-quiz-runner" aria-label={quiz.title}>
      {resource.pending && <p role="status">Saving answer…</p>}
      <div className="lab-quiz-question-stack">
        {visible.map(({q,i},n) => (
          <article className={`lab-quiz-question${confirmingQuestion===q.id ? " is-confirming" : ""}`} key={q.id}>
            <div className="lab-quiz-card-progress kp-progress-track"
              {...(n===0 ? {role:"progressbar", "aria-label":"Quiz answers saved", "aria-valuenow":answered, "aria-valuemin":0, "aria-valuemax":questions.length, "aria-valuetext":`${answered} of ${questions.length} answered`} : {"aria-hidden":true})}>
              <span style={{width:`${100 * answered / questions.length}%`}} />
            </div>
            <div className="lab-quiz-question-top">
              <span className="lab-quiz-question-meta">Question {i + 1} · {quiz.shortTitle}</span>
              <span className="lab-quiz-question-count">{answered} / {questions.length} answered</span>
            </div>
            <h2 tabIndex={-1} data-quiz-question-index={i} aria-label={`Question ${i + 1} of ${questions.length}: ${q.prompt}`}>{q.prompt}</h2>
            <div className="lab-quiz-options" role="group" aria-label={`Answer question ${i+1}`}>
              {answerOptions.map(option => (
                <button key={option.value} type="button"
                  aria-pressed={(selection?.id===q.id ? selection.value : answers[q.id]) === option.value}
                  aria-hidden={confirmingQuestion===q.id && answers[q.id] !== option.value ? true : undefined}
                  data-quiz-feedback-hidden={confirmingQuestion===q.id && answers[q.id] !== option.value ? "true" : undefined}
                  disabled={confirmingQuestion!==null || resource.pending || resource.failed}
                  className={(selection?.id===q.id ? selection.value : answers[q.id]) === option.value ? "selected" : ""}
                  onClick={() => answer(q.id, i, option.value)}>
                  <span className="lab-quiz-option-number">{option.value}</span>
                  <span className="lab-quiz-option-label">{option.label}</span>
                  {answers[q.id] === option.value && <span className="lab-quiz-option-check" aria-hidden="true">✓</span>}
                </button>
              ))}
            </div>
            {confirmingQuestion===q.id && <span className="lab-quiz-saved-status" role="status">Answer saved</span>}
          </article>
        ))}
      </div>
      <nav className="lab-quiz-run-actions" aria-label="Quiz navigation">
        <button type="button" className="lab-quiz-action-back" disabled={confirmingQuestion!==null || resource.pending || resource.failed || (wide ? start === 0 : index === 0)} onClick={() => setIndex(wide ? Math.max(0,start-3) : Math.max(0,index-1))}>← Back</button>
        <button type="button" className="lab-quiz-action-exit" disabled={confirmingQuestion!==null || resource.pending || resource.failed} onClick={() => go("Quizzes")}>Save & exit</button>
        {wide && start + 3 < questions.length && (
          <button type="button" className="lab-quiz-action-next"
            disabled={!batchComplete || confirmingQuestion!==null || resource.pending || resource.failed}
            onClick={() => setIndex(Math.min(start+3,questions.length-1))}>
            Next questions →
          </button>
        )}
      </nav>
    </section>
  );
}

function QuizResults({ record, go, service, resource }: { record: QuizRecord; go: Go; service: QuizService; resource: Resource }) {
  const navigate = useNavigate();
  const quiz = record.definition;
  const [activeView, setActiveView] = useState("");
  const scores = record.scores;
  const views = useMemo(() => quizRadarViews(quiz, scores), [quiz, scores]);
  const current = views.find(view => view.id === activeView) ?? views[0];
  const measured = scores.filter(score => resolveQuizDimensionState(score.coverage).state !== "unexplored");
  const top = [...measured].sort((a,b) => b.percentage-a.percentage).slice(0,3);

  function retake() {
    resource.run(options => service.startRetake(quiz.id, options), () => go("Quizzes","Question",{id:quiz.id}));
  }
  return (
    <section className="lab-quiz-results" aria-label={`${quiz.title} results`}>
      <header className="lab-quiz-results-intro">
        <p>This is a shape of the signals you shared, not a fixed identity or a list of permissions.</p>
        {record.lifecycle.state === "retake-in-progress" && <p className="lab-quiz-retake-note">A retake is in progress. These remain your last completed results until the new attempt is finished.</p>}
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
            {id:"profile",label:"View Profile",detail:"View the saved profile that includes your quiz evidence",area:"Profile" as const,Icon:appIcons.profile},
            {id:"quizzes",label:"Explore another quiz",detail:"Browse all four quiz topics",area:"Quizzes" as const,Icon:appIcons.quiz},
            {id:"learn",label:"Learn",detail:"Explore educational guides",area:"Learn" as const,Icon:appIcons.education},
          ]).map(item=>
            <button type="button" key={item.id} data-quiz-next-step={item.id} onClick={()=>item.id==="profile" ? navigate(profileRoute.path) : go(item.area)}>
              <item.Icon {...appIconDefaults} aria-hidden="true" />
              <strong>{item.label}</strong>
              <span>{item.detail}</span>
              <appIcons.next size={18} aria-hidden="true" />
            </button>)}
        </div>
      </nav>
      <div className="lab-quiz-result-controls">
        <button type="button" disabled={resource.pending} onClick={record.lifecycle.state === "retake-in-progress" ? ()=>go("Quizzes","Question",{id:quiz.id}) : retake}>
          {record.lifecycle.state === "retake-in-progress" ? "Continue retake" : "Retake this quiz"}
        </button>
      </div>
    </section>
  );
}

export function LabQuizWorkspace({ service: explicitService, ...props }: Props) {
  const services = useOptionalServices();
  const service = explicitService ?? services?.quizzes;
  if (!service) return <p role="alert">Quizzes are unavailable with the current service connection.</p>;
  return <ConnectedQuizWorkspace {...props} service={service}/>;
}
function ConnectedQuizWorkspace({ view, quizId, go, service }: Props & {service:QuizService}) {
  const read = useCallback((options:import("../../services/contracts").RequestOptions) => service.getSnapshot(options), [service]);
  const resource = useServiceResource(read);
  if (!resource.data) return <ServiceQueryStatus loading={resource.loading} error={resource.loadError} onRetry={resource.retryLoad} label="quizzes"/>;
  const recovery = resource.failed && <div role="alert"><p>Your change could not be saved. Your selection is kept here for retry.</p><button onClick={resource.retry}>Retry saving</button></div>;
  if (!view) return <QuizLanding go={go} snapshot={resource.data}/>;
  const record = resource.data.quizzes.find(value => value.definition.id === quizId && value.definition.availability === "available");
  if (!record || record.lifecycle.state === "error") return <p role="alert">That quiz is unavailable. Your saved answers have not changed. <button onClick={()=>go("Quizzes")}>Back to Quizzes</button></p>;
  if (view === "Results" && !record.lifecycle.hasEstablishedResult) return <p role="alert">No completed results are available for this quiz yet. <button onClick={()=>go("Quizzes","Question",{id:record.definition.id})}>Continue quiz</button></p>;
  return <>{recovery}{view === "Results" ? <QuizResults key={record.definition.id} record={record} go={go} service={service} resource={resource}/> :
    view === "Question" ? <QuizQuestions key={record.definition.id} record={record} go={go} service={service} resource={resource}/> : null}</>;
}
