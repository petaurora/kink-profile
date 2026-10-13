import { describe,expect,it } from "vitest";
import { fullSourceDisposition,sourceDispositionCounts,verifiedMigrationDecisions,planLosslessV1Migration } from "./fullSourceDisposition";
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
 it("all approved executable targets exist in the canonical V2 model",()=>{
  const rejected:string[]=[];
  for(const decision of verifiedMigrationDecisions){
   if(decision.outcome==="review"||decision.outcome==="exclude")continue;
   const report=migrateV1Ratings({[decision.sourceId]:"Like"},[decision],catalog);
   if(report.unresolved.length||report.conflicts.length||report.applied.length!==1)rejected.push(`${decision.sourceId}: ${report.unresolved.map(x=>x.reason).join(", ")}`);
  }
  expect(rejected).toEqual([]);
 });
 it("keeps all unapplied legacy ratings, including excluded and conflicting IDs, in a sidecar",()=>{
  const original=Object.fromEntries(legacyCatalogIds.map(id=>[id,"Like" as const]));
  const plan=planLosslessV1Migration(original,catalog);
  const applied=new Set(plan.applied);
  expect(Object.keys(plan.retainedLegacyRatings).length+applied.size).toBe(551);
  for(const sourceId of legacyCatalogIds)
   expect(applied.has(sourceId)||Object.hasOwn(plan.retainedLegacyRatings,sourceId)).toBe(true);
  expect(plan.retainedLegacyRatings["praise-kink"]).toBe("Like");
  const direct=verifiedMigrationDecisions.find(d=>d.outcome==="item");
  if(direct?.outcome==="item"){
   const key=JSON.stringify(["item",direct.targetItemId]);
   const conflict=planLosslessV1Migration({[direct.sourceId]:"Not Interested"},catalog,{[key]:"Love"});
   expect(conflict.ratings[key]).toBe("Love");
   expect(conflict.retainedLegacyRatings[direct.sourceId]).toBe("Not Interested");
  }
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
