/** Application-facing contracts. Adapters own transport/storage; React owns presentation. */
export type RequestOptions = { signal?: AbortSignal };
export const preferenceRatings = ["Love", "Like", "Curious", "Unsure", "Not Interested", "Hard Limit", "Not Applicable"] as const;
export type PreferenceRating = typeof preferenceRatings[number];
export type ClassificationAnswer = "yes" | "no" | "unanswered";
export type Classification = { reward: ClassificationAnswer; punishment: ClassificationAnswer };
export type ModifierValue = { id: string; name: string; conceptId?: string };
export type ModifierGroup = { id: string; name: string; values: ModifierValue[] };
export type CatalogItem = {
  id: string;
  name: string;
  category: string;
  description?: string;
  groups: ModifierGroup[];
  collections: ("kinks" | "rewards")[];
};
export type CatalogSubject = {
  id: string; name: string; description: string; itemIds: string[];
  featured?: { symbol: string; tone: string };
};
export type CatalogConcept = { id: string; name: string; description: string };
export type CatalogReferenceData = {
  items: CatalogItem[]; subjects: CatalogSubject[]; concepts: CatalogConcept[];
};
export type PreferenceTarget =
  | { kind: "item"; itemId: string }
  | { kind: "modifier"; itemId: string; groupId: string; valueId: string };
/** Tuple encoding avoids collisions between labels, groups and overall values. */
export function ratingKey(target: PreferenceTarget): string {
  return JSON.stringify(target.kind === "item"
    ? ["item", target.itemId]
    : ["modifier", target.itemId, target.groupId, target.valueId]);
}
export type PreferenceSnapshot = {
  ratings: Record<string, PreferenceRating>;
  classifications: Record<string, Classification>;
};
export type CatalogSearchTarget = { itemId: string; groupId?: string; valueId?: string };
export type SearchResult = {
  id: string; name: string; type: "Items" | "Modifiers" | "Concepts"; path: string;
  target: CatalogSearchTarget | { conceptId: string };
};
export type SearchQuery = { text: string; type?: SearchResult["type"]; sort?: "default" | "az" | "za" };
export interface AppServices {
  catalog: { getReferenceData(options?: RequestOptions): Promise<CatalogReferenceData> };
  search: { search(query: SearchQuery, options?: RequestOptions): Promise<SearchResult[]> };
  preferences: {
    getSnapshot(options?: RequestOptions): Promise<PreferenceSnapshot>;
    setRating(target: PreferenceTarget, value: PreferenceRating | undefined, options?: RequestOptions): Promise<void>;
  };
}
export class ServiceError extends Error {
  constructor(public readonly code: "unavailable" | "invalid-target" | "invalid-value", message: string) {
    super(message);
    this.name = "ServiceError";
  }
}
