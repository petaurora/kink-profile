import { describe, expect, it } from "vitest";
import {
  createEmptySceneLibraryState,
  createSavedScene,
  deleteSavedScene,
  duplicateSavedScene,
  parseSceneLibraryState,
  savedSceneToComposition,
  updateSavedScene,
  upsertSavedScene,
} from "./sceneLibrary";
import {
  createEmptySceneComposition,
  upsertRewardPunishmentSceneComponent,
} from "./sceneComposition";
import type { SceneCandidate } from "./sceneCandidates";
import { addCatalogSceneComponent } from "./sceneComposition";

function candidate(id: string): SceneCandidate {
  return {
    catalogId: id,
    label: id,
    categoryId: "misc",
    categoryLabel: "Misc",
    direction: "both",
    intensity: "Moderate",
    riskLevel: "",
    provenance: "explicit",
    themeMatches: [
      { themeId: "pain", label: "Pain", fit: 90 },
    ],
    matchedThemeIds: ["pain"],
    bridge: false,
    score: 80,
    automaticEligible: true,
    meaningfulPairwiseComparisons: 0,
  };
}

function composition() {
  let result = createEmptySceneComposition({
    themeIds: ["pain"],
    effort: "normal",
    exploration: "mixed",
  });
  result = addCatalogSceneComponent(
    result,
    candidate("catalog-one"),
    "core_play",
  );
  result = upsertRewardPunishmentSceneComponent(result, {
    kind: "reward_punishment",
    context: "reward",
    entry: {
      kind: "recipe",
      recipeId: "recipe-one",
    },
  });
  return result;
}

describe("M13.8 saved scene library", () => {
  it("round-trips stable scene sources without derived candidate data", () => {
    const scene = createSavedScene(
      composition(),
      "  Good   scene  ",
      {
        id: "scene-1",
        now: "2026-09-09T03:00:00.000Z",
      },
    );

    const state = upsertSavedScene(
      createEmptySceneLibraryState(),
      scene,
    );
    const parsed = parseSceneLibraryState(
      JSON.parse(JSON.stringify(state)),
    );

    expect(parsed).toEqual(state);
    expect(scene.name).toBe("Good scene");
    expect(savedSceneToComposition(scene).components).toEqual(
      scene.components,
    );
  });

  it("updates an existing scene while preserving creation identity", () => {
    const original = createSavedScene(
      composition(),
      "First name",
      {
        id: "scene-1",
        now: "2026-09-09T03:00:00.000Z",
      },
    );
    const updated = updateSavedScene(
      original,
      {
        ...composition(),
        effort: "elaborate",
      },
      "Second name",
      "2026-09-09T04:00:00.000Z",
    );

    expect(updated).toMatchObject({
      id: "scene-1",
      name: "Second name",
      effort: "elaborate",
      createdAt: "2026-09-09T03:00:00.000Z",
      updatedAt: "2026-09-09T04:00:00.000Z",
    });
  });

  it("duplicates with a new ID and independent component copies", () => {
    const original = createSavedScene(
      composition(),
      "Favorite",
      {
        id: "scene-1",
        now: "2026-09-09T03:00:00.000Z",
      },
    );
    const state = duplicateSavedScene(
      upsertSavedScene(
        createEmptySceneLibraryState(),
        original,
      ),
      "scene-1",
      {
        id: "scene-2",
        now: "2026-09-09T05:00:00.000Z",
      },
    );

    expect(state.scenes).toHaveLength(2);
    expect(state.scenes[0]).toMatchObject({
      id: "scene-2",
      name: "Favorite copy",
    });
    expect(state.scenes[0].components).not.toBe(
      state.scenes[1].components,
    );
  });

  it("deletes one scene without touching the rest", () => {
    let state = createEmptySceneLibraryState();
    state = upsertSavedScene(
      state,
      createSavedScene(composition(), "One", {
        id: "one",
      }),
    );
    state = upsertSavedScene(
      state,
      createSavedScene(composition(), "Two", {
        id: "two",
      }),
    );

    state = deleteSavedScene(state, "one");
    expect(state.scenes.map((scene) => scene.id)).toEqual(["two"]);
  });

  it("rejects malformed reward/punishment placement", () => {
    const scene = createSavedScene(
      composition(),
      "Scene",
      { id: "scene-1" },
    );
    const malformed = {
      schemaVersion: 1,
      scenes: [
        {
          ...scene,
          components: scene.components.map((component) =>
            component.source.kind === "reward_punishment"
              ? { ...component, phaseId: "core_play" }
              : component,
          ),
        },
      ],
    };

    expect(parseSceneLibraryState(malformed)).toBeNull();
  });
});
