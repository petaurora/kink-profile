import { items, normalizedSearch } from "./LabCatalog";

export const concepts = [
  { id: "ownership", name: "Ownership", description: "A negotiated concept of belonging or authority. Meaning depends on explicit agreements.", related: ["Collars", "Protocol"] },
  { id: "leather", name: "Leather", description: "A material and a broader cultural concept. An item's Leather modifier has its own independent meaning and rating.", related: ["Collars"] },
  { id: "ceremonial", name: "Ceremonial", description: "Actions or objects given deliberate symbolic meaning through a ceremony.", related: ["Collars", "Ceremonies"] },
  { id: "trust", name: "Trust", description: "Confidence developed through communication, reliability and respected boundaries.", related: ["Aftercare", "Protocol"] },
];
export type SearchResult = {
  id: string; name: string; type: "Items" | "Modifiers" | "Concepts"; path: string;
  itemName?: string; group?: string; value?: string; conceptId?: string;
  searchable: string; score?: number;
};
const index: SearchResult[] = [
  ...items.map(item => ({ id: `item:${item.id}`, name: item.name, type: "Items" as const, path: item.category, itemName: item.name, searchable: [item.name, item.description, item.category].join(" ") })),
  ...items.flatMap(item => item.groups.flatMap(group => group.values.map(value => ({ id: `modifier:${item.id}:${group.name}:${value}`, name: value, type: "Modifiers" as const, path: `${item.name} → ${group.name}`, itemName: item.name, group: group.name, value, searchable: [value, item.name, group.name].join(" ") })))),
  ...concepts.map(concept => ({ id: `concept:${concept.id}`, name: concept.name, type: "Concepts" as const, path: "Concept Explorer", conceptId: concept.id, searchable: [concept.name, concept.description].join(" ") })),
];
export function searchCatalog(query: string): SearchResult[] {
  const normalized = normalizedSearch(query);
  const words = normalized.split(" ").filter(Boolean);
  if (!words.length) return [];
  return index.filter(result => words.every(word => normalizedSearch(result.searchable).includes(word))).map(result => ({
    ...result, score: normalizedSearch(result.name) === normalized ? 3 : normalizedSearch(result.name).startsWith(normalized) ? 2 : 1,
  })).sort((a,b) => b.score - a.score || a.name.localeCompare(b.name) || a.path.localeCompare(b.path));
}
export function searchSections(results: SearchResult[], type: string, sort: "default" | "az" | "za") {
  const filtered = results.filter(result => type === "All" || result.type === type);
  if (sort !== "default") filtered.sort((a,b) => (sort === "az" ? 1 : -1) * a.name.localeCompare(b.name) || a.path.localeCompare(b.path));
  const best = sort === "default" ? filtered.slice(0,3) : [];
  const ids = new Set(best.map(result => result.id));
  return [
    { label: "Best matches", rows: best },
    ...["Items", "Modifiers", "Concepts"].map(label => ({ label, rows: filtered.filter(result => result.type === label && !ids.has(result.id)) })),
  ].filter(section => section.rows.length);
}
