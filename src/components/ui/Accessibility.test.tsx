// @vitest-environment jsdom
import { act, useState, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import axe from "axe-core";
import { MemoryRouter } from "react-router-dom";
import { ModalLayer } from "./ModalLayer";
import { InlineSaveStatus } from "./PreferenceControl";
import { ToastProvider, useToasts } from "./ToastProvider";
import { ToastViewport } from "./ToastViewport";
import { CatalogComposite } from "../../features/ui-lab/CatalogComposite";
import { UiLabPage } from "../../features/ui-lab/UiLabPage";

let root: Root;
let container: HTMLDivElement;
function mount(node: ReactNode) { act(() => root.render(node)); }
function button(name: string) {
  const element = [...document.querySelectorAll<HTMLButtonElement>("button")].find(b => b.getAttribute("aria-label") === name || b.textContent === name);
  if (!element) throw new Error(`Missing button: ${name}`);
  return element;
}
function click(element: HTMLElement) { act(() => { element.focus(); element.click(); }); }
function escape() { act(() => document.activeElement?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))); }
async function audit() {
  let result: axe.AxeResults;
  await act(async () => { result = await axe.run(document.body, {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] },
    // jsdom cannot measure rendered contrast. Browser validation covers layout/colors.
    rules: { "color-contrast": { enabled: false } },
  }); });
  expect(result!.violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) }))).toEqual([]);
}
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
  vi.stubGlobal("requestAnimationFrame", (callback: () => void) => { callback(); return 1; });
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {configurable: true, value: vi.fn()});
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount()); container.remove();
  vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers();
});

describe("accessibility regressions", () => {
  it("isolates background and nested sheets, including newly mounted content, then restores original attributes", async () => {
    function Harness() {
      const [open, setOpen] = useState(false), [child, setChild] = useState(false);
      return <><div aria-hidden="false" data-background><button onClick={() => setOpen(true)}>Open</button></div>
        <div inert aria-hidden="true" data-original>Originally unavailable</div>
        <ModalLayer open={open} onClose={() => setOpen(false)} label="Parent"><button onClick={() => setChild(true)}>Child</button><button>Parent last</button>
          <ModalLayer open={child} onClose={() => setChild(false)} label="Child"><button>Child action</button></ModalLayer>
        </ModalLayer></>;
    }
    mount(<Harness />);
    click(button("Open"));
    const background = document.querySelector("[data-background]")!;
    expect(background.hasAttribute("inert")).toBe(true);
    expect(background.getAttribute("aria-hidden")).toBe("true");
    expect(document.querySelector(".kp-modal-backdrop")?.hasAttribute("inert")).toBe(false);
    const late = document.createElement("button"); document.body.append(late);
    await act(async () => { await Promise.resolve(); });
    expect(late.hasAttribute("inert")).toBe(true);
    click(button("Child"));
    expect(button("Parent last").hasAttribute("inert")).toBe(true);
    expect(button("Child action").closest("[inert]")).toBeNull();
    escape();
    expect(button("Parent last").hasAttribute("inert")).toBe(false);
    expect(document.activeElement).toBe(button("Child"));
    escape();
    expect(background.hasAttribute("inert")).toBe(false);
    expect(background.getAttribute("aria-hidden")).toBe("false");
    expect(document.querySelector("[data-original]")?.hasAttribute("inert")).toBe(true);
    expect(late.hasAttribute("inert")).toBe(false);
    expect(document.activeElement).toBe(button("Open")); late.remove();
  });
  it("excludes negative-tabindex and hidden controls from dialog Tab wrapping", () => {
    mount(<ModalLayer open onClose={() => {}} label="Editor"><input tabIndex={-1}/><input type="hidden"/><button>Only action</button></ModalLayer>);
    expect(document.activeElement).toBe(button("Only action"));
    act(() => button("Only action").dispatchEvent(new KeyboardEvent("keydown", {key: "Tab", shiftKey: true, bubbles: true})));
    expect(document.activeElement).toBe(button("Only action"));
  });
  it("exposes changing save status as live text separately from its retry button", () => {
    mount(<InlineSaveStatus label="Leather" state="idle"/>);
    const region = document.querySelector('[role="status"]');
    mount(<InlineSaveStatus label="Leather" state="saving"/>);
    expect(region?.textContent).toBe("Leather: Saving");
    mount(<InlineSaveStatus label="Leather" state="failed" onRetry={() => {}}/>);
    expect(region?.textContent).toBe("Leather: Not saved");
    expect(region?.querySelector("button")).toBeNull();
    expect(button("Retry saving Leather")).toBeTruthy();
  });
  it("keeps recovery actions persistent even when a caller supplies a timeout", () => {
    vi.useFakeTimers(); const dismiss = vi.fn();
    mount(<ToastViewport items={[{id: 1, kind: "info", message: "Changed", actionLabel: "Undo", duration: 1000}]} onDismiss={dismiss}/>);
    act(() => vi.advanceTimersByTime(60000)); expect(dismiss).not.toHaveBeenCalled();
    click(button("Dismiss notification")); act(() => vi.advanceTimersByTime(150));
    expect(dismiss).toHaveBeenCalledWith(1);
  });
  it("places notifications inside the active dialog's accessible boundary", () => {
    function Harness() {
      const {notify} = useToasts(); const [open, setOpen] = useState(false);
      return <><button onClick={() => setOpen(true)}>Open</button><ModalLayer open={open} onClose={() => setOpen(false)} label="Editor"><button onClick={() => notify({message: "Failed", kind: "error", actionLabel: "Retry"})}>Notify</button></ModalLayer></>;
    }
    mount(<ToastProvider><Harness/></ToastProvider>); click(button("Open")); click(button("Notify"));
    expect(button("Retry").closest('[role="dialog"]')?.getAttribute("aria-label")).toBe("Editor");
    escape(); expect(button("Retry").closest("[inert]")).toBeNull();
  });
  it("uses unique search/disclosure IDs across concurrent catalogs", async () => {
    mount(<ToastProvider><CatalogComposite/><CatalogComposite collection="rewards"/></ToastProvider>);
    const ids = [...document.querySelectorAll("[id]")].map(e => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const input of document.querySelectorAll('input[type="search"]')) {
      expect(document.getElementById(input.getAttribute("aria-controls")!)).not.toBeNull();
    }
    expect(button("Refine Collars")).toBeTruthy();
    for (const control of document.querySelectorAll("[aria-controls]")) {
      const ids = control.getAttribute("aria-controls")!.split(/\s+/);
      for (const id of ids) expect(document.getElementById(id)).not.toBeNull();
    }
    click(button("Collars: Reward — Yes. View classification explanation"));
    await audit();
  }, 15000);
  it("announces navigation through the new heading and current destination; global search announces results", async () => {
    mount(<MemoryRouter initialEntries={["/ui-lab/home"]}><UiLabPage/></MemoryRouter>);
    await act(async()=>{await new Promise(resolve=>setTimeout(resolve,220));});
    await act(async () => { await vi.waitFor(() => expect(button("Catalog")).toBeTruthy(), { timeout: 5000 }); });
    click(button("Catalog"));
    const heading = document.querySelector("h1")!;
    expect(document.activeElement).toBe(heading);
    expect(document.title).toContain("Explore the catalog.");
    expect(button("Catalog").getAttribute("aria-current")).toBe("page");
    await audit();
    click(button("Search"));
    const input = document.querySelector<HTMLInputElement>('input[aria-label="Search catalog"]')!;
    const target = document.getElementById(input.getAttribute("aria-controls")!);
    expect(target).not.toBeNull();
    act(() => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, "no matches");
      input.dispatchEvent(new Event("input", {bubbles: true}));
    });
    expect(document.querySelector('[role="status"]')?.textContent).toBe("Searching…");
    await act(async()=>{await vi.waitFor(()=>expect(document.querySelector('[role="status"]')?.textContent).toBe("0 matches"),{timeout:5000});});
    await audit(); escape();
    expect(document.activeElement).toBe(button("Search"));
  }, 15000);
});
