export const APPEARANCE_STORAGE_KEY = "kink-profile:appearance";

export const appearancePresets = [
  { id: "midnight", name: "Midnight", description: "Soft plum & pink glow", scheme: "dark", chrome: "#0b0c25" },
  { id: "dusty-rose", name: "Dusty Rose", description: "Warm blush & rosewood", scheme: "light", chrome: "#f4e9e8" },
  { id: "oxblood", name: "Oxblood", description: "Deep burgundy & dark velvet", scheme: "dark", chrome: "#170e13" },
] as const;

export type Appearance = typeof appearancePresets[number]["id"];
export const DEFAULT_APPEARANCE: Appearance = "midnight";

export function isAppearance(value: unknown): value is Appearance {
  return appearancePresets.some(preset => preset.id === value);
}

/** Small synchronous head script, generated from the same preset registry as React.
 * It runs before styles/app modules and reads the already-scoped preview key.
 * The normal storage shim is installed later; never install it twice here. */
export function appearanceBootstrapScript(storageKey: string) {
  return `(() => {
    const presets = ${JSON.stringify(appearancePresets)};
    let saved;
    try { saved = localStorage.getItem(${JSON.stringify(storageKey)}); } catch {}
    const preset = presets.find(p => p.id === saved) || presets[0];
    const root = document.documentElement;
    root.dataset.theme = preset.id;
    root.style.colorScheme = preset.scheme;
    root.style.backgroundColor = preset.chrome;
    document.querySelector('meta[name="theme-color"]').content = preset.chrome;
    document.querySelector('meta[name="color-scheme"]').content = preset.scheme;
  })();`;
}
