const DEVELOPER_TOOLS_STORAGE_KEY = "kink-profile:developer-tools-enabled";

export function loadDeveloperToolsEnabled(storage: Storage | undefined = typeof window === "undefined" ? undefined : window.localStorage) {
  if (!storage) return false;

  try {
    return storage.getItem(DEVELOPER_TOOLS_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function saveDeveloperToolsEnabled(
  enabled: boolean,
  storage: Storage | undefined = typeof window === "undefined" ? undefined : window.localStorage,
) {
  if (!storage) return;

  try {
    if (enabled) storage.setItem(DEVELOPER_TOOLS_STORAGE_KEY, "true");
    else storage.removeItem(DEVELOPER_TOOLS_STORAGE_KEY);
  } catch {
    // Local discoverability is optional; storage failures must not break Settings.
  }
}
