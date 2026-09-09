import { useEffect, useMemo, useState } from "react";
import {
  IconArrowDown,
  IconArrowLeft,
  IconArrowUp,
  IconAlertTriangle,
  IconArrowsExchange,
  IconCopy,
  IconDeviceFloppy,
  IconNotes,
  IconPlus,
  IconSparkles,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import {
  sceneThemeDefinitions,
  type SceneThemeFamily,
  type SceneThemeId,
} from "./data/sceneThemes";
import {
  buildSceneCandidateView,
  type SceneCandidate,
  type SceneExplorationMode,
  type SceneIntensityPreference,
} from "./lib/sceneCandidates";
import {
  clearSceneSessionChoice,
  loadSceneSessionState,
  saveSceneSessionState,
  setSceneSessionChoice,
  type SceneSessionChoice,
} from "./lib/sceneSession";
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
  scenePhaseDefinitions,
  updateSceneComponentNote,
  updateSceneComponentPhase,
  upsertRewardPunishmentSceneComponent,
  type SceneComposition,
  type SceneEffort,
  type ScenePhaseId,
} from "./lib/sceneComposition";
import {
  catalogPreferenceLabels,
  type CatalogResultView,
} from "./lib/catalogResults";
import {
  buildRandomSceneComposition,
  chooseRandomSceneCandidate,
  clearSceneRandomizerState,
  loadSceneRandomizerState,
  saveSceneRandomizerState,
  shuffleSceneComponent,
} from "./lib/sceneRandomizer";
import {
  loadRewardPunishmentProfile,
} from "./lib/rewardPunishmentProfileStorage";
import {
  loadRewardPunishmentRecipeState,
} from "./lib/rewardPunishmentRecipeStorage";
import {
  getSceneRewardPunishmentAvailability,
  pickSceneRewardPunishment,
  resolveSceneRewardPunishmentSource,
  type SceneRewardPunishmentMode,
} from "./lib/sceneRewardPunishment";
import {
  createSavedScene,
  deleteSavedScene,
  duplicateSavedScene,
  savedSceneToComposition,
  updateSavedScene,
  upsertSavedScene,
} from "./lib/sceneLibrary";
import {
  loadSceneLibraryState,
  saveSceneLibraryState,
} from "./lib/sceneLibraryStorage";
import { reviewSavedScene } from "./lib/sceneLifecycle";
import "./sceneBuilder.css";

type SceneBuilderProps = {
  catalogResultView: CatalogResultView;
  onClose: () => void;
};

const familyOrder: Array<{
  id: SceneThemeFamily;
  label: string;
}> = [
  { id: "activity", label: "Play" },
  { id: "headspace", label: "Headspace" },
  { id: "dynamic_mode", label: "Dynamic" },
  { id: "facet", label: "Broad theme" },
  { id: "vibe", label: "Vibe" },
];

const effortOptions: Array<{
  id: SceneEffort;
  label: string;
  description: string;
  confirmedLimit: number;
  suggestedLimit: number;
}> = [
  {
    id: "quick",
    label: "Quick",
    description: "Smallest menu",
    confirmedLimit: 4,
    suggestedLimit: 2,
  },
  {
    id: "normal",
    label: "Normal",
    description: "A few choices",
    confirmedLimit: 8,
    suggestedLimit: 4,
  },
  {
    id: "elaborate",
    label: "Elaborate",
    description: "More ingredients",
    confirmedLimit: 12,
    suggestedLimit: 6,
  },
];

const explorationOptions: Array<{
  id: SceneExplorationMode;
  label: string;
}> = [
  { id: "familiar", label: "Familiar" },
  { id: "mixed", label: "Mix" },
  { id: "explore", label: "Explore" },
];

const intensityOptions: Array<{
  id: SceneIntensityPreference;
  label: string;
}> = [
  { id: "any", label: "Any" },
  { id: "light", label: "Light" },
  { id: "moderate", label: "Moderate" },
  { id: "intense", label: "Intense" },
];

const rewardPunishmentModes: Array<{
  id: SceneRewardPunishmentMode;
  label: string;
}> = [
  { id: "none", label: "None" },
  { id: "reward", label: "Reward" },
  { id: "punishment", label: "Punishment" },
  { id: "either", label: "Surprise me" },
];

const sessionChoices: Array<{
  id: SceneSessionChoice;
  label: string;
  shortLabel: string;
}> = [
  { id: "yes_tonight", label: "Yes tonight", shortLabel: "Yes" },
  { id: "maybe_tonight", label: "Maybe tonight", shortLabel: "Maybe" },
  { id: "not_tonight", label: "Not tonight", shortLabel: "Not tonight" },
];

function createSceneId() {
  if (
    typeof globalThis.crypto !== "undefined" &&
    "randomUUID" in globalThis.crypto
  ) {
    return globalThis.crypto.randomUUID();
  }

  return `scene-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

function sessionChoiceLabel(choice: SceneSessionChoice) {
  return (
    sessionChoices.find((entry) => entry.id === choice)?.label ??
    choice.replaceAll("_", " ")
  );
}

function candidateReasons(candidate: SceneCandidate) {
  const reasons: string[] = [];

  if (candidate.themeMatches.length > 0) {
    reasons.push(
      `Matches ${candidate.themeMatches
        .map((match) => match.label)
        .join(" + ")}`,
    );
  }

  if (candidate.sessionChoice) {
    reasons.push(sessionChoiceLabel(candidate.sessionChoice));
  } else if (candidate.explicitState) {
    reasons.push(
      `Marked ${catalogPreferenceLabels[candidate.explicitState]}`,
    );
  }

  if (candidate.overallRank) {
    reasons.push(`Overall This or That · #${candidate.overallRank.rank}`);
  } else if (candidate.categoryRank) {
    reasons.push(
      `${candidate.categoryLabel} · #${candidate.categoryRank.rank}`,
    );
  }

  if (candidate.provenance === "inference_only") {
    reasons.push("Suggested from profile signals");
  }

  return reasons.slice(0, 3);
}

function CandidateCard({
  candidate,
  onSetSessionChoice,
  onAddToScene,
  isInScene = false,
}: {
  candidate: SceneCandidate;
  onSetSessionChoice: (
    catalogId: string,
    choice: SceneSessionChoice,
  ) => void;
  onAddToScene?: (candidate: SceneCandidate) => void;
  isInScene?: boolean;
}) {
  return (
    <article
      className={
        "scene-candidate-card" +
        (candidate.provenance === "inference_only"
          ? " scene-candidate-suggested"
          : "")
      }
    >
      <div className="scene-candidate-top">
        <div>
          <span className="scene-candidate-category">
            {candidate.categoryLabel}
          </span>
          <h3>{componentLabel}</h3>
        </div>

        {candidate.bridge && (
          <span className="scene-bridge-chip">Bridge</span>
        )}
      </div>

      <div className="scene-candidate-theme-chips">
        {candidate.themeMatches.map((match) => (
          <span key={match.themeId}>{match.label}</span>
        ))}
      </div>

      <div className="scene-candidate-meta">
        <span>{candidate.intensity || "Variable"} intensity</span>
        <span>{candidate.direction}</span>
      </div>

      <div className="scene-candidate-reasons">
        {candidateReasons(candidate).map((reason) => (
          <span key={reason}>{reason}</span>
        ))}
      </div>

      {onAddToScene && (
        <button
          type="button"
          className="scene-add-button"
          disabled={isInScene}
          onClick={() => onAddToScene(candidate)}
        >
          <IconPlus size={15} stroke={2} aria-hidden="true" />
          {isInScene ? "In scene" : "Add to scene"}
        </button>
      )}

      <div
        className="scene-tonight-control"
        aria-label={`Current-session preference for ${candidate.label}`}
      >
        <span>Tonight</span>
        <div>
          {sessionChoices.map((choice) => (
            <button
              key={choice.id}
              type="button"
              className={
                candidate.sessionChoice === choice.id ? "selected" : ""
              }
              aria-pressed={candidate.sessionChoice === choice.id}
              onClick={() =>
                onSetSessionChoice(candidate.catalogId, choice.id)
              }
            >
              {choice.shortLabel}
            </button>
          ))}
        </div>
      </div>
    </article>
  );
}

export function SceneBuilder({
  catalogResultView,
  onClose,
}: SceneBuilderProps) {
  const [selectedThemeIds, setSelectedThemeIds] = useState<SceneThemeId[]>([]);
  const [effort, setEffort] = useState<SceneEffort>("normal");
  const [exploration, setExploration] =
    useState<SceneExplorationMode>("mixed");
  const [intensity, setIntensity] =
    useState<SceneIntensityPreference>("any");
  const [sessionState, setSessionState] = useState(() =>
    loadSceneSessionState(),
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

  const candidateView = useMemo(
    () =>
      buildSceneCandidateView(
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
      selectedThemeIds,
      sessionState,
    ],
  );

  const effortConfig =
    effortOptions.find((option) => option.id === effort) ??
    effortOptions[1];

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
          .filter(
            (component) => component.source.kind === "catalog",
          )
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
      getSceneRewardPunishmentAvailability(
        rewardPunishmentProfile,
        rewardPunishmentRecipes.recipes,
      ),
    [rewardPunishmentProfile, rewardPunishmentRecipes],
  );

  const rewardPunishmentPoolCount = (
    mode: SceneRewardPunishmentMode,
  ) =>
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
            rewardPunishmentRecipes:
              rewardPunishmentRecipes.recipes,
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

  const activeOverrides = Object.entries(sessionState.overrides)
    .map(([catalogId, override]) => {
      const result = catalogResultView.byCatalogId.get(catalogId);
      return {
        catalogId,
        label: result?.item.label ?? catalogId,
        choice: override.choice,
      };
    })
    .sort(
      (left, right) =>
        left.label.localeCompare(right.label) ||
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

  const makeStarterScene = () => {
    setComposition((current) => {
      let next = buildStarterSceneComposition(candidateView, {
        effort,
        exploration,
      });
      const addOn = current?.components.find(
        (component) =>
          component.source.kind === "reward_punishment",
      );
      if (addOn?.source.kind === "reward_punishment") {
        next = upsertRewardPunishmentSceneComponent(
          next,
          addOn.source,
        );
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
    ).find(
      (candidate) =>
        candidate.catalogId !== currentCatalogId,
    );
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
        setSceneLibrary((current) =>
          upsertSavedScene(current, updated),
        );
        setSceneSaveMessage("Saved changes.");
        return;
      }
    }

    const saved = createSavedScene(
      composition,
      normalizedName,
      {
        id: createSceneId(),
      },
    );
    setSceneLibrary((current) =>
      upsertSavedScene(current, saved),
    );
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
      (component) =>
        component.source.kind === "reward_punishment",
    );
    setRewardPunishmentMode(
      rp?.source.kind === "reward_punishment"
        ? rp.source.context
        : "none",
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

    setSceneLibrary((current) =>
      deleteSavedScene(current, sceneId),
    );
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
        current
          ? removeRewardPunishmentSceneComponent(current)
          : current,
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

  const changeRewardPunishmentMode = (
    mode: SceneRewardPunishmentMode,
  ) => {
    setRewardPunishmentMode(mode);
    if (mode === "none") {
      setComposition((current) =>
        current
          ? removeRewardPunishmentSceneComponent(current)
          : current,
      );
    }
  };

  const removeRewardPunishmentAddon = () => {
    setRewardPunishmentMode("none");
    setComposition((current) =>
      current
        ? removeRewardPunishmentSceneComponent(current)
        : current,
    );
  };

  const shuffleRewardPunishmentAddon = () => {
    const component = composition?.components.find(
      (entry) => entry.source.kind === "reward_punishment",
    );
    if (!component || component.source.kind !== "reward_punishment") {
      return;
    }

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
    const result = buildRandomSceneComposition(
      candidateView.confirmed,
      {
        themeIds: selectedThemeIds,
        effort,
        exploration,
        state: randomizerState,
      },
    );
    let nextComposition = result.composition;

    if (rewardPunishmentMode !== "none") {
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

  return (
    <section className="scene-builder-stack">
      <header className="scene-builder-heading panel">
        <button
          type="button"
          className="scene-builder-back"
          onClick={onClose}
        >
          <IconArrowLeft size={17} stroke={2} aria-hidden="true" />
          Back to hub
        </button>

        <div className="scene-builder-heading-copy">
          <span className="scene-builder-icon" aria-hidden="true">
            <IconSparkles size={24} stroke={1.8} />
          </span>
          <div>
            <p className="eyebrow">Scene Builder</p>
            <h1>What sounds good right now?</h1>
            <p>
              Pick a few themes. Your profile gets shrunk into a small
              play space instead of making you remember every possible option.
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

        <div className="scene-selection-summary" aria-live="polite">
          {selectedThemeIds.length === 0
            ? "Nothing selected yet."
            : `${selectedThemeIds.length} ${selectedThemeIds.length === 1 ? "theme" : "themes"} selected · ${selectedThemeIds
                .map((id) =>
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
            {effortConfig.label} · {explorationOptions.find((item) => item.id === exploration)?.label} · {intensityOptions.find((item) => item.id === intensity)?.label}
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
              onClick={() =>
                setSessionState({
                  schemaVersion: 1,
                  overrides: {},
                })
              }
            >
              Reset tonight
            </button>
          </div>

          <div className="scene-session-chips">
            {activeOverrides.map((override) => (
              <span
                className={`scene-session-chip scene-session-${override.choice}`}
                key={override.catalogId}
              >
                <strong>{override.label}</strong>
                <small>{sessionChoiceLabel(override.choice)}</small>
                <button
                  type="button"
                  aria-label={`Clear current-session preference for ${override.label}`}
                  onClick={() => clearSessionChoice(override.catalogId)}
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
            You can combine themes too — Pain + Surrender, Pet + Playful,
            Restraint + Protocol, whatever fits the moment.
          </p>
        </article>
      ) : (
        <section className="scene-results">
          <div className="scene-results-heading">
            <div>
              <p className="eyebrow">03 · Your play space</p>
              <h2>Strongest profile-backed matches</h2>
            </div>
            <span>
              {candidateView.confirmed.length} eligible · showing{" "}
              {confirmedMenu.length}
            </span>
          </div>

          {confirmedMenu.length > 0 ? (
            <div className="scene-candidate-grid">
              {confirmedMenu.map((candidate) => (
                <CandidateCard
                  key={candidate.catalogId}
                  candidate={candidate}
                  onSetSessionChoice={setSessionChoice}
                  onAddToScene={addCandidateToScene}
                  isInScene={compositionCatalogIds.has(
                    candidate.catalogId,
                  )}
                />
              ))}
            </div>
          ) : (
            <article className="scene-empty panel">
              <h2>No directly confirmed matches in this exact space yet.</h2>
              <p>
                Try another theme, loosen the optional filters, or review the
                exploration suggestions below. Nothing inferred is silently
                promoted into the automatic pool.
              </p>
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
              Random means random inside the valid pool. Profile fit gets an
              item into the pool; it does not secretly make the highest-ranked
              item win every time.
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
                  Avoiding{" "}
                  {Math.min(
                    randomizerState.recentCatalogIds.length,
                    10,
                  )} recent{" "}
                  {randomizerState.recentCatalogIds.length === 1
                    ? "pick"
                    : "picks"}
                </span>
              )}
            </div>

            <div className="scene-rp-control">
              <div className="scene-rp-control-copy">
                <strong>Optional reward / punishment</strong>
                <span>
                  Uses only M11 items and recipes already marked eligible
                  for random use.
                </span>
              </div>

              <div
                className="scene-rp-modes"
                aria-label="Reward or punishment add-on"
              >
                {rewardPunishmentModes.map((mode) => {
                  const count = rewardPunishmentPoolCount(mode.id);
                  const unavailable =
                    mode.id !== "none" && count === 0;

                  return (
                    <button
                      type="button"
                      key={mode.id}
                      className={
                        rewardPunishmentMode === mode.id
                          ? "selected"
                          : ""
                      }
                      aria-pressed={
                        rewardPunishmentMode === mode.id
                      }
                      disabled={unavailable}
                      title={
                        unavailable
                          ? "No M11 random-eligible options in this context."
                          : undefined
                      }
                      onClick={() =>
                        changeRewardPunishmentMode(mode.id)
                      }
                    >
                      <span>{mode.label}</span>
                      {mode.id !== "none" && (
                        <small>{count}</small>
                      )}
                    </button>
                  );
                })}
              </div>

              {rewardPunishmentMode !== "none" && (
                <button
                  type="button"
                  className="secondary compact scene-rp-pick"
                  disabled={
                    rewardPunishmentPoolCount(
                      rewardPunishmentMode,
                    ) === 0
                  }
                  onClick={() => pickRewardPunishmentAddon()}
                >
                  <IconSparkles
                    size={15}
                    stroke={2}
                    aria-hidden="true"
                  />
                  Pick add-on
                </button>
              )}
            </div>

            {randomPick && (
              <div className="scene-random-pick" aria-live="polite">
                <div>
                  <span className="scene-candidate-category">
                    {randomPick.categoryLabel}
                  </span>
                  <strong>{randomPick.label}</strong>
                  <small>
                    {randomPick.themeMatches
                      .map((match) => match.label)
                      .join(" + ")}
                  </small>
                </div>
                <div>
                  <button
                    type="button"
                    className="secondary compact"
                    disabled={compositionCatalogIds.has(
                      randomPick.catalogId,
                    )}
                    onClick={() => addCandidateToScene(randomPick)}
                  >
                    <IconPlus
                      size={15}
                      stroke={2}
                      aria-hidden="true"
                    />
                    {compositionCatalogIds.has(randomPick.catalogId)
                      ? "In scene"
                      : "Add to scene"}
                  </button>
                  <button
                    type="button"
                    className="text-button"
                    onClick={pickSomething}
                  >
                    Another option
                  </button>
                </div>
              </div>
            )}
          </article>

          <article
            className="scene-composition panel"
            id="scene-composition"
          >
            <div className="scene-section-heading">
              <div>
                <p className="eyebrow">05 · Build the scene</p>
                <h2>Turn the menu into an editable arc.</h2>
              </div>
              {composition && composition.components.length > 0 && (
                <button
                  type="button"
                  className="text-button"
                  onClick={clearComposition}
                >
                  Clear scene
                </button>
              )}
            </div>

            {composition && composition.components.length > 0 && (
              <div className="scene-save-bar">
                <label>
                  <span>
                    {activeSavedSceneId
                      ? "Editing saved scene"
                      : "Save this scene"}
                  </span>
                  <input
                    type="text"
                    value={sceneName}
                    maxLength={80}
                    placeholder="Give it a name…"
                    onChange={(event) => {
                      setSceneName(event.target.value);
                      setSceneSaveMessage(null);
                    }}
                  />
                </label>

                <div className="scene-save-actions">
                  <button
                    type="button"
                    className="primary compact"
                    disabled={!sceneName.trim()}
                    onClick={() => saveCurrentScene(false)}
                  >
                    <IconDeviceFloppy
                      size={15}
                      stroke={2}
                      aria-hidden="true"
                    />
                    {activeSavedSceneId
                      ? "Save changes"
                      : "Save scene"}
                  </button>
                  {activeSavedSceneId && (
                    <>
                      <button
                        type="button"
                        className="secondary compact"
                        disabled={!sceneName.trim()}
                        onClick={() => saveCurrentScene(true)}
                      >
                        <IconCopy
                          size={15}
                          stroke={2}
                          aria-hidden="true"
                        />
                        Save as new
                      </button>
                      <button
                        type="button"
                        className="text-button"
                        onClick={stopEditingSavedScene}
                      >
                        Stop editing
                      </button>
                    </>
                  )}
                </div>

                {sceneSaveMessage && (
                  <small aria-live="polite">
                    {sceneSaveMessage}
                  </small>
                )}
              </div>
            )}

            <div className="scene-arc-guide" aria-label="Scene arc">
              {scenePhaseDefinitions.map((phase) => (
                <span
                  key={phase.id}
                  className={
                    phase.id === "reward_punishment"
                      ? "scene-arc-phase m11"
                      : "scene-arc-phase"
                  }
                  title={phase.description}
                >
                  {phase.shortLabel}
                  {phase.optional && <small>optional</small>}
                </span>
              ))}
            </div>

            {!composition || composition.components.length === 0 ? (
              <div className="scene-composition-empty">
                <div>
                  <IconNotes size={23} stroke={1.7} aria-hidden="true" />
                  <strong>Start with a sensible first draft.</strong>
                  <span>
                    This version is deterministic. Use Build something above
                    when you want the app to choose the parts for you.
                  </span>
                </div>
                <button
                  type="button"
                  className="primary compact"
                  disabled={candidateView.confirmed.length === 0}
                  onClick={makeStarterScene}
                >
                  <IconPlus size={16} stroke={2} aria-hidden="true" />
                  Make a starter scene
                </button>
              </div>
            ) : (
              <>
                <div className="scene-composition-list">
                  {composition.components.map((component, index) => {
                    if (
                      component.source.kind === "reward_punishment"
                    ) {
                      const resolved =
                        resolveSceneRewardPunishmentSource(
                          component.source,
                          rewardPunishmentRecipes.recipes,
                        );
                      const contextLabel =
                        component.source.context === "reward"
                          ? "Reward"
                          : "Punishment";
                      const accessibleLabel =
                        `${contextLabel}: ${resolved.label}`;

                      return (
                        <article
                          className="scene-component scene-component-m11"
                          key={component.id}
                        >
                          <div className="scene-component-order">
                            <span>{index + 1}</span>
                            <div>
                              <button
                                type="button"
                                aria-label={`Move ${accessibleLabel} up`}
                                disabled={index === 0}
                                onClick={() =>
                                  setComposition((current) =>
                                    current
                                      ? moveSceneComponent(
                                          current,
                                          component.id,
                                          "up",
                                        )
                                      : current,
                                  )
                                }
                              >
                                <IconArrowUp
                                  size={15}
                                  stroke={2}
                                  aria-hidden="true"
                                />
                              </button>
                              <button
                                type="button"
                                aria-label={`Move ${accessibleLabel} down`}
                                disabled={
                                  index ===
                                  composition.components.length - 1
                                }
                                onClick={() =>
                                  setComposition((current) =>
                                    current
                                      ? moveSceneComponent(
                                          current,
                                          component.id,
                                          "down",
                                        )
                                      : current,
                                  )
                                }
                              >
                                <IconArrowDown
                                  size={15}
                                  stroke={2}
                                  aria-hidden="true"
                                />
                              </button>
                            </div>
                          </div>

                          <div className="scene-component-body">
                            <div className="scene-component-top">
                              <div>
                                <span className="scene-component-fixed-phase">
                                  Reward / punishment
                                </span>
                                <h3>{resolved.label}</h3>
                                <span>
                                  {contextLabel} · {resolved.kindLabel} ·
                                  {" "}confirmed in M11
                                </span>
                              </div>

                              <div className="scene-component-actions">
                                <button
                                  type="button"
                                  onClick={shuffleRewardPunishmentAddon}
                                >
                                  <IconSparkles
                                    size={15}
                                    stroke={2}
                                    aria-hidden="true"
                                  />
                                  Shuffle
                                </button>
                                <button
                                  type="button"
                                  className="icon-only"
                                  aria-label={`Remove ${accessibleLabel} from scene`}
                                  onClick={removeRewardPunishmentAddon}
                                >
                                  <IconX
                                    size={16}
                                    stroke={2}
                                    aria-hidden="true"
                                  />
                                </button>
                              </div>
                            </div>

                            <label className="scene-component-note">
                              <span>Scene-local note</span>
                              <textarea
                                rows={2}
                                value={component.note}
                                placeholder="Anything to remember for this add-on…"
                                onChange={(event) =>
                                  setComposition((current) =>
                                    current
                                      ? updateSceneComponentNote(
                                          current,
                                          component.id,
                                          event.target.value,
                                        )
                                      : current,
                                  )
                                }
                              />
                            </label>
                          </div>
                        </article>
                      );
                    }

                    const currentCatalogId =
                      component.source.catalogId;
                    const candidate = confirmedById.get(
                      currentCatalogId,
                    );
                    const catalogResult =
                      catalogResultView.byCatalogId.get(
                        currentCatalogId,
                      );
                    const componentLabel =
                      candidate?.label ??
                      catalogResult?.item.label ??
                      currentCatalogId;
                    const componentCategoryLabel =
                      candidate?.categoryLabel ??
                      catalogResult?.item.categoryLabel ??
                      "Unavailable catalog item";
                    const componentUnavailable = !candidate;

                    const replacements =
                      replacementCandidatesForComponent(
                        composition,
                        component.id,
                        candidateView.coverageOrder,
                      ).filter(
                        (replacement) =>
                          replacement.catalogId !==
                          currentCatalogId,
                      );

                    return (
                      <article
                        className="scene-component"
                        key={component.id}
                      >
                        <div className="scene-component-order">
                          <span>{index + 1}</span>
                          <div>
                            <button
                              type="button"
                              aria-label={`Move ${componentLabel} up`}
                              disabled={index === 0}
                              onClick={() =>
                                setComposition((current) =>
                                  current
                                    ? moveSceneComponent(
                                        current,
                                        component.id,
                                        "up",
                                      )
                                    : current,
                                )
                              }
                            >
                              <IconArrowUp
                                size={15}
                                stroke={2}
                                aria-hidden="true"
                              />
                            </button>
                            <button
                              type="button"
                              aria-label={`Move ${componentLabel} down`}
                              disabled={
                                index ===
                                composition.components.length - 1
                              }
                              onClick={() =>
                                setComposition((current) =>
                                  current
                                    ? moveSceneComponent(
                                        current,
                                        component.id,
                                        "down",
                                      )
                                    : current,
                                )
                              }
                            >
                              <IconArrowDown
                                size={15}
                                stroke={2}
                                aria-hidden="true"
                              />
                            </button>
                          </div>
                        </div>

                        <div className="scene-component-body">
                          <div className="scene-component-top">
                            <div>
                              <select
                                aria-label={`Scene phase for ${componentLabel}`}
                                value={component.phaseId}
                                onChange={(event) =>
                                  setComposition((current) =>
                                    current
                                      ? updateSceneComponentPhase(
                                          current,
                                          component.id,
                                          event.target
                                            .value as ScenePhaseId,
                                        )
                                      : current,
                                  )
                                }
                              >
                                {scenePhaseDefinitions
                                  .filter(
                                    (phase) => phase.catalogEnabled,
                                  )
                                  .map((phase) => (
                                    <option
                                      key={phase.id}
                                      value={phase.id}
                                    >
                                      {phase.label}
                                    </option>
                                  ))}
                              </select>
                              <h3>{componentLabel}</h3>
                              <span>
                                {componentCategoryLabel}
                                {componentUnavailable &&
                                  " · Needs review"}
                              </span>
                            </div>

                            <div className="scene-component-actions">
                              <button
                                type="button"
                                disabled={replacements.length === 0}
                                onClick={() =>
                                  replaceComponent(component.id)
                                }
                              >
                                <IconArrowsExchange
                                  size={15}
                                  stroke={2}
                                  aria-hidden="true"
                                />
                                Replace
                              </button>
                              <button
                                type="button"
                                disabled={replacements.length === 0}
                                onClick={() =>
                                  shuffleComponent(component.id)
                                }
                              >
                                <IconSparkles
                                  size={15}
                                  stroke={2}
                                  aria-hidden="true"
                                />
                                Shuffle
                              </button>
                              <button
                                type="button"
                                className="icon-only"
                                aria-label={`Remove ${componentLabel} from scene`}
                                onClick={() =>
                                  setComposition((current) =>
                                    current
                                      ? removeSceneComponent(
                                          current,
                                          component.id,
                                        )
                                      : current,
                                  )
                                }
                              >
                                <IconX
                                  size={16}
                                  stroke={2}
                                  aria-hidden="true"
                                />
                              </button>
                            </div>
                          </div>

                          <label className="scene-component-note">
                            <span>Scene-local note</span>
                            <textarea
                              rows={2}
                              value={component.note}
                              placeholder="Anything to remember for this part…"
                              onChange={(event) =>
                                setComposition((current) =>
                                  current
                                    ? updateSceneComponentNote(
                                        current,
                                        component.id,
                                        event.target.value,
                                      )
                                    : current,
                                )
                              }
                            />
                          </label>
                        </div>
                      </article>
                    );
                  })}
                </div>

                <div className="scene-composition-footer">
                  <button
                    type="button"
                    className="secondary compact"
                    disabled={
                      candidateView.coverageOrder.every((candidate) =>
                        compositionCatalogIds.has(candidate.catalogId),
                      )
                    }
                    onClick={addNextCandidate}
                  >
                    <IconPlus size={15} stroke={2} aria-hidden="true" />
                    Add another
                  </button>
                  <button
                    type="button"
                    className="text-button"
                    onClick={makeStarterScene}
                  >
                    Rebuild starter
                  </button>
                </div>
              </>
            )}
          </article>

          <details
            className="scene-library panel"
            open={sceneLibrary.scenes.length > 0}
          >
            <summary>
              <div>
                <span>Saved scenes</span>
                <strong>
                  {sceneLibrary.scenes.length}{" "}
                  {sceneLibrary.scenes.length === 1
                    ? "template"
                    : "templates"}
                </strong>
              </div>
              <small>Local + private</small>
            </summary>

            {sceneLibrary.scenes.length === 0 ? (
              <div className="scene-library-empty">
                Build a scene above, give it a name, and save it here
                for later.
              </div>
            ) : (
              <div className="scene-library-list">
                {sceneLibrary.scenes.map((scene) => {
                  const review = savedSceneReviews.get(scene.id);
                  const needsReview =
                    review?.status === "needs_review";
                  const isActive =
                    activeSavedSceneId === scene.id;

                  return (
                    <article
                      className={
                        "scene-library-card" +
                        (isActive ? " active" : "") +
                        (needsReview ? " needs-review" : "")
                      }
                      key={scene.id}
                    >
                      <div className="scene-library-card-main">
                        <div className="scene-library-card-title">
                          <strong>{scene.name}</strong>
                          {needsReview ? (
                            <span className="scene-review-badge">
                              <IconAlertTriangle
                                size={13}
                                stroke={2}
                                aria-hidden="true"
                              />
                              Needs review
                            </span>
                          ) : (
                            <span className="scene-ready-badge">
                              Ready
                            </span>
                          )}
                        </div>
                        <span>
                          {scene.components.length}{" "}
                          {scene.components.length === 1
                            ? "part"
                            : "parts"}{" "}
                          · {scene.effort} ·{" "}
                          {scene.themeIds
                            .map(
                              (id) =>
                                sceneThemeDefinitions.find(
                                  (theme) => theme.id === id,
                                )?.label ?? id,
                            )
                            .join(" + ")}
                        </span>
                        <small>
                          Updated{" "}
                          {new Date(
                            scene.updatedAt,
                          ).toLocaleDateString()}
                        </small>
                      </div>

                      <div className="scene-library-card-actions">
                        <button
                          type="button"
                          className={
                            isActive
                              ? "primary compact"
                              : "secondary compact"
                          }
                          onClick={() => loadSavedScene(scene.id)}
                        >
                          {isActive ? "Loaded" : "Load"}
                        </button>
                        <button
                          type="button"
                          className="icon-only"
                          aria-label={`Duplicate ${scene.name}`}
                          title="Duplicate"
                          onClick={() => duplicateScene(scene.id)}
                        >
                          <IconCopy
                            size={16}
                            stroke={2}
                            aria-hidden="true"
                          />
                        </button>
                        <button
                          type="button"
                          className={
                            pendingDeleteSceneId === scene.id
                              ? "scene-delete-confirm"
                              : "icon-only"
                          }
                          aria-label={
                            pendingDeleteSceneId === scene.id
                              ? `Confirm delete ${scene.name}`
                              : `Delete ${scene.name}`
                          }
                          onClick={() => deleteScene(scene.id)}
                        >
                          {pendingDeleteSceneId === scene.id ? (
                            "Confirm"
                          ) : (
                            <IconTrash
                              size={16}
                              stroke={2}
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      </div>

                      {needsReview && review && (
                        <details className="scene-review-details">
                          <summary>
                            {review.issues.length}{" "}
                            {review.issues.length === 1
                              ? "issue"
                              : "issues"}
                          </summary>
                          <ul>
                            {review.issues.map((issue) => (
                              <li
                                key={`${issue.componentId}:${issue.code}`}
                              >
                                {issue.message}
                              </li>
                            ))}
                          </ul>
                        </details>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </details>

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
                These fit the selected themes through your broader profile,
                but you have not directly confirmed or ranked them yet.
              </div>

              <div className="scene-candidate-grid">
                {suggestedMenu.map((candidate) => (
                  <CandidateCard
                    key={candidate.catalogId}
                    candidate={candidate}
                    onSetSessionChoice={setSessionChoice}
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
