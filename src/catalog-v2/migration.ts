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
  conflicts: { sourceId: string; targetKey: string; existing: PreferenceRating; incoming: PreferenceRating }[];
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
  for (const [sourceId, incoming] of Object.entries(legacyRatings)) {
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
    if (ratings[key] !== undefined && ratings[key] !== incoming) {
      conflicts.push({ sourceId, targetKey: key, existing: ratings[key], incoming }); continue;
    }
    ratings[key] = incoming;
    applied.push(sourceId);
  }
  return { ratings, applied, unresolved, conflicts };
}
