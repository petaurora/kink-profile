// @vitest-environment jsdom
import { createLocalQuizService } from "../../services/local/createLocalQuizService";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { quizzes } from "../../data/quizzes";
import { createEmptyProfile, loadProfile, saveProfile } from "../../lib/profileStorage";
import { LabQuizWorkspace } from "./LabQuizWorkspace";
import { labPath, parseLabRoute, type LabArea } from "./LabNavigation";

const quizService = createLocalQuizService();
const quiz = quizzes.find(q => q.id === "dominance-submission")!;
let root: Root;
let host: HTMLDivElement;
let originalWidth: number;
function Screen() {
  const location = useLocation();
  const navigate = useNavigate();
  const route = parseLabRoute(location.pathname, location.search);
  const go = (area: LabArea, view = "", params?: Record<string,string>) => navigate(labPath(area,view,params));
  return <LabQuizWorkspace service={quizService} view={route.workspace} quizId={route.params.get("id")} go={go}/>;
}
async function renderQuiz() {
  await act(async()=>{root.render(<MemoryRouter initialEntries={[labPath("Quizzes","Question",{id:quiz.id})]}><Screen/></MemoryRouter>);});
}
const press=async(text:string)=>{
  const button=[...host.querySelectorAll<HTMLButtonElement>(".lab-quiz-run-actions button")]
    .find(el=>el.textContent?.startsWith(text));
  expect(button).toBeDefined();
  await act(async()=>{button!.click();});
};
const focusIndex=()=>document.activeElement?.getAttribute("data-quiz-question-index");
beforeEach(()=>{
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT",true);
  originalWidth=window.innerWidth;
  localStorage.clear();
  host=document.createElement("div");document.body.append(host);root=createRoot(host);
});
afterEach(()=>{
  act(()=>root.unmount());host.remove();localStorage.clear();
  Object.defineProperty(window,"innerWidth",{configurable:true,value:originalWidth});
  vi.unstubAllGlobals();
});
it("focuses each new mobile heading on answers and Back without skip controls",async () =>{
  Object.defineProperty(window,"innerWidth",{configurable:true,value:390});
  await renderQuiz();
  expect(focusIndex()).toBe("0");
  const heading=host.querySelector<HTMLElement>('[data-quiz-question-index="0"]')!;
  expect(heading.getAttribute("tabindex")).toBe("-1");
  expect(heading.getAttribute("aria-label")).toContain("Question 1 of");
  await act(async()=>{host.querySelectorAll<HTMLButtonElement>(".lab-quiz-options button")[1].click();});
  expect(focusIndex()).toBe("1");
  expect(host.querySelectorAll(".lab-quiz-options button.selected .lab-quiz-option-check")).toHaveLength(0);
  await press("← Back");
  expect(focusIndex()).toBe("0");
  expect(host.querySelector(".lab-quiz-options button.selected .lab-quiz-option-check")).not.toBeNull();
  expect(loadProfile().quizzes[quiz.id]?.answers).toEqual({[quiz.questionIds[0]]:1});
  expect(host.textContent).not.toContain("Review unanswered");
  expect(host.textContent).not.toContain("Next question");
});
it("focuses the exact resumed desktop prompt and enables new batches only after answering each card",async () =>{
  Object.defineProperty(window,"innerWidth",{configurable:true,value:1100});
  const profile=createEmptyProfile();
  profile.quizzes[quiz.id]={quizVersion:quiz.version,answers:Object.fromEntries(quiz.questionIds.slice(0,4).map(id=>[id,3]))};
  saveProfile(profile);
  await renderQuiz();
  expect(focusIndex()).toBe("4");
  expect(document.activeElement?.getAttribute("aria-label")).toContain("Question 5 of");
  await press("← Back");
  expect(focusIndex()).toBe("0");
  expect(host.querySelector<HTMLButtonElement>(".lab-quiz-run-actions button")?.disabled).toBe(true);
  const next=[...host.querySelectorAll<HTMLButtonElement>(".lab-quiz-run-actions button")]
    .find(el=>el.textContent?.startsWith("Next questions"))!;
  expect(next.disabled).toBe(false);
  await press("Next questions");
  expect(focusIndex()).toBe("3");
  expect(host.textContent).not.toContain("Review unanswered");
  expect(loadProfile().quizzes[quiz.id]?.answers).toEqual(profile.quizzes[quiz.id]?.answers);
});

it("scrolls the full mobile question card into reading position on load and auto-advance",async () =>{
  Object.defineProperty(window,"innerWidth",{configurable:true,value:390});
  const original=HTMLElement.prototype.scrollIntoView;
  const scroll=vi.fn();
  Object.defineProperty(HTMLElement.prototype,"scrollIntoView",{configurable:true,value:scroll});
  try {
    await renderQuiz();
    const first=host.querySelector(".lab-quiz-question");
    expect(document.activeElement).toBe(first?.querySelector("h2"));
    expect(scroll).toHaveBeenCalledWith({block:"start",behavior:"instant"});
    expect(scroll.mock.contexts[0]).toBe(first);
    await act(async()=>{host.querySelectorAll<HTMLButtonElement>(".lab-quiz-options button")[2].click();});
    expect(focusIndex()).toBe("1");
    expect(scroll.mock.contexts.at(-1)).toBe(host.querySelector(".lab-quiz-question"));
    expect(scroll.mock.calls.at(-1)?.[0]).toEqual({block:"start",behavior:"instant"});
  } finally {
    if(original) Object.defineProperty(HTMLElement.prototype,"scrollIntoView",{configurable:true,value:original});
    else Reflect.deleteProperty(HTMLElement.prototype,"scrollIntoView");
  }
});


it("confirms a selected answer with a check before transitioning, while persisting immediately",async () =>{
  Object.defineProperty(window,"innerWidth",{configurable:true,value:390});
  const existing=Object.getOwnPropertyDescriptor(window,"matchMedia");
  Object.defineProperty(window,"matchMedia",{configurable:true,value:()=>({matches:false})});
  vi.useFakeTimers();
  try {
    await renderQuiz();
    await act(async()=>{host.querySelectorAll<HTMLButtonElement>(".lab-quiz-options button")[3].click();});
    expect(loadProfile().quizzes[quiz.id]?.answers).toEqual({[quiz.questionIds[0]]:3});
    expect(focusIndex()).toBe("0");
    expect(host.querySelector(".lab-quiz-question.is-confirming")).not.toBeNull();
    expect([...host.querySelectorAll<HTMLButtonElement>(".lab-quiz-options button")].every(button=>button.disabled)).toBe(true);
    // Only the confirmed choice remains visible while the other slots
    // preserve card height and cannot receive pointer/keyboard input.
    const confirmingOptions=[...host.querySelectorAll<HTMLButtonElement>(".lab-quiz-options button")];
    expect(confirmingOptions.filter(button=>button.dataset.quizFeedbackHidden!=="true")).toHaveLength(1);
    expect(confirmingOptions.filter(button=>button.dataset.quizFeedbackHidden==="true")).toHaveLength(4);
    expect(confirmingOptions.filter(button=>button.getAttribute("aria-hidden")==="true")).toHaveLength(4);
    expect(confirmingOptions[3].classList.contains("selected")).toBe(true);
    expect([...host.querySelectorAll<HTMLButtonElement>(".lab-quiz-run-actions button")].find(button=>button.textContent==="Save & exit")?.disabled).toBe(true);
    expect(host.querySelector(".lab-quiz-options button.selected .lab-quiz-option-check")?.textContent).toBe("✓");
    expect(host.querySelector(".lab-quiz-saved-status")?.textContent).toBe("Answer saved");
    expect(host.querySelector(".lab-quiz-card-progress")?.getAttribute("aria-valuenow")).toBe("1");
    await act(async()=>{vi.advanceTimersByTime(389);});
    expect(focusIndex()).toBe("0");
    await act(async()=>{vi.advanceTimersByTime(1);});
    expect(focusIndex()).toBe("1");
    expect(host.querySelector(".lab-quiz-question.is-confirming")).toBeNull();
    expect(host.querySelector(".lab-quiz-saved-status")).toBeNull();
  } finally {
    vi.useRealTimers();
    if(existing)Object.defineProperty(window,"matchMedia",existing);
    else Reflect.deleteProperty(window,"matchMedia");
  }
});
it("respects reduced motion by moving on immediately after selection",async () =>{
  Object.defineProperty(window,"innerWidth",{configurable:true,value:390});
  const existing=Object.getOwnPropertyDescriptor(window,"matchMedia");
  Object.defineProperty(window,"matchMedia",{configurable:true,value:()=>({matches:true})});
  try {
    await renderQuiz();
    await act(async()=>{host.querySelectorAll<HTMLButtonElement>(".lab-quiz-options button")[2].click();});
    expect(focusIndex()).toBe("1");
    expect(host.querySelector(".lab-quiz-question.is-confirming")).toBeNull();
    expect(loadProfile().quizzes[quiz.id]?.answers).toEqual({[quiz.questionIds[0]]:2});
  } finally {
    if(existing)Object.defineProperty(window,"matchMedia",existing);
    else Reflect.deleteProperty(window,"matchMedia");
  }
});

it("locks repeated mobile taps before React commits and unlocks only on the next question",async () =>{
  Object.defineProperty(window,"innerWidth",{configurable:true,value:390});
  const previous=Object.getOwnPropertyDescriptor(window,"matchMedia");
  Object.defineProperty(window,"matchMedia",{configurable:true,value:()=>({matches:false})});
  vi.useFakeTimers();
  try {
    await renderQuiz();
    const first=host.querySelectorAll<HTMLButtonElement>(".lab-quiz-options button");
    // Both clicks occur before React renders disabled controls.
    await act(async()=>{first[1].click();first[4].click();});
    expect(loadProfile().quizzes[quiz.id]?.answers).toEqual({[quiz.questionIds[0]]:1});
    expect(host.querySelector(".lab-quiz-question.is-confirming")).not.toBeNull();
    expect(first[4].disabled).toBe(true);
    await act(async()=>{vi.advanceTimersByTime(390);});
    expect(focusIndex()).toBe("1");
    const next=host.querySelectorAll<HTMLButtonElement>(".lab-quiz-options button");
    expect(next[4].disabled).toBe(false);
    await act(async()=>{next[4].click();});
    expect(loadProfile().quizzes[quiz.id]?.answers).toEqual({
      [quiz.questionIds[0]]:1,[quiz.questionIds[1]]:4,
    });
  } finally {
    vi.useRealTimers();
    if(previous)Object.defineProperty(window,"matchMedia",previous);
    else Reflect.deleteProperty(window,"matchMedia");
  }
});

it("keeps the final selected answer visible until results are ready, with no completion flash",async () =>{
  Object.defineProperty(window,"innerWidth",{configurable:true,value:390});
  const previous=Object.getOwnPropertyDescriptor(window,"matchMedia");
  Object.defineProperty(window,"matchMedia",{configurable:true,value:()=>({matches:false})});
  vi.useFakeTimers();
  try {
    const profile=createEmptyProfile();
    profile.quizzes[quiz.id]={
      quizVersion:quiz.version,
      answers:Object.fromEntries(quiz.questionIds.slice(0,-1).map(id=>[id,2])),
    };
    saveProfile(profile);
    await renderQuiz();
    expect(focusIndex()).toBe(String(quiz.questionIds.length-1));
    const options=host.querySelectorAll<HTMLButtonElement>(".lab-quiz-options button");
    await act(async()=>{options[3].click();options[0].click();});
    expect(loadProfile().quizzes[quiz.id]?.answers[quiz.questionIds.at(-1)!]).toBe(3);
    expect(host.querySelector(".lab-quiz-question.is-confirming")).not.toBeNull();
    expect(host.querySelector(".lab-quiz-runner")).not.toBeNull();
    expect(host.querySelector(".lab-quiz-card-progress")?.getAttribute("aria-valuenow")).toBe(String(quiz.questionIds.length));
    expect(host.textContent).not.toContain("This quiz is complete");
    expect(host.textContent).not.toContain("You've finished this quiz");
    expect(host.querySelectorAll(".lab-quiz-options button.selected .lab-quiz-option-check")).toHaveLength(1);
    expect(host.querySelectorAll('.lab-quiz-options button[data-quiz-feedback-hidden="true"]')).toHaveLength(4);
    expect(host.querySelectorAll('.lab-quiz-options button:not([data-quiz-feedback-hidden="true"])')).toHaveLength(1);
    await act(async()=>{vi.advanceTimersByTime(389);});
    expect(host.querySelector(".lab-quiz-runner")).not.toBeNull();
    await act(async()=>{vi.advanceTimersByTime(1);});
    expect(host.querySelector(".lab-quiz-results")).not.toBeNull();
    expect(host.querySelector(".lab-quiz-runner")).toBeNull();
  } finally {
    vi.useRealTimers();
    if(previous)Object.defineProperty(window,"matchMedia",previous);
    else Reflect.deleteProperty(window,"matchMedia");
  }
});

it("opens results directly when a saved complete question route is revisited",async () =>{
  const profile=createEmptyProfile();
  profile.quizzes[quiz.id]={
    quizVersion:quiz.version,
    completedAt:"2026-10-17T12:00:00Z",
    answers:Object.fromEntries(quiz.questionIds.map(id=>[id,2])),
  };
  saveProfile(profile);
  await renderQuiz();
  expect(host.querySelector(".lab-quiz-results")).not.toBeNull();
  expect(host.textContent).not.toContain("This quiz is complete");
  expect(host.textContent).not.toContain("You've finished this quiz");
});
