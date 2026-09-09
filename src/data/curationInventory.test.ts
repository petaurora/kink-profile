import { describe, expect, it } from "vitest";
import {
  curationInventory,
  curationReviewRubric,
  curationSurfaces,
} from "./curationInventory";

describe("M16 curation inventory", () => {
  it("keeps runtime entity identity unique within each primitive type", () => {
    const keys = curationInventory.map(
      (entry) => `${entry.entityType}:${entry.entityId}`,
    );

    expect(new Set(keys).size).toBe(keys.length);
  });

  it("tracks the required review rubric", () => {
    expect(curationReviewRubric.map((criterion) => criterion.id)).toEqual([
      "distinct",
      "useful",
      "clear",
      "measurable",
      "balanced",
      "mapped-correctly",
      "stable",
      "interaction-cost",
    ]);
  });

  it("inventories the major authored data surfaces", () => {
    const surfaceIds = new Set(curationSurfaces.map((surface) => surface.id));

    expect(surfaceIds.has("quiz-bank")).toBe(true);
    expect(surfaceIds.has("signals")).toBe(true);
    expect(surfaceIds.has("roles-modes")).toBe(true);
    expect(surfaceIds.has("overall-facets")).toBe(true);
    expect(surfaceIds.has("catalog")).toBe(true);
    expect(surfaceIds.has("catalog-pending-additions")).toBe(true);
    expect(surfaceIds.has("reward-punishment-library")).toBe(true);
  });
});
