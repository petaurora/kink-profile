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
export type CatalogConcept = { id: string; name: string; description: string; relatedItemIds?:string[] };
export type CatalogReferenceData = {
  items: CatalogItem[]; subjects: CatalogSubject[]; concepts: CatalogConcept[];
};
export type PreferenceTarget =
  | { kind: "item"; itemId: string }
  | { kind: "modifier"; itemId: string; groupId: string; valueId: string }
  | { kind: "concept"; conceptId:string };
/** Tuple encoding avoids collisions between labels, groups and overall values. */
export function ratingKey(target: PreferenceTarget): string {
  return JSON.stringify(target.kind === "item"
    ? ["item", target.itemId]
    : target.kind === "modifier" ? ["modifier", target.itemId, target.groupId, target.valueId] : ["concept",target.conceptId]);
}
export type ComfortValue = "uncomfortable" | "somewhat_comfortable" | "comfortable";
export type ExperienceValue = true | ComfortValue;
export type PreferenceSnapshot = {
  ratings: Record<string, PreferenceRating>;
  classifications: Record<string, Classification>;
  experience?:Record<string,{tried?:true;comfort?:ComfortValue}>;
};
export type CatalogSearchTarget = { itemId: string; groupId?: string; valueId?: string };
export type SearchResult = {
  id: string; name: string; type: "Items" | "Modifiers" | "Concepts"; path: string;
  target: CatalogSearchTarget | { conceptId: string };
  score?:number;
};
export type SearchQuery = { text: string; type?: SearchResult["type"]; sort?: "default" | "az" | "za" };
/** Stable Education identity is not a file path or display title. The UI only consumes this service contract. */
export type EducationSection = "Understanding BDSM" | "Consent and scenes" | "Kinks, roles, and motivation" | "Relationship structures" | "Collars, symbols, and rituals" | "Practices & safety";
export type EducationLink = {
  target: { kind:"article"|"catalog-item"|"concept"; id:string };
  relation: "further-reading"|"discusses"|"explains";
};
export type EducationArticleSummary = {
  id:string; slug:string; title:string; description:string; section:EducationSection;
  level:"Beginner"|"Beginner–Intermediate"; readingMinutes:number; version:string;
  links:EducationLink[];
};
export type EducationArticle = EducationArticleSummary & { markdown:string };
export interface EducationService {
  listArticles(options?:RequestOptions):Promise<EducationArticleSummary[]>;
  getArticle(id:string, options?:RequestOptions):Promise<EducationArticle|null>;
}

export interface AppServices {
  /** Optional until all injected adapters implement the Education capability. No silent fixture fallback. */
  education?: EducationService;
  catalog: { getReferenceData(options?: RequestOptions): Promise<CatalogReferenceData> };
  search: { search(query: SearchQuery, options?: RequestOptions): Promise<SearchResult[]> };
  preferences: {
    getSnapshot(options?: RequestOptions): Promise<PreferenceSnapshot>;
    setExperience(itemId:string,field:"tried"|"comfort",value:ExperienceValue|undefined,options?:RequestOptions):Promise<void>;
    setRating(target: PreferenceTarget, value: PreferenceRating | undefined, options?: RequestOptions): Promise<void>;
  };
}
export class ServiceError extends Error {
  constructor(public readonly code: "unavailable" | "invalid-target" | "invalid-value", message: string) {
    super(message);
    this.name = "ServiceError";
  }
}
