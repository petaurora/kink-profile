import { describe, expect, it } from "vitest";
import { reviewedBatch1Decisions, reviewedCatalogExpansion } from "./reviewedExpansion";
import { approvedV2Slice } from "./approvedSlice";
import { validateCatalogV2 } from "./model";
import { migrateV1Ratings } from "./migration";
import { labReferenceData } from "../features/ui-lab/services/fixtures";

describe("reviewed V2 expansion", () => {
 it("has consistent item, theme, group and value references", () => {
  expect(validateCatalogV2(reviewedCatalogExpansion)).toEqual([]);
 });
 it("routes curated source rows to valid targets", () => {
  const catalog = {
   schemaVersion: 2 as const,
   items: [...approvedV2Slice.items, ...reviewedCatalogExpansion.items],
   themes: [...approvedV2Slice.themes.filter(t=>t.id !== "equipment"), ...reviewedCatalogExpansion.themes],
  };
  const input = Object.fromEntries(reviewedBatch1Decisions.map(d=>[d.sourceId,"Like" as const]));
  const report = migrateV1Ratings(input, reviewedBatch1Decisions, catalog);
  expect(report.unresolved).toEqual([]);
  expect(report.conflicts).toEqual([]);
  expect(report.applied).toHaveLength(reviewedBatch1Decisions.length);
 });
 it("makes approved Batch 17 and 18 Items available through the Lab service source", () => {
  expect(labReferenceData.items.find(i=>i.id==="orgasm-control")?.groups.map(g=>g.name)).toEqual(["Direction","Method"]);
  expect(labReferenceData.items.find(i=>i.id==="anal-penetration")?.groups[0].values).toHaveLength(3);
  expect(labReferenceData.items.find(i=>i.id==="chastity")?.groups[0].name).toBe("Material");
 });
});
