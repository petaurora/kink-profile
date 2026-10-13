// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UiLabPage } from "./UiLabPage";
import { createUiLabServices } from "./services/createUiLabServices";
import { labReferenceData } from "./services/fixtures";
let root:Root,container:HTMLDivElement;
beforeEach(()=>{
  vi.useFakeTimers();vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT",true);
  vi.spyOn(window,"scrollTo").mockImplementation(()=>{});
  vi.spyOn(HTMLElement.prototype,"getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
  vi.stubGlobal("requestAnimationFrame",(callback:FrameRequestCallback)=>setTimeout(()=>callback(0),0));
  vi.stubGlobal("cancelAnimationFrame",clearTimeout);
  Object.defineProperty(HTMLElement.prototype,"scrollIntoView",{value:vi.fn(),configurable:true});
  container=document.createElement("div");document.body.append(container);root=createRoot(container);
});
afterEach(()=>{act(()=>root.unmount());container.remove();vi.restoreAllMocks();vi.unstubAllGlobals();vi.useRealTimers();});
function button(label:string){const found=[...container.querySelectorAll<HTMLButtonElement>("button")].find(b=>b.getAttribute("aria-label")===label||b.textContent===label);if(!found)throw new Error("Missing button: "+label);return found;}
function click(element:HTMLElement){act(()=>{element.focus();element.click();});}
async function advance(ms=0){await act(async()=>{await vi.advanceTimersByTimeAsync(ms);});}
function mount(adapter:ReturnType<typeof createUiLabServices>){act(()=>root.render(<UiLabPage services={adapter.services}/>));}
function openKinks(){click(button("Catalog"));const tile=[...container.querySelectorAll<HTMLButtonElement>("button")].find(b=>b.querySelector("strong")?.textContent==="Kinks")!;click(tile);}
describe("service-backed UI Lab",()=>{
  it("shows loading, recovers from a failed load, and renders injected reference data",async()=>{
    const data=structuredClone(labReferenceData);data.items[0].name="Injected Item";
    const adapter=createUiLabServices({latencyMs:0,referenceData:data});adapter.failNext("catalog");
    mount(adapter);expect(container.textContent).toContain("Loading UI Lab data");
    await advance();expect(container.querySelector('[role="alert"]')).not.toBeNull();
    click(button("Retry loading UI Lab data"));await advance();openKinks();
    expect(button("Injected Item overall: Not rated. Change rating")).toBeTruthy();
  });
  it("keeps confirmed preferences across feature unmount/navigation, without production storage writes",async()=>{
    const storage=vi.spyOn(Storage.prototype,"setItem");
    const adapter=createUiLabServices({latencyMs:0,saveLatencyMs:10});mount(adapter);await advance();openKinks();
    click(button("Collars overall: Not rated. Change rating"));click(button("Love"));
    expect(container.querySelector('[aria-label="Collars overall: Saving"]')).not.toBeNull();
    await advance(10);click(button("Home"));openKinks();
    expect(button("Collars overall: Love. Change rating")).toBeTruthy();expect(storage).not.toHaveBeenCalled();
  });
  it("opens the exact modifier and parent from a service search result",async()=>{
    const adapter=createUiLabServices({latencyMs:0});mount(adapter);await advance();
    click(button("Search"));await advance();click(button("Leather ↗"));await advance();
    click(button("Modifiers"));await advance();
    const result=[...container.querySelectorAll<HTMLButtonElement>("button")].find(b=>b.querySelector("strong")?.textContent==="Leather"&&b.textContent?.includes("Collars → Material"))!;
    expect(result).toBeTruthy();click(result);await advance();
    expect(container.querySelector('[aria-label="Refine Collars"]')).not.toBeNull();
    expect(button("Leather: Not rated. Change rating")).toBeTruthy();
    expect(button("Material4 options⌃").getAttribute("aria-expanded")).toBe("true");
  });
  it("shows actionable search failures and retries through the injected service",async()=>{
    const adapter=createUiLabServices({latencyMs:0});mount(adapter);await advance();adapter.failNext("search");
    click(button("Search"));await advance();expect(container.textContent).toContain("Unable to load search results");
    click(button("Retry loading search results"));await advance();
    expect(container.querySelector('[role="alert"]')).toBeNull();
    expect(container.querySelector(".ui-lab-search-results strong")?.textContent).toBe("Collars");
  });
});

it("keeps the inline ca search explainable from the visible Item names",async()=>{
  const adapter=createUiLabServices({latencyMs:0});mount(adapter);await advance();openKinks();
  const input=container.querySelector<HTMLInputElement>('[aria-label="Search kinks"]')!;
  act(()=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value")!.set!.call(input,"ca");input.dispatchEvent(new Event("input",{bubbles:true}));});await advance(275);
  expect([...container.querySelectorAll('[data-item-id]')].map(node=>node.getAttribute('data-item-id'))).toEqual(["aftercare"]);
});
