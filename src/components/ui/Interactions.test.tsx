// @vitest-environment jsdom
import { act, useState, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ModalLayer } from "./ModalLayer";
import { SearchField } from "./SearchField";
import { PreferenceControl, PreferenceSheet } from "./PreferenceControl";
import { DisclosureSection } from "./DisclosureSection";
import { ToastViewport, type ToastMessage } from "./ToastViewport";
import { ToastProvider, useToasts } from "./ToastProvider";
import { enqueueToast } from "./useToastQueue";
import { CatalogComposite } from "../../features/ui-lab/CatalogComposite";

let container: HTMLDivElement;
let root: Root;
function mount(node: ReactNode) {
  act(() => root.render(node));
}
function button(label: string) {
  const match = [
    ...document.querySelectorAll<HTMLButtonElement>("button"),
  ].find(
    (element) =>
      element.getAttribute("aria-label") === label ||
      element.textContent === label,
  );
  if (!match) throw new Error(`Missing button: ${label}`);
  return match;
}
function click(element: HTMLElement) {
  act(() => {
    element.focus();
    element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}
function key(value: string, shiftKey = false) {
  act(() =>
    document.activeElement?.dispatchEvent(
      new KeyboardEvent("keydown", { key: value, shiftKey, bubbles: true }),
    ),
  );
}
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  // jsdom has no layout; treat mounted controls as visible for focus tests.
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    {},
  ] as unknown as DOMRectList);
  document.body.style.overflow = "";
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("shared modal interactions", () => {
  function DialogHarness() {
    const [open, setOpen] = useState(false);
    const [nested, setNested] = useState(false);
    return (
      <>
        <button onClick={() => setOpen(true)}>Open</button>
        <ModalLayer open={open} onClose={() => setOpen(false)} label="Parent">
          <button onClick={() => setNested(true)}>Nested</button>
          <button>Last</button>
          <ModalLayer
            open={nested}
            onClose={() => setNested(false)}
            label="Child"
          >
            <button>Child action</button>
          </ModalLayer>
        </ModalLayer>
      </>
    );
  }
  it("traps Tab in the top dialog and restores nested and originating focus", () => {
    mount(<DialogHarness />);
    click(button("Open"));
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.activeElement).toBe(button("Nested"));
    key("Tab", true);
    expect(document.activeElement).toBe(button("Last"));
    key("Tab");
    expect(document.activeElement).toBe(button("Nested"));
    click(button("Nested"));
    expect(document.activeElement).toBe(button("Child action"));
    key("Escape");
    expect(document.querySelector('[aria-label="Child"]')).toBeNull();
    expect(document.querySelector('[aria-label="Parent"]')).not.toBeNull();
    expect(document.body.style.overflow).toBe("hidden");
    expect(document.activeElement).toBe(button("Nested"));
    key("Escape");
    expect(document.activeElement).toBe(button("Open"));
    expect(document.body.style.overflow).toBe("");
  });
  it("restores an existing scroll lock after backdrop dismissal", () => {
    document.body.style.overflow = "clip";
    mount(<DialogHarness />);
    click(button("Open"));
    click(button("Close dialog"));
    expect(document.body.style.overflow).toBe("clip");
  });
  it("restores trigger focus when a child input uses autofocus", () => {
    function AutofocusDialog() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button onClick={() => setOpen(true)}>Search launcher</button>
          <ModalLayer open={open} onClose={() => setOpen(false)} label="Search">
            <input autoFocus aria-label="Query" />
          </ModalLayer>
        </>
      );
    }
    mount(<AutofocusDialog />);
    click(button("Search launcher"));
    expect(document.activeElement).toBe(document.querySelector("input"));
    key("Escape");
    expect(document.activeElement).toBe(button("Search launcher"));
  });
  it("orders a parent and initially open child correctly", () => {
    function InitialNested() {
      const [open, setOpen] = useState(false);
      const [child, setChild] = useState(true);
      return (
        <>
          <button onClick={() => setOpen(true)}>Launch both</button>
          <ModalLayer open={open} onClose={() => setOpen(false)} label="Outer">
            <button>Outer action</button>
            <ModalLayer
              open={child}
              onClose={() => setChild(false)}
              label="Inner"
            >
              <button>Inner action</button>
            </ModalLayer>
          </ModalLayer>
        </>
      );
    }
    mount(<InitialNested />);
    click(button("Launch both"));
    expect(document.activeElement).toBe(button("Inner action"));
    key("Escape");
    expect(document.querySelector('[aria-label="Outer"]')).not.toBeNull();
    key("Escape");
    expect(document.activeElement).toBe(button("Launch both"));
  });
  it("allows an actionable notification while a sheet is open", () => {
    const retry = vi.fn();
    mount(
      <>
        <ModalLayer open onClose={() => {}} label="Editor">
          <button>Edit</button>
        </ModalLayer>
        <ToastViewport
          position="modal"
          items={[
            {
              id: 1,
              message: "Failed",
              kind: "error",
              actionLabel: "Retry",
              onAction: retry,
            },
          ]}
          onDismiss={() => {}}
        />
      </>,
    );
    click(button("Retry"));
    click(button("Retry"));
    expect(retry).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(button("Retry"));
  });
});

describe("controlled preferences, disclosure and search", () => {
  it("opens help without changing a rating and clears only through an explicit action", () => {
    const change = vi.fn();
    mount(
      <PreferenceSheet
        open
        onClose={() => {}}
        label="Leather"
        context="Material"
        value="Like"
        options={["Love", "Like"]}
        onChange={change}
        help="Preference, not experience."
      />,
    );
    click(button("What do these mean? +"));
    expect(document.body.textContent).toContain("Preference, not experience.");
    expect(change).not.toHaveBeenCalled();
    click(button("Clear rating"));
    expect(change).toHaveBeenCalledWith(undefined);
  });
  it("preserves independent overall and modifier values through nested rating sheets", () => {
    vi.useFakeTimers();
    mount(
      <ToastProvider>
        <CatalogComposite />
      </ToastProvider>,
    );
    click(button("Collars overall: Not rated. Change rating"));
    click(button("Like"));
    expect(button("Collars overall: Like. Change rating")).toBeTruthy();
    const row = document.querySelector('[data-item-id="collars"]')!;
    click(
      [...row.querySelectorAll<HTMLButtonElement>("button")].find((element) =>
        element.textContent?.includes("Refine"),
      )!,
    );
    const material = button("Material4 options⌄");
    click(material);
    expect(button("Leather: Not rated. Change rating")).toBeTruthy();
    click(button("Leather: Not rated. Change rating"));
    click(button("Love"));
    expect(button("Leather: Love. Change rating")).toBeTruthy();
    expect(document.activeElement).toBe(button("Leather: Love. Change rating"));
    expect(
      document.querySelector('[aria-label="Refine Collars"]'),
    ).not.toBeNull();
    expect(button("Collars overall: Like. Change rating")).toBeTruthy();
    key("Escape");
    expect(document.querySelector('[aria-label="Refine Collars"]')).toBeNull();
    expect(button("Collars overall: Like. Change rating")).toBeTruthy();
  });
  it("keeps a failed latest rating recoverable with contextual Retry", async () => {
    vi.useFakeTimers();
    mount(
      <ToastProvider>
        <CatalogComposite />
      </ToastProvider>,
    );
    click(document.querySelector('input[type="checkbox"]')!);
    click(button("Collars overall: Not rated. Change rating"));
    click(button("Love"));
    await act(async () => {await vi.advanceTimersByTimeAsync(850);});
    expect(button("Collars overall: Love. Change rating")).toBeTruthy();
    click(button("Retry saving Collars overall"));
    await act(async () => {await vi.advanceTimersByTimeAsync(850);});
    expect(
      document.querySelector('[aria-label="Retry saving Collars overall"]'),
    ).toBeNull();
    expect(button("Collars overall: Love. Change rating")).toBeTruthy();
  });
  it("links controlled disclosure to a stable panel without editing preferences", () => {
    const toggle = vi.fn();
    mount(
      <DisclosureSection title="Context" open={false} onToggle={toggle}>
        <PreferenceControl label="Scene" value="Love" onActivate={() => {}} />
      </DisclosureSection>,
    );
    const trigger = button("Context⌄");
    expect(
      document.getElementById(trigger.getAttribute("aria-controls")!)?.hidden,
    ).toBe(true);
    click(trigger);
    expect(toggle).toHaveBeenCalledOnce();
    expect(
      document.querySelector('[aria-label="Scene: Love. Change rating"]'),
    ).toBeNull();
  });
  it("returns focus to search input when clearing outside the UI Lab", () => {
    function SearchHarness() {
      const [value, setValue] = useState("Leather");
      return (
        <SearchField
          mode="input"
          placeholder="Search…"
          value={value}
          onChange={setValue}
          onClear={() => setValue("")}
        />
      );
    }
    mount(<SearchHarness />);
    click(button("Clear search"));
    const input = document.querySelector("input")!;
    expect(input.value).toBe("");
    expect(document.activeElement).toBe(input);
    expect(document.querySelector('[aria-label="Clear search"]')).toBeNull();
  });
});

describe("notification queue and timing", () => {
  const toast = (
    id: number,
    kind: ToastMessage["kind"],
    actionLabel?: string,
  ): ToastMessage => ({ id, kind, message: `Message ${id}`, actionLabel });
  it("consolidates only queued routine successes without replacing the active action or errors", () => {
    const active = toast(1, "info", "Undo"),
      error = toast(2, "error", "Retry");
    const items = [
      active,
      toast(3, "success"),
      error,
      toast(4, "success", "Undo"),
    ];
    expect(enqueueToast(items, toast(5, "success"))).toEqual([
      active,
      error,
      items[3],
      toast(5, "success"),
    ]);
    const success = toast(6, "success");
    expect(enqueueToast([success], toast(7, "success"))).toEqual([
      success,
      toast(7, "success"),
    ]);
    expect(enqueueToast([error], error)).toHaveLength(2);
  });
  it("gives each newly active message its full duration and pauses on focus", () => {
    vi.useFakeTimers();
    const dismiss = vi.fn();
    const info = { ...toast(1, "info"), duration: 1000 };
    mount(<ToastViewport items={[info]} onDismiss={dismiss} />);
    act(() => vi.advanceTimersByTime(400));
    act(() => button("Dismiss notification").focus());
    act(() => vi.advanceTimersByTime(2000));
    expect(dismiss).not.toHaveBeenCalled();
    act(() => button("Dismiss notification").blur());
    act(() => vi.advanceTimersByTime(599));
    expect(dismiss).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(dismiss).toHaveBeenCalledWith(1);
    dismiss.mockClear();
    mount(
      <ToastViewport
        items={[{ ...toast(2, "success"), duration: 1000 }]}
        onDismiss={dismiss}
      />,
    );
    act(() => vi.advanceTimersByTime(999));
    expect(dismiss).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(dismiss).toHaveBeenCalledWith(2);
  });
  it("uses one queue across independent provider consumers", () => {
    function Consumer({ name }: { name: string }) {
      const { notify } = useToasts();
      return (
        <button
          onClick={() => notify({ message: name, kind: "info", duration: 0 })}
        >
          {name}
        </button>
      );
    }
    mount(
      <ToastProvider>
        <Consumer name="From Catalog" />
        <Consumer name="From Playground" />
      </ToastProvider>,
    );
    click(button("From Catalog"));
    click(button("From Playground"));
    expect(document.querySelectorAll(".kp-toast-region")).toHaveLength(1);
    expect(document.querySelector(".kp-toast-message")?.textContent).toBe(
      "From Catalog",
    );
    vi.useFakeTimers();
    click(button("Dismiss notification"));
    act(() => vi.advanceTimersByTime(150));
    expect(document.querySelector(".kp-toast-message")?.textContent).toBe(
      "From Playground",
    );
  });
  it("requires horizontal swipe intent and ignores gestures on toast actions", () => {
    vi.useFakeTimers();
    const dismiss = vi.fn(),
      retry = vi.fn();
    mount(
      <ToastViewport
        items={[
          {
            id: 1,
            message: "Failed",
            kind: "error",
            actionLabel: "Retry",
            onAction: retry,
          },
        ]}
        onDismiss={dismiss}
      />,
    );
    const toast = document.querySelector<HTMLElement>(".kp-toast")!;
    toast.hasPointerCapture = () => false;
    toast.setPointerCapture = () => {};
    const pointer = (target: HTMLElement, type: string, x: number, y: number) =>
      act(() => {
        const event = new Event(type, { bubbles: true });
        Object.assign(event, {
          pointerType: "touch",
          pointerId: 1,
          clientX: x,
          clientY: y,
        });
        target.dispatchEvent(event);
      });
    pointer(toast, "pointerdown", 0, 0);
    pointer(toast, "pointermove", 10, 100);
    pointer(toast, "pointerup", 150, 100);
    act(() => vi.advanceTimersByTime(200));
    expect(dismiss).not.toHaveBeenCalled();
    pointer(button("Retry"), "pointerdown", 0, 0);
    pointer(toast, "pointermove", 150, 0);
    pointer(toast, "pointerup", 150, 0);
    act(() => vi.advanceTimersByTime(200));
    expect(dismiss).not.toHaveBeenCalled();
    expect(retry).not.toHaveBeenCalled();
    pointer(toast, "pointerdown", 0, 0);
    pointer(toast, "pointermove", 100, 5);
    pointer(toast, "pointerup", 100, 5);
    act(() => vi.advanceTimersByTime(150));
    expect(dismiss).toHaveBeenCalledWith(1);
    expect(retry).not.toHaveBeenCalled();
  });
  it("keeps failures persistent and invokes an action once before dismissal", () => {
    vi.useFakeTimers();
    const dismiss = vi.fn(),
      retry = vi.fn();
    mount(
      <ToastViewport
        items={[{ ...toast(1, "error", "Retry"), onAction: retry }]}
        onDismiss={dismiss}
      />,
    );
    act(() => vi.advanceTimersByTime(60000));
    expect(dismiss).not.toHaveBeenCalled();
    click(button("Retry"));
    click(button("Retry"));
    expect(retry).toHaveBeenCalledOnce();
    act(() => vi.advanceTimersByTime(150));
    expect(dismiss).toHaveBeenCalledWith(1);
  });
});
