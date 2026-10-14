import { v2RatingKey, type CatalogV2, type CatalogV2Target } from "./model";
import type { PreferenceRating } from "../services/contracts";

/** Deliberate migration outcomes: unresolved rows stay visible in the report. */
export type MigrationDecision =
  | { sourceId: string; outcome: "item"; targetItemId: string }
  | { sourceId: string; outcome: "refinement"; targetItemId: string; groupId: string; valueId: string }
  | { sourceId: string; outcome: "alias" | "merge"; targetItemId: string }
  | { sourceId: string; outcome: "exclude"; reason: string }
  | { sourceId: string; outcome: "review"; reason: string };
export type MigrationReport = {
  ratings: Record<string, PreferenceRating>;
  applied: string[];
  unresolved: { sourceId: string; reason: string }[];
  conflicts: {
    sourceId: string; targetKey: string; incoming: PreferenceRating;
    reason: "incoming-sources" | "existing-v2";
    existing?: PreferenceRating;
    /** Every incoming source involved in a contested target, in stable ID order. */
    sourceIds: string[];
  }[];
};

export function migrateV1Ratings(
  legacyRatings: Record<string, PreferenceRating>,
  decisions: MigrationDecision[],
  catalog: CatalogV2,
  existing: Record<string, PreferenceRating> = {},
): MigrationReport {
  const ratings = { ...existing }, applied: string[] = [];
  const unresolved: MigrationReport["unresolved"] = [], conflicts: MigrationReport["conflicts"] = [];
  const bySource = new Map<string, MigrationDecision[]>();
  for (const d of decisions) bySource.set(d.sourceId, [...(bySource.get(d.sourceId) ?? []), d]);
  const byTarget = new Map<string, {sourceId:string; incoming:PreferenceRating}[]>();
  for (const [sourceId, incoming] of Object.entries(legacyRatings).sort(([a],[b])=>a.localeCompare(b))) {
    const candidates = bySource.get(sourceId) ?? [];
    if (candidates.length !== 1) { unresolved.push({ sourceId, reason: candidates.length ? "Conflicting migration decisions" : "No approved migration decision" }); continue; }
    const d = candidates[0];
    if (d.outcome === "review" || d.outcome === "exclude") {
      unresolved.push({ sourceId, reason: d.outcome === "review" ? d.reason : `Excluded: ${d.reason}` }); continue;
    }
    const item = catalog.items.find(i => i.id === d.targetItemId);
    if (!item) { unresolved.push({ sourceId, reason: "Target Item not found" }); continue; }
    let target: CatalogV2Target;
    if (d.outcome === "refinement") {
      if (!item.groups.find(g => g.id === d.groupId)?.values.some(v => v.id === d.valueId)) {
        unresolved.push({ sourceId, reason: "Target refinement not found" }); continue;
      }
      target = { kind: "modifier", itemId: item.id, groupId: d.groupId, valueId: d.valueId };
    } else target = { kind: "item", itemId: item.id };
    const key = v2RatingKey(target);
    byTarget.set(key,[...(byTarget.get(key) ?? []),{sourceId,incoming}]);
  }
  // Inspect all incoming evidence before assigning a merged target. Input object
  // order must never choose a preference or weaken a source Hard Limit.
  for (const [targetKey, sources] of byTarget) {
    const sourceIds=sources.map(source=>source.sourceId);
    if (new Set(sources.map(source=>source.incoming)).size > 1) {
      for (const {sourceId,incoming} of sources) conflicts.push({
        sourceId,targetKey,incoming,reason:"incoming-sources",sourceIds,
        ...(existing[targetKey] !== undefined ? {existing:existing[targetKey]} : {}),
      });
      continue;
    }
    const incoming=sources[0].incoming;
    if (existing[targetKey] !== undefined && existing[targetKey] !== incoming) {
      for (const {sourceId} of sources) conflicts.push({sourceId,targetKey,existing:existing[targetKey],incoming,reason:"existing-v2",sourceIds});
      continue;
    }
    ratings[targetKey] = incoming;
    applied.push(...sourceIds);
  }
  return { ratings, applied, unresolved, conflicts };
}
