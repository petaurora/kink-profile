export const DEVELOPER_TOOLS_STORAGE_KEY = "kink-profile-developer-tools-v1";

export type StorageLike = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

function browserStorage(): StorageLike | undefined {
  return typeof localStorage === "undefined" ? undefined : localStorage;
}

export function loadDeveloperToolsEnabled(
  storage: StorageLike | undefined = browserStorage(),
) {
  if (!storage) return false;

  try {
    return storage.getItem(DEVELOPER_TOOLS_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function saveDeveloperToolsEnabled(
  enabled: boolean,
  storage: StorageLike | undefined = browserStorage(),
) {
  if (!storage) return;

  try {
    storage.setItem(DEVELOPER_TOOLS_STORAGE_KEY, String(enabled));
  } catch {
    // Developer-tool discoverability should never block the product shell.
  }
}
