// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { quizzes } from "../../data/quizzes";
import { createEmptyProfile } from "../../lib/profileStorage";
import { QuizCard } from "./QuizCard";
import { QuizHomePage } from "./QuizHomePage";

let container: HTMLDivElement;
let root: Root;
const render = (element: React.ReactNode) => act(() => root.render(element));

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

it("shows all four independent quizzes as accessible visual cards without requiring a guided sequence", () => {
  render(<MemoryRouter><QuizHomePage /></MemoryRouter>);
  const cards = [...container.querySelectorAll<HTMLButtonElement>(".quiz-card-grid.quiz-list .quiz-visual-card")];
  expect(cards).toHaveLength(4);
  expect(cards.map(card => card.textContent)).toEqual(
    quizzes.filter(quiz => quiz.contributesToOverall).map(quiz => expect.stringContaining(quiz.title)),
  );
  expect(cards.every(card => card.textContent?.includes("Explore"))).toBe(true);
  expect(container.querySelector(".quiz-home-progress")?.textContent).toContain("0 of 4 complete");
  expect(container.querySelector(".quiz-list-row")).toBeNull();
});

it("keeps answers and established results distinct from in-progress and retake status", () => {
  const quiz = quizzes[0];
  const onOpen = vi.fn();
  const fresh = createEmptyProfile();
  render(<QuizCard quiz={quiz} profile={fresh} onOpen={onOpen} />);
  const card = () => container.querySelector<HTMLButtonElement>(".quiz-visual-card")!;
  expect(card().getAttribute("aria-label")).toContain("Explore");
  expect(card().textContent).toContain(quiz.description);
  act(() => card().click());
  expect(onOpen).toHaveBeenCalledWith(quiz);

  const partial = { ...fresh, quizzes: { [quiz.id]: { quizVersion: quiz.version, answers: { [quiz.questionIds[0]]: 2 } } } };
  render(<QuizCard quiz={quiz} profile={partial} onOpen={onOpen} />);
  expect(card().getAttribute("aria-label")).toContain("Continue");
  expect(card().textContent).toContain("1 of");
  expect(card().querySelector(".card-progress")).not.toBeNull();

  const completeAnswers = Object.fromEntries(quiz.questionIds.map(id => [id, 3]));
  const done = { ...fresh, quizzes: { [quiz.id]: { quizVersion: quiz.version, answers: completeAnswers, completedAt: "2026-10-15T12:00:00Z" } } };
  render(<QuizCard quiz={quiz} profile={done} onOpen={onOpen} />);
  expect(card().getAttribute("aria-label")).toContain("View results");
  expect(card().querySelector(".card-progress")).toBeNull();

  const retake = { ...fresh, quizzes: { [quiz.id]: { ...done.quizzes[quiz.id], retake: { quizVersion: quiz.version, answers: { [quiz.questionIds[0]]: 4 }, startedAt: "2026-10-15T15:00:00Z" } } } };
  render(<QuizCard quiz={quiz} profile={retake} onOpen={onOpen} />);
  expect(card().getAttribute("aria-label")).toContain("Continue retake");
  expect(card().textContent).toContain("previous result saved");
  expect(card().querySelector(".card-progress")).not.toBeNull();
});
