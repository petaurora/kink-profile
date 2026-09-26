import { useState } from "react";
import {
  featureFlags,
  type FeatureFlagState,
  type FeatureFlagStorage,
} from "../../lib/featureFlags";
import "./ExperimentalFeaturesPanel.css";

type FeatureFlagRuntime<Key extends string> = {
  getState: (
    key: Key,
    storage?: FeatureFlagStorage,
  ) => FeatureFlagState<Key>;
  getAllStates: (
    storage?: FeatureFlagStorage,
  ) => FeatureFlagState<Key>[];
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

export function toggleExperimentalFeature<Key extends string>(
  runtime: FeatureFlagRuntime<Key>,
  key: Key,
  storage?: FeatureFlagStorage,
) {
  const state = runtime.getState(key, storage);
  runtime.setOverride(key, !state.effectiveValue, storage);
}

export function clearExperimentalFeatureOverride<Key extends string>(
  runtime: FeatureFlagRuntime<Key>,
  key: Key,
  storage?: FeatureFlagStorage,
) {
  runtime.clearOverride(key, storage);
}

export function resetExperimentalFeatureOverrides<Key extends string>(
  runtime: FeatureFlagRuntime<Key>,
  storage?: FeatureFlagStorage,
) {
  runtime.resetOverrides(storage);
}

export function ExperimentalFeaturesPanel() {
  const [states, setStates] = useState(() => featureFlags.getAllStates());

  const refresh = () => {
    setStates(featureFlags.getAllStates());
  };

  const anyOverrides = states.some((state) => state.isOverridden);

  return (
    <section
      className="settings-experiments panel"
      aria-labelledby="settings-experiments-heading"
    >
      <header className="settings-experiments-heading">
        <div>
          <p className="eyebrow">Local experiments</p>
          <h3 id="settings-experiments-heading">Experimental Features</h3>
          <p>
            Try unfinished product work on this browser only. These switches are
            developer conveniences, not account permissions or security controls.
          </p>
        </div>
        <button
          type="button"
          className="secondary compact"
          disabled={!anyOverrides}
          onClick={() => {
            resetExperimentalFeatureOverrides(featureFlags);
            refresh();
          }}
        >
          Reset experimental flags
        </button>
      </header>

      {states.length === 0 ? (
        <div className="settings-experiments-empty">
          <strong>No experimental features registered.</strong>
          <span>
            New experiments will appear here automatically when they are added to
            the feature-flag registry.
          </span>
        </div>
      ) : (
        <div
          className="settings-experiments-list"
          aria-label="Experimental feature flags"
        >
          {states.map((state) => (
            <article className="settings-experiment-row" key={state.key}>
              <div className="settings-experiment-copy">
                <strong>{state.label}</strong>
                <p>{state.description}</p>
                <div className="settings-experiment-status">
                  <span>
                    Effective: <b>{state.effectiveValue ? "On" : "Off"}</b>
                  </span>
                  <span>
                    Default: {state.defaultValue ? "On" : "Off"}
                  </span>
                  <span>
                    {state.isOverridden ? "Local override" : "Using default"}
                  </span>
                </div>
              </div>

              <div className="settings-experiment-controls">
                <button
                  type="button"
                  className={
                    state.effectiveValue
                      ? "settings-switch is-on"
                      : "settings-switch"
                  }
                  role="switch"
                  aria-checked={state.effectiveValue}
                  aria-label={`${state.label}: ${state.effectiveValue ? "On" : "Off"}`}
                  onClick={() => {
                    toggleExperimentalFeature(featureFlags, state.key);
                    refresh();
                  }}
                >
                  <span aria-hidden="true" />
                  {state.effectiveValue ? "On" : "Off"}
                </button>

                {state.isOverridden && (
                  <button
                    type="button"
                    className="secondary compact"
                    onClick={() => {
                      clearExperimentalFeatureOverride(
                        featureFlags,
                        state.key,
                      );
                      refresh();
                    }}
                  >
                    Use default
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="settings-experiments-note">
        Overrides stay local to this browser and are kept separate from profile
        settings, backup, and share data. Hiding Developer Tools does not reset
        them.
      </p>
    </section>
  );
}
