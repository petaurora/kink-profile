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
  const match = [...document.querySelectorAll<HTMLButtonElement>("button")].find(el => el.getAttribute("aria-label") === label || el.textContent?.replace(/[⌃⌄]/g, "") === label.replace(/[⌃⌄]/g, ""));
  if (!match) throw new Error(`Missing button: ${label}`);
  return match;
};
const click = (el: HTMLElement) => act(() => { el.focus(); el.click(); });
const key = (value: string) => act(() => document.activeElement?.dispatchEvent(new KeyboardEvent("keydown", { key: value, bubbles: true })));
const advance = async (ms: number) => act(async () => {await vi.advanceTimersByTimeAsync(ms);});
function mount(collection: "kinks" | "rewards" = "kinks",subject?:string) {
  act(() => root.render(<ToastProvider><LabRecordsProvider><CatalogComposite collection={collection} subject={subject}/></LabRecordsProvider></ToastProvider>));
}
function refine() {
  const row = document.querySelector('[data-item-id="collars"]')!;
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

it("renders preserved Equipment members and the approved Marking modifiers",()=>{
 mount("kinks","Equipment & Objects");
 for(const id of ["collars","cuffs","chastity"])expect(document.querySelector(`[data-item-id="${id}"]`)).not.toBeNull();
 mount("kinks","Marking & Expression");
 expect(document.querySelector('[data-item-id="worship"]')).toBeNull();
 const row=document.querySelector('[data-item-id="marking"]')!;
 click([...row.querySelectorAll<HTMLButtonElement>("button")].find(el=>el.textContent?.includes("Refine"))!);
 click(button("Type4 options⌄"));
 for(const label of ["Hickeys","Bruise Marking","Stamps / Temporary Tattoos","Other Temporary Marks"])
  expect(button(label+": Not rated. Change rating")).toBeTruthy();
});

it("uses canonical choices, explicit keyboard commit and session help", async () => {
  mount(); click(button("Collars overall: Not rated. Change rating"));
  expect(document.activeElement?.tagName).toBe("H3");
  key("Tab"); expect(document.activeElement).toBe(button("Love"));
  key("ArrowDown"); expect(document.activeElement).toBe(button("Like"));
  expect(button("Like").getAttribute("aria-pressed")).toBe("false");
  expect(document.body.textContent).not.toContain("Dislike");
  click(button("What do these mean?")); expect(document.body.textContent).toContain("Potential personal interest in participating");
  click(button("Unsure"));
  click(button("Collars overall: Unsure. Change rating"));
  expect(button("What do these mean?").getAttribute("aria-expanded")).toBe("true");
  key("Escape"); expect(button("Collars overall: Unsure. Change rating")).toBeTruthy();
  click(button("Collars overall: Unsure. Change rating")); key("Tab"); key("Home"); key("Enter"); expect(button("Collars overall: Love. Change rating")).toBeTruthy();
});

it("clears with genuine exact-value Undo while a previous save is pending", async () => {
  mount(); rate("Collars overall: Not rated. Change rating", "Curious");
  click(button("Collars overall: Curious. Change rating")); click(button("Clear rating"));
  expect(button("Collars overall: Not rated. Change rating")).toBeTruthy();
  click(button("Undo")); await advance(1700);
  expect(button("Collars overall: Curious. Change rating")).toBeTruthy();
  expect([...document.querySelectorAll('[role="status"]')].find(node=>node.textContent==="Collars overall: Saved")??null).not.toBeNull();
  await advance(1250); expect([...document.querySelectorAll('[role="status"]')].find(node=>node.textContent==="Collars overall: Saved")??null).toBeNull();
});

it("an older Undo never overwrites a newer explicit edit", async () => {
  mount(); rate("Collars overall: Not rated. Change rating", "Love");
  click(button("Collars overall: Love. Change rating")); click(button("Clear rating"));
  rate("Collars overall: Not rated. Change rating", "Hard Limit"); click(button("Undo")); await advance(1700);
  expect(button("Collars overall: Hard Limit. Change rating")).toBeTruthy();
});

it("reveals failed modifiers from the collapsed parent and retries the current value", async () => {
  mount(); refine(); click(button("Material4 options⌄"));
  click(document.querySelector('input[type="checkbox"]')!);
  rate("Leather: Not rated. Change rating", "Like"); key("Escape"); await advance(1700);
  click(button("Collars: Modifier save failed. Reveal issue")); await advance(20);
  expect(button("Material: Save failed. Reveal issue").getAttribute("aria-expanded")).toBe("true");
  expect(document.activeElement).toBe(button("Retry saving Leather"));
  click(button("Retry saving Leather")); await advance(1700);
  expect(button("Leather: Like. Change rating")).toBeTruthy();
  expect(document.querySelector('[aria-label="Collars: Modifier save failed. Reveal issue"]')).toBeNull();
});

it("keeps Tried and Comfort independent of rating and makes Tried reversible", async () => {
  mount(); rate("Collars overall: Not rated. Change rating", "Hard Limit"); refine();
  click(button("ExperienceOptional · Independent of preference⌄"));
  click(button("Comfortable"));
  const tried = document.querySelector<HTMLInputElement>('.cc-experience input')!;
  expect(tried.checked).toBe(false); click(tried);
  expect(button("Comfortable").getAttribute("aria-pressed")).toBe("true");
  expect([...document.querySelectorAll<HTMLButtonElement>("button")].some(el => el.textContent?.trim() === "Undo")).toBe(false);
  // Reversible in place without a toast; unrelated comfort/rating stays put.
  click(tried); expect(tried.checked).toBe(false);
  expect(button("Comfortable").getAttribute("aria-pressed")).toBe("true");
  expect(button("Collars overall: Hard Limit. Change rating")).toBeTruthy();
});

it("preserves latest pending edits and revisions across feature remounts", async () => {
  function Consumer() {
    const records = useLabRecords();
    return <><button onClick={() => records.commit("collars:overall", "Like", true)}>Old</button><button onClick={() => records.commit("collars:overall", "Love")}>New</button><output>{JSON.stringify({values:records.values,saves:records.saves,revisions:records.revisions})}</output></>;
  }
  function Harness() { const [show,setShow]=useState(true); return <><button onClick={()=>setShow(!show)}>Navigate</button>{show&&<Consumer/>}</>; }
  act(()=>root.render(<LabRecordsProvider><Harness/></LabRecordsProvider>));
  click(button("Old")); click(button("New")); click(button("Navigate")); await advance(1700); click(button("Navigate"));
  const result=JSON.parse(document.querySelector("output")!.textContent!);
  expect(result.values["collars:overall"]).toBe("Love"); expect(result.saves["collars:overall"]).toBe("saved");
  expect(result.revisions.map((event:{value:string})=>event.value)).toEqual(["Like","Love"]);
  expect(result.revisions[0].recordedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
});

it("returns R/P to the list start after classification filters change", async () => {
  mount("rewards"); const scroll=vi.mocked(HTMLElement.prototype.scrollIntoView); scroll.mockClear();
  click(button("Reward")); expect(scroll).toHaveBeenCalledWith({block:"start"});
  click(button("Answers")); scroll.mockClear(); click(button("✕ No")); expect(scroll).toHaveBeenCalledWith({block:"start"});
});
