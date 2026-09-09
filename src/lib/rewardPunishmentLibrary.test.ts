import { describe, expect, it } from "vitest";
import { kinkCatalog } from "../data/kinkCatalog.generated";
import {
  rewardPunishmentCatalogCategoryMappings,
  rewardPunishmentCatalogSourceOrigins,
  rewardPunishmentSourceIdeaCount,
  type RewardPunishmentSourceOrigin,
} from "../data/rewardPunishmentLibrary.generated";
import {
  rewardPunishmentActions,
  rewardPunishmentCategories,
  getRewardPunishmentCategoryFacetAffinities,
  getRewardPunishmentCategorySignalMappings,
  rewardPunishmentPrimitiveKey,
  rewardPunishmentPrimitives,
  rewardPunishmentTaxonomyVersion,
} from "./rewardPunishmentLibrary";

describe("M11 runtime library", () => {
  it("locks stable category and action identity", () => {
    expect(rewardPunishmentTaxonomyVersion).toBe(1);
    expect(rewardPunishmentCategories).toHaveLength(12);
    expect(rewardPunishmentActions).toHaveLength(637);
    const actionIds = rewardPunishmentActions.map((action) => action.id);
    expect(new Set(actionIds).size).toBe(actionIds.length);
    for (const id of actionIds) expect(id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    const categoryIds = rewardPunishmentCategories.map((category) => category.id);
    expect(new Set(categoryIds).size).toBe(categoryIds.length);
  });

  it("accounts for every raw source idea exactly once after dedupe/catalog linking", () => {
    const origins: RewardPunishmentSourceOrigin[] = [];
    for (const action of rewardPunishmentActions) {
      origins.push(
        ...(action.sourceOrigins as readonly RewardPunishmentSourceOrigin[]),
      );
    }

    const catalogOrigins =
      rewardPunishmentCatalogSourceOrigins as Readonly<
        Record<string, readonly RewardPunishmentSourceOrigin[]>
      >;
    for (const linkedOrigins of Object.values(catalogOrigins)) {
      origins.push(...linkedOrigins);
    }

    expect(rewardPunishmentSourceIdeaCount).toBe(669);
    expect(origins).toHaveLength(669);
    const keys = origins.map((origin) =>
      origin.sourceKind + "|" + origin.sourceSheet + "|" + origin.sourceRow,
    );
    expect(new Set(keys).size).toBe(669);
  });

  it("uses catalog identity for exact source overlaps instead of duplicate action rows", () => {
    const catalogOrigins =
      rewardPunishmentCatalogSourceOrigins as Readonly<
        Record<string, readonly RewardPunishmentSourceOrigin[]>
      >;

    for (const catalogId of [
      "hairbrush-spanking",
      "wall-sit",
      "plank-hold",
      "hands-behind-back-posture",
    ]) expect(catalogOrigins[catalogId]).toBeDefined();

    expect(
      rewardPunishmentActions.some(
        (action) => action.label.toLowerCase() === "hairbrush spanking",
      ),
    ).toBe(false);
    expect(rewardPunishmentCatalogSourceOrigins["hairbrush-spanking"]).toHaveLength(2);
  });

  it("maps every primitive into normalized contextual categories with bounded weights", () => {
    expect(rewardPunishmentPrimitives).toHaveLength(
      kinkCatalog.length + rewardPunishmentActions.length,
    );
    const validCategoryIds = new Set(
      rewardPunishmentCategories.map((category) => category.id),
    );
    for (const primitive of rewardPunishmentPrimitives) {
      expect(primitive.contextCategories.length).toBeGreaterThan(0);
      for (const mapping of primitive.contextCategories) {
        expect(validCategoryIds.has(mapping.id)).toBe(true);
        expect([0.25, 0.5, 0.75, 1]).toContain(mapping.weight);
      }
    }
    for (const item of kinkCatalog) {
      expect(
        rewardPunishmentCatalogCategoryMappings[item.categoryId]?.length ?? 0,
      ).toBeGreaterThan(0);
    }
  });

  it("bridges R/P context categories into canonical Signals and derived Overall Facets", () => {
    const impactSignals = getRewardPunishmentCategorySignalMappings("impact");
    expect(impactSignals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ signalId: "pain_receiving", weight: 1 }),
        expect.objectContaining({
          signalId: "receiving_intensity",
          weight: 0.75,
        }),
      ]),
    );

    const impactFacets = getRewardPunishmentCategoryFacetAffinities("impact");
    expect(impactFacets[0]?.facetId).toBe("intensity_pain");
  });

  it("keeps known semantic gaps explicit instead of fabricating a facet mapping", () => {
    expect(getRewardPunishmentCategorySignalMappings("sexual-scene")).toEqual(
      [],
    );
    expect(getRewardPunishmentCategoryFacetAffinities("sexual-scene")).toEqual(
      [],
    );
  });

  it("derives action signal semantics through weighted R/P context categories", () => {
    const ceremony = rewardPunishmentPrimitives.find(
      (primitive) =>
        primitive.ref.kind === "action" &&
        primitive.ref.id === "action-achievement-ceremony",
    );

    expect(ceremony?.signalMappings.length).toBeGreaterThan(0);
    expect(
      ceremony?.signalMappings.some(
        (mapping) => mapping.signalId === "praise_approval",
      ),
    ).toBe(true);
  });

  it("namespaces catalog and action primitive keys", () => {
    const keys = rewardPunishmentPrimitives.map((primitive) =>
      rewardPunishmentPrimitiveKey(primitive.ref),
    );
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys.some((key) => key.startsWith("catalog:"))).toBe(true);
    expect(keys.some((key) => key.startsWith("action:"))).toBe(true);
  });
});
