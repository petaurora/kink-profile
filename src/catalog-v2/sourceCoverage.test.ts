import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { approvedV1ToV2Slice, approvedV2Slice } from "./approvedSlice";
import { reviewedBatch1Decisions, reviewedCatalogExpansion } from "./reviewedExpansion";
import { additionalReviewedCatalog } from "./additionalReviewed";
import { migrateV1Ratings } from "./migration";
import type { CatalogV2 } from "./model";

/** The original V1 source of record has 551 entries; never call the migration complete based on rendered count. */
const source = readFileSync(new URL("../../reference/catalog/kink-catalog.tsv",import.meta.url),"utf8");
const [header,...records] = source.trimEnd().split(/\r?\n/);
const idColumn=header.split("\t").indexOf("Catalog ID");
const sourceIds=records.map(row=>row.split("\t")[idColumn]);
const merged: CatalogV2={
 schemaVersion:2,
 items:[...new Map([...approvedV2Slice.items,...reviewedCatalogExpansion.items,...additionalReviewedCatalog.items].map(i=>[i.id,i])).values()],
 themes: [...approvedV2Slice.themes,...reviewedCatalogExpansion.themes,...additionalReviewedCatalog.themes],
};
const decisions=[...approvedV1ToV2Slice,...reviewedBatch1Decisions];

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
 it("all explicit Batch 1 mappings correspond to actual legacy rows",()=>{
  for(const decision of reviewedBatch1Decisions)expect(sourceIds).toContain(decision.sourceId);
 });
});
