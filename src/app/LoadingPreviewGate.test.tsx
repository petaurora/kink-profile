// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, useLocation } from "react-router-dom";
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
function RoutedContent() {
  const location = useLocation();
  return <p>Actual KP app content at {location.pathname}</p>;
}
function mount(route: string) {
  act(() => root.render(<MemoryRouter initialEntries={[route]}>
    <LoadingPreviewGate><RoutedContent /></LoadingPreviewGate>
  </MemoryRouter>));
}
it("holds an explicitly enabled loader preview until Continue is activated", () => {
  mount("/ui-lab/home?loading-preview=1");
  const continueButton = element.querySelector<HTMLButtonElement>(".kp-loading-preview-continue");
  expect(continueButton?.textContent).toContain("Continue to KP");
  expect(element.textContent).not.toContain("Actual KP app content");
  expect(element.querySelector(".kp-loading-rotor")).not.toBeNull();
  act(() => continueButton!.click());
  expect(element.textContent).toContain("Actual KP app content at /ui-lab/home");
  expect(element.querySelector(".kp-loading-preview")).toBeNull();
});
it("covers the PR's bare root preview link and moves it to V2 Lab after Continue", () => {
  mount("/");
  const isPrPreview = /(?:^|\/)pr-\d+(?:\/|$)/.test(import.meta.env.BASE_URL || "/");
  if (isPrPreview) {
    const continueButton = element.querySelector<HTMLButtonElement>(".kp-loading-preview-continue")!;
    expect(continueButton).not.toBeNull();
    act(() => continueButton.click());
    expect(element.textContent).toContain("Actual KP app content at /ui-lab/home");
  } else {
    expect(element.textContent).toContain("Actual KP app content at /");
  }
});
it("does not hold ordinary production routes without an explicit preview flag", () => {
  mount("/ui-lab/home");
  if (!/(?:^|\/)pr-\d+(?:\/|$)/.test(import.meta.env.BASE_URL || "/")) {
    expect(element.textContent).toContain("Actual KP app content");
    expect(element.querySelector(".kp-loading-preview")).toBeNull();
  }
});
