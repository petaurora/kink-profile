import { legacyCatalogIds } from "./legacyCatalogIds";
import { verifiedSourceDecisions, verifiedImpactDecisions } from "./verifiedSourceDecisions";
import { describe, expect, it } from "vitest";
import { approvedV1ToV2Slice, approvedV2Slice } from "./approvedSlice";
import { reviewedBatch1Decisions, reviewedCatalogExpansion } from "./reviewedExpansion";
import { additionalReviewedCatalog } from "./additionalReviewed";
import { migrateV1Ratings } from "./migration";
import type { CatalogV2 } from "./model";

/** The original V1 source of record has 551 entries; never call the migration complete based on rendered count. */
const sourceIds: string[] = [...legacyCatalogIds];
const merged: CatalogV2={
 schemaVersion:2,
 items:[...new Map([...approvedV2Slice.items,...reviewedCatalogExpansion.items,...additionalReviewedCatalog.items].map(i=>[i.id,i])).values()],
 themes: [...approvedV2Slice.themes,...reviewedCatalogExpansion.themes,...additionalReviewedCatalog.themes],
};
const decisions=[...approvedV1ToV2Slice,...reviewedBatch1Decisions,...verifiedSourceDecisions,...verifiedImpactDecisions];

describe("V1 source coverage audit (#292)",()=>{
 it("reads unique stable IDs from every original source row",()=>{
  expect(sourceIds).toHaveLength(551);
  expect(new Set(sourceIds).size).toBe(sourceIds.length);
 });
 it("never silently treats unmapped rows as migrated",()=>{
  const input=Object.fromEntries(sourceIds.map(id=>[id,"Unsure" as const]));
  const report=migrateV1Ratings(input,decisions,merged);
  expect(report.applied.length+report.unresolved.length+report.conflicts.length).toBe(sourceIds.length);
  expect(report.unresolved.length).toBeGreaterThan(0); // Gate must change when the approved ledger is complete.
  for(const mapped of report.applied)expect(sourceIds).toContain(mapped);
 });
 it("all newly verified source mappings exist and target approved Items/refinements",()=>{
  const input=Object.fromEntries(verifiedSourceDecisions.map(d=>[d.sourceId,"Like" as const]));
  const result=migrateV1Ratings(input,verifiedSourceDecisions,merged);
  expect(result.unresolved).toEqual([]);
  expect(result.conflicts).toEqual([]);
  expect(result.applied).toHaveLength(verifiedSourceDecisions.length);
  for(const decision of verifiedSourceDecisions)expect(sourceIds).toContain(decision.sourceId);
 });
 it("applies approved impact migrations and records unresolved legacy rows",()=>{
  const input=Object.fromEntries(verifiedImpactDecisions.map(d=>[d.sourceId,"Like" as const]));
  const result=migrateV1Ratings(input,verifiedImpactDecisions,merged);
  expect(result.conflicts).toEqual([]);
  expect(result.unresolved.map(x=>x.sourceId).sort()).toEqual(["punishment-style-impact","targeted-impact"]);
  expect(result.applied.length).toBe(verifiedImpactDecisions.length-2);
  for(const d of verifiedImpactDecisions)expect(sourceIds).toContain(d.sourceId);
 });
 it("every migration decision names a real V1 source identifier",()=>{
  for(const decision of decisions)expect(sourceIds,`Unexpected V1 source ID: ${decision.sourceId}`).toContain(decision.sourceId);
 });
 it("all explicit Batch 1 mappings correspond to actual legacy rows",()=>{
  for(const decision of reviewedBatch1Decisions)expect(sourceIds).toContain(decision.sourceId);
 });
});
