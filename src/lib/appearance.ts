import { useSyncExternalStore } from "react";
import { APPEARANCE_STORAGE_KEY, appearancePresets, DEFAULT_APPEARANCE, isAppearance, type Appearance } from "./appearancePresets";

const CHANGE_EVENT = "kp-appearance-change";

export function loadAppearance(): Appearance {
  try {
    const saved = window.localStorage.getItem(APPEARANCE_STORAGE_KEY);
    return isAppearance(saved) ? saved : DEFAULT_APPEARANCE;
  } catch {
    return DEFAULT_APPEARANCE;
  }
}

export function applyAppearance(appearance: Appearance) {
  const preset = appearancePresets.find(p => p.id === appearance)!;
  document.documentElement.dataset.theme = appearance;
  document.documentElement.style.colorScheme = preset.scheme;
  document.documentElement.style.backgroundColor = preset.chrome;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", preset.chrome);
  document.querySelector('meta[name="color-scheme"]')?.setAttribute("content", preset.scheme);
}

export function initializeAppearance() {
  applyAppearance(loadAppearance());
}

/** Appearance is a device preference, independent of profile import/reset/share. */
export function selectAppearance(appearance: Appearance): boolean {
  applyAppearance(appearance);
  let saved = true;
  try { window.localStorage.setItem(APPEARANCE_STORAGE_KEY, appearance); }
  catch { saved = false; }
  window.dispatchEvent(new Event(CHANGE_EVENT));
  return saved;
}

function subscribe(listener: () => void) {
  window.addEventListener(CHANGE_EVENT, listener);
  return () => window.removeEventListener(CHANGE_EVENT, listener);
}
function snapshot(): Appearance {
  const active = document.documentElement.dataset.theme;
  return isAppearance(active) ? active : loadAppearance();
}
export function useAppearance() {
  return useSyncExternalStore(subscribe, snapshot, () => DEFAULT_APPEARANCE);
}
