// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { applyAppearance, initializeAppearance, loadAppearance, selectAppearance } from "./appearance";
import { APPEARANCE_STORAGE_KEY, appearanceBootstrapScript } from "./appearancePresets";
import { previewStorageKey } from "./previewStorageNamespace";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  document.head.innerHTML = '<meta name="theme-color" content="#0b0c25"><meta name="color-scheme" content="dark">';
});
afterEach(() => vi.restoreAllMocks());

describe("appearance preference", () => {
  it("defaults safely when preference is missing, malformed or storage cannot be accessed", () => {
    expect(loadAppearance()).toBe("midnight");
    localStorage.setItem(APPEARANCE_STORAGE_KEY, '{"theme":"unknown"}');
    expect(loadAppearance()).toBe("midnight");
    vi.spyOn(window, "localStorage", "get").mockImplementation(() => { throw new Error("Blocked"); });
    expect(loadAppearance()).toBe("midnight");
  });
  it("changes only appearance storage, leaving profile and unrelated settings byte-identical", () => {
    localStorage.setItem("pet-profile-v2", '{"answers":{"q1":2}}');
    localStorage.setItem("kink-profile:developer-tools-enabled", "true");
    const notify = vi.fn(); window.addEventListener("kp-appearance-change", notify);
    expect(selectAppearance("dusty-rose")).toBe(true);
    expect(loadAppearance()).toBe("dusty-rose");
    expect(document.documentElement.dataset.theme).toBe("dusty-rose");
    expect(document.querySelector('meta[name="color-scheme"]')?.getAttribute("content")).toBe("light");
    expect(localStorage.getItem("pet-profile-v2")).toBe('{"answers":{"q1":2}}');
    expect(localStorage.getItem("kink-profile:developer-tools-enabled")).toBe("true");
    expect(notify).toHaveBeenCalledOnce();
    window.removeEventListener("kp-appearance-change", notify);
  });
  it("keeps a choice active even if persistence fails", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Quota"); });
    expect(selectAppearance("oxblood")).toBe(false);
    expect(document.documentElement.dataset.theme).toBe("oxblood");
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });
  it("restores selected appearance and document metadata on initialization", () => {
    localStorage.setItem(APPEARANCE_STORAGE_KEY, "oxblood");
    applyAppearance("dusty-rose");
    initializeAppearance();
    expect(document.documentElement.dataset.theme).toBe("oxblood");
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute("content")).toBe("#170e13");
  });
  it("bootstraps before app rendering using only the current preview's preference", () => {
    localStorage.setItem(APPEARANCE_STORAGE_KEY, "oxblood");
    const previewKey = previewStorageKey(APPEARANCE_STORAGE_KEY, "314");
    localStorage.setItem(previewKey, "dusty-rose");
    window.eval(appearanceBootstrapScript(previewKey));
    expect(document.documentElement.dataset.theme).toBe("dusty-rose");
    expect(document.documentElement.style.colorScheme).toBe("light");
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute("content")).toBe("#f4e9e8");
    expect(localStorage.getItem(APPEARANCE_STORAGE_KEY)).toBe("oxblood");
  });
  it("uses the same safe default in bootstrap when storage is unavailable", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("Blocked"); });
    window.eval(appearanceBootstrapScript(APPEARANCE_STORAGE_KEY));
    expect(document.documentElement.dataset.theme).toBe("midnight");
  });
});
