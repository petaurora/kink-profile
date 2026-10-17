// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import axe from "axe-core";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { quizzes } from "../../data/quizzes";
import { loadProfile, saveProfile, createEmptyProfile } from "../../lib/profileStorage";
import { getQuestionsForQuiz, getQuizAttemptAnswers, initialQuestionIndex, resolveQuizLifecycle } from "../quizzes/quizRuntime";
import { LabQuizWorkspace } from "./LabQuizWorkspace";
import { labPath, parseLabRoute, type LabArea } from "./LabNavigation";

let root:Root, host:HTMLDivElement, originalWidth:number;
function Driver() {
  const location=useLocation(), navigate=useNavigate();
  const {area,workspace,params}=parseLabRoute(location.pathname,location.search);
  return <>
    <button type="button" data-testid="browser-back" onClick={()=>navigate(-1)}>Browser Back</button>
    {area==="Quizzes" && <LabQuizWorkspace key={workspace+":"+(params.get("id")??"")}
      view={workspace} quizId={params.get("id")}
      go={(a:LabArea,w="",p?:Record<string,string>)=>navigate(labPath(a,w,p))}/>}
    {area==="Learn"&&<main>Learn destination</main>}
    <output data-testid="url">{location.pathname+location.search}</output>
  </>;
}
function mount(initial="/ui-lab/quizzes") {
  act(()=>root.render(<MemoryRouter initialEntries={[initial]}><Driver/></MemoryRouter>));
}
function click(el:HTMLElement) {act(()=>el.click());}
const select=(q:string)=>host.querySelector<HTMLElement>(q)!;
const route=()=>select('[data-testid="url"]').textContent??"";
beforeEach(()=>{
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT",true);
  vi.spyOn(HTMLElement.prototype,"getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
  Object.defineProperty(HTMLElement.prototype,"scrollIntoView",{configurable:true,value:vi.fn()});
  originalWidth=window.innerWidth;
  host=document.createElement("div");document.body.append(host);root=createRoot(host);
  localStorage.clear();
});
afterEach(()=>{
  act(()=>root.unmount());host.remove();localStorage.clear();
  Object.defineProperty(window,"innerWidth",{configurable:true,value:originalWidth});
  vi.restoreAllMocks();vi.unstubAllGlobals();
});
it("keeps all four quizzes distinct through routing, Save & exit, browser Back and persisted resume",()=>{
  Object.defineProperty(window,"innerWidth",{configurable:true,value:390});
  mount();
  for(const quiz of quizzes.filter(q=>q.availability==="available")) {
    const expectedPath=labPath("Quizzes","Question",{id:quiz.id});
    click(select(`[aria-label^="${quiz.title}: Explore quiz"]`));
    expect(route()).toBe(expectedPath);
    expect(select(".lab-quiz-runner")).not.toBeNull();
    expect(select(".lab-quiz-question h2").getAttribute("data-quiz-question-index")).toBe("0");
    click(host.querySelectorAll<HTMLElement>(".lab-quiz-options button")[4]);
    const after=loadProfile();
    expect(after.quizzes[quiz.id]?.answers[quiz.questionIds[0]]).toBe(4);
    click([...host.querySelectorAll<HTMLElement>(".lab-quiz-run-actions button")]
      .find(b=>b.textContent?.includes("Save & exit"))!);
    expect(route()).toBe(labPath("Quizzes"));
    expect(select(`[aria-label^="${quiz.title}: Continue"]`)).not.toBeNull();
    click(select('[data-testid="browser-back"]'));
    expect(route()).toBe(expectedPath);
    expect(select(".lab-quiz-question h2").getAttribute("data-quiz-question-index")).toBe("1");
    click([...host.querySelectorAll<HTMLElement>(".lab-quiz-run-actions button")]
      .find(b=>b.textContent?.includes("Save & exit"))!);
  }
  const profile=loadProfile();
  expect(Object.keys(profile.quizzes)).toHaveLength(4);
  for(const quiz of quizzes) {
    expect(profile.quizzes[quiz.id]?.answers).toEqual({[quiz.questionIds[0]]:4});
    expect(resolveQuizLifecycle(quiz,profile).state).toBe("in-progress");
    expect(initialQuestionIndex(quiz,profile)).toBe(1);
  }
});
it("reloads a sparse attempt with unknown answers and keeps existing unrelated evidence unchanged",()=>{
  const [quiz,other]=quizzes;
  const profile=createEmptyProfile();
  profile.quizzes[other.id]={
    quizVersion:other.version,
    answers:Object.fromEntries(other.questionIds.map(id=>[id,2])),
    completedAt:"2026-10-01T12:00:00Z",
  };
  saveProfile(profile);
  const unrelated=JSON.stringify(loadProfile().quizzes[other.id]);
  mount(labPath("Quizzes","Question",{id:quiz.id}));
  expect(select("[role=progressbar]").getAttribute("aria-valuenow")).toBe("0");
  click([...host.querySelectorAll<HTMLElement>(".lab-quiz-run-actions button")]
    .find(b=>b.textContent?.startsWith("Next question"))!);
  expect(getQuizAttemptAnswers(quiz,loadProfile())).toEqual({});
  click(host.querySelectorAll<HTMLElement>(".lab-quiz-options button")[1]);
  expect(loadProfile().quizzes[quiz.id]?.answers).toEqual({[quiz.questionIds[1]]:1});
  expect(JSON.stringify(loadProfile().quizzes[other.id])).toBe(unrelated);
  expect(Object.keys(loadProfile().quizzes[quiz.id]?.answers??{})).toHaveLength(1);
  expect(getQuestionsForQuiz(quiz)).toHaveLength(quiz.questionIds.length);
});
async function runAxe() {
  let results:axe.AxeResults;
  await act(async()=>{results=await axe.run(host,{
    runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa","wcag22aa"]},
    rules:{"color-contrast":{enabled:false}},
  });});
  expect(results!.violations.map(v=>({rule:v.id,target:v.nodes.map(n=>n.target)}))).toEqual([]);
}
it("passes automated WCAG structural checks on quiz landing and focused question runner",async()=>{
  mount();
  await runAxe();
  click(select(".lab-quiz-card"));
  expect(select(".lab-quiz-question h2").getAttribute("tabindex")).toBe("-1");
  await runAxe();
},15000);
it("passes automated WCAG structural checks on complete and in-progress-retake results",async()=>{
  const quiz=quizzes[0],profile=createEmptyProfile();
  profile.quizzes[quiz.id]={
    quizVersion:quiz.version,
    answers:Object.fromEntries(quiz.questionIds.map(id=>[id,3])),
    completedAt:"2026-10-01T12:00:00Z",
    retake:{quizVersion:quiz.version,answers:{[quiz.questionIds[0]]:1},startedAt:"2026-10-02T12:00:00Z"},
  };
  saveProfile(profile);
  mount(labPath("Quizzes","Results",{id:quiz.id}));
  expect(select(".lab-quiz-results")).not.toBeNull();
  await runAxe();
  click(select("details.lab-quiz-details summary"));
  expect(select("details.lab-quiz-details").hasAttribute("open")).toBe(true);
  await runAxe();
  expect(loadProfile().quizzes[quiz.id]?.answers).toEqual(profile.quizzes[quiz.id]?.answers);
},15000);
