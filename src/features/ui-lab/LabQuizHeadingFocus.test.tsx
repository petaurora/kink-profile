// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { quizzes } from "../../data/quizzes";
import { createEmptyProfile, loadProfile, saveProfile } from "../../lib/profileStorage";
import { LabQuizWorkspace } from "./LabQuizWorkspace";
import { labPath, parseLabRoute, type LabArea } from "./LabNavigation";

const quiz = quizzes.find(q => q.id === "dominance-submission")!;
let root: Root;
let host: HTMLDivElement;
let originalWidth: number;
function Screen() {
  const location = useLocation();
  const navigate = useNavigate();
  const route = parseLabRoute(location.pathname, location.search);
  const go = (area: LabArea, view = "", params?: Record<string,string>) => navigate(labPath(area,view,params));
  return <LabQuizWorkspace view={route.workspace} quizId={route.params.get("id")} go={go}/>;
}
function renderQuiz() {
  act(()=>root.render(<MemoryRouter initialEntries={[labPath("Quizzes","Question",{id:quiz.id})]}><Screen/></MemoryRouter>));
}
const press=(text:string)=>{
  const button=[...host.querySelectorAll<HTMLButtonElement>(".lab-quiz-run-actions button")]
    .find(el=>el.textContent?.startsWith(text));
  expect(button).toBeDefined();
  act(()=>button!.click());
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
it("focuses each new mobile heading on auto-advance, Next, Back and review",()=>{
  Object.defineProperty(window,"innerWidth",{configurable:true,value:390});
  renderQuiz();
  expect(focusIndex()).toBe("0");
  const heading=host.querySelector<HTMLElement>('[data-quiz-question-index="0"]')!;
  expect(heading.getAttribute("tabindex")).toBe("-1");
  expect(heading.getAttribute("aria-label")).toContain("Question 1 of");
  act(()=>host.querySelectorAll<HTMLButtonElement>(".lab-quiz-options button")[1].click());
  expect(focusIndex()).toBe("1");
  press("Next question");
  expect(focusIndex()).toBe("2");
  press("← Back");
  expect(focusIndex()).toBe("1");
  press("Review unanswered (");
  expect(focusIndex()).toBe("1");
  expect(loadProfile().quizzes[quiz.id]?.answers).toEqual({[quiz.questionIds[0]]:1});
});
it("focuses the exact resumed desktop prompt and batch headings after navigation",()=>{
  Object.defineProperty(window,"innerWidth",{configurable:true,value:1100});
  const profile=createEmptyProfile();
  profile.quizzes[quiz.id]={quizVersion:quiz.version,answers:Object.fromEntries(quiz.questionIds.slice(0,4).map(id=>[id,3]))};
  saveProfile(profile);
  renderQuiz();
  expect(focusIndex()).toBe("4");
  expect(document.activeElement?.getAttribute("aria-label")).toContain("Question 5 of");
  press("← Back");
  expect(focusIndex()).toBe("0");
  expect(host.querySelector<HTMLButtonElement>(".lab-quiz-run-actions button")?.disabled).toBe(true);
  press("Next questions");
  expect(focusIndex()).toBe("3");
  press("Review unanswered (");
  expect(focusIndex()).toBe("4");
  expect(loadProfile().quizzes[quiz.id]?.answers).toEqual(profile.quizzes[quiz.id]?.answers);
});


it("scrolls the full mobile question card into reading position on load and auto-advance",()=>{
  Object.defineProperty(window,"innerWidth",{configurable:true,value:390});
  const original=HTMLElement.prototype.scrollIntoView;
  const scroll=vi.fn();
  Object.defineProperty(HTMLElement.prototype,"scrollIntoView",{configurable:true,value:scroll});
  try {
    renderQuiz();
    const first=host.querySelector(".lab-quiz-question");
    expect(document.activeElement).toBe(first?.querySelector("h2"));
    expect(scroll).toHaveBeenCalledWith({block:"start",behavior:"instant"});
    expect(scroll.mock.contexts[0]).toBe(first);
    act(()=>host.querySelectorAll<HTMLButtonElement>(".lab-quiz-options button")[2].click());
    expect(focusIndex()).toBe("1");
    expect(scroll.mock.contexts.at(-1)).toBe(host.querySelector(".lab-quiz-question"));
    expect(scroll.mock.calls.at(-1)?.[0]).toEqual({block:"start",behavior:"instant"});
  } finally {
    if(original) Object.defineProperty(HTMLElement.prototype,"scrollIntoView",{configurable:true,value:original});
    else Reflect.deleteProperty(HTMLElement.prototype,"scrollIntoView");
  }
});
