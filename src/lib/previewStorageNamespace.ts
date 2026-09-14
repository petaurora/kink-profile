const APP_STORAGE_PREFIXES = ["pet-profile-", "kink-profile:"] as const;

export function previewStoragePrefix(previewPr: string | undefined) {
  const normalized = previewPr?.trim();
  return normalized ? `kink-profile:preview:pr-${normalized}:` : "";
}

export function previewStorageKey(
  key: string,
  previewPr: string | undefined,
) {
  const prefix = previewStoragePrefix(previewPr);
  if (!prefix) return key;
  return APP_STORAGE_PREFIXES.some((candidate) => key.startsWith(candidate))
    ? `${prefix}${key}`
    : key;
}

/**
 * PR previews share the petaurora.github.io origin with production, so their
 * localStorage would otherwise share the same keys. Install this shim before
 * the app hydrates any persisted state. Production is intentionally a no-op so
 * its existing keys and behavior remain unchanged.
 */
export function installPreviewStorageNamespace(
  previewPr: string | undefined = import.meta.env.VITE_PREVIEW_PR,
) {
  const prefix = previewStoragePrefix(previewPr);
  if (!prefix || typeof window === "undefined") return;

  const prototype = Storage.prototype;
  const originalGetItem = prototype.getItem;
  const originalSetItem = prototype.setItem;
  const originalRemoveItem = prototype.removeItem;

  const scopedKey = (storage: Storage, key: string) =>
    storage === window.localStorage
      ? previewStorageKey(key, previewPr)
      : key;

  prototype.getItem = function getItem(key: string) {
    return originalGetItem.call(this, scopedKey(this, key));
  };
  prototype.setItem = function setItem(key: string, value: string) {
    return originalSetItem.call(this, scopedKey(this, key), value);
  };
  prototype.removeItem = function removeItem(key: string) {
    return originalRemoveItem.call(this, scopedKey(this, key));
  };
}
