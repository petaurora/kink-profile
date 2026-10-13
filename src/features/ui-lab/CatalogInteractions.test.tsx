// @vitest-environment jsdom
import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { CatalogComposite } from "./CatalogComposite";
import { LabRecordsProvider, useLabRecords } from "./LabRecords";
import { ToastProvider } from "../../components/ui/ToastProvider";

let root: Root;
let container: HTMLDivElement;
const button = (label: string) => {
  const match = [...document.querySelectorAll<HTMLButtonElement>("button")].find(el => el.getAttribute("aria-label") === label || el.textContent === label);
  if (!match) throw new Error(`Missing button: ${label}`);
  return match;
};
const click = (el: HTMLElement) => act(() => { el.focus(); el.click(); });
const key = (value: string) => act(() => document.activeElement?.dispatchEvent(new KeyboardEvent("keydown", { key: value, bubbles: true })));
const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));
function mount(collection: "kinks" | "rewards" = "kinks") {
  act(() => root.render(<ToastProvider><LabRecordsProvider><CatalogComposite collection={collection}/></LabRecordsProvider></ToastProvider>));
}
function refine() {
  const row = document.querySelector('[data-item-id="Power Exchange:0"]')!;
  click([...row.querySelectorAll<HTMLButtonElement>("button")].find(el => el.textContent?.includes("Refine"))!);
}
function rate(label: string, value: string) { click(button(label)); click(button(value)); }
beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
  HTMLElement.prototype.scrollIntoView = vi.fn();
  container = document.createElement("div"); document.body.append(container); root = createRoot(container);
});
afterEach(() => { act(() => root.unmount()); container.remove(); vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); });

it("uses canonical choices, explicit keyboard commit and session help", () => {
  mount(); click(button("Collars overall: Not rated. Change rating"));
  expect(document.activeElement?.tagName).toBe("H3");
  key("Tab"); expect(document.activeElement).toBe(button("Love"));
  key("ArrowDown"); expect(document.activeElement).toBe(button("Like"));
  expect(button("Like").getAttribute("aria-pressed")).toBe("false");
  expect(document.body.textContent).not.toContain("Dislike");
  click(button("What do these mean? +")); expect(document.body.textContent).toContain("Potential personal interest in participating");
  click(button("Unsure"));
  click(button("Collars overall: Unsure. Change rating"));
  expect(button("What do these mean? −").getAttribute("aria-expanded")).toBe("true");
  key("Escape"); expect(button("Collars overall: Unsure. Change rating")).toBeTruthy();
  click(button("Collars overall: Unsure. Change rating")); key("Tab"); key("Home"); key("Enter"); expect(button("Collars overall: Love. Change rating")).toBeTruthy();
});

it("clears with genuine exact-value Undo while a previous save is pending", () => {
  mount(); rate("Collars overall: Not rated. Change rating", "Curious");
  click(button("Collars overall: Curious. Change rating")); click(button("Clear rating"));
  expect(button("Collars overall: Not rated. Change rating")).toBeTruthy();
  click(button("Undo")); advance(850);
  expect(button("Collars overall: Curious. Change rating")).toBeTruthy();
  expect(document.querySelector('[aria-label="Collars overall: Saved"]')).not.toBeNull();
  advance(1250); expect(document.querySelector('[aria-label="Collars overall: Saved"]')).toBeNull();
});

it("an older Undo never overwrites a newer explicit edit", () => {
  mount(); rate("Collars overall: Not rated. Change rating", "Love");
  click(button("Collars overall: Love. Change rating")); click(button("Clear rating"));
  rate("Collars overall: Not rated. Change rating", "Hard Limit"); click(button("Undo")); advance(850);
  expect(button("Collars overall: Hard Limit. Change rating")).toBeTruthy();
});

it("reveals failed modifiers from the collapsed parent and retries the current value", () => {
  mount(); refine(); click(button("Material4 options⌄"));
  click(document.querySelector('input[type="checkbox"]')!);
  rate("Leather: Not rated. Change rating", "Like"); key("Escape"); advance(850);
  click(button("Collars: Modifier save failed. Reveal issue")); advance(20);
  expect(button("Material: Save failed. Reveal issue").getAttribute("aria-expanded")).toBe("true");
  expect(document.activeElement).toBe(button("Retry saving Leather"));
  click(button("Retry saving Leather")); advance(850);
  expect(button("Leather: Like. Change rating")).toBeTruthy();
  expect(document.querySelector('[aria-label="Collars: Modifier save failed. Reveal issue"]')).toBeNull();
});

it("keeps Tried and Comfort independent of rating and makes Tried reversible", () => {
  mount(); rate("Collars overall: Not rated. Change rating", "Hard Limit"); refine();
  click(button("ExperienceOptional · Independent of preference⌄"));
  click(button("Comfortable"));
  const tried = document.querySelector<HTMLInputElement>('.cc-experience input')!;
  expect(tried.checked).toBe(false); click(tried);
  expect(button("Comfortable").getAttribute("aria-pressed")).toBe("true");
  click(button("Undo")); expect(tried.checked).toBe(false);
  expect(button("Comfortable").getAttribute("aria-pressed")).toBe("true");
  expect(button("Collars overall: Hard Limit. Change rating")).toBeTruthy();
});

it("preserves latest pending edits and revisions across feature remounts", () => {
  function Consumer() {
    const records = useLabRecords();
    return <><button onClick={() => records.commit("x", "old", true)}>Old</button><button onClick={() => records.commit("x", "new")}>New</button><output>{JSON.stringify({values:records.values,saves:records.saves,revisions:records.revisions})}</output></>;
  }
  function Harness() { const [show,setShow]=useState(true); return <><button onClick={()=>setShow(!show)}>Navigate</button>{show&&<Consumer/>}</>; }
  act(()=>root.render(<LabRecordsProvider><Harness/></LabRecordsProvider>));
  click(button("Old")); click(button("New")); click(button("Navigate")); advance(850); click(button("Navigate"));
  const result=JSON.parse(document.querySelector("output")!.textContent!);
  expect(result.values.x).toBe("new"); expect(result.saves.x).toBe("saved");
  expect(result.revisions.map((event:{value:string})=>event.value)).toEqual(["old","new"]);
  expect(result.revisions[0].recordedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
});

it("returns R/P to the list start after classification filters change", () => {
  mount("rewards"); const scroll=vi.mocked(HTMLElement.prototype.scrollIntoView); scroll.mockClear();
  click(button("Reward")); expect(scroll).toHaveBeenCalledWith({block:"start"});
  click(button("Answers")); scroll.mockClear(); click(button("✕ No")); expect(scroll).toHaveBeenCalledWith({block:"start"});
});
