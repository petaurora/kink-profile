// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { quizzes } from "../../data/quizzes";
import { createEmptyProfile, loadProfile, saveProfile } from "../../lib/profileStorage";
import { QuizRoutePage } from "./QuizRoutePage";

const quiz = quizzes.find(item => item.id === "dominance-submission")!;
let root: Root;
let container: HTMLDivElement;

beforeEach(() => {
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
  vi.unstubAllGlobals();
});

function saveCompletedQuiz(retake = false) {
  const profile = createEmptyProfile();
  profile.quizzes[quiz.id] = {
    quizVersion: quiz.version,
    answers: Object.fromEntries(quiz.questionIds.map(id => [id, 3])),
    completedAt: "2026-10-15T12:00:00Z",
    ...(retake ? {
      retake: {
        quizVersion: quiz.version,
        answers: { [quiz.questionIds[0]]: 1 },
        startedAt: "2026-10-15T15:00:00Z",
      },
    } : {}),
  };
  saveProfile(profile);
}

function mountResults() {
  act(() => root.render(
    <MemoryRouter initialEntries={[`/quizzes/${quiz.id}/results`]}>
      <Routes>
        <Route path="/quizzes/:quizId/results" element={<QuizRoutePage mode="results" />} />
        <Route path="/quizzes/:quizId" element={<QuizRoutePage mode="quiz" />} />
        <Route path="/profile" element={<main>Profile destination</main>} />
        <Route path="/quizzes" element={<main>Quiz landing destination</main>} />
        <Route path="/ui-lab/learn" element={<main>Learning destination</main>} />
      </Routes>
    </MemoryRouter>,
  ));
}

it("shows top signals and a compact chart first, then exposes full chart and signal drilldown on request", () => {
  saveCompletedQuiz();
  mountResults();
  const overview = container.querySelector<HTMLElement>(".quiz-results-overview")!;
  expect(overview).not.toBeNull();
  expect(overview.querySelector(".results-summary-panel h2")?.textContent).toBe("At a glance");
  expect(overview.querySelectorAll(".results-top-signal").length).toBeGreaterThan(0);
  expect(overview.querySelector(".quiz-results-preview-panel [role=img]")).not.toBeNull();
  expect(overview.querySelector(".results-ranked-panel")).toBeNull();

  const details = container.querySelector<HTMLDetailsElement>("details.quiz-results-deep-dive")!;
  expect(details).not.toBeNull();
  expect(details.open).toBe(false);
  const toggle = details.querySelector<HTMLElement>("summary")!;
  expect(toggle.textContent).toContain("Explore the full breakdown");
  act(() => toggle.click());
  expect(details.open).toBe(true);
  expect(details.querySelector(".results-radar-panel [role=img]")).not.toBeNull();
  expect(details.querySelector(".results-ranked-panel h2")?.textContent).toBe("All signals");
  const signal = details.querySelector<HTMLButtonElement>(".result-row-toggle")!;
  expect(signal.getAttribute("aria-expanded")).toBe("false");
  act(() => signal.click());
  expect(signal.getAttribute("aria-expanded")).toBe("true");
});

it("keeps the previous result on screen and does not overwrite it during an unfinished retake", () => {
  saveCompletedQuiz(true);
  const before = loadProfile().quizzes[quiz.id]!;
  mountResults();
  expect(container.textContent).toContain("last completed");
  expect(container.querySelector(".results-top-signals")).not.toBeNull();
  expect(container.querySelector(".quiz-results-preview-panel")).not.toBeNull();
  const after = loadProfile().quizzes[quiz.id]!;
  expect(after.answers).toEqual(before.answers);
  expect(after.retake?.answers).toEqual(before.retake?.answers);
});

it("keeps low-coverage historical results available without treating unanswered dimensions as zero", () => {
  const profile = createEmptyProfile();
  profile.quizzes[quiz.id] = {
    quizVersion: quiz.version - 1,
    answers: { [quiz.questionIds[0]]: 3 },
    completedAt: "2026-01-01T12:00:00Z",
  };
  saveProfile(profile);
  mountResults();
  expect(container.querySelector(".quiz-results-overview")).not.toBeNull();
  const details = container.querySelector<HTMLDetailsElement>("details.quiz-results-deep-dive")!;
  act(() => details.querySelector<HTMLElement>("summary")!.click());
  expect(details.open).toBe(true);
  expect(details.textContent).toContain("All signals");
  expect(details.textContent).toContain("Not enough information");
  expect(loadProfile().quizzes[quiz.id]?.answers).toEqual(profile.quizzes[quiz.id]?.answers);
});

it("offers Profile, another quiz and learning as equally weighted post-result choices", () => {
  saveCompletedQuiz();
  mountResults();
  const group = container.querySelector('nav[aria-label="Next steps after quiz results"]')!;
  expect(group).not.toBeNull();
  const links = [...group.querySelectorAll<HTMLAnchorElement>("a.quiz-results-next-step")];
  expect(links).toHaveLength(3);
  expect(links.map(link => link.dataset.quizNextStep)).toEqual(["profile", "quizzes", "learn"]);
  expect(links.map(link => link.textContent)).toEqual([
    expect.stringContaining("View Profile"),
    expect.stringContaining("Explore another quiz"),
    expect.stringContaining("Learn"),
  ]);
  expect(links.map(link => link.getAttribute("href"))).toEqual(["/profile", "/quizzes", "/ui-lab/learn"]);
  expect(group.querySelector(".featured, .primary, [aria-current]")).toBeNull();
  expect(container.querySelector(".quiz-results-overview")).not.toBeNull();
  expect(container.querySelector(".quiz-results-deep-dive")).not.toBeNull();
});

it.each([
  ["profile", "Profile destination"],
  ["quizzes", "Quiz landing destination"],
  ["learn", "Learning destination"],
])("navigates to the %s choice without writing any quiz evidence", (target, expected) => {
  saveCompletedQuiz(true);
  const before = localStorage.getItem("pet-profile-v2");
  mountResults();
  const link = container.querySelector<HTMLAnchorElement>(`[data-quiz-next-step="${target}"]`)!;
  expect(link).not.toBeNull();
  act(() => link.click());
  expect(container.textContent).toContain(expected);
  expect(localStorage.getItem("pet-profile-v2")).toBe(before);
});

it("does not expose the obsolete legacy Reset this quiz control", () => {
  saveCompletedQuiz();
  mountResults();
  expect(container.textContent).not.toContain("Reset this quiz");
  expect([...container.querySelectorAll<HTMLButtonElement>("button")].some(
    button => /reset|delete|discard draft/i.test(button.textContent ?? ""),
  )).toBe(false);
  expect([...container.querySelectorAll<HTMLButtonElement>("button")].some(
    button => button.textContent?.includes("Retake quiz"),
  )).toBe(true);
});
