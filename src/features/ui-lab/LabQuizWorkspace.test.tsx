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
  expect(container.querySelector(".lab-quiz-run-meta")?.textContent).toContain("5 /");
  expect(container.querySelectorAll(".lab-quiz-question")).toHaveLength(1);
  expect(document.activeElement?.textContent).toBe(container.querySelector(".lab-quiz-question h2")?.textContent);
  resize(1100);
  expect(container.querySelector(".lab-quiz-run-meta")?.textContent).toContain("4–6 /");
  expect(container.querySelectorAll(".lab-quiz-question")).toHaveLength(3);
  expect(loadProfile().quizzes[quiz.id]?.answers).toEqual(saved.quizzes[quiz.id].answers);
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

it("keeps missing results from inventing scores or changing stored answers", () => {
  mount(labPath("Quizzes","Results",{id:quiz.id}));
  expect(container.textContent).toContain("No completed results");
  expect(loadProfile().quizzes[quiz.id]).toBeUndefined();
});
