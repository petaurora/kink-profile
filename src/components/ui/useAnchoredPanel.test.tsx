// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAnchoredPanel } from "./useAnchoredPanel";

let root: Root;
let container: HTMLDivElement;
let anchor: HTMLButtonElement;
let triggerTop: number;

function Harness({ open = true, details = false }: { open?: boolean; details?: boolean }) {
  const { panelRef, panelStyle } = useAnchoredPanel(open, anchor);
  return <section ref={panelRef} style={panelStyle}>
    <div className="kp-preference-scroll">Choices{details && <p>Expanded help and a longer title</p>}</div>
    {details && <button>Clear rating</button>}
  </section>;
}
function render(props: Parameters<typeof Harness>[0] = {}) {
  act(() => root.render(<Harness {...props} />));
}
function geometry() {
  const style = container.querySelector("section")!.style;
  return { left: parseFloat(style.left), top: parseFloat(style.top), width: parseFloat(style.width), height: parseFloat(style.height) };
}

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("innerWidth", 390);
  vi.stubGlobal("innerHeight", 720);
  vi.stubGlobal("visualViewport", undefined);
  triggerTop = 80;
  anchor = document.createElement("button");
  vi.spyOn(anchor, "getBoundingClientRect").mockImplementation(() => ({ left: 1100, right: 1180, top: triggerTop, bottom: triggerTop + 44, width: 80, height: 44, x: 1100, y: triggerTop, toJSON() {} }));
  container = document.createElement("div");
  document.body.append(anchor, container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  anchor.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("rating popup geometry", () => {
  it("keeps the same phone frame across trigger positions, Clear and expanded help", () => {
    render();
    const initial = geometry();
    expect(initial).toEqual({ left: 25, top: 80, width: 340, height: 560 });
    triggerTop = 620;
    render({ details: true });
    act(() => window.dispatchEvent(new Event("resize")));
    expect(geometry()).toEqual(initial);
    render({ open: false });
    expect(container.querySelector("section")!.style.visibility).toBe("hidden");
    triggerTop = 300;
    render();
    expect(geometry()).toEqual(initial);
  });

  it("flips desktop placement while retaining the same frame size", () => {
    vi.stubGlobal("innerWidth", 1280);
    vi.stubGlobal("innerHeight", 860);
    triggerTop = 50;
    render();
    expect(geometry()).toEqual({ left: 840, top: 102, width: 340, height: 560 });
    triggerTop = 740;
    act(() => window.dispatchEvent(new Event("scroll")));
    expect(geometry()).toEqual({ left: 840, top: 172, width: 340, height: 560 });
  });

  it("fits and recenters inside a zoomed or panned visual viewport", () => {
    const viewport = Object.assign(new EventTarget(), { width: 195, height: 360, offsetLeft: 80, offsetTop: 90 });
    vi.stubGlobal("visualViewport", viewport);
    render();
    expect(geometry()).toEqual({ left: 92, top: 102, width: 171, height: 336 });
    viewport.offsetLeft = 120;
    viewport.offsetTop = 200;
    act(() => viewport.dispatchEvent(new Event("scroll")));
    expect(geometry()).toEqual({ left: 132, top: 212, width: 171, height: 336 });
  });

  it("switches between phone centering and desktop anchoring on resize", () => {
    triggerTop = 50;
    render();
    vi.stubGlobal("innerWidth", 1280);
    vi.stubGlobal("innerHeight", 860);
    act(() => window.dispatchEvent(new Event("resize")));
    expect(geometry()).toEqual({ left: 840, top: 102, width: 340, height: 560 });
    vi.stubGlobal("innerWidth", 320);
    vi.stubGlobal("innerHeight", 480);
    act(() => window.dispatchEvent(new Event("resize")));
    expect(geometry()).toEqual({ left: 12, top: 12, width: 296, height: 456 });
  });
});
