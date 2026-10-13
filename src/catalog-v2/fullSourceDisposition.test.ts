import { describe,expect,it } from "vitest";
import { fullSourceDisposition,sourceDispositionCounts,verifiedMigrationDecisions } from "./fullSourceDisposition";
import { legacyCatalogIds } from "./legacyCatalogIds";
import { migrateV1Ratings } from "./migration";
import { approvedV2Slice } from "./approvedSlice";
import { reviewedCatalogExpansion } from "./reviewedExpansion";
import { additionalReviewedCatalog } from "./additionalReviewed";
import type { CatalogV2 } from "./model";

const catalog:CatalogV2={schemaVersion:2,items:[...new Map(
 [...approvedV2Slice.items,...reviewedCatalogExpansion.items,...additionalReviewedCatalog.items]
 .map(item=>[item.id,item])).values()],
 themes:[...approvedV2Slice.themes,...reviewedCatalogExpansion.themes,...additionalReviewedCatalog.themes]};
describe("complete, loss-auditable V1 source disposition",()=>{
 it("accounts for all 551 source IDs exactly once in original order",()=>{
  expect(fullSourceDisposition.map(d=>d.sourceId)).toEqual([...legacyCatalogIds]);
  expect(sourceDispositionCounts.total).toBe(551);
  expect(sourceDispositionCounts.confirmed+sourceDispositionCounts.pending).toBe(551);
  expect(new Set(verifiedMigrationDecisions.map(d=>d.sourceId)).size).toBe(verifiedMigrationDecisions.length);
 });
 it("never claims unreviewed records migrated or invents ratings",()=>{
  const input=Object.fromEntries(legacyCatalogIds.map(id=>[id,"Like" as const]));
  const report=migrateV1Ratings(input,fullSourceDisposition,catalog);
  expect(report.applied.length+report.unresolved.length+report.conflicts.length).toBe(551);
  expect(report.unresolved.length).toBeGreaterThan(0);
  expect(report.conflicts).toEqual([]);
  const tracked=new Set([...report.applied,...report.unresolved.map(x=>x.sourceId),...report.conflicts.map(x=>x.sourceId)]);
  expect(tracked.size).toBe(551);
 });
 it("preserves existing preferences on collisions and reports their source",()=>{
  const source=verifiedMigrationDecisions.find(d=>d.outcome==="item");
  expect(source).toBeDefined();
  if(!source||source.outcome!=="item") return;
  const key=JSON.stringify(["item",source.targetItemId]);
  const report=migrateV1Ratings({[source.sourceId]:"Not Interested"},fullSourceDisposition,catalog,{[key]:"Love"});
  expect(report.ratings[key]).toBe("Love");
  expect(report.conflicts.some(c=>c.sourceId===source.sourceId)).toBe(true);
 });
});
