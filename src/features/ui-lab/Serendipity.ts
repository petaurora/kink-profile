import type { CatalogConcept, CatalogReferenceData } from "../../services/contracts";

/** Explicitly editorial, gentle Lab examples—not a production eligibility engine. */
export const discoveryTopics = [
  { id: "trust", theme: "Communication", prompt: "How does trust take shape?", teaser: "A look at communication, reliability, and respected boundaries." },
  { id: "ceremonial", theme: "Symbolism", prompt: "When does an ordinary action become a ritual?", teaser: "Explore how intention can give gestures and objects meaning." },
  { id: "ownership", theme: "Symbolism", prompt: "Can the same symbol mean different things?", teaser: "Explore negotiated meaning rather than assumptions about belonging." },
  { id: "leather", theme: "Materials", prompt: "How can a material become a symbol?", teaser: "Discover the difference between an object's material and its significance." },
  { id: "metal", theme: "Materials", prompt: "How do everyday materials acquire meaning?", teaser: "Look at materials as objects, design choices, and cultural references." },
] as const;
export type DiscoveryTopic = typeof discoveryTopics[number];
export type DiscoveryTheme = DiscoveryTopic["theme"];
export const discoveryThemes: DiscoveryTheme[] = ["Communication", "Symbolism", "Materials"];
export const discoveryDismissalId = (id: string) => `discovery:${id}`;

/** A restricted concept or a concept tied to an explicitly limited Item cannot be an ambient surprise. */
export function eligibleDiscoveryTopics(data: CatalogReferenceData, values: Record<string, string | boolean | undefined>, dismissed: string[]): DiscoveryTopic[] {
  const available = new Map(data.concepts.map(concept => [concept.id, concept]));
  return discoveryTopics.filter(topic => {
    const concept = available.get(topic.id);
    return Boolean(concept) && !dismissed.includes(discoveryDismissalId(topic.id))
      && values[`concept:${topic.id}:preference`] !== "Hard Limit"
      && !(concept?.relatedItemIds ?? []).some(id => values[`${id}:overall`] === "Hard Limit");
  });
}

/** Deterministic ambient rotation; no history, inferred affinity, or per-user ranking. */
export function ambientTopic(topics: DiscoveryTopic[], day: number): DiscoveryTopic | undefined {
  return topics.length ? topics[((day % topics.length) + topics.length) % topics.length] : undefined;
}

/** Never loop back through viewed suggestions just to keep someone engaged. */
export function nextDiscoveryTopic(topics: DiscoveryTopic[], seen: string[], seed = 0, theme: DiscoveryTheme | null = null): DiscoveryTopic | undefined {
  const candidates = topics.filter(topic => !seen.includes(topic.id) && (!theme || topic.theme === theme));
  return candidates.length ? candidates[((seed % candidates.length) + candidates.length) % candidates.length] : undefined;
}

export type ExplainedConnection = {
  concept: CatalogConcept;
  sharedItem: { id: string; name: string };
  insight: string;
};

/**
 * Deliberately authored editorial lenses for the Lab. They are NOT claimed to
 * be canonical concept-to-concept edges. Every lens must also be supported by
 * the actual shared canonical Item reference loaded from the service.
 */
const editorialLenses = [
  {
    ids: ["ceremonial", "ownership"], via: "collars",
    insight: "A negotiated symbol can also become part of a ritual. The agreement and the ceremony carry different kinds of meaning.",
  },
  {
    ids: ["ceremonial", "leather"], via: "collars",
    insight: "An object's material and its ceremonial significance are two different lenses on the very same object.",
  },
  {
    ids: ["leather", "metal"], via: "collars",
    insight: "The same kind of object can use different materials. How might its texture or symbolism change?",
  },
] as const;

/** Display only reviewed editorial lenses with actual canonical reference evidence. */
export function explainedConnections(id: string, data: CatalogReferenceData, topics: DiscoveryTopic[], values: Record<string, string | boolean | undefined>): ExplainedConnection[] {
  const source = data.concepts.find(concept => concept.id === id);
  if (!source) return [];
  const allowed = new Set<string>(topics.map(topic => topic.id));
  return editorialLenses.filter(lens => lens.ids.some(value => value === id)).flatMap(lens => {
    const otherId = lens.ids.find(value => value !== id);
    if (!otherId || !allowed.has(otherId)) return [];
    const concept = data.concepts.find(entry => entry.id === otherId);
    const sharedItem = data.items.find(item => item.id === lens.via);
    if (!concept || !sharedItem || values[`${sharedItem.id}:overall`] === "Hard Limit") return [];
    if (!source.relatedItemIds?.includes(sharedItem.id) || !concept.relatedItemIds?.includes(sharedItem.id)) return [];
    return [{ concept, sharedItem: { id: sharedItem.id, name: sharedItem.name }, insight: lens.insight }];
  });
}
