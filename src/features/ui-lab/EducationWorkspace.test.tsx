// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, useLocation, useNavigate, type NavigateFunction } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UiLabPage } from "./UiLabPage";
import { createUiLabServices } from "./services/createUiLabServices";
import { labPath, parseLabRoute } from "./LabNavigation";

let root:Root,container:HTMLDivElement,navigate:NavigateFunction;
function Driver(){const location=useLocation();navigate=useNavigate();return <output>{location.pathname+location.search}</output>;}
const click=(element:HTMLElement)=>act(()=>{element.focus();element.click();});
const flush=async(ms=0)=>{await act(async()=>{await vi.advanceTimersByTimeAsync(ms);});};
function mount(path="/ui-lab/learn",adapter=createUiLabServices({latencyMs:0})){
  act(()=>root.render(<MemoryRouter initialEntries={[path]}><UiLabPage services={adapter.services}/><Driver/></MemoryRouter>));
  return adapter;
}
beforeEach(()=>{
  vi.useFakeTimers();vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT",true);
  vi.spyOn(window,"scrollTo").mockImplementation(()=>{});
  vi.spyOn(HTMLElement.prototype,"getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
  HTMLElement.prototype.scrollIntoView=vi.fn();
  vi.stubGlobal("requestAnimationFrame",(callback:FrameRequestCallback)=>setTimeout(()=>callback(0),0));
  container=document.createElement("div");document.body.append(container);root=createRoot(container);
});
afterEach(()=>{act(()=>root.unmount());container.remove();vi.restoreAllMocks();vi.unstubAllGlobals();vi.useRealTimers();});

describe("service-backed Education",()=>{
  it("uses stable direct routes and browser Back, without recording personal evidence",async()=>{
    const original=labPath("Learn","Article",{id:"edu-collars"});
    expect(original).toBe("/ui-lab/learn/article?id=edu-collars");
    expect(parseLabRoute(original.split("?")[0],"?id=edu-collars").unknown).toBe(false);
    const storage=vi.spyOn(Storage.prototype,"setItem");
    mount();await flush(300);
    expect(container.textContent).toContain("9 articles");
    const collars=[...container.querySelectorAll<HTMLButtonElement>(".lab-education-grid button")].find(b=>b.textContent?.includes("Collars & Collaring"))!;
    expect(collars).toBeTruthy();click(collars);await flush(300);
    expect(container.querySelector("output")?.textContent).toBe(original);
    expect(container.querySelector(".lab-education-prose")?.textContent).toContain("Different Types of Collars");
    expect(container.textContent).toContain("Continue learning");
    expect(storage).not.toHaveBeenCalled();
    act(()=>navigate(-1));await flush(300);
    expect(container.querySelector("output")?.textContent).toBe("/ui-lab/learn");
  });

  it("searches across article titles and descriptions without reading preference state",async()=>{
    mount();await flush(300);
    const input=container.querySelector<HTMLInputElement>("#lab-education-search")!;
    act(()=>{
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value")!.set!.call(input,"safewords");
      input.dispatchEvent(new Event("input",{bubbles:true}));
    });
    expect(container.querySelectorAll(".lab-education-grid button")).toHaveLength(1);
    expect(container.textContent).toContain("1 article matching your search");
  });

  it("shows Education service errors and supports explicit retry",async()=>{
    const adapter=createUiLabServices({latencyMs:0});
    adapter.failNext("education");mount("/ui-lab/learn",adapter);await flush(300);
    expect(container.querySelector('[role="alert"]')?.textContent).toContain("Unable to load the Education library");
    const retry=[...container.querySelectorAll<HTMLButtonElement>("button")].find(b=>b.textContent==="Retry loading articles")!;
    click(retry);await flush(300);
    expect(container.textContent).toContain("9 articles");
  });

  it("handles unavailable deep-linked articles without inventing content",async()=>{
    mount("/ui-lab/learn/article?id=edu-missing");await flush(300);
    expect(container.textContent).toContain("This article is unavailable");
  });
});
