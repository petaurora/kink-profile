import { describe, expect, it } from "vitest";
import type { SceneCandidate } from "./sceneCandidates";
import {
  addCatalogSceneComponent,
  buildStarterSceneComposition,
  createEmptySceneComposition,
  moveSceneComponent,
  reconcileSceneComposition,
  replaceSceneComponent,
  scenePhaseCandidateFit,
  scenePhaseDefinitions,
  updateSceneComponentNote,
  updateSceneComponentPhase,
} from "./sceneComposition";

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

describe("M13.5 scene composition", () => {
  it("builds a deterministic ordered starter from eligible catalog IDs", () => {
    const pet = candidate("pet-item", {
      matchedThemeIds: ["pet"],
      themeMatches: [{ themeId: "pet", label: "Pet", fit: 90 }],
    });
    const pain = candidate("pain-item", {
      score: 95,
    });
    const care = candidate("care-item", {
      intensity: "Low",
      matchedThemeIds: ["care", "soft"],
      themeMatches: [
        { themeId: "care", label: "Care", fit: 90 },
        { themeId: "soft", label: "Soft", fit: 82 },
      ],
    });

    const view = {
      selectedThemeIds: ["pet", "pain", "care"] as const,
      coverageOrder: [pet, pain, care],
    };

    const first = buildStarterSceneComposition(view, {
      effort: "quick",
      exploration: "mixed",
    });
    const second = buildStarterSceneComposition(view, {
      effort: "quick",
      exploration: "mixed",
    });

    expect(first).toEqual(second);
    expect(
      first.components.map((component) => component.source.catalogId),
    ).toEqual(expect.arrayContaining(["pet-item", "pain-item", "care-item"]));
    expect(new Set(first.components.map((component) => component.source.catalogId)).size)
      .toBe(first.components.length);
  });

  it("only places care-like candidates into aftercare", () => {
    const pain = candidate("pain");
    const care = candidate("care", {
      matchedThemeIds: ["care"],
      themeMatches: [{ themeId: "care", label: "Care", fit: 95 }],
    });

    expect(scenePhaseCandidateFit("aftercare", pain)).toBe(0);
    expect(scenePhaseCandidateFit("aftercare", care)).toBeGreaterThan(0);
  });

  it("keeps the reward/punishment phase reserved for M13.7", () => {
    expect(
      scenePhaseDefinitions.find(
        (phase) => phase.id === "reward_punishment",
      ),
    ).toMatchObject({
      optional: true,
      catalogEnabled: false,
    });
  });

  it("adds stable catalog references and prevents duplicates", () => {
    const item = candidate("catalog-id");
    let composition = createEmptySceneComposition({
      themeIds: ["pain"],
      effort: "normal",
      exploration: "mixed",
    });

    composition = addCatalogSceneComponent(
      composition,
      item,
      "core_play",
    );
    composition = addCatalogSceneComponent(
      composition,
      item,
      "warm_up",
    );

    expect(composition.components).toHaveLength(1);
    expect(composition.components[0]).toMatchObject({
      source: {
        kind: "catalog",
        catalogId: "catalog-id",
      },
    });
  });

  it("supports notes, phase changes, and explicit reordering", () => {
    let composition = createEmptySceneComposition({
      themeIds: ["pain"],
      effort: "normal",
      exploration: "mixed",
    });
    composition = addCatalogSceneComponent(
      composition,
      candidate("one"),
      "warm_up",
    );
    composition = addCatalogSceneComponent(
      composition,
      candidate("two"),
      "core_play",
    );

    const firstId = composition.components[0].id;
    composition = updateSceneComponentNote(
      composition,
      firstId,
      "Keep this slow.",
    );
    composition = updateSceneComponentPhase(
      composition,
      firstId,
      "setup",
    );
    composition = moveSceneComponent(composition, firstId, "down");

    expect(composition.components[1]).toMatchObject({
      id: firstId,
      phaseId: "setup",
      note: "Keep this slow.",
    });
  });

  it("replaces a component without losing its slot identity or note", () => {
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
    const componentId = composition.components[0].id;
    composition = updateSceneComponentNote(
      composition,
      componentId,
      "Use the padded one.",
    );

    composition = replaceSceneComponent(
      composition,
      componentId,
      candidate("replacement"),
    );

    expect(composition.components[0]).toMatchObject({
      id: componentId,
      phaseId: "core_play",
      note: "Use the padded one.",
      source: {
        catalogId: "replacement",
      },
    });
  });

  it("drops components that are no longer eligible tonight", () => {
    let composition = createEmptySceneComposition({
      themeIds: ["pain"],
      effort: "normal",
      exploration: "mixed",
    });
    composition = addCatalogSceneComponent(
      composition,
      candidate("keep"),
      "core_play",
    );
    composition = addCatalogSceneComponent(
      composition,
      candidate("drop"),
      "warm_up",
    );

    const reconciled = reconcileSceneComposition(
      composition,
      new Set(["keep"]),
    );

    expect(
      reconciled.components.map(
        (component) => component.source.catalogId,
      ),
    ).toEqual(["keep"]);
  });
});
