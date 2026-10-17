// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { LoadingPreviewGate } from "./LoadingPreviewGate";

let element: HTMLDivElement;
let root: Root;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  element = document.createElement("div");
  document.body.appendChild(element);
  root = createRoot(element);
});
afterEach(() => {
  act(() => root.unmount());
  element.remove();
  vi.unstubAllGlobals();
});
function mount(route: string) {
  act(() => root.render(<MemoryRouter initialEntries={[route]}>
    <LoadingPreviewGate><p>Actual KP app content</p></LoadingPreviewGate>
  </MemoryRouter>));
}
it("holds an explicit loader preview until Continue is activated", () => {
  mount("/ui-lab/home?loading-preview=1");
  const continueButton = element.querySelector<HTMLButtonElement>(".kp-loading-preview-continue");
  expect(continueButton?.textContent).toContain("Continue to KP");
  expect(element.textContent).not.toContain("Actual KP app content");
  expect(element.querySelector(".kp-loading-rotor")).not.toBeNull();
  act(() => continueButton!.click());
  expect(element.textContent).toContain("Actual KP app content");
  expect(element.querySelector(".kp-loading-preview")).toBeNull();
});
it("does not hold an ordinary UI Lab route outside PR previews", () => {
  mount("/ui-lab/home");
  if (!/(?:^|\/)pr-\d+(?:\/|$)/.test(import.meta.env.BASE_URL || "/")) {
    expect(element.textContent).toContain("Actual KP app content");
  }
});
