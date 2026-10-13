import { describe, expect, it } from "vitest";
import { approvedV1ToV2Slice, approvedV2Slice } from "./approvedSlice";
import { migrateV1Ratings } from "./migration";
import { validateCatalogV2, v2RatingKey } from "./model";
describe("Catalog V2 canonical slice and migration", () => {
  it("validates IDs and non-exclusive browse themes", () => {
    expect(validateCatalogV2(approvedV2Slice)).toEqual([]);
    expect(approvedV2Slice.items[0].themeIds).toHaveLength(2);
  });
  it("migrates approved overall without deriving from modifiers", () => {
    const migrated = migrateV1Ratings({ collars: "Love" }, approvedV1ToV2Slice, approvedV2Slice);
    expect(migrated.ratings[v2RatingKey({kind:"item",itemId:"collars"})]).toBe("Love");
    expect(Object.keys(migrated.ratings)).toHaveLength(1);
  });
  it("keeps unreviewed legacy ratings auditable", () => {
    const migrated = migrateV1Ratings({ unknown: "Like" }, approvedV1ToV2Slice, approvedV2Slice);
    expect(migrated.unresolved).toEqual([{ sourceId: "unknown", reason: "No approved migration decision" }]);
  });
  it("does not silently overwrite conflicting ratings", () => {
    const key = v2RatingKey({kind:"item",itemId:"collars"});
    const migrated = migrateV1Ratings({ collars:"Like" }, approvedV1ToV2Slice, approvedV2Slice, {[key]:"Love"});
    expect(migrated.ratings[key]).toBe("Love");
    expect(migrated.conflicts).toHaveLength(1);
  });
  it("requires a valid scoped refinement destination", () => {
    const decisions = [{sourceId:"leather-collars",outcome:"refinement",targetItemId:"collars",groupId:"material",valueId:"leather"}] as const;
    const migrated = migrateV1Ratings({"leather-collars":"Love"}, [...decisions], approvedV2Slice);
    expect(migrated.ratings[v2RatingKey({kind:"modifier",itemId:"collars",groupId:"material",valueId:"leather"})]).toBe("Love");
  });
});
