import type { CatalogReferenceData, SearchQuery, SearchResult } from "./contracts";
export function normalizeSearch(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
/** Names permit partial-word lookup. Hidden metadata requires a word prefix and 3+ characters. */
export function matchesNamedSearch(name:string,metadata:string,query:string){
  const title=normalizeSearch(name);
  const words=normalizeSearch(metadata).split(" ");
  return normalizeSearch(query).split(" ").filter(Boolean).every(term=>title.includes(term)||(term.length>=3&&words.some(word=>word.startsWith(term))));
}
export function matchesSearch(text: string, query: string) {
  const searchable = normalizeSearch(text);
  return normalizeSearch(query).split(" ").filter(Boolean).every(word => searchable.includes(word));
}
/** Same reference universe supplies item, exact modifier, and concept result targets. */
export function searchReferenceData(data: CatalogReferenceData, query: SearchQuery): SearchResult[] {
  const results: SearchResult[] = [];
  for (const item of data.items) {
    if (matchesNamedSearch(item.name,[item.description, item.category, ...item.groups.flatMap(g => [g.name, ...g.values.map(v => v.name)])].join(" "), query.text)) {
      results.push({id:`item:${item.id}`, name:item.name, type:"Items", path:item.category, target:{itemId:item.id}});
    }
    for (const group of item.groups) for (const value of group.values) {
      if (matchesNamedSearch(value.name,[group.name,item.name].join(" "),query.text)) {
        results.push({id:`modifier:${item.id}:${group.id}:${value.id}`, name:value.name, type:"Modifiers", path:`${item.name} → ${group.name}`, target:{itemId:item.id,groupId:group.id,valueId:value.id}});
      }
    }
  }
  for (const concept of data.concepts) if (matchesNamedSearch(concept.name,concept.description,query.text)) {
    results.push({id:`concept:${concept.id}`,name:concept.name,type:"Concepts",path:"Concept Explorer",target:{conceptId:concept.id}});
  }
  const needle=normalizeSearch(query.text);
  return results.filter(result=>!query.type||query.type===result.type).map(result=>({...result,score:normalizeSearch(result.name)===needle?3:normalizeSearch(result.name).startsWith(needle)?2:1})).sort((a,b)=>query.sort==="az"?a.name.localeCompare(b.name):query.sort==="za"?b.name.localeCompare(a.name):b.score-a.score||a.name.localeCompare(b.name)||a.path.localeCompare(b.path));
}
