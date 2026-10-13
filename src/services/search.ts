import type { CatalogReferenceData, SearchQuery, SearchResult } from "./contracts";
export function normalizeSearch(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
export function matchesSearch(text: string, query: string) {
  const searchable = normalizeSearch(text);
  return normalizeSearch(query).split(" ").filter(Boolean).every(word => searchable.includes(word));
}
/** Same reference universe supplies item, exact modifier, and concept result targets. */
export function searchReferenceData(data: CatalogReferenceData, query: SearchQuery): SearchResult[] {
  const results: SearchResult[] = [];
  for (const item of data.items) {
    if (matchesSearch([item.name, item.description, item.category, ...item.groups.flatMap(g => [g.name, ...g.values.map(v => v.name)])].join(" "), query.text)) {
      results.push({id:`item:${item.id}`, name:item.name, type:"Items", path:item.category, target:{itemId:item.id}});
    }
    for (const group of item.groups) for (const value of group.values) {
      if (matchesSearch([value.name, group.name, item.name].join(" "), query.text)) {
        results.push({id:`modifier:${item.id}:${group.id}:${value.id}`, name:value.name, type:"Modifiers", path:`${item.name} → ${group.name}`, target:{itemId:item.id,groupId:group.id,valueId:value.id}});
      }
    }
  }
  for (const concept of data.concepts) if (matchesSearch(`${concept.name} ${concept.description}`, query.text)) {
    results.push({id:`concept:${concept.id}`,name:concept.name,type:"Concepts",path:"Concept Explorer",target:{conceptId:concept.id}});
  }
  return results.filter(result => !query.type || query.type === result.type).sort((a,b) => query.sort === "az" ? a.name.localeCompare(b.name) : query.sort === "za" ? b.name.localeCompare(a.name) : 0);
}
