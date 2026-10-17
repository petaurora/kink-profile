// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { quizzes } from "../../data/quizzes";
import { createEmptyProfile, loadProfile, saveProfile } from "../../lib/profileStorage";
import { LabQuizWorkspace } from "./LabQuizWorkspace";
import { labPath, parseLabRoute, type LabArea } from "./LabNavigation";

const quiz = quizzes.find(q => q.id === "dominance-submission")!;
let container: HTMLDivElement;
let root: Root;
let priorWidth: number;

function LabTestPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { area, workspace, params, unknown } = parseLabRoute(location.pathname, location.search);
  if (unknown || area !== "Quizzes") return <p role="alert">Invalid Lab route</p>;
  const go = (destination: LabArea, view = "", query?: Record<string,string>) =>
    navigate(labPath(destination, view, query));
  return <>
    <LabQuizWorkspace key={workspace + ":" + (params.get("id") || "")}
      view={workspace} quizId={params.get("id")} go={go} />
    <output data-testid="current-path">{location.pathname}</output>
  </>;
}
function mount(path = labPath("Quizzes")) {
  act(() => root.render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/ui-lab/*" element={<LabTestPage />} />
        <Route path="/ui-lab/profile" element={<main>Profile landing</main>} />
        <Route path="/profile" element={<main>Saved Profile destination</main>} />
        <Route path="/ui-lab/learn" element={<main>Learning landing</main>} />
      </Routes>
    </MemoryRouter>,
  ));
}
const click = (element: HTMLElement) => act(() => element.click());
const resize = (width: number) => act(() => {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
  window.dispatchEvent(new Event("resize"));
});
const path = () => container.querySelector('[data-testid="current-path"]')?.textContent;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  priorWidth = window.innerWidth;
  localStorage.clear();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  localStorage.clear();
  Object.defineProperty(window, "innerWidth", { configurable: true, value: priorWidth });
  vi.unstubAllGlobals();
});

it("registers a native V2 quiz landing, question and results URL without an extra primary tab", () => {
  expect(labPath("Quizzes")).toBe("/ui-lab/quizzes");
  expect(labPath("Quizzes","Question",{id:quiz.id})).toBe(`/ui-lab/quizzes/question?id=${quiz.id}`);
  expect(labPath("Quizzes","Results",{id:quiz.id})).toBe(`/ui-lab/quizzes/results?id=${quiz.id}`);
  const parsed = parseLabRoute("/ui-lab/quizzes/results", `?id=${quiz.id}`);
  expect(parsed.area).toBe("Quizzes");
  expect(parsed.workspace).toBe("Results");
  expect(parsed.unknown).toBe(false);
});

it("opens the native four-card landing and starts a quiz without a legacy route handoff", () => {
  resize(390);
  mount();
  const cards = [...container.querySelectorAll<HTMLButtonElement>(".lab-quiz-card")];
  expect(cards).toHaveLength(4);
  expect(cards.map(card => card.textContent)).toEqual(
    quizzes.filter(q => q.contributesToOverall).map(q => expect.stringContaining(q.title)),
  );
  const start = container.querySelector<HTMLButtonElement>(`[aria-label^="${quiz.title}: Explore quiz"]`)!;
  click(start);
  expect(path()).toBe("/ui-lab/quizzes/question");
  expect(container.querySelectorAll(".lab-quiz-question")).toHaveLength(1);
  expect(container.querySelectorAll(".lab-quiz-options button")).toHaveLength(5);
  click(container.querySelectorAll<HTMLButtonElement>(".lab-quiz-options button")[2]);
  expect(loadProfile().quizzes[quiz.id]?.answers[quiz.questionIds[0]]).toBe(2);
});

it("resumes saved progress at the first unfinished question on mobile and desktop", () => {
  const saved = createEmptyProfile();
  saved.quizzes[quiz.id] = {
    quizVersion: quiz.version,
    answers: Object.fromEntries(quiz.questionIds.slice(0,4).map(id => [id,2])),
  };
  saveProfile(saved);
  resize(390);
  mount(labPath("Quizzes","Question",{id:quiz.id}));
  expect(container.querySelector(".lab-quiz-question-meta")?.textContent).toContain("Question 5");
  expect(container.querySelectorAll(".lab-quiz-question")).toHaveLength(1);
  expect(document.activeElement?.textContent).toBe(container.querySelector(".lab-quiz-question h2")?.textContent);
  resize(1100);
  expect(container.querySelector(".lab-quiz-question-meta")?.textContent).toContain("Question 4");
  expect(container.querySelectorAll(".lab-quiz-question")).toHaveLength(3);
  expect(loadProfile().quizzes[quiz.id]?.answers).toEqual(saved.quizzes[quiz.id]!.answers);
});

it("keeps a previous result authoritative during an incomplete retake and offers equal V2 destinations", () => {
  const saved = createEmptyProfile();
  saved.quizzes[quiz.id] = {
    quizVersion: quiz.version,
    completedAt: "2026-10-15T12:00:00Z",
    answers: Object.fromEntries(quiz.questionIds.map(id => [id,3])),
    retake: { quizVersion: quiz.version, answers: { [quiz.questionIds[0]]:1 }, startedAt:"2026-10-15T16:00:00Z" },
  };
  saveProfile(saved);
  mount(labPath("Quizzes","Results",{id:quiz.id}));
  expect(container.querySelectorAll(".lab-quiz-results-overview .lab-quiz-panel")).toHaveLength(2);
  const disclosure = container.querySelector<HTMLDetailsElement>("details.lab-quiz-details")!;
  expect(disclosure.open).toBe(false);
  click(disclosure.querySelector<HTMLElement>("summary")!);
  expect(disclosure.open).toBe(true);
  expect(disclosure.textContent).toContain("All signals");
  const links = [...container.querySelectorAll<HTMLButtonElement>(".lab-quiz-next-grid button")];
  expect(links.map(link=>link.dataset.quizNextStep)).toEqual(["profile","quizzes","learn"]);
  const before = JSON.stringify(loadProfile().quizzes[quiz.id]);
  click(links[1]);
  expect(path()).toBe("/ui-lab/quizzes");
  expect(JSON.stringify(loadProfile().quizzes[quiz.id])).toBe(before);
});

it("opens the authoritative saved Profile instead of the temporary Lab demo Profile", () => {
  const profile = createEmptyProfile();
  profile.quizzes[quiz.id] = {
    quizVersion: quiz.version,
    answers: Object.fromEntries(quiz.questionIds.map(id => [id,3])),
    completedAt: "2026-10-15T12:00:00Z",
  };
  saveProfile(profile);
  const before = JSON.stringify(loadProfile().quizzes[quiz.id]);
  mount(labPath("Quizzes","Results",{id:quiz.id}));
  click(container.querySelector<HTMLButtonElement>('[data-quiz-next-step="profile"]')!);
  expect(container.textContent).toContain("Saved Profile destination");
  expect(JSON.stringify(loadProfile().quizzes[quiz.id])).toBe(before);
});

it("keeps missing results from inventing scores or changing stored answers", () => {
  mount(labPath("Quizzes","Results",{id:quiz.id}));
  expect(container.textContent).toContain("No completed results");
  expect(loadProfile().quizzes[quiz.id]).toBeUndefined();
});

it("offers Retake only and keeps completed results authoritative until the retake finishes", () => {
  const profile = createEmptyProfile();
  profile.quizzes[quiz.id] = {
    quizVersion: quiz.version,
    completedAt: "2026-10-16T04:00:00Z",
    answers: Object.fromEntries(quiz.questionIds.map(id => [id, 3])),
  };
  saveProfile(profile);
  const completed = loadProfile().quizzes[quiz.id]!;
  mount(labPath("Quizzes", "Results", { id: quiz.id }));
  const controls = container.querySelector<HTMLElement>(".lab-quiz-result-controls")!;
  expect(controls).not.toBeNull();
  const buttons = [...controls.querySelectorAll<HTMLButtonElement>("button")];
  expect(buttons).toHaveLength(1);
  expect(buttons[0].textContent).toBe("Retake this quiz");
  expect(container.textContent).not.toMatch(/Reset this quiz|Delete Quiz History|Discard Draft|Start over/i);
  click(buttons[0]);
  expect(path()).toBe("/ui-lab/quizzes/question");
  expect(container.querySelector(".lab-quiz-runner")).not.toBeNull();
  const saved = loadProfile().quizzes[quiz.id]!;
  expect(saved.answers).toEqual(completed.answers);
  expect(saved.completedAt).toBe(completed.completedAt);
  expect(saved.retake).toBeDefined();
  expect(saved.retake?.answers).toEqual({});
  click([...container.querySelectorAll<HTMLButtonElement>(".lab-quiz-run-actions button")].find(btn => btn.textContent?.includes("Save & exit"))!);
  expect(path()).toBe("/ui-lab/quizzes");
  expect(container.querySelector<HTMLButtonElement>(`[aria-label^="${quiz.title}: Continue retake"]`)).not.toBeNull();
  expect(loadProfile().quizzes[quiz.id]?.answers).toEqual(completed.answers);
  expect(loadProfile().quizzes[quiz.id]?.retake).toBeDefined();
});

it("never presents quiz deletion or reset actions on the native landing or runner", () => {
  mount();
  expect(container.textContent).not.toMatch(/Reset this quiz|Delete Quiz History|Discard Draft|Start over/i);
  click(container.querySelector<HTMLButtonElement>(`[aria-label^="${quiz.title}: Explore quiz"]`)!);
  expect(container.textContent).not.toMatch(/Reset this quiz|Delete Quiz History|Discard Draft|Start over/i);
});


it("requires a deliberate mobile answer before advancing, with in-card progress", () => {
  resize(390);
  mount(labPath("Quizzes", "Question", { id: quiz.id }));
  const controls = [...container.querySelectorAll<HTMLButtonElement>(".lab-quiz-run-actions button")];
  expect(controls.map(button=>button.textContent)).toEqual(["← Back", "Save & exit"]);
  expect(container.textContent).not.toMatch(/Review unanswered|move ahead|Next question/i);
  const progress = container.querySelector<HTMLElement>(".lab-quiz-card-progress")!;
  expect(progress.getAttribute("role")).toBe("progressbar");
  expect(progress.getAttribute("aria-valuenow")).toBe("0");
  expect(progress.querySelector<HTMLElement>("span")?.style.width).toBe("0%");
  expect(loadProfile().quizzes[quiz.id]).toBeUndefined();
  click(container.querySelectorAll<HTMLButtonElement>(".lab-quiz-options button")[2]);
  expect(loadProfile().quizzes[quiz.id]?.answers).toEqual({ [quiz.questionIds[0]]: 2 });
  expect(container.querySelector(".lab-quiz-question-meta")?.textContent).toContain("Question 2");
  expect(container.querySelector(".lab-quiz-card-progress")?.getAttribute("aria-valuenow")).toBe("1");
  expect(container.querySelector<HTMLElement>(".lab-quiz-card-progress span")?.style.width).toBe(`${100 / quiz.questionIds.length}%`);
});
it("desktop blocks moving to the next three-question group until all are answered", () => {
  resize(1100);
  mount(labPath("Quizzes", "Question", { id: quiz.id }));
  const next = () => [...container.querySelectorAll<HTMLButtonElement>(".lab-quiz-run-actions button")]
    .find(button => button.textContent?.includes("Next questions"))!;
  expect(next().disabled).toBe(true);
  expect(container.querySelectorAll(".lab-quiz-question")).toHaveLength(3);
  expect(container.querySelectorAll('[role="progressbar"]')).toHaveLength(1);
  for (let i=0;i<3;i++) {
    const cards = container.querySelectorAll<HTMLElement>(".lab-quiz-question");
    click(cards[i].querySelectorAll<HTMLButtonElement>(".lab-quiz-options button")[3]);
    expect(loadProfile().quizzes[quiz.id]?.answers[quiz.questionIds[i]]).toBe(3);
    if (i<2) expect(next().disabled).toBe(true);
  }
  expect(next().disabled).toBe(false);
  click(next());
  expect(container.querySelector(".lab-quiz-question-meta")?.textContent).toContain("Question 4");
  expect(document.activeElement?.getAttribute("data-quiz-question-index")).toBe("3");
});
it("retake preserves completed evidence when navigating back without skipping", () => {
  resize(390);
  const previous = Object.fromEntries(quiz.questionIds.map(id => [id, 4]));
  const draft = { [quiz.questionIds[0]]: 1 };
  const profile = createEmptyProfile();
  profile.quizzes[quiz.id] = {
    quizVersion: quiz.version,
    completedAt: "2026-10-16T04:00:00Z",
    answers: previous,
    retake: {
      quizVersion: quiz.version,
      answers: draft,
      startedAt: "2026-10-16T04:01:00Z",
    },
  };
  saveProfile(profile);
  mount(labPath("Quizzes", "Question", {id:quiz.id}));
  expect(container.querySelector(".lab-quiz-question-meta")?.textContent).toContain("Question 2");
  expect(container.querySelector(".lab-quiz-card-progress")?.getAttribute("aria-valuenow")).toBe("1");
  const back = [...container.querySelectorAll<HTMLButtonElement>(".lab-quiz-run-actions button")]
    .find(button=>button.textContent?.includes("Back"))!;
  click(back);
  const after = loadProfile().quizzes[quiz.id]!;
  expect(after.answers).toEqual(previous);
  expect(after.retake?.answers).toEqual(draft);
  expect(container.textContent).not.toContain("Review unanswered");
});
it("uses a quiet two-action phone footer with no skip or duplicate navigation", () => {
  resize(390);
  mount(labPath("Quizzes","Question",{id:quiz.id}));
  const nav=container.querySelector<HTMLElement>(".lab-quiz-run-actions")!;
  const buttons=[...nav.querySelectorAll<HTMLButtonElement>("button")];
  expect(buttons.map(button=>button.className)).toEqual([
    "lab-quiz-action-back",
    "lab-quiz-action-exit",
  ]);
  expect(buttons[0].disabled).toBe(true);
  expect(buttons[1].textContent).toBe("Save & exit");
  expect(nav.textContent).not.toMatch(/Next question|Review unanswered/i);
  expect(container.querySelectorAll(".lab-quiz-question")).toHaveLength(1);
  expect(loadProfile().quizzes[quiz.id]).toBeUndefined();
});
it("uses the approved warm response labels with unchanged numeric 0–4 answer persistence", () => {
  resize(390);
  mount(labPath("Quizzes", "Question", { id: quiz.id }));
  const expected = ["Nope", "A little", "Somewhat", "A lot", "Absolutely"];
  const buttons = [...container.querySelectorAll<HTMLButtonElement>(".lab-quiz-options button")];
  expect(buttons).toHaveLength(5);
  expect(buttons.map(button => button.querySelectorAll("span")[1]?.textContent)).toEqual(expected);
  expect(buttons.map(button => Number(button.querySelector(".lab-quiz-option-number")?.textContent)))
    .toEqual([0, 1, 2, 3, 4]);
  click(buttons[4]);
  const answers = loadProfile().quizzes[quiz.id]?.answers;
  expect(answers).toEqual({ [quiz.questionIds[0]]: 4 });
  expect(container.querySelector('[role="progressbar"]')?.getAttribute("aria-valuenow")).toBe("1");
});


it("shares the KPI progress-gradient skin between quiz landing and question cards", () => {
  const profile = createEmptyProfile();
  profile.quizzes[quiz.id] = {
    quizVersion: quiz.version,
    answers: { [quiz.questionIds[0]]: 2 },
  };
  saveProfile(profile);
  resize(390);
  mount();
  const landing = container.querySelector<HTMLElement>(".lab-quiz-progress-track")!;
  expect(landing).not.toBeNull();
  expect(landing.classList.contains("kp-progress-track")).toBe(true);
  expect(landing.querySelector<HTMLElement>("span")?.style.width)
    .toBe(`${100 / quiz.questionIds.length}%`);
  click(container.querySelector<HTMLButtonElement>(`[aria-label^="${quiz.title}: Continue"]`)!);
  const current = container.querySelector<HTMLElement>(".lab-quiz-card-progress")!;
  expect(current.classList.contains("kp-progress-track")).toBe(true);
  expect(current.getAttribute("aria-valuenow")).toBe("1");
  expect(current.querySelector<HTMLElement>("span")?.style.width)
    .toBe(`${100 / quiz.questionIds.length}%`);
});
