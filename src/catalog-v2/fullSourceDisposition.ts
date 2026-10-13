import { legacyCatalogIds } from "./legacyCatalogIds";
import { approvedBatchItemIds } from "./approvedBatchInventory";
import { approvedV1ToV2Slice } from "./approvedSlice";
import { reviewedBatch1Decisions } from "./reviewedExpansion";
import { verifiedImpactDecisions, verifiedSourceDecisions } from "./verifiedSourceDecisions";
import { verifiedReviewBatchDecisions } from "./verifiedReviewBatchDecisions";
import type { MigrationDecision } from "./migration";

/** Exact source coverage with honest, explicit dispositions.
 * REVIEW IS NOT MIGRATION: uncurated source IDs cannot create a V2 rating.
 * Additional approvals must replace 'review' with a verified decision and
 * retain provenance. Never derive targets from matching names.
 */
/** Explicit final outcomes from #261, #263, #265, #272 and #274.
 * These are intentional dispositions, not inferred migrations. */
export const approvedExclusionsAndDeferrals: MigrationDecision[] = [
 {sourceId:"praise-kink",outcome:"review",reason:"Core Praise intentionally deferred to Rewards & Punishments (#261/#262)"},
 ...["good-girl-good-boy-praise","competence-praise","pet-praise","praise-ritual","daily-praise-dynamic"].map(sourceId=>({sourceId,outcome:"exclude" as const,reason:"Granular Praise variants expressly excluded by #261"})),
 {sourceId:"training-dynamic",outcome:"exclude",reason:"Training Dynamic excluded as standalone Item (#263)"},
 {sourceId:"kneeling-endurance",outcome:"exclude",reason:"Kneeling Endurance explicitly excluded (#265)"},
 {sourceId:"tease-and-denial",outcome:"exclude",reason:"Composite Tease and Denial excluded from V2 (#272)"},
 {sourceId:"magic-wand-stimulation",outcome:"exclude",reason:"Standalone Magic-Wand Stimulation removed (#274)"},
];

const sourceLinkedDecisions: MigrationDecision[] = [
  ...approvedV1ToV2Slice, ...reviewedBatch1Decisions,
  ...verifiedSourceDecisions, ...verifiedImpactDecisions,
  ...approvedExclusionsAndDeferrals, ...verifiedReviewBatchDecisions,
];
const explicitSources = new Set(sourceLinkedDecisions.map(d=>d.sourceId));
const explicitlyApprovedItems = new Set(Object.values(approvedBatchItemIds).flat());
/** Strict stable-ID equality to an expressly approved standalone Item.
 * This is NOT similarity matching. Explicit dispositions always take precedence. */
export const identicalApprovedItemDecisions: MigrationDecision[] = legacyCatalogIds
  .filter(sourceId=>explicitlyApprovedItems.has(sourceId) && !explicitSources.has(sourceId))
  .map(sourceId=>({sourceId,outcome:"item",targetItemId:sourceId}));
export const verifiedMigrationDecisions: MigrationDecision[] = [
  ...sourceLinkedDecisions, ...identicalApprovedItemDecisions,
];
const approved = new Map<string, MigrationDecision>();
for (const decision of verifiedMigrationDecisions) {
  if (approved.has(decision.sourceId)) throw new Error(`Duplicate V1 migration decision: ${decision.sourceId}`);
  approved.set(decision.sourceId, decision);
}
const ids = new Set<string>(legacyCatalogIds);
for (const id of approved.keys()) {
  if (!ids.has(id)) throw new Error(`Migration decision refers to absent V1 ID: ${id}`);
}
export const fullSourceDisposition: MigrationDecision[] = legacyCatalogIds.map(sourceId =>
  approved.get(sourceId) ?? {
    sourceId, outcome:"review",
    reason:"Awaiting source-linked final V2 destination review; preserve original rating unchanged",
  },
);
export const sourceDispositionCounts = {
  total:fullSourceDisposition.length,
  confirmed:fullSourceDisposition.filter(d=>d.outcome!=="review").length,
  pending:fullSourceDisposition.filter(d=>d.outcome==="review").length,
  excluded:fullSourceDisposition.filter(d=>d.outcome==="exclude").length,
} as const;
