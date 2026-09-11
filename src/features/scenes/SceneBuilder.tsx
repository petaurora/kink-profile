import { useEffect, useMemo, useState } from "react";
import {
  IconArrowLeft,
  IconNotes,
  IconPlus,
  IconSparkles,
  IconX,
} from "@tabler/icons-react";
import {
  sceneThemeDefinitions,
  type SceneThemeId,
} from "../../data/sceneThemes";
import {
  buildSceneCandidateView,
  type SceneCandidate,
  type SceneExplorationMode,
  type SceneIntensityPreference,
} from "../../lib/sceneCandidates";
import {
  clearSceneSessionChoice,
  createEmptySceneSessionState,
  getSceneSessionChoice,
  loadSceneSessionState,
  saveSceneSessionState,
  setSceneSessionChoice,
  type SceneSessionChoice,
} from "../../lib/sceneSession";
import {
  addCatalogSceneComponent,
  buildStarterSceneComposition,
  createEmptySceneComposition,
  moveSceneComponent,
  reconcileSceneComposition,
  removeRewardPunishmentSceneComponent,
  removeSceneComponent,
  replacementCandidatesForComponent,
  replaceSceneComponent,
  updateSceneComponentNote,
  updateSceneComponentPhase,
  upsertRewardPunishmentSceneComponent,
  type SceneComposition,
  type SceneEffort,
  type ScenePhaseId,
} from "../../lib/sceneComposition";
import type { CatalogResultView } from "../../lib/catalogResults";
import {
  buildRandomSceneComposition,
  chooseRandomSceneCandidate,
  clearSceneRandomizerState,
  loadSceneRandomizerState,
  saveSceneRandomizerState,
  shuffleSceneComponent,
} from "../../lib/sceneRandomizer";
import { loadRewardPunishmentProfile } from "../../lib/rewardPunishmentProfileStorage";
import { loadRewardPunishmentRecipeState } from "../../lib/rewardPunishmentRecipeStorage";
import {
  getSceneRewardPunishmentAvailability,
  pickSceneRewardPunishment,
  type SceneRewardPunishmentMode,
} from "../../lib/sceneRewardPunishment";
import {
  createSavedScene,
  deleteSavedScene,
  duplicateSavedScene,
  savedSceneToComposition,
  updateSavedScene,
  upsertSavedScene,
} from "../../lib/sceneLibrary";
import {
  loadSceneLibraryState,
  saveSceneLibraryState,
} from "../../lib/sceneLibraryStorage";
import { reviewSavedScene } from "../../lib/sceneLifecycle";
import { getSceneProfileReadiness } from "../../lib/sceneProfileReadiness";
import { buildSharedSceneCandidateView } from "../../lib/sharedSceneCandidates";
import type { SharedProfileComparison } from "../../lib/sharedProfileComparison";
import type { SharedParticipantIntent } from "../../lib/sharedParticipantIntent";
import { SceneCandidateCard } from "./SceneCandidateCard";
import { SceneCompositionEditor } from "./SceneCompositionEditor";
import { SceneLibraryPanel } from "./SceneLibraryPanel";
import {
  createSceneId,
  effortOptions,
  explorationOptions,
  familyOrder,
  intensityOptions,
  rewardPunishmentModes,
  sessionChoiceLabel,
} from "./sceneBuilderOptions";
import "../../sceneBuilder.css";

export type SceneBuilderSharedContext = {
  profileAName: string;
  profileBName: string;
  partnerCatalogResultView: CatalogResultView;
  comparison: SharedProfileComparison;
  profileAIntent: SharedParticipantIntent;
  profileBIntent: SharedParticipantIntent;
};

type SceneBuilderProps = {
  catalogResultView: CatalogResultView;
  onClose: () => void;
  initialThemeIds?: readonly SceneThemeId[];
  sharedContext?: SceneBuilderSharedContext;
};

export function SceneBuilder({
  catalogResultView,
  onClose,
  initialThemeIds = [],
  sharedContext,
}: SceneBuilderProps) {
  const [selectedThemeIds, setSelectedThemeIds] = useState<SceneThemeId[]>(() => [
    ...new Set(initialThemeIds),
  ]);
  const [effort, setEffort] = useState<SceneEffort>("normal");
  const [exploration, setExploration] =
    useState<SceneExplorationMode>("mixed");
  const [intensity, setIntensity] =
    useState<SceneIntensityPreference>("any");
  const [sessionState, setSessionState] = useState(() =>
    loadSceneSessionState(),
  );
  const [partnerSessionState, setPartnerSessionState] = useState(() =>
    createEmptySceneSessionState(),
  );
  const [composition, setComposition] =
    useState<SceneComposition | null>(null);
  const [randomizerState, setRandomizerState] = useState(() =>
    loadSceneRandomizerState(),
  );
  const [randomPick, setRandomPick] =
    useState<SceneCandidate | null>(null);
  const [rewardPunishmentProfile] = useState(() =>
    loadRewardPunishmentProfile(),
  );
  const [rewardPunishmentRecipes] = useState(() =>
    loadRewardPunishmentRecipeState(),
  );
  const [rewardPunishmentMode, setRewardPunishmentMode] =
    useState<SceneRewardPunishmentMode>("none");
  const [lastRewardPunishmentKey, setLastRewardPunishmentKey] =
    useState<string | undefined>(undefined);
  const [sceneLibrary, setSceneLibrary] = useState(() =>
    loadSceneLibraryState(),
  );
  const [activeSavedSceneId, setActiveSavedSceneId] =
    useState<string | null>(null);
  const [sceneName, setSceneName] = useState("");
  const [pendingDeleteSceneId, setPendingDeleteSceneId] =
    useState<string | null>(null);
  const [sceneSaveMessage, setSceneSaveMessage] =
    useState<string | null>(null);

  useEffect(() => {
    saveSceneSessionState(sessionState);
  }, [sessionState]);

  useEffect(() => {
    saveSceneRandomizerState(randomizerState);
  }, [randomizerState]);

  useEffect(() => {
    saveSceneLibraryState(sceneLibrary);
  }, [sceneLibrary]);

  const selectedThemeSet = useMemo(
    () => new Set(selectedThemeIds),
    [selectedThemeIds],
  );

  const profileReadiness = useMemo(
    () => getSceneProfileReadiness(catalogResultView),
    [catalogResultView],
  );

  const candidateView = useMemo(
    () =>
      sharedContext
        ? buildSharedSceneCandidateView(
            catalogResultView,
            sharedContext.partnerCatalogResultView,
            sharedContext.comparison,
            selectedThemeIds,
            {
              exploration,
              intensity,
              profileASessionState: sessionState,
              profileBSessionState: partnerSessionState,
            },
          )
        : buildSceneCandidateView(
            catalogResultView,
            selectedThemeIds,
            {
              exploration,
              intensity,
              sessionState,
            },
          ),
    [
      catalogResultView,
      exploration,
      intensity,
      partnerSessionState,
      selectedThemeIds,
      sessionState,
      sharedContext,
    ],
  );

  const effortConfig =
    effortOptions.find((option) => option.id === effort) ?? effortOptions[1];

  const confirmedMenu = candidateView.coverageOrder.slice(
    0,
    effortConfig.confirmedLimit,
  );
  const suggestedMenu = candidateView.suggestedToExplore.slice(
    0,
    effortConfig.suggestedLimit,
  );

  const confirmedById = useMemo(
    () =>
      new Map(
        candidateView.confirmed.map((candidate) => [
          candidate.catalogId,
          candidate,
        ]),
      ),
    [candidateView.confirmed],
  );

  const compositionCatalogIds = useMemo(
    () =>
      new Set(
        composition?.components
          .filter((component) => component.source.kind === "catalog")
          .map((component) =>
            component.source.kind === "catalog"
              ? component.source.catalogId
              : "",
          )
          .filter(Boolean) ?? [],
      ),
    [composition],
  );

  const rewardPunishmentAvailability = useMemo(
    () =>
      sharedContext
        ? { reward: 0, punishment: 0, either: 0 }
        : getSceneRewardPunishmentAvailability(
            rewardPunishmentProfile,
            rewardPunishmentRecipes.recipes,
          ),
    [rewardPunishmentProfile, rewardPunishmentRecipes, sharedContext],
  );

  const rewardPunishmentPoolCount = (mode: SceneRewardPunishmentMode) =>
    mode === "reward"
      ? rewardPunishmentAvailability.reward
      : mode === "punishment"
        ? rewardPunishmentAvailability.punishment
        : mode === "either"
          ? rewardPunishmentAvailability.either
          : 0;

  const savedSceneReviews = useMemo(
    () =>
      new Map(
        sceneLibrary.scenes.map((scene) => [
          scene.id,
          reviewSavedScene(scene, {
            catalogResultView,
            rewardPunishmentProfile,
            rewardPunishmentRecipes: rewardPunishmentRecipes.recipes,
          }),
        ]),
      ),
    [
      catalogResultView,
      rewardPunishmentProfile,
      rewardPunishmentRecipes,
      sceneLibrary.scenes,
    ],
  );

  useEffect(() => {
    if (!composition || activeSavedSceneId) return;

    const eligibleIds = new Set(
      candidateView.confirmed.map((candidate) => candidate.catalogId),
    );
    setComposition((current) => {
      if (!current) return current;
      const reconciled = reconcileSceneComposition(current, eligibleIds);
      return {
        ...reconciled,
        themeIds: [...selectedThemeIds],
        effort,
        exploration,
      };
    });
  }, [
    activeSavedSceneId,
    candidateView.confirmed,
    effort,
    exploration,
    selectedThemeIds,
  ]);

  const activeOverrides = [
    ...Object.entries(sessionState.overrides).map(([catalogId, override]) => {
      const result = catalogResultView.byCatalogId.get(catalogId);
      return {
        participant: sharedContext?.profileAName,
        participantKey: "profile-a",
        catalogId,
        label: result?.item.label ?? catalogId,
        choice: override.choice,
      };
    }),
    ...(sharedContext
      ? Object.entries(partnerSessionState.overrides).map(
          ([catalogId, override]) => {
            const result =
              sharedContext.partnerCatalogResultView.byCatalogId.get(catalogId);
            return {
              participant: sharedContext.profileBName,
              participantKey: "profile-b",
              catalogId,
              label: result?.item.label ?? catalogId,
              choice: override.choice,
            };
          },
        )
      : []),
  ].sort(
    (left, right) =>
      left.label.localeCompare(right.label) ||
      (left.participant ?? "").localeCompare(right.participant ?? "") ||
      left.catalogId.localeCompare(right.catalogId),
  );

  const toggleTheme = (themeId: SceneThemeId) => {
    setSelectedThemeIds((current) =>
      current.includes(themeId)
        ? current.filter((id) => id !== themeId)
        : [...current, themeId],
    );
  };

  const setSessionChoice = (
    catalogId: string,
    choice: SceneSessionChoice,
  ) => {
    setSessionState((current) =>
      current.overrides[catalogId]?.choice === choice
        ? clearSceneSessionChoice(current, catalogId)
        : setSceneSessionChoice(current, catalogId, choice),
    );
  };

  const clearSessionChoice = (catalogId: string) => {
    setSessionState((current) =>
      clearSceneSessionChoice(current, catalogId),
    );
  };

  const setPartnerSessionChoice = (
    catalogId: string,
    choice: SceneSessionChoice,
  ) => {
    setPartnerSessionState((current) =>
      current.overrides[catalogId]?.choice === choice
        ? clearSceneSessionChoice(current, catalogId)
        : setSceneSessionChoice(current, catalogId, choice),
    );
  };

  const clearPartnerSessionChoice = (catalogId: string) => {
    setPartnerSessionState((current) =>
      clearSceneSessionChoice(current, catalogId),
    );
  };

  const sharedSessionControlsFor = (catalogId: string) =>
    sharedContext
      ? {
          profileAName: sharedContext.profileAName,
          profileBName: sharedContext.profileBName,
          profileASessionChoice: getSceneSessionChoice(sessionState, catalogId),
          profileBSessionChoice: getSceneSessionChoice(
            partnerSessionState,
            catalogId,
          ),
          onSetProfileAChoice: setSessionChoice,
          onSetProfileBChoice: setPartnerSessionChoice,
        }
      : undefined;

  const makeStarterScene = () => {
    setComposition((current) => {
      let next = buildStarterSceneComposition(candidateView, {
        effort,
        exploration,
      });
      const addOn = current?.components.find(
        (component) => component.source.kind === "reward_punishment",
      );
      if (addOn?.source.kind === "reward_punishment") {
        next = upsertRewardPunishmentSceneComponent(next, addOn.source);
      }
      return next;
    });
  };

  const addCandidateToScene = (candidate: SceneCandidate) => {
    setComposition((current) =>
      addCatalogSceneComponent(
        current ??
          createEmptySceneComposition({
            themeIds: selectedThemeIds,
            effort,
            exploration,
          }),
        candidate,
      ),
    );
  };

  const addNextCandidate = () => {
    const next = candidateView.coverageOrder.find(
      (candidate) => !compositionCatalogIds.has(candidate.catalogId),
    );
    if (next) addCandidateToScene(next);
  };

  const replaceComponent = (componentId: string) => {
    if (!composition) return;
    const component = composition.components.find(
      (entry) => entry.id === componentId,
    );
    if (!component || component.source.kind !== "catalog") return;

    const currentCatalogId = component.source.catalogId;
    const replacement = replacementCandidatesForComponent(
      composition,
      componentId,
      candidateView.coverageOrder,
    ).find((candidate) => candidate.catalogId !== currentCatalogId);
    if (!replacement) return;

    setComposition((current) =>
      current
        ? replaceSceneComponent(current, componentId, replacement)
        : current,
    );
  };

  const clearComposition = () => {
    setComposition(
      createEmptySceneComposition({
        themeIds: selectedThemeIds,
        effort,
        exploration,
      }),
    );
  };

  const saveCurrentScene = (asNew = false) => {
    if (!composition || composition.components.length === 0) return;
    const normalizedName = sceneName.trim();
    if (!normalizedName) return;

    if (!asNew && activeSavedSceneId) {
      const existing = sceneLibrary.scenes.find(
        (scene) => scene.id === activeSavedSceneId,
      );
      if (existing) {
        const updated = updateSavedScene(
          existing,
          composition,
          normalizedName,
        );
        setSceneLibrary((current) => upsertSavedScene(current, updated));
        setSceneSaveMessage("Saved changes.");
        return;
      }
    }

    const saved = createSavedScene(composition, normalizedName, {
      id: createSceneId(),
    });
    setSceneLibrary((current) => upsertSavedScene(current, saved));
    setActiveSavedSceneId(saved.id);
    setSceneName(saved.name);
    setSceneSaveMessage("Scene saved.");
  };

  const loadSavedScene = (sceneId: string) => {
    const scene = sceneLibrary.scenes.find(
      (candidate) => candidate.id === sceneId,
    );
    if (!scene) return;

    setSelectedThemeIds([...scene.themeIds]);
    setEffort(scene.effort);
    setExploration(scene.exploration);
    setIntensity("any");
    setComposition(savedSceneToComposition(scene));
    setActiveSavedSceneId(scene.id);
    setSceneName(scene.name);
    setPendingDeleteSceneId(null);
    setSceneSaveMessage(null);

    const rp = scene.components.find(
      (component) => component.source.kind === "reward_punishment",
    );
    setRewardPunishmentMode(
      rp?.source.kind === "reward_punishment" ? rp.source.context : "none",
    );
  };

  const duplicateScene = (sceneId: string) => {
    setSceneLibrary((current) =>
      duplicateSavedScene(current, sceneId, {
        id: createSceneId(),
      }),
    );
    setPendingDeleteSceneId(null);
  };

  const deleteScene = (sceneId: string) => {
    if (pendingDeleteSceneId !== sceneId) {
      setPendingDeleteSceneId(sceneId);
      return;
    }

    setSceneLibrary((current) => deleteSavedScene(current, sceneId));
    if (activeSavedSceneId === sceneId) {
      setActiveSavedSceneId(null);
      setSceneName("");
    }
    setPendingDeleteSceneId(null);
  };

  const stopEditingSavedScene = () => {
    setActiveSavedSceneId(null);
    setSceneName("");
    setSceneSaveMessage(null);
  };

  const pickRewardPunishmentAddon = (
    mode: SceneRewardPunishmentMode = rewardPunishmentMode,
  ) => {
    if (mode === "none") {
      setComposition((current) =>
        current ? removeRewardPunishmentSceneComponent(current) : current,
      );
      return;
    }

    const pick = pickSceneRewardPunishment(
      rewardPunishmentProfile,
      rewardPunishmentRecipes.recipes,
      mode,
      {
        previousKey: lastRewardPunishmentKey,
      },
    );
    if (!pick) return;

    setComposition((current) =>
      upsertRewardPunishmentSceneComponent(
        current ??
          createEmptySceneComposition({
            themeIds: selectedThemeIds,
            effort,
            exploration,
          }),
        pick.source,
      ),
    );
    setLastRewardPunishmentKey(pick.key);
  };

  const changeRewardPunishmentMode = (mode: SceneRewardPunishmentMode) => {
    setRewardPunishmentMode(mode);
    if (mode === "none") {
      setComposition((current) =>
        current ? removeRewardPunishmentSceneComponent(current) : current,
      );
    }
  };

  const removeRewardPunishmentAddon = () => {
    setRewardPunishmentMode("none");
    setComposition((current) =>
      current ? removeRewardPunishmentSceneComponent(current) : current,
    );
  };

  const shuffleRewardPunishmentAddon = () => {
    const component = composition?.components.find(
      (entry) => entry.source.kind === "reward_punishment",
    );
    if (!component || component.source.kind !== "reward_punishment") return;

    const mode =
      rewardPunishmentMode === "none"
        ? component.source.context
        : rewardPunishmentMode;
    pickRewardPunishmentAddon(mode);
  };

  const pickSomething = () => {
    const result = chooseRandomSceneCandidate(
      candidateView.confirmed,
      randomizerState,
    );
    setRandomizerState(result.state);
    setRandomPick(result.candidate ?? null);
  };

  const buildSomething = () => {
    const result = buildRandomSceneComposition(candidateView.confirmed, {
      themeIds: selectedThemeIds,
      effort,
      exploration,
      state: randomizerState,
    });
    let nextComposition = result.composition;

    if (!sharedContext && rewardPunishmentMode !== "none") {
      const addOn = pickSceneRewardPunishment(
        rewardPunishmentProfile,
        rewardPunishmentRecipes.recipes,
        rewardPunishmentMode,
        {
          previousKey: lastRewardPunishmentKey,
        },
      );

      if (addOn) {
        nextComposition = upsertRewardPunishmentSceneComponent(
          nextComposition,
          addOn.source,
        );
        setLastRewardPunishmentKey(addOn.key);
      }
    }

    setComposition(nextComposition);
    setRandomizerState(result.state);
    setRandomPick(null);
  };

  const shuffleComponent = (componentId: string) => {
    if (!composition) return;

    const result = shuffleSceneComponent(
      composition,
      componentId,
      candidateView.confirmed,
      randomizerState,
    );
    setComposition(result.composition);
    setRandomizerState(result.state);
  };

  const resetRandomMemory = () => {
    clearSceneRandomizerState();
    setRandomizerState({
      schemaVersion: 1,
      recentCatalogIds: [],
    });
  };

  const moveComponent = (
    componentId: string,
    direction: "up" | "down",
  ) => {
    setComposition((current) =>
      current ? moveSceneComponent(current, componentId, direction) : current,
    );
  };

  const updateComponentNote = (componentId: string, note: string) => {
    setComposition((current) =>
      current ? updateSceneComponentNote(current, componentId, note) : current,
    );
  };

  const updateComponentPhase = (
    componentId: string,
    phaseId: ScenePhaseId,
  ) => {
    setComposition((current) =>
      current
        ? updateSceneComponentPhase(current, componentId, phaseId)
        : current,
    );
  };

  const removeComponent = (componentId: string) => {
    setComposition((current) =>
      current ? removeSceneComponent(current, componentId) : current,
    );
  };

  return (
    <section className="scene-builder-stack">
      <header className="scene-builder-heading panel">
        <button
          type="button"
          className="scene-builder-back"
          onClick={onClose}
        >
          <IconArrowLeft size={17} stroke={2} aria-hidden="true" />
          {sharedContext ? "Back to comparison" : "Back to hub"}
        </button>

        <div className="scene-builder-heading-copy">
          <span className="scene-builder-icon" aria-hidden="true">
            <IconSparkles size={24} stroke={1.8} />
          </span>
          <div>
            <p className="eyebrow">
              {sharedContext ? "Shared Scene Builder" : "Scene Builder"}
            </p>
            <h1>What sounds good right now?</h1>
            <p>
              {sharedContext
                ? "Build from the space both profiles support. Either person's boundaries and Not tonight choices remove an item from automatic shared suggestions."
                : "Pick a few themes. Your profile gets shrunk into a small play space instead of making you remember every possible option."}
            </p>
          </div>
        </div>
      </header>

      <article className="scene-theme-panel panel">
        <div className="scene-section-heading">
          <div>
            <p className="eyebrow">01 · Pick the space</p>
            <h2>Choose one or more themes.</h2>
          </div>
          {selectedThemeIds.length > 0 && (
            <button
              type="button"
              className="text-button"
              onClick={() => setSelectedThemeIds([])}
            >
              Clear themes
            </button>
          )}
        </div>

        <div className="scene-theme-groups">
          {familyOrder.map((family) => {
            const themes = sceneThemeDefinitions.filter(
              (theme) => theme.family === family.id,
            );
            if (themes.length === 0) return null;

            return (
              <section className="scene-theme-group" key={family.id}>
                <span>{family.label}</span>
                <div>
                  {themes.map((theme) => (
                    <button
                      type="button"
                      key={theme.id}
                      className={
                        selectedThemeSet.has(theme.id)
                          ? "scene-theme-chip selected"
                          : "scene-theme-chip"
                      }
                      aria-pressed={selectedThemeSet.has(theme.id)}
                      aria-label={`${theme.label}. ${theme.description}`}
                      title={theme.description}
                      onClick={() => toggleTheme(theme.id)}
                    >
                      {theme.label}
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <div
          className="scene-selection-summary"
          aria-live="polite"
          aria-atomic="true"
        >
          {selectedThemeIds.length === 0
            ? "Nothing selected yet."
            : `${selectedThemeIds.length} ${
                selectedThemeIds.length === 1 ? "theme" : "themes"
              } selected · ${selectedThemeIds
                .map(
                  (id) =>
                    sceneThemeDefinitions.find((theme) => theme.id === id)?.label,
                )
                .filter(Boolean)
                .join(" + ")}`}
        </div>
      </article>

      <details className="scene-tuning-panel panel">
        <summary>
          <div>
            <p className="eyebrow">02 · Optional</p>
            <strong>Tune this scene</strong>
          </div>
          <span>
            {effortConfig.label} ·{" "}
            {explorationOptions.find((item) => item.id === exploration)?.label} ·{" "}
            {intensityOptions.find((item) => item.id === intensity)?.label}
          </span>
        </summary>

        <div className="scene-tuning-grid">
          <fieldset>
            <legend>Effort</legend>
            <p>How many ingredients should be on the menu?</p>
            <div className="scene-segmented">
              {effortOptions.map((option) => (
                <button
                  type="button"
                  key={option.id}
                  className={effort === option.id ? "selected" : ""}
                  aria-pressed={effort === option.id}
                  onClick={() => setEffort(option.id)}
                >
                  <strong>{option.label}</strong>
                  <span>{option.description}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>Exploration</legend>
            <p>How far outside established preferences should we look?</p>
            <div className="scene-segmented compact">
              {explorationOptions.map((option) => (
                <button
                  type="button"
                  key={option.id}
                  className={exploration === option.id ? "selected" : ""}
                  aria-pressed={exploration === option.id}
                  onClick={() => setExploration(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>Intensity</legend>
            <p>Narrow by the catalog's intensity metadata.</p>
            <div className="scene-segmented compact">
              {intensityOptions.map((option) => (
                <button
                  type="button"
                  key={option.id}
                  className={intensity === option.id ? "selected" : ""}
                  aria-pressed={intensity === option.id}
                  onClick={() => setIntensity(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      </details>

      {activeOverrides.length > 0 && (
        <article className="scene-session-summary panel">
          <div className="scene-section-heading">
            <div>
              <p className="eyebrow">Tonight only</p>
              <h2>Current-session changes</h2>
            </div>
            <button
              type="button"
              className="text-button"
              onClick={() => {
                setSessionState(createEmptySceneSessionState());
                if (sharedContext) {
                  setPartnerSessionState(createEmptySceneSessionState());
                }
              }}
            >
              Reset tonight
            </button>
          </div>

          <div className="scene-session-chips">
            {activeOverrides.map((override) => (
              <span
                className={`scene-session-chip scene-session-${override.choice}`}
                key={override.participantKey + ":" + override.catalogId}
              >
                <strong>{override.label}</strong>
                <small>
                  {override.participant ? override.participant + " · " : ""}
                  {sessionChoiceLabel(override.choice)}
                </small>
                <button
                  type="button"
                  aria-label={`Clear current-session preference for ${override.label}`}
                  onClick={() =>
                    override.participantKey === "profile-b"
                      ? clearPartnerSessionChoice(override.catalogId)
                      : clearSessionChoice(override.catalogId)
                  }
                >
                  <IconX size={14} stroke={2} aria-hidden="true" />
                </button>
              </span>
            ))}
          </div>
        </article>
      )}

      {selectedThemeIds.length === 0 ? (
        <article className="scene-empty panel">
          <IconSparkles size={28} stroke={1.6} aria-hidden="true" />
          <h2>Pick a theme to make the giant option-space smaller.</h2>
          <p>
            You can combine themes too — Pain + Surrender, Pet + Playful, Restraint +
            Protocol, whatever fits the moment.
          </p>
        </article>
      ) : (
        <section className="scene-results">
          <div className="scene-results-heading">
            <div>
              <p className="eyebrow">
                03 · {sharedContext ? "Shared play space" : "Your play space"}
              </p>
              <h2>
                {sharedContext
                  ? "Strongest matches supported by both profiles"
                  : "Strongest profile-backed matches"}
              </h2>
            </div>
            <span aria-live="polite" aria-atomic="true">
              {candidateView.confirmed.length} eligible · showing {confirmedMenu.length}
            </span>
          </div>

          {confirmedMenu.length > 0 ? (
            <div className="scene-candidate-grid">
              {confirmedMenu.map((candidate) => (
                <SceneCandidateCard
                  key={candidate.catalogId}
                  candidate={candidate}
                  onSetSessionChoice={setSessionChoice}
                  sharedSessionControls={sharedSessionControlsFor(candidate.catalogId)}
                  onAddToScene={addCandidateToScene}
                  isInScene={compositionCatalogIds.has(candidate.catalogId)}
                />
              ))}
            </div>
          ) : (
            <article className="scene-empty panel" role="status" aria-live="polite">
              {profileReadiness.state === "unprofiled" && !sharedContext ? (
                <>
                  <h2>This profile does not have scene-ready evidence yet.</h2>
                  <p>
                    Define a few catalog preferences or rankings first. Scene Builder
                    will stay conservative instead of turning unknown items into
                    automatic picks.
                  </p>
                </>
              ) : profileReadiness.state === "emerging" && !sharedContext ? (
                <>
                  <h2>This profile is still a little sparse for this space.</h2>
                  <p>
                    Try another theme or loosen the optional filters. Explore can
                    surface inference-backed ideas separately, but they still will not
                    enter randomization automatically.
                  </p>
                </>
              ) : (
                <>
                  <h2>No directly confirmed matches in this exact space yet.</h2>
                  <p>
                    Try another theme, loosen the optional filters, or review the
                    exploration suggestions below. Nothing inferred is silently
                    promoted into the automatic pool.
                  </p>
                </>
              )}
            </article>
          )}

          <article className="scene-randomizer panel">
            <div className="scene-section-heading">
              <div>
                <p className="eyebrow">04 · Take the decision away</p>
                <h2>Pick for me.</h2>
              </div>
              {randomizerState.recentCatalogIds.length > 0 && (
                <button
                  type="button"
                  className="text-button"
                  onClick={resetRandomMemory}
                >
                  Reset repeats
                </button>
              )}
            </div>

            <p className="scene-randomizer-copy">
              Random means random inside the valid pool. Profile fit gets an item into
              the pool; it does not secretly make the highest-ranked item win every
              time.
            </p>

            <div className="scene-randomizer-actions">
              <button
                type="button"
                className="primary compact"
                disabled={candidateView.confirmed.length === 0}
                onClick={pickSomething}
              >
                <IconSparkles size={16} stroke={2} aria-hidden="true" />
                Pick something
              </button>
              <button
                type="button"
                className="secondary compact"
                disabled={candidateView.confirmed.length === 0}
                onClick={buildSomething}
              >
                <IconNotes size={16} stroke={2} aria-hidden="true" />
                Build something
              </button>
              {randomizerState.recentCatalogIds.length > 0 && (
                <span>
                  Avoiding {Math.min(randomizerState.recentCatalogIds.length, 10)} recent{" "}
                  {randomizerState.recentCatalogIds.length === 1 ? "pick" : "picks"}
                </span>
              )}
            </div>

            <div className="scene-rp-control">
              <div className="scene-rp-control-copy">
                <strong>Optional reward / punishment</strong>
                <span>
                  {sharedContext
                    ? "Shared M11 add-ons stay disabled until both profiles' reward/punishment suitability can be intersected safely."
                    : "Uses only M11 items and recipes already marked eligible for random use."}
                </span>
              </div>

              <div className="scene-rp-modes" aria-label="Reward or punishment add-on">
                {rewardPunishmentModes.map((mode) => {
                  const count = rewardPunishmentPoolCount(mode.id);
                  const unavailable = mode.id !== "none" && count === 0;

                  return (
                    <button
                      type="button"
                      key={mode.id}
                      className={rewardPunishmentMode === mode.id ? "selected" : ""}
                      aria-pressed={rewardPunishmentMode === mode.id}
                      disabled={unavailable}
                      title={
                        unavailable
                          ? "No M11 random-eligible options in this context."
                          : undefined
                      }
                      onClick={() => changeRewardPunishmentMode(mode.id)}
                    >
                      <span>{mode.label}</span>
                      {mode.id !== "none" && <small>{count}</small>}
                    </button>
                  );
                })}
              </div>

              {rewardPunishmentMode !== "none" && (
                <button
                  type="button"
                  className="secondary compact scene-rp-pick"
                  disabled={rewardPunishmentPoolCount(rewardPunishmentMode) === 0}
                  onClick={() => pickRewardPunishmentAddon()}
                >
                  <IconSparkles size={15} stroke={2} aria-hidden="true" />
                  Pick add-on
                </button>
              )}
            </div>

            {randomPick && (
              <div
                className="scene-random-pick"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                <div>
                  <span className="scene-candidate-category">
                    {randomPick.categoryLabel}
                  </span>
                  <strong>{randomPick.label}</strong>
                  <small>
                    {randomPick.themeMatches.map((match) => match.label).join(" + ")}
                  </small>
                </div>
                <div>
                  <button
                    type="button"
                    className="secondary compact"
                    disabled={compositionCatalogIds.has(randomPick.catalogId)}
                    onClick={() => addCandidateToScene(randomPick)}
                  >
                    <IconPlus size={15} stroke={2} aria-hidden="true" />
                    {compositionCatalogIds.has(randomPick.catalogId)
                      ? "In scene"
                      : "Add to scene"}
                  </button>
                  <button type="button" className="text-button" onClick={pickSomething}>
                    Another option
                  </button>
                </div>
              </div>
            )}
          </article>

          <SceneCompositionEditor
            composition={composition}
            candidateView={candidateView}
            compositionCatalogIds={compositionCatalogIds}
            confirmedById={confirmedById}
            catalogResultView={catalogResultView}
            rewardPunishmentRecipes={rewardPunishmentRecipes.recipes}
            activeSavedSceneId={activeSavedSceneId}
            sceneName={sceneName}
            sceneSaveMessage={sceneSaveMessage}
            onSceneNameChange={(value) => {
              setSceneName(value);
              setSceneSaveMessage(null);
            }}
            onSave={saveCurrentScene}
            onStopEditing={stopEditingSavedScene}
            onClear={clearComposition}
            onMakeStarter={makeStarterScene}
            onMove={moveComponent}
            onShuffleRewardPunishment={shuffleRewardPunishmentAddon}
            onRemoveRewardPunishment={removeRewardPunishmentAddon}
            onUpdateNote={updateComponentNote}
            onUpdatePhase={updateComponentPhase}
            onReplace={replaceComponent}
            onShuffle={shuffleComponent}
            onRemove={removeComponent}
            onAddNext={addNextCandidate}
          />

          <SceneLibraryPanel
            scenes={sceneLibrary.scenes}
            reviews={savedSceneReviews}
            activeSavedSceneId={activeSavedSceneId}
            pendingDeleteSceneId={pendingDeleteSceneId}
            onLoad={loadSavedScene}
            onDuplicate={duplicateScene}
            onDelete={deleteScene}
          />

          {candidateView.suggestedToExplore.length > 0 && (
            <details className="scene-suggested panel">
              <summary>
                <div>
                  <span>Suggested to explore</span>
                  <strong>
                    {candidateView.suggestedToExplore.length} profile-signal{" "}
                    {candidateView.suggestedToExplore.length === 1
                      ? "match"
                      : "matches"}
                  </strong>
                </div>
                <small>Never used automatically</small>
              </summary>

              <div className="scene-suggested-copy">
                These fit the selected themes through your broader profile, but you
                have not directly confirmed or ranked them yet.
              </div>

              <div className="scene-candidate-grid">
                {suggestedMenu.map((candidate) => (
                  <SceneCandidateCard
                    key={candidate.catalogId}
                    candidate={candidate}
                    onSetSessionChoice={setSessionChoice}
                    sharedSessionControls={sharedSessionControlsFor(candidate.catalogId)}
                  />
                ))}
              </div>
            </details>
          )}
        </section>
      )}
    </section>
  );
}
