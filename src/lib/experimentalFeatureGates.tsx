import { useSyncExternalStore, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import {
  featureFlags,
  type AppFeatureFlagKey,
  type FeatureFlagStorage,
} from "./featureFlags";
import { unknownRouteFallbackPath } from "../app/routes";

export const EXPERIMENTAL_FEATURE_FLAGS_CHANGED_EVENT =
  "kink-profile:experimental-feature-flags-changed";

export type ExperimentalFeatureReader<Key extends string> = {
  storageKey: string;
  isEnabled: (key: Key, storage?: FeatureFlagStorage) => boolean;
};

export type ExperimentalFeatureRuntime<Key extends string> =
  ExperimentalFeatureReader<Key> & {
    setOverride: (
      key: Key,
      value: boolean,
      storage?: FeatureFlagStorage,
    ) => void;
    clearOverride: (
      key: Key,
      storage?: FeatureFlagStorage,
    ) => void;
    resetOverrides: (
      storage?: FeatureFlagStorage,
    ) => void;
  };

export type ExperimentalNavigationItem<Key extends string> = {
  featureFlag?: Key;
};

function notifyExperimentalFeatureFlagsChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EXPERIMENTAL_FEATURE_FLAGS_CHANGED_EVENT));
}

export function setExperimentalFeatureOverride<Key extends string>(
  runtime: ExperimentalFeatureRuntime<Key>,
  key: Key,
  value: boolean,
  storage?: FeatureFlagStorage,
) {
  runtime.setOverride(key, value, storage);
  notifyExperimentalFeatureFlagsChanged();
}

export function clearExperimentalFeatureOverride<Key extends string>(
  runtime: ExperimentalFeatureRuntime<Key>,
  key: Key,
  storage?: FeatureFlagStorage,
) {
  runtime.clearOverride(key, storage);
  notifyExperimentalFeatureFlagsChanged();
}

export function resetExperimentalFeatureOverrides<Key extends string>(
  runtime: ExperimentalFeatureRuntime<Key>,
  storage?: FeatureFlagStorage,
) {
  runtime.resetOverrides(storage);
  notifyExperimentalFeatureFlagsChanged();
}

export function isExperimentalFeatureEnabled<Key extends string>(
  runtime: ExperimentalFeatureReader<Key>,
  key: Key,
  storage?: FeatureFlagStorage,
) {
  return runtime.isEnabled(key, storage);
}

export function isExperimentalNavigationItemVisible<Key extends string>(
  item: ExperimentalNavigationItem<Key>,
  runtime: ExperimentalFeatureReader<Key>,
  storage?: FeatureFlagStorage,
) {
  return item.featureFlag === undefined
    ? true
    : runtime.isEnabled(item.featureFlag, storage);
}

export function filterExperimentalNavigation<
  Key extends string,
  Item extends ExperimentalNavigationItem<Key>,
>(
  items: readonly Item[],
  runtime: ExperimentalFeatureReader<Key>,
  storage?: FeatureFlagStorage,
) {
  return items.filter((item) =>
    isExperimentalNavigationItemVisible(item, runtime, storage),
  );
}

export function resolveExperimentalRoute<Key extends string>(
  runtime: ExperimentalFeatureReader<Key>,
  key: Key,
  fallbackPath: string = unknownRouteFallbackPath,
  storage?: FeatureFlagStorage,
) {
  return runtime.isEnabled(key, storage)
    ? { allowed: true as const, redirectTo: null }
    : { allowed: false as const, redirectTo: fallbackPath };
}

function subscribeToExperimentalFeatureFlags(listener: () => void) {
  if (typeof window === "undefined") return () => {};

  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === featureFlags.storageKey) {
      listener();
    }
  };

  window.addEventListener(EXPERIMENTAL_FEATURE_FLAGS_CHANGED_EVENT, listener);
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener(
      EXPERIMENTAL_FEATURE_FLAGS_CHANGED_EVENT,
      listener,
    );
    window.removeEventListener("storage", onStorage);
  };
}

export function useExperimentalFeatureEnabled(key: AppFeatureFlagKey) {
  return useSyncExternalStore(
    subscribeToExperimentalFeatureFlags,
    () => featureFlags.isEnabled(key),
    () => featureFlags.isEnabled(key),
  );
}

export function ExperimentalFeatureGate({
  flag,
  children,
  fallback = null,
}: {
  flag: AppFeatureFlagKey;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return useExperimentalFeatureEnabled(flag) ? children : fallback;
}

export function ExperimentalRouteGate({
  flag,
  children,
  fallbackPath = unknownRouteFallbackPath,
}: {
  flag: AppFeatureFlagKey;
  children: ReactNode;
  fallbackPath?: string;
}) {
  const enabled = useExperimentalFeatureEnabled(flag);

  return enabled ? (
    children
  ) : (
    <Navigate to={fallbackPath} replace />
  );
}
