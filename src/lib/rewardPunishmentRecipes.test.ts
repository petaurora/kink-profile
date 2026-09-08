import { describe, expect, it } from "vitest";
import {
  createEmptyRewardPunishmentProfileState,
  setContextSuitability,
} from "./rewardPunishmentProfile";
import {
  rewardPunishmentPrimitives,
} from "./rewardPunishmentLibrary";
import {
  createEmptyRewardPunishmentRecipeState,
  deleteRewardPunishmentRecipe,
  duplicateRewardPunishmentRecipe,
  moveRewardPunishmentRecipeComponent,
  reconcileRewardPunishmentRecipeState,
  upsertRewardPunishmentRecipe,
  validateRewardPunishmentRecipe,
  type RewardPunishmentRecipe,
} from "./rewardPunishmentRecipes";

const first = rewardPunishmentPrimitives[0];
const second = rewardPunishmentPrimitives[1];

function recipe(): RewardPunishmentRecipe {
  return {
    id: "recipe-1",
    kind: "reward",
    name: "  A nice combo  ",
    components: [
      { kind: "primitive", ref: first.ref },
      { kind: "custom", id: "custom-1", label: "  custom ending  " },
      { kind: "primitive", ref: second.ref },
    ],
    notes: "  keep it simple  ",
    tags: [" Care ", "care", "Weekend"],
    randomEligible: true,
    createdAt: "2026-09-08T00:00:00.000Z",
    updatedAt: "2026-09-08T00:00:00.000Z",
  };
}

describe("M11.7 recipe validation", () => {
  it("preserves ordered primitive + custom composition and normalizes recipe-local text", () => {
    const state = upsertRewardPunishmentRecipe(
      createEmptyRewardPunishmentRecipeState(),
      recipe(),
    );
    const saved = state.recipes[0];

    expect(saved.name).toBe("A nice combo");
    expect(saved.components.map((component) => component.kind)).toEqual([
      "primitive",
      "custom",
      "primitive",
    ]);
    expect(saved.components[1]).toEqual({
      kind: "custom",
      id: "custom-1",
      label: "custom ending",
    });
    expect(saved.notes).toBe("keep it simple");
    expect(saved.tags).toEqual(["Care", "Weekend"]);
  });

  it("marks context-never components Needs review and reconciles random eligibility off", () => {
    let profile = createEmptyRewardPunishmentProfileState();
    profile = setContextSuitability(
      profile,
      first.ref,
      "reward",
      "never",
      "2026-09-08T00:00:00.000Z",
    );

    const validation = validateRewardPunishmentRecipe(recipe(), profile);
    expect(validation.needsReview).toBe(true);
    expect(validation.canRandomize).toBe(false);
    expect(validation.issues.some((issue) => issue.code === "context_never"))
      .toBe(true);

    const state = upsertRewardPunishmentRecipe(
      createEmptyRewardPunishmentRecipeState(),
      recipe(),
    );
    const reconciled = reconcileRewardPunishmentRecipeState(
      state,
      profile,
      "2026-09-08T01:00:00.000Z",
    );
    expect(reconciled.recipes[0].randomEligible).toBe(false);
  });

  it("preserves stale primitive refs but marks the recipe Needs review", () => {
    const stale: RewardPunishmentRecipe = {
      ...recipe(),
      components: [
        {
          kind: "primitive",
          ref: { kind: "catalog", id: "missing-catalog-item" },
        },
      ],
    };

    const validation = validateRewardPunishmentRecipe(
      stale,
      createEmptyRewardPunishmentProfileState(),
    );
    expect(validation.canSave).toBe(true);
    expect(validation.needsReview).toBe(true);
    expect(validation.issues[0]?.code).toBe("stale_primitive");
  });

  it("treats context-no as a warning rather than invalidating composition", () => {
    let profile = createEmptyRewardPunishmentProfileState();
    profile = setContextSuitability(profile, first.ref, "reward", "no");

    const validation = validateRewardPunishmentRecipe(
      {
        ...recipe(),
        components: [{ kind: "primitive", ref: first.ref }],
      },
      profile,
    );

    expect(validation.canSave).toBe(true);
    expect(validation.needsReview).toBe(false);
    expect(validation.issues[0]?.severity).toBe("warning");
  });

  it("requires a name, a component, and nonblank custom components", () => {
    const validation = validateRewardPunishmentRecipe(
      {
        ...recipe(),
        name: " ",
        components: [{ kind: "custom", id: "c1", label: " " }],
      },
      createEmptyRewardPunishmentProfileState(),
    );

    expect(validation.canSave).toBe(false);
    expect(validation.issues.map((issue) => issue.code)).toEqual([
      "missing_name",
      "empty_custom_component",
    ]);

    expect(
      validateRewardPunishmentRecipe(
        { ...recipe(), components: [] },
        createEmptyRewardPunishmentProfileState(),
      ).canSave,
    ).toBe(false);
  });
});

describe("M11.7 recipe editing helpers", () => {
  it("moves components without changing their identity", () => {
    const source = recipe();
    const moved = moveRewardPunishmentRecipeComponent(source, 2, 0);
    expect(moved.components[0]).toEqual(source.components[2]);
    expect(moved.components[1]).toEqual(source.components[0]);
    expect(moved.components[2]).toEqual(source.components[1]);
  });

  it("duplicates without joining the future random pool automatically", () => {
    const copy = duplicateRewardPunishmentRecipe(recipe(), {
      id: "recipe-copy",
      now: "2026-09-08T02:00:00.000Z",
    });
    expect(copy.id).toBe("recipe-copy");
    expect(copy.name).toBe("A nice combo copy");
    expect(copy.randomEligible).toBe(false);
    expect(copy.components).toEqual(recipe().components);
  });

  it("supports upsert and delete without touching unrelated recipes", () => {
    const original = recipe();
    const secondRecipe = { ...recipe(), id: "recipe-2", name: "Other" };
    let state = createEmptyRewardPunishmentRecipeState();
    state = upsertRewardPunishmentRecipe(state, original);
    state = upsertRewardPunishmentRecipe(state, secondRecipe);
    state = deleteRewardPunishmentRecipe(state, original.id);
    expect(state.recipes.map((item) => item.id)).toEqual(["recipe-2"]);
  });
});
