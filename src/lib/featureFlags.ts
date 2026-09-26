export const FEATURE_FLAG_OVERRIDES_STORAGE_KEY =
  "kink-profile:feature-flag-overrides-v1";
export const FEATURE_FLAG_OVERRIDES_SCHEMA_VERSION = 1 as const;

export type FeatureFlagDefinition = Readonly<{
  label: string;
  description: string;
  defaultValue: boolean;
}>;

export type FeatureFlagRegistry = Readonly<
  Record<string, FeatureFlagDefinition>
>;

export type FeatureFlagKey<Registry extends FeatureFlagRegistry> = Extract<
  keyof Registry,
  string
>;

export type FeatureFlagStorage = Pick<
  Storage,
  "getItem" | "setItem" | "removeItem"
>;

export type FeatureFlagOverrides<Registry extends FeatureFlagRegistry> =
  Partial<Record<FeatureFlagKey<Registry>, boolean>>;

export type FeatureFlagState<Key extends string = string> = {
  key: Key;
  label: string;
  description: string;
  defaultValue: boolean;
  overrideValue: boolean | undefined;
  effectiveValue: boolean;
  isOverridden: boolean;
};

/**
 * The canonical application registry.
 *
 * Keep this list intentionally small. Add a flag only when experimental code
 * needs to land disabled by default, and remove the flag when the experiment
 * graduates or is abandoned.
 */
export const FEATURE_FLAG_REGISTRY = {} as const satisfies FeatureFlagRegistry;

export type AppFeatureFlagKey = FeatureFlagKey<
  typeof FEATURE_FLAG_REGISTRY
>;

type PersistedFeatureFlagOverrides = {
  schemaVersion: typeof FEATURE_FLAG_OVERRIDES_SCHEMA_VERSION;
  overrides: Record<string, boolean>;
};

function browserStorage(): FeatureFlagStorage | undefined {
  return typeof window === "undefined" ? undefined : window.localStorage;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function createFeatureFlagRuntime<
  Registry extends FeatureFlagRegistry,
>(
  registry: Registry,
  storageKey = FEATURE_FLAG_OVERRIDES_STORAGE_KEY,
) {
  type Key = FeatureFlagKey<Registry>;
  type Overrides = FeatureFlagOverrides<Registry>;

  const keys = Object.keys(registry) as Key[];

  function loadOverrides(
    storage: FeatureFlagStorage | undefined = browserStorage(),
  ): Overrides {
    if (!storage) return {};

    try {
      const raw = storage.getItem(storageKey);
      if (!raw) return {};

      const parsed = JSON.parse(raw) as unknown;
      if (
        !isRecord(parsed) ||
        parsed.schemaVersion !== FEATURE_FLAG_OVERRIDES_SCHEMA_VERSION ||
        !isRecord(parsed.overrides)
      ) {
        return {};
      }

      const overrides: Overrides = {};
      for (const key of keys) {
        const value = parsed.overrides[key];
        if (typeof value === "boolean") {
          overrides[key] = value;
        }
      }
      return overrides;
    } catch {
      return {};
    }
  }

  function saveOverrides(
    overrides: Overrides,
    storage: FeatureFlagStorage | undefined = browserStorage(),
  ) {
    if (!storage) return;

    try {
      const persistedOverrides: Record<string, boolean> = {};
      for (const key of keys) {
        const value = overrides[key];
        if (typeof value === "boolean") {
          persistedOverrides[key] = value;
        }
      }

      if (Object.keys(persistedOverrides).length === 0) {
        storage.removeItem(storageKey);
        return;
      }

      storage.setItem(
        storageKey,
        JSON.stringify({
          schemaVersion: FEATURE_FLAG_OVERRIDES_SCHEMA_VERSION,
          overrides: persistedOverrides,
        } satisfies PersistedFeatureFlagOverrides),
      );
    } catch {
      // Experimental controls are optional. Storage failures must not break
      // ordinary product behavior; callers fall back to registry defaults.
    }
  }

  function definitionFor(key: Key) {
    const definition = registry[key];
    if (!definition) {
      throw new Error(`Unknown feature flag: ${key}`);
    }
    return definition;
  }

  function getState(
    key: Key,
    storage: FeatureFlagStorage | undefined = browserStorage(),
  ): FeatureFlagState<Key> {
    const definition = definitionFor(key);
    const overrides = loadOverrides(storage);
    const overrideValue = overrides[key];
    const isOverridden = typeof overrideValue === "boolean";

    return {
      key,
      label: definition.label,
      description: definition.description,
      defaultValue: definition.defaultValue,
      overrideValue: isOverridden ? overrideValue : undefined,
      effectiveValue: isOverridden ? overrideValue : definition.defaultValue,
      isOverridden,
    };
  }

  function getAllStates(
    storage: FeatureFlagStorage | undefined = browserStorage(),
  ): FeatureFlagState<Key>[] {
    const overrides = loadOverrides(storage);

    return keys.map((key) => {
      const definition = definitionFor(key);
      const overrideValue = overrides[key];
      const isOverridden = typeof overrideValue === "boolean";

      return {
        key,
        label: definition.label,
        description: definition.description,
        defaultValue: definition.defaultValue,
        overrideValue: isOverridden ? overrideValue : undefined,
        effectiveValue: isOverridden
          ? overrideValue
          : definition.defaultValue,
        isOverridden,
      };
    });
  }

  function isEnabled(
    key: Key,
    storage: FeatureFlagStorage | undefined = browserStorage(),
  ) {
    return getState(key, storage).effectiveValue;
  }

  function setOverride(
    key: Key,
    value: boolean,
    storage: FeatureFlagStorage | undefined = browserStorage(),
  ) {
    const overrides = loadOverrides(storage);
    overrides[key] = value;
    saveOverrides(overrides, storage);
  }

  function clearOverride(
    key: Key,
    storage: FeatureFlagStorage | undefined = browserStorage(),
  ) {
    const overrides = loadOverrides(storage);
    delete overrides[key];
    saveOverrides(overrides, storage);
  }

  function resetOverrides(
    storage: FeatureFlagStorage | undefined = browserStorage(),
  ) {
    if (!storage) return;

    try {
      storage.removeItem(storageKey);
    } catch {
      // See saveOverrides: flags must safely fall back to registry defaults.
    }
  }

  return {
    registry,
    storageKey,
    listDefinitions: () =>
      keys.map((key) => ({ key, ...definitionFor(key) })),
    loadOverrides,
    getState,
    getAllStates,
    isEnabled,
    setOverride,
    clearOverride,
    resetOverrides,
  };
}

export const featureFlags = createFeatureFlagRuntime(FEATURE_FLAG_REGISTRY);
