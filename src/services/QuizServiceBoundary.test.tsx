// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { LabQuizWorkspace } from "../features/ui-lab/LabQuizWorkspace";
import { createLocalQuizService } from "./local/createLocalQuizService";
import { createEmptyProfile } from "../lib/profileStorage";
import { quizzes } from "../data/quizzes";
import type { QuizService, QuizSnapshot } from "./quizContracts";

let host:HTMLDivElement,root:Root;
const go=vi.fn();
const quiz=quizzes.find(value=>value.id==="dominance-submission")!;
const button=(label:string)=>[...host.querySelectorAll<HTMLButtonElement>("button")].find(value=>value.textContent===label)!;
async function mount(service?:QuizService,view="Question") {
  await act(async()=>root.render(<MemoryRouter><LabQuizWorkspace view={view} quizId={quiz.id} go={go} service={service}/></MemoryRouter>));
}
const click=async(element:HTMLElement)=>{await act(async()=>element.click());};
function memoryService() {
  let profile=createEmptyProfile();
  return createLocalQuizService({read:()=>profile,write:value=>{profile=value;}});
}
beforeEach(()=>{
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT",true);
  Object.defineProperty(window,"innerWidth",{configurable:true,value:390});
  host=document.createElement("div");document.body.append(host);root=createRoot(host);go.mockClear();
});
afterEach(()=>{act(()=>root.unmount());host.remove();vi.unstubAllGlobals();vi.restoreAllMocks();});
it("uses injected quiz content and scoring without touching browser profile storage",async()=>{
  const service=memoryService();
  const get=service.getSnapshot;
  service.getSnapshot=async options=>{const snapshot=await get(options);snapshot.quizzes.find(value=>value.definition.id===quiz.id)!.questions[0].prompt="Injected question";return snapshot;};
  const getStorage=vi.spyOn(Storage.prototype,"getItem");
  const setStorage=vi.spyOn(Storage.prototype,"setItem");
  await mount(service);
  expect(host.textContent).toContain("Injected question");
  await click(host.querySelectorAll<HTMLButtonElement>(".lab-quiz-options button")[3]);
  expect((await service.getSnapshot()).quizzes.find(value=>value.definition.id===quiz.id)!.attemptAnswers[quiz.questionIds[0]]).toBe(3);
  expect(getStorage).not.toHaveBeenCalled();expect(setStorage).not.toHaveBeenCalled();
});
it("retains a failed answer for Retry and never advances or reports saved before confirmation",async()=>{
  const service=memoryService();
  const answer=vi.spyOn(service,"answerQuestion").mockRejectedValueOnce(new Error("offline"));
  await mount(service);
  await click(host.querySelectorAll<HTMLButtonElement>(".lab-quiz-options button")[3]);
  expect(host.querySelector('h2')?.getAttribute("data-quiz-question-index")).toBe("0");
  expect(host.querySelector("button.selected")?.getAttribute("aria-pressed")).toBe("true");
  expect(host.textContent).not.toContain("Answer saved");
  expect(host.textContent).toContain("Your change could not be saved");
  await click(button("Retry saving"));
  expect(answer).toHaveBeenCalledTimes(2);
  expect(host.querySelector('h2')?.getAttribute("data-quiz-question-index")).toBe("1");
});
it("ignores an old adapter's pending completion and does not navigate its replacement",async()=>{
  const service=memoryService();
  const snapshot=await service.getSnapshot();
  snapshot.quizzes.find(value=>value.definition.id===quiz.id)!.lifecycle={...snapshot.quizzes.find(value=>value.definition.id===quiz.id)!.lifecycle,state:"complete",hasEstablishedResult:true} as typeof snapshot.quizzes[number]["lifecycle"];
  let resolve!:(value:QuizSnapshot)=>void;
  service.answerQuestion=()=>new Promise(done=>{resolve=done;});
  await mount(service);
  await click(host.querySelectorAll<HTMLButtonElement>(".lab-quiz-options button")[2]);
  expect(host.textContent).toContain("Saving answer");
  await mount(memoryService());
  await act(async()=>resolve(snapshot));
  expect(go).not.toHaveBeenCalled();
  expect(host.querySelector('[role="progressbar"]')?.getAttribute("aria-valuenow")).toBe("0");
});
it("shows missing capability and read errors without silently loading local data",async()=>{
  await mount(undefined);
  expect(host.textContent).toContain("unavailable with the current service connection");
  const service=memoryService();
  vi.spyOn(service,"getSnapshot").mockRejectedValueOnce(new Error("offline"));
  await mount(service);
  expect(host.textContent).toContain("Unable to load quizzes");
  await click(button("Retry loading quizzes"));
  expect(host.querySelector(".lab-quiz-runner")).not.toBeNull();
});
