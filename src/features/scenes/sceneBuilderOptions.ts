import type {
  SceneExplorationMode,
  SceneIntensityPreference,
} from "../../lib/sceneCandidates";
import type {
  SceneEffort,
} from "../../lib/sceneComposition";
import type {
  SceneRewardPunishmentMode,
} from "../../lib/sceneRewardPunishment";
import type {
  SceneSessionChoice,
} from "../../lib/sceneSession";
import type {
  SceneThemeFamily,
} from "../../data/sceneThemes";

export const familyOrder: Array<{
  id: SceneThemeFamily;
  label: string;
}> = [
  { id: "activity", label: "Play" },
  { id: "headspace", label: "Headspace" },
  { id: "dynamic_mode", label: "Dynamic" },
  { id: "facet", label: "Broad theme" },
  { id: "vibe", label: "Vibe" },
];

export const effortOptions: Array<{
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

export const explorationOptions: Array<{
  id: SceneExplorationMode;
  label: string;
}> = [
  { id: "familiar", label: "Familiar" },
  { id: "mixed", label: "Mix" },
  { id: "explore", label: "Explore" },
];

export const intensityOptions: Array<{
  id: SceneIntensityPreference;
  label: string;
}> = [
  { id: "any", label: "Any" },
  { id: "light", label: "Light" },
  { id: "moderate", label: "Moderate" },
  { id: "intense", label: "Intense" },
];

export const rewardPunishmentModes: Array<{
  id: SceneRewardPunishmentMode;
  label: string;
}> = [
  { id: "none", label: "None" },
  { id: "reward", label: "Reward" },
  { id: "punishment", label: "Punishment" },
  { id: "either", label: "Surprise me" },
];

export const sessionChoices: Array<{
  id: SceneSessionChoice;
  label: string;
  shortLabel: string;
}> = [
  { id: "yes_tonight", label: "Yes tonight", shortLabel: "Yes" },
  { id: "maybe_tonight", label: "Maybe tonight", shortLabel: "Maybe" },
  { id: "not_tonight", label: "Not tonight", shortLabel: "Not tonight" },
];

export function createSceneId() {
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

export function sessionChoiceLabel(choice: SceneSessionChoice) {
  return (
    sessionChoices.find((entry) => entry.id === choice)?.label ??
    choice.replaceAll("_", " ")
  );
}
