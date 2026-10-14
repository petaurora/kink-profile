import type { CatalogReferenceData, SearchQuery, SearchResult } from "./contracts";
export function normalizeSearch(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
export function matchesSearch(text: string, query: string) {
  const searchable = normalizeSearch(text);
  return normalizeSearch(query).split(" ").filter(Boolean).every(word => searchable.includes(word));
}
export type SearchField = { label: string; text: string };
export type SearchMatch = { score: number; fields: SearchField[] };
/** All terms may match any text; direct name matches rank above supporting fields. */
export function getSearchMatch(name: string, fields: SearchField[], query: string): SearchMatch | null {
  const needle = normalizeSearch(query);
  if (!needle) return { score: 0, fields: [] };
  const title = normalizeSearch(name);
  const terms = needle.split(" ");
  if (!matchesSearch([name, ...fields.map(field => field.text)].join(" "), needle)) return null;
  const missing = terms.filter(term => !title.includes(term));
  const score = title === needle ? 4 : title.startsWith(needle) ? 3 : missing.length === 0 ? 2 : 1;
  return { score, fields: fields.filter(field => missing.some(term => normalizeSearch(field.text).includes(term))) };
}
type SearchableItem = {
  name: string; category: string; description?: string;
  aliases?:string[]; modifierAliases?:string[];
  groups: { name: string; values: readonly (string | { name: string; aliases?:string[] })[] }[];
};
export function getItemSearchMatch(item: SearchableItem, query: string) {
  return getSearchMatch(item.name, [
    { label: "description", text: item.description ?? "" },
    { label: "category", text: item.category },
    { label: "aliases", text: (item.aliases ?? []).join(", ") },
    { label: "modifier aliases", text: (item.modifierAliases ?? []).join(", ") },
    ...item.groups.map(group => ({ label: "modifiers", text: `${group.name}: ${group.values.map(value => typeof value === "string" ? value : value.name).join(", ")}` })),
    ...item.groups.flatMap(group=>group.values.flatMap(value=>typeof value==="string"||!value.aliases?.length?[]:[{label:"modifier aliases",text:value.aliases.join(", ")}])) ,
  ], query);
}
/** Keep a short excerpt around the matching words, rather than exposing an opaque hit. */
export function searchMatchExplanation(match: SearchMatch | null, query: string) {
  const terms = normalizeSearch(query).split(" ");
  return match?.fields.map(field => {
    const words = field.text.split(/\s+/);
    const index = words.findIndex(word => terms.some(term => normalizeSearch(word).includes(term)));
    const start = Math.max(0, index - 2), end = Math.min(words.length, start + 12);
    const excerpt = `${start ? "…" : ""}${words.slice(start, end).join(" ")}${end < words.length ? "…" : ""}`;
    return `Matched ${field.label}: “${excerpt}”`;
  }).join(" · ") || undefined;
}
/** Same reference universe supplies item, exact modifier, and concept result targets. */
export function searchReferenceData(data: CatalogReferenceData, query: SearchQuery): SearchResult[] {
  const results: SearchResult[] = [];
  for (const item of data.items) {
    const match = getItemSearchMatch(item, query.text);
    if (match) {
      results.push({id:`item:${item.id}`, name:item.name, type:"Items", path:item.category, target:{itemId:item.id},score:match.score});
    }
    for (const group of item.groups) for (const value of group.values) {
      const concept = data.concepts.find(concept => concept.id === value.conceptId);
      const match = getSearchMatch(value.name, [
        {label:"item",text:item.name}, {label:"modifier group",text:group.name},
        {label:"category",text:item.category}, {label:"description",text:item.description ?? ""},
        {label:"concept",text:concept ? `${concept.name} ${concept.description}` : ""},
        {label:"aliases",text:[...(value.aliases ?? []),...(item.aliases ?? [])].join(", ")},
      ], query.text);
      if (match) {
        results.push({id:`modifier:${item.id}:${group.id}:${value.id}`, name:value.name, type:"Modifiers", path:`${item.name} → ${group.name}`, target:{itemId:item.id,groupId:group.id,valueId:value.id},score:match.score});
      }
    }
  }
  for (const concept of data.concepts) {
    const match = getSearchMatch(concept.name, [
      {label:"description",text:concept.description},
      {label:"related Items",text:(concept.relatedItemIds ?? []).map(id => data.items.find(item => item.id === id)?.name ?? "").join(" ")},
    ], query.text);
    if (match) results.push({id:`concept:${concept.id}`,name:concept.name,type:"Concepts",path:"Concept Explorer",target:{conceptId:concept.id},score:match.score});
  }
  return results.filter(result=>!query.type||query.type===result.type).sort((a,b)=>query.sort==="az"?a.name.localeCompare(b.name):query.sort==="za"?b.name.localeCompare(a.name):(b.score??0)-(a.score??0)||a.name.localeCompare(b.name)||a.path.localeCompare(b.path));
}
