import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SceneCandidate } from "./sceneCandidates";
import {
  addCatalogSceneComponent,
  createEmptySceneComposition,
} from "./sceneComposition";
import {
  buildRandomSceneComposition,
  chooseRandomSceneCandidate,
  clearSceneRandomizerState,
  createEmptySceneRandomizerState,
  loadSceneRandomizerState,
  recordSceneRandomPick,
  saveSceneRandomizerState,
  shuffleSceneComponent,
} from "./sceneRandomizer";

function candidate(
  id: string,
  options: Partial<SceneCandidate> = {},
): SceneCandidate {
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
      {
        themeId: "pain",
        label: "Pain",
        fit: 90,
      },
    ],
    matchedThemeIds: ["pain"],
    bridge: false,
    score: 80,
    automaticEligible: true,
    meaningfulPairwiseComparisons: 0,
    ...options,
  };
}

describe("M13.6 scene randomizer", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("only selects automatic-eligible candidates", () => {
    const pick = chooseRandomSceneCandidate(
      [
        candidate("blocked", {
          automaticEligible: false,
          provenance: "inference_only",
        }),
        candidate("allowed"),
      ],
      createEmptySceneRandomizerState(),
      () => 0,
    );

    expect(pick.candidate?.catalogId).toBe("allowed");
  });

  it("avoids recent picks when an alternative exists", () => {
    const state = recordSceneRandomPick(
      createEmptySceneRandomizerState(),
      "one",
    );

    const pick = chooseRandomSceneCandidate(
      [candidate("one"), candidate("two")],
      state,
      () => 0,
    );

    expect(pick.candidate?.catalogId).toBe("two");
  });

  it("falls back to the full eligible pool once everything is recent", () => {
    let state = createEmptySceneRandomizerState();
    state = recordSceneRandomPick(state, "one");
    state = recordSceneRandomPick(state, "two");

    const pick = chooseRandomSceneCandidate(
      [candidate("one"), candidate("two")],
      state,
      () => 0,
    );

    expect(["one", "two"]).toContain(pick.candidate?.catalogId);
  });

  it("persists short-term anti-repeat history in sessionStorage", () => {
    const state = recordSceneRandomPick(
      createEmptySceneRandomizerState(),
      "picked",
    );

    saveSceneRandomizerState(state);
    expect(loadSceneRandomizerState().recentCatalogIds).toEqual([
      "picked",
    ]);

    clearSceneRandomizerState();
    expect(loadSceneRandomizerState()).toEqual(
      createEmptySceneRandomizerState(),
    );
  });

  it("builds a randomized scene without duplicate catalog items", () => {
    const candidates = [
      candidate("pet", {
        matchedThemeIds: ["pet"],
        themeMatches: [{ themeId: "pet", label: "Pet", fit: 90 }],
      }),
      candidate("pain"),
      candidate("soft", {
        intensity: "Low",
        matchedThemeIds: ["care", "soft"],
        themeMatches: [
          { themeId: "care", label: "Care", fit: 90 },
          { themeId: "soft", label: "Soft", fit: 80 },
        ],
      }),
      candidate("extra"),
    ];

    const result = buildRandomSceneComposition(candidates, {
      themeIds: ["pet", "pain", "care"],
      effort: "quick",
      exploration: "mixed",
      state: createEmptySceneRandomizerState(),
      rng: () => 0,
    });

    const ids = result.composition.components.map(
      (component) => component.source.catalogId,
    );
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBeGreaterThan(0);
  });

  it("never lets inference-only candidates enter random builds", () => {
    const result = buildRandomSceneComposition(
      [
        candidate("direct"),
        candidate("inferred", {
          automaticEligible: false,
          provenance: "inference_only",
        }),
      ],
      {
        themeIds: ["pain"],
        effort: "quick",
        exploration: "mixed",
        state: createEmptySceneRandomizerState(),
        rng: () => 0.99,
      },
    );

    expect(
      result.composition.components.map(
        (component) => component.source.catalogId,
      ),
    ).not.toContain("inferred");
  });

  it("shuffles only the requested component and preserves its note", () => {
    let composition = createEmptySceneComposition({
      themeIds: ["pain"],
      effort: "normal",
      exploration: "mixed",
    });
    composition = addCatalogSceneComponent(
      composition,
      candidate("first"),
      "core_play",
    );
    composition = {
      ...composition,
      components: composition.components.map((component) => ({
        ...component,
        note: "keep this note",
      })),
    };

    const componentId = composition.components[0].id;
    const result = shuffleSceneComponent(
      composition,
      componentId,
      [candidate("first"), candidate("second")],
      createEmptySceneRandomizerState(),
      () => 0,
    );

    expect(result.replacement?.catalogId).toBe("second");
    expect(result.composition.components[0]).toMatchObject({
      id: componentId,
      note: "keep this note",
      source: {
        catalogId: "second",
      },
    });
  });

  it("caps anti-repeat history to a short session window", () => {
    let state = createEmptySceneRandomizerState();
    for (let index = 0; index < 20; index += 1) {
      state = recordSceneRandomPick(state, `item-${index}`);
    }

    expect(state.recentCatalogIds).toHaveLength(10);
    expect(state.recentCatalogIds[0]).toBe("item-10");
  });
});
