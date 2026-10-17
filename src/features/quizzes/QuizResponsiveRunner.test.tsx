// @vitest-environment jsdom
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { quizzes } from "../../data/quizzes";
import { PROFILE_STORAGE_KEY, loadProfile, saveProfile, createEmptyProfile } from "../../lib/profileStorage";
import { QuizRoutePage } from "./QuizRoutePage";
import { QuizHomePage } from "./QuizHomePage";

const quiz = quizzes.find((item) => item.id === "dominance-submission")!;
let root: Root;
let container: HTMLDivElement;
let originalWidth: number;

function Location() {
  const location = useLocation();
  return <output data-testid="location">{location.pathname}</output>;
}
function render(element: ReactNode) {
  act(() => root.render(element));
}
function mount(path = `/quizzes/${quiz.id}`) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/quizzes/:quizId" element={<QuizRoutePage mode="quiz" />} />
        <Route path="/quizzes/:quizId/results" element={<QuizRoutePage mode="results" />} />
        <Route path="/quizzes" element={<QuizHomePage />} />
      </Routes>
      <Location />
    </MemoryRouter>,
  );
}
const visibleCards = () => [...container.querySelectorAll<HTMLElement>(".quiz-batch-layout .question-card")];
const click = (node: HTMLElement) => act(() => node.click());
const setViewport = (width: number) => act(() => {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
  window.dispatchEvent(new Event("resize"));
});

beforeEach(() => {
  originalWidth = window.innerWidth;
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  localStorage.clear();
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  localStorage.clear();
  Object.defineProperty(window, "innerWidth", { configurable: true, value: originalWidth });
  vi.unstubAllGlobals();
});

it("shows one focused question on mobile, saves each answer, and advances only one question", () => {
  setViewport(390);
  mount();
  expect(visibleCards()).toHaveLength(1);
  expect(visibleCards()[0].querySelector("h1")).not.toBeNull();
  expect(container.querySelector('nav[aria-label="Quiz navigation"]')?.textContent).toContain("Save & exit");
  expect(container.querySelector('[role="progressbar"]')?.getAttribute("aria-valuenow")).toBe("0");
  click(visibleCards()[0].querySelectorAll<HTMLButtonElement>(".answers button")[2]);
  expect(loadProfile().quizzes[quiz.id]?.answers[quiz.questionIds[0]]).toBe(2);
  expect(visibleCards()).toHaveLength(1);
  expect(container.querySelector(".quiz-question-position")?.textContent).toContain("2 /");
  expect(container.querySelector('[role="progressbar"]')?.getAttribute("aria-valuenow")).toBe("1");
});

it("shows three independently answerable cards per desktop batch with Back and Next navigation", () => {
  setViewport(1200);
  mount();
  expect(visibleCards()).toHaveLength(3);
  expect(container.querySelectorAll(".quiz-batch-layout h2")).toHaveLength(3);
  expect(container.querySelector(".quiz-question-position")?.textContent).toContain("1–3 /");
  click(visibleCards()[1].querySelectorAll<HTMLButtonElement>(".answers button")[4]);
  expect(loadProfile().quizzes[quiz.id]?.answers[quiz.questionIds[1]]).toBe(4);
  expect(visibleCards()).toHaveLength(3);
  expect(visibleCards()[1].querySelectorAll('[aria-pressed="true"]')).toHaveLength(1);
  const next = [...container.querySelectorAll<HTMLButtonElement>(".quiz-run-nav button")].find(node => node.textContent?.includes("Next questions"))!;
  click(next);
  expect(container.querySelector(".quiz-question-position")?.textContent).toContain("4–6 /");
  expect(visibleCards()).toHaveLength(3);
  click([...container.querySelectorAll<HTMLButtonElement>(".quiz-run-nav button")].find(node => node.textContent?.includes("Back"))!);
  expect(container.querySelector(".quiz-question-position")?.textContent).toContain("1–3 /");
  expect(loadProfile().quizzes[quiz.id]?.answers[quiz.questionIds[1]]).toBe(4);
});

it("switches between single and batch layouts on resize without changing saved answers", () => {
  setViewport(390);
  mount();
  click(visibleCards()[0].querySelectorAll<HTMLButtonElement>(".answers button")[1]);
  expect(visibleCards()).toHaveLength(1);
  setViewport(1200);
  expect(visibleCards()).toHaveLength(3);
  expect(loadProfile().quizzes[quiz.id]?.answers[quiz.questionIds[0]]).toBe(1);
  setViewport(390);
  expect(visibleCards()).toHaveLength(1);
});

it("keeps established completed answers authoritative while an in-progress retake is answered on desktop", () => {
  const previous = Object.fromEntries(quiz.questionIds.map(id => [id, 3]));
  const profile = createEmptyProfile();
  profile.quizzes[quiz.id] = {
    quizVersion: quiz.version,
    answers: previous,
    completedAt: "2026-10-15T12:00:00Z",
    retake: {
      quizVersion: quiz.version,
      answers: {},
      startedAt: "2026-10-15T15:00:00Z",
    },
  };
  saveProfile(profile);
  expect(localStorage.getItem(PROFILE_STORAGE_KEY)).not.toBeNull();
  setViewport(1200);
  mount();
  expect(container.textContent).toContain("previous completed result stays active");
  click(visibleCards()[0].querySelectorAll<HTMLButtonElement>(".answers button")[2]);
  const saved = loadProfile().quizzes[quiz.id]!;
  expect(saved.answers[quiz.questionIds[0]]).toBe(3);
  expect(saved.retake?.answers[quiz.questionIds[0]]).toBe(2);
  expect(container.querySelector('[data-testid="location"]')?.textContent).toContain(`/quizzes/${quiz.id}`);
});

it("Continue opens an unfinished first attempt immediately at the earliest unanswered question on mobile", () => {
  const profile = createEmptyProfile();
  profile.quizzes[quiz.id] = {
    quizVersion: quiz.version,
    answers: Object.fromEntries([0, 1, 2, 3].map(index => [quiz.questionIds[index], 2])),
  };
  saveProfile(profile);
  setViewport(390);
  mount("/quizzes");
  expect(container.querySelector(".quiz-home-progress")?.textContent).toContain("0 of 4 complete");
  const continueButton = container.querySelector<HTMLButtonElement>(`button[aria-label^="${quiz.title}: Continue."]`)!;
  expect(continueButton).not.toBeNull();
  click(continueButton);
  expect(container.querySelector('[data-testid="location"]')?.textContent).toBe(`/quizzes/${quiz.id}`);
  expect(visibleCards()).toHaveLength(1);
  expect(container.querySelector(".quiz-question-position")?.textContent).toContain("5 /");
  expect(visibleCards()[0].textContent).toContain("Nope");
  expect(document.activeElement).toBe(visibleCards()[0].querySelector("h1"));
  expect(loadProfile().quizzes[quiz.id]?.answers).toEqual(profile.quizzes[quiz.id]?.answers);
});

it("Continue retake opens the batch containing the first unanswered draft response and keeps previous results", () => {
  const previous = Object.fromEntries(quiz.questionIds.map(id => [id, 3]));
  const draft = Object.fromEntries([0, 1, 2, 3].map(index => [quiz.questionIds[index], 1]));
  const profile = createEmptyProfile();
  profile.quizzes[quiz.id] = {
    quizVersion: quiz.version,
    answers: previous,
    completedAt: "2026-10-15T12:00:00Z",
    retake: { quizVersion: quiz.version, answers: draft, startedAt: "2026-10-15T15:00:00Z" },
  };
  saveProfile(profile);
  setViewport(1200);
  mount("/quizzes");
  // The existing finished quiz still counts as complete while its retake is a draft.
  expect(container.querySelector(".quiz-home-progress")?.textContent).toContain("1 of 4 complete");
  const continueButton = container.querySelector<HTMLButtonElement>(`button[aria-label^="${quiz.title}: Continue retake."]`)!;
  expect(continueButton).not.toBeNull();
  click(continueButton);
  expect(container.querySelector('[data-testid="location"]')?.textContent).toBe(`/quizzes/${quiz.id}`);
  expect(container.querySelector(".quiz-question-position")?.textContent).toContain("4–6 /");
  expect(visibleCards()).toHaveLength(3);
  expect(document.activeElement).toBe(visibleCards()[1].querySelector("h2"));
  expect(container.textContent).toContain("previous completed result stays active");
  const saved = loadProfile().quizzes[quiz.id]!;
  expect(saved.retake?.answers).toEqual(draft);
  expect(saved.answers).toEqual(previous);
});
