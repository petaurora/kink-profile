import { describe, expect, it } from "vitest";
import type { CatalogResultView } from "./catalogResults";
import {
  createEmptyRewardPunishmentProfileState,
  setContextSuitability,
} from "./rewardPunishmentProfile";
import {
  rewardPunishmentPrimitives,
} from "./rewardPunishmentLibrary";
import type { RewardPunishmentRecipe } from "./rewardPunishmentRecipes";
import {
  createSavedScene,
} from "./sceneLibrary";
import {
  createEmptySceneComposition,
  upsertRewardPunishmentSceneComponent,
} from "./sceneComposition";
import { reviewSavedScene } from "./sceneLifecycle";

function emptyCatalogView(): CatalogResultView {
  return {
    items: [],
    byCatalogId: new Map(),
    categories: [],
  } as unknown as CatalogResultView;
}

describe("M13.8 saved scene review lifecycle", () => {
  it("marks a saved catalog reference for review when the item is gone", () => {
    const scene = createSavedScene(
      {
        schemaVersion: 1,
        themeIds: ["pain"],
        effort: "quick",
        exploration: "familiar",
        components: [
          {
            id: "component-1",
            phaseId: "core_play",
            source: {
              kind: "catalog",
              catalogId: "missing-item",
            },
            note: "",
          },
        ],
      },
      "Saved",
      { id: "scene-1" },
    );

    const review = reviewSavedScene(scene, {
      catalogResultView: emptyCatalogView(),
      rewardPunishmentProfile:
        createEmptyRewardPunishmentProfileState(),
      rewardPunishmentRecipes: [],
    });

    expect(review.status).toBe("needs_review");
    expect(review.issues[0].code).toBe("catalog_missing");
  });

  it("marks durable catalog exclusions", () => {
    const byCatalogId = new Map();
    byCatalogId.set(
      "item",
      {
        item: {
          id: "item",
          label: "Item",
        },
        explicitState: "hard_limit",
      } as never,
    );
    const view = {
      ...emptyCatalogView(),
      byCatalogId,
    } as unknown as CatalogResultView;

    const scene = createSavedScene(
      {
        schemaVersion: 1,
        themeIds: ["pain"],
        effort: "quick",
        exploration: "familiar",
        components: [
          {
            id: "component-1",
            phaseId: "core_play",
            source: {
              kind: "catalog",
              catalogId: "item",
            },
            note: "",
          },
        ],
      },
      "Saved",
      { id: "scene-1" },
    );

    expect(
      reviewSavedScene(scene, {
        catalogResultView: view,
        rewardPunishmentProfile:
          createEmptyRewardPunishmentProfileState(),
        rewardPunishmentRecipes: [],
      }).issues[0].code,
    ).toBe("catalog_excluded");
  });

  it("marks an M11 primitive when contextual suitability is no longer confirmed", () => {
    const primitive = rewardPunishmentPrimitives[0];
    let composition = createEmptySceneComposition({
      themeIds: ["care"],
      effort: "quick",
      exploration: "familiar",
    });
    composition = upsertRewardPunishmentSceneComponent(
      composition,
      {
        kind: "reward_punishment",
        context: "reward",
        entry: {
          kind: "primitive",
          ref: primitive.ref,
        },
      },
    );
    const scene = createSavedScene(
      composition,
      "Reward scene",
      { id: "scene-1" },
    );

    expect(
      reviewSavedScene(scene, {
        catalogResultView: emptyCatalogView(),
        rewardPunishmentProfile:
          createEmptyRewardPunishmentProfileState(),
        rewardPunishmentRecipes: [],
      }).issues[0].code,
    ).toBe("m11_context_unconfirmed");

    const confirmed = setContextSuitability(
      createEmptyRewardPunishmentProfileState(),
      primitive.ref,
      "reward",
      "works",
    );

    expect(
      reviewSavedScene(scene, {
        catalogResultView: emptyCatalogView(),
        rewardPunishmentProfile: confirmed,
        rewardPunishmentRecipes: [],
      }).status,
    ).toBe("ready");
  });

  it("marks missing recipes for review", () => {
    let composition = createEmptySceneComposition({
      themeIds: ["care"],
      effort: "quick",
      exploration: "familiar",
    });
    composition = upsertRewardPunishmentSceneComponent(
      composition,
      {
        kind: "reward_punishment",
        context: "reward",
        entry: {
          kind: "recipe",
          recipeId: "missing-recipe",
        },
      },
    );

    const scene = createSavedScene(
      composition,
      "Recipe scene",
      { id: "scene-1" },
    );

    expect(
      reviewSavedScene(scene, {
        catalogResultView: emptyCatalogView(),
        rewardPunishmentProfile:
          createEmptyRewardPunishmentProfileState(),
        rewardPunishmentRecipes: [] as RewardPunishmentRecipe[],
      }).issues[0].code,
    ).toBe("m11_recipe_missing");
  });
});
