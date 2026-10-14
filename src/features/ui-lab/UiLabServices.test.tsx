// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UiLabPage } from "./UiLabPage";
import { createUiLabServices as makeUiLabServices } from "./services/createUiLabServices";
import { MemoryRouter } from "react-router-dom";
import { illustrativeReferenceData as labReferenceData } from "./services/fixtures";
const createUiLabServices = (options:Parameters<typeof makeUiLabServices>[0]={}) => makeUiLabServices({...options,referenceData:options.referenceData??labReferenceData});
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
function mount(adapter:ReturnType<typeof createUiLabServices>){act(()=>root.render(<MemoryRouter initialEntries={["/ui-lab/home"]}><UiLabPage services={adapter.services}/></MemoryRouter>));}
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
    expect([...container.querySelectorAll('[role="status"]')].find(node=>node.textContent==="Collars overall: Saving")??null).not.toBeNull();
    await advance(10);click(button("Home"));openKinks();
    expect(button("Collars overall: Love. Change rating")).toBeTruthy();expect(storage).not.toHaveBeenCalled();
  });
  it("opens the exact modifier and parent from a service search result",async()=>{
    const adapter=createUiLabServices({latencyMs:0});mount(adapter);await advance();
    click(button("Search"));await advance();click(button("Leather ↗"));await advance(201);
    click(button("Modifiers"));await advance();
    const result=[...container.querySelectorAll<HTMLButtonElement>("button")].find(b=>b.querySelector("strong")?.textContent==="Leather"&&b.textContent?.includes("Collars → Material"))!;
    expect(result).toBeTruthy();click(result);await advance();
    expect(container.querySelector('[role="dialog"][aria-label="Refine Collars"]')).not.toBeNull();
    expect(button("Leather: Not rated. Change rating")).toBeTruthy();
    expect(button("Material4 options⌃").getAttribute("aria-expanded")).toBe("true");
  });
  it("shows actionable search failures and retries through the injected service",async()=>{
    const adapter=createUiLabServices({latencyMs:0});mount(adapter);await advance();adapter.failNext("search");
    click(button("Search"));click(button("Collars ↗"));await advance(201);expect(container.textContent).toContain("Search failed");
    click(button("Retry search"));await advance(201);
    expect(container.querySelector('[role="alert"]')).toBeNull();
    expect(container.querySelector(".ui-lab-search-results strong")?.textContent).toBe("Collars");
  });
});

it("puts name matches first and explains supporting-text hits in the inline Catalog",async()=>{
  const adapter=createUiLabServices({latencyMs:0});mount(adapter);await advance();openKinks();
  const input=container.querySelector<HTMLInputElement>('[aria-label="Search Items in kinks"]')!;
  act(()=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value")!.set!.call(input,"ca");input.dispatchEvent(new Event("input",{bubbles:true}));});await advance(275);
  expect([...container.querySelectorAll('[data-item-id]')].map(node=>node.getAttribute('data-item-id'))).toEqual(expect.arrayContaining(["aftercare","permission-rituals"]));
  expect(container.querySelector('[data-item-id="aftercare"] .kp-item-supporting-text')).toBeNull();
  expect(container.querySelector('[data-item-id="permission-rituals"] .kp-item-supporting-text')?.textContent).toContain("Matched description: “Ceremonial or practical");
  click(button("Sort and group results"));click(button("Name: Z–A"));click(button("Done"));
  expect([...container.querySelectorAll('[data-item-id]')].map(node=>node.getAttribute('data-item-id'))).toEqual(expect.arrayContaining(["permission-rituals","aftercare"]));
  click(button("Clear search"));expect(container.querySelector('.kp-item-supporting-text')).toBeNull();
});

it("uses best matches for an R/P query while keeping alphabetical browsing and explicit sorting",async()=>{
  const data=structuredClone(labReferenceData);data.items.find(item=>item.id==="praise")!.description="Permission can accompany praise.";
  const adapter=createUiLabServices({latencyMs:0,referenceData:data});mount(adapter);await advance();click(button("Catalog"));
  click([...container.querySelectorAll<HTMLButtonElement>("button")].find(node=>node.querySelector("strong")?.textContent==="Rewards & Punishments")!);
  const rows=()=>[...container.querySelectorAll('[data-item-id]')].map(node=>node.getAttribute('data-item-id'));
  const names=rows().map(id=>data.items.find(item=>item.id===id)!.name);
  expect(names).toEqual([...names].sort((a,b)=>a.localeCompare(b)));
  const input=container.querySelector<HTMLInputElement>('[aria-label="Search Items in rewards and punishments"]')!;
  act(()=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value")!.set!.call(input,"permission");input.dispatchEvent(new Event("input",{bubbles:true}));});await advance(275);
  expect(rows()[0]).toBe("permission-rituals");expect(rows()).toContain("praise");
  click(button("Sort and group results"));
  const best=[...container.querySelectorAll<HTMLButtonElement>("button")].find(node=>node.textContent?.startsWith("Best matches"))!;
  expect(best.getAttribute("aria-pressed")).toBe("true");click(button("Name: Z–A"));click(button("Done"));
  expect(rows()[0]).toBe("privileges");
});
