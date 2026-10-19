// @vitest-environment jsdom
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LoadingBar, ProgressBar, StepProgress } from "./ProgressBar";
import { LoadingIndicator, LoadingState, SkeletonBlock } from "./LoadingState";

let host: HTMLDivElement;
let root: Root;
const mount = (node: ReactNode) => act(() => root.render(node));
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

describe("shared progress semantics", () => {
  it("uses actual determinate values, with finite clamping", () => {
    mount(<ProgressBar value={11} max={8} label="Quiz progress" />);
    const progress = host.querySelector('[role="progressbar"]')!;
    expect(progress.getAttribute("aria-valuenow")).toBe("8");
    expect(progress.getAttribute("aria-valuemax")).toBe("8");
    expect(progress.querySelector("span")?.getAttribute("style")).toContain("100%");
    mount(<ProgressBar value={-3} max={8} label="Quiz progress" />);
    expect(host.querySelector('[role="progressbar"]')?.getAttribute("aria-valuenow")).toBe("0");
  });
  it("announces completed steps separately from the current question", () => {
    mount(<StepProgress title="Discover progress" completed={3} total={8} />);
    expect(host.textContent).toContain("3 / 8");
    expect(host.querySelector('[role="progressbar"]')?.getAttribute("aria-valuetext")).toBe("3 of 8 complete");
  });
  it("does not invent percent complete for indefinite work", () => {
    mount(<LoadingBar label="Finding matches" />);
    const progress = host.querySelector('[role="progressbar"]')!;
    expect(progress.getAttribute("aria-label")).toBe("Finding matches");
    expect(progress.hasAttribute("aria-valuenow")).toBe(false);
  });
});

describe("shared loading semantics", () => {
  it("provides readable status and keeps rotating artwork decorative", () => {
    mount(<LoadingState label="Loading discoveries" detail="Checking updated suggestions" showBar />);
    expect(host.querySelector('[role="status"]')?.textContent).toContain("Loading discoveries");
    expect(host.querySelector(".kp-loading-indicator")?.getAttribute("aria-hidden")).toBe("true");
  });
  it("permits custom future artwork and non-announced skeletons", () => {
    mount(<><LoadingIndicator artwork={<span data-testid="flame">Artwork</span>} /><SkeletonBlock height="1rem" /></>);
    expect(host.querySelector('[data-testid="flame"]')).not.toBeNull();
    expect(host.querySelector(".kp-skeleton")?.getAttribute("aria-hidden")).toBe("true");
  });
});
