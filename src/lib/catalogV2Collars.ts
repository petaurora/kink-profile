import type { CatalogPreferenceState } from "./catalogProfile";

/** Approved in Catalog V2 Batch 2 (#257). Groups are structural, values rate independently. */
export const collarsV2 = {
  id: "collars",
  label: "Collars",
  description: "Interest in collars as objects, their form, use, and personal meaning.",
  groups: [
    { id: "use", label: "Use / context", values: [
      ["play-scene", "Play / scene"], ["day-everyday", "Day / everyday"], ["ceremonial-formal", "Ceremonial / formal"],
    ] },
    { id: "form", label: "Function / form", values: [
      ["posture-restrictive", "Posture / restrictive"], ["choker-necklace", "Choker / necklace-style"],
    ] },
    { id: "material", label: "Material", values: [
      ["leather", "Leather"], ["metal", "Metal"], ["fabric-textile", "Fabric / textile"], ["synthetic-silicone", "Synthetic / silicone"],
    ] },
    { id: "features", label: "Features", values: [
      ["locking", "Locking"], ["rigid-semirigid", "Rigid / semi-rigid"], ["attachment-point", "Leash / attachment point"], ["tag-plate", "Tag / plate"], ["discreet", "Discreet / public-wearable"],
    ] },
    { id: "meaning", label: "Meaning / symbolism", values: [
      ["ownership-belonging", "Ownership / belonging"], ["submission-service", "Submission / service"], ["protocol", "Protocol"], ["pet-symbolism", "Pet-role symbolism"], ["commitment-devotion", "Commitment / devotion"], ["ritual-ceremony", "Ritual / ceremony"], ["fashion-aesthetic", "Fashion / aesthetic"],
    ] },
  ],
} as const;

export type CollarsV2Ratings = Record<string, CatalogPreferenceState>;
export const COLLARS_V2_STORAGE_KEY = "kink-profile:catalog-v2:collars-pilot:v1";
export function collarsModifierKey(groupId: string, valueId: string) {
  return `collars:${groupId}:${valueId}`;
}
export function parseCollarsV2Ratings(raw: string | null): CollarsV2Ratings {
  if (!raw) return {};
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    const validKeys = new Set(collarsV2.groups.flatMap((group) =>
      group.values.map(([id]) => collarsModifierKey(group.id, id))));
    const validStates = new Set<string>(["love", "like", "curious", "unsure", "not_interested", "hard_limit", "not_applicable"]);
    return Object.fromEntries(Object.entries(value).filter(([key, state]) =>
      validKeys.has(key) && typeof state === "string" && validStates.has(state))) as CollarsV2Ratings;
  } catch { return {}; }
}
