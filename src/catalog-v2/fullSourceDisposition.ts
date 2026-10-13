import { legacyCatalogIds } from "./legacyCatalogIds";
import { approvedV1ToV2Slice } from "./approvedSlice";
import { reviewedBatch1Decisions } from "./reviewedExpansion";
import { verifiedImpactDecisions, verifiedSourceDecisions } from "./verifiedSourceDecisions";
import type { MigrationDecision } from "./migration";

/** Exact source coverage with honest, explicit dispositions.
 * REVIEW IS NOT MIGRATION: uncurated source IDs cannot create a V2 rating.
 * Additional approvals must replace 'review' with a verified decision and
 * retain provenance. Never derive targets from matching names.
 */
export const verifiedMigrationDecisions: MigrationDecision[] = [
  ...approvedV1ToV2Slice, ...reviewedBatch1Decisions,
  ...verifiedSourceDecisions, ...verifiedImpactDecisions,
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
