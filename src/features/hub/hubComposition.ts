import type { ProfileMaturityKind } from "../../lib/profileMaturity";

export type HubModuleId =
  | "onboarding"
  | "reflection"
  | "quiz-resume"
  | "latest-preference"
  | "intent-doors"
  | "randomizer";

export type HubIntentDoorId =
  | "profile"
  | "catalog"
  | "compare"
  | "scene-builder";

export type HubCompositionInput = {
  maturity: ProfileMaturityKind;
  hasResumableQuiz: boolean;
  hasLatestPreference: boolean;
  randomizerReady: boolean;
};

export type HubComposition = {
  maturity: ProfileMaturityKind;
  modules: readonly HubModuleId[];
  intentDoors: readonly HubIntentDoorId[];
};

const emergingIntentDoors: readonly HubIntentDoorId[] = [
  "profile",
  "catalog",
];

const establishedIntentDoors: readonly HubIntentDoorId[] = [
  "profile",
  "catalog",
  "compare",
  "scene-builder",
];

/**
 * Resolve the Hub from truthful semantic state rather than a generic
 * "anything exists" activity flag.
 *
 * Optional modules only appear when they have eligible content. Maturity
 * controls the broad posture and which durable exploration doors make sense;
 * it is not a completion percentage.
 */
export function buildHubComposition(
  input: HubCompositionInput,
): HubComposition {
  if (input.maturity === "unformed") {
    return {
      maturity: input.maturity,
      modules: ["onboarding"],
      intentDoors: [],
    };
  }

  const modules: HubModuleId[] = ["reflection"];

  if (input.hasResumableQuiz) {
    modules.push("quiz-resume");
  }
  if (input.hasLatestPreference) {
    modules.push("latest-preference");
  }

  modules.push("intent-doors");

  if (input.randomizerReady) {
    modules.push("randomizer");
  }

  return {
    maturity: input.maturity,
    modules,
    intentDoors:
      input.maturity === "established"
        ? establishedIntentDoors
        : emergingIntentDoors,
  };
}

export function hubHasModule(
  composition: HubComposition,
  moduleId: HubModuleId,
) {
  return composition.modules.includes(moduleId);
}
