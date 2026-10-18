// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { AppServicesProvider } from "./AppServicesProvider";
import { DiscoverSessionProvider, useDiscoverSession } from "../features/ui-lab/DiscoverSession";
import { createUiLabServices } from "../features/ui-lab/services/createUiLabServices";
import { createLocalDiscoverService } from "./local/createLocalDiscoverService";
import type { DiscoverSnapshot } from "./discoverContracts";

let root:Root, host:HTMLDivElement, session:ReturnType<typeof useDiscoverSession>;
function Probe(){session=useDiscoverSession();return <output>{JSON.stringify(session.attempts)}</output>;}
const flush=async(ms=0)=>{await act(async()=>{await vi.advanceTimersByTimeAsync(ms);});};
beforeEach(()=>{vi.useFakeTimers();vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT",true);host=document.createElement("div");document.body.append(host);root=createRoot(host);});
afterEach(()=>{act(()=>root.unmount());host.remove();vi.useRealTimers();vi.unstubAllGlobals();});
async function mount(discover:ReturnType<typeof createLocalDiscoverService>){
  const {services}=createUiLabServices({latencyMs:0});services.discover=discover;
  act(()=>root.render(<AppServicesProvider services={services}><DiscoverSessionProvider><Probe/></DiscoverSessionProvider></AppServicesProvider>));
  await flush();
}
it("retains newer typed notes while a prior autosave is pending, then saves the latest draft",async()=>{
  const service=createLocalDiscoverService();const {id}=await service.startAttempt();
  const persist=service.saveAttempt;
  let finish!:(value:DiscoverSnapshot)=>void;
  const save=vi.spyOn(service,"saveAttempt").mockImplementationOnce(()=>new Promise(resolve=>{finish=resolve;}));
  await mount(service);
  act(()=>session.update(id,"interest","First draft"));await flush(250);
  expect(session.pending).toBe(true);
  act(()=>session.update(id,"interest","Newest draft"));
  await act(async()=>finish(await persist(id,{answers:{interest:"First draft"},step:0})));
  expect(session.attempts[0].answers.interest).toBe("Newest draft");
  expect(session.hasUnsaved).toBe(true);
  await flush(250);
  expect(save).toHaveBeenCalledTimes(2);
  expect((await service.getSnapshot()).attempts[0].answers.interest).toBe("Newest draft");
  expect(session.hasUnsaved).toBe(false);
});
it("retains failed autosaves for retry and confirms completion only after its command succeeds",async()=>{
  const service=createLocalDiscoverService();const {id}=await service.startAttempt();
  vi.spyOn(service,"saveAttempt").mockRejectedValueOnce(new Error("offline"));
  await mount(service);
  act(()=>session.update(id,"interest","Keep this note"));await flush(250);
  expect(session.failed).toBe(true);expect(session.hasUnsaved).toBe(true);
  expect((await service.getSnapshot()).attempts[0].answers).toEqual({});
  await act(async()=>session.retry?.());
  expect((await service.getSnapshot()).attempts[0].answers.interest).toBe("Keep this note");
  const completed=vi.fn();
  vi.spyOn(service,"completeAttempt").mockRejectedValueOnce(new Error("offline"));
  await act(async()=>session.complete(id,completed));
  expect(completed).not.toHaveBeenCalled();expect(session.attempts[0].status).toBe("draft");
  await act(async()=>session.retry?.());
  expect(completed).toHaveBeenCalledTimes(1);expect(session.attempts[0].status).toBe("complete");
});
