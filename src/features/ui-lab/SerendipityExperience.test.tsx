// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, useLocation, type NavigateFunction } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { UiLabPage } from "./UiLabPage";
import { createUiLabServices } from "./services/createUiLabServices";
import { illustrativeReferenceData } from "./services/fixtures";
import type { AppServices } from "../../services/contracts";

let root: Root;
let container: HTMLDivElement;
let currentPath: string;
function LocationMarker() { const location=useLocation();currentPath=location.pathname+location.search;return null; }
const click=(element:HTMLElement)=>act(()=>{element.focus();element.click();});
const action=(selector:string)=>{const el=document.querySelector<HTMLButtonElement>(selector);if(!el)throw new Error("Missing "+selector);return el;};
async function mount(services:AppServices,path="/ui-lab/discover") {
  act(()=>root.render(<MemoryRouter initialEntries={[path]}><UiLabPage services={services}/><LocationMarker/></MemoryRouter>));
  await act(async()=>{await vi.advanceTimersByTimeAsync(0);});
}
beforeEach(()=>{
  vi.useFakeTimers();vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT",true);
  vi.spyOn(HTMLElement.prototype,"getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
  HTMLElement.prototype.scrollIntoView=vi.fn();vi.spyOn(window,"scrollTo").mockImplementation(()=>{});
  container=document.createElement("div");document.body.append(container);root=createRoot(container);
});
afterEach(()=>{act(()=>root.unmount());container.remove();vi.restoreAllMocks();vi.unstubAllGlobals();vi.useRealTimers();});

it("opens Surprise Me immediately and hands off to canonical features without writing preferences",async()=>{
  const adapter=createUiLabServices({latencyMs:0,referenceData:illustrativeReferenceData});
  const write=vi.spyOn(adapter.services.preferences,"setRating");
  await mount(adapter.services);
  expect(action(".lab-serendipity-entry").textContent).toContain("Surprise Me");
  expect(document.querySelector(".lab-serendipity-ambient")?.textContent).toContain("Editorial discovery");
  click(action(".lab-serendipity-entry"));
  expect(currentPath).toMatch(/^\/ui-lab\/discover\/surprise\?topic=/);
  expect(document.querySelector(".lab-serendipity-preview")?.textContent).toContain("Not personalized");
  expect(document.querySelector(".lab-serendipity-paths")).toBeNull();
  expect(document.querySelector(".lab-serendipity-connections")).toBeNull();
  expect(document.querySelector(".lab-serendipity-back")).toBeNull(); // Shell breadcrumb already returns to Discover.
  expect(document.querySelector(".lab-serendipity-explore .kp-icon")).not.toBeNull(); // Shared KP preview icon.
  expect(document.querySelectorAll(".lab-serendipity-secondary button")).toHaveLength(2);
  click(action(".lab-serendipity-explore"));
  expect(currentPath).toMatch(/\/discover\/preview\?topic=.*&stage=details/);
  expect(document.querySelector(".lab-serendipity-paths")).not.toBeNull();
  click(action(".lab-serendipity-back"));
  expect(document.querySelector(".lab-serendipity-paths")).toBeNull();
  const previousPath=currentPath;
  click(action(".lab-serendipity-next"));
  expect(currentPath).not.toBe(previousPath);
  expect(document.querySelector(".lab-serendipity-paths")).toBeNull();
  click(action(".lab-serendipity-explore"));
  expect(write).not.toHaveBeenCalled();
  click(action(".lab-serendipity-paths button"));
  expect(currentPath).toBe("/ui-lab/learn");
  expect(write).not.toHaveBeenCalled();
});

it("keeps theme scope temporary and applies it only after the next user-requested surprise",async()=>{
  await mount(createUiLabServices({latencyMs:0,referenceData:illustrativeReferenceData}).services);
  click(action(".lab-serendipity-entry"));
  const originalTitle=document.querySelector("#lab-serendipity-topic-title")?.textContent;
  click(action(".lab-serendipity-secondary button"));
  const theme=[...document.querySelectorAll<HTMLButtonElement>(".lab-serendipity-chips button")].find(button=>button.textContent==="Symbolism")!;
  click(theme);
  expect(theme.getAttribute("aria-pressed")).toBe("true");
  expect(document.querySelector("#lab-serendipity-topic-title")?.textContent).toBe(originalTitle);
  const clear=[...document.querySelectorAll<HTMLButtonElement>(".lab-serendipity-chips button")].find(button=>button.textContent?.includes("Clear theme"))!;
  click(clear);
  expect(document.querySelector(".lab-serendipity-themes")?.textContent).toContain("Any eligible theme");
});

it("uses existing persistent session dismiss/restore with no nested navigation buttons",async()=>{
  await mount(createUiLabServices({latencyMs:0,referenceData:illustrativeReferenceData}).services);
  expect(document.querySelector(".lab-serendipity-card button button")).toBeNull();
  const visible=document.querySelector(".lab-serendipity-card-main")?.textContent;
  click(action(".lab-serendipity-hide"));
  const more=document.querySelector<HTMLButtonElement>(".lab-card-footer button")!;
  click(more);
  expect(document.querySelector(".lab-section")?.textContent).toContain("Restore");
  const restored=[...document.querySelectorAll<HTMLButtonElement>(".lab-list-row button")].find(el=>el.textContent==="Restore")!;
  click(restored);
  const breadcrumb=action(".ui-lab-breadcrumbs button");
  click(breadcrumb);
  expect(document.querySelector(".lab-serendipity-card-main")?.textContent).toBe(visible);
});

it("does not promote bare shared-item neighbors to unexpected conceptual connections",async()=>{
  await mount(createUiLabServices({latencyMs:0}).services,
    "/ui-lab/discover/surprise?topic=metal");
  expect(document.querySelector(".lab-serendipity-connections")).toBeNull();
  click(action(".lab-serendipity-explore"));
  const section=document.querySelector(".lab-serendipity-connections");
  expect(section?.textContent).toContain("Leather");
  expect(section?.textContent).toContain("How might its texture or symbolism change?");
  expect(section?.textContent).not.toContain("Ownership");
  expect(section?.textContent).toContain("Curated perspective");
});
