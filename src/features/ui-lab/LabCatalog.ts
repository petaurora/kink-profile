import type { CatalogReferenceData, CatalogItem } from "../../services/contracts";
import { matchesNamedSearch, normalizeSearch } from "../../services/search";
import { useOptionalServiceData } from "../../services/AppServicesProvider";
import { labReferenceData, labInitialPreferences } from "./services/fixtures";
export type Item={id:string;name:string;category:string;description?:string;groups:{name:string;values:string[]}[]};
export function toLabItems(data:CatalogReferenceData):Item[]{return data.items.map(item=>({...item,groups:item.groups.map(group=>({name:group.name,values:group.values.map(value=>value.name)}))}));}
export function toLabConcepts(data:CatalogReferenceData){return data.concepts.map(concept=>({...concept,related:(concept.relatedItemIds??[]).map(id=>data.items.find(item=>item.id===id)?.name).filter((name):name is string=>Boolean(name))}));}
export const items=toLabItems(labReferenceData);
export const catalogSeeds=Object.fromEntries([...new Set(items.map(item=>item.category))].map(category=>[category,items.filter(item=>item.category===category).map(item=>item.name)]));
export const normalizedSearch=normalizeSearch;
export function matchesCatalogSearch(item:Item,query:string){return matchesNamedSearch(item.name,[item.description||"",item.category,...item.groups.flatMap(group=>[group.name,...group.values])].join(" "),query);}
export function useLabCatalog(){const loaded=useOptionalServiceData();const data=loaded?.referenceData??labReferenceData;return {data,items:toLabItems(data),concepts:toLabConcepts(data),classifications:(loaded?.snapshot??labInitialPreferences).classifications,catalogSeeds:Object.fromEntries([...new Set(data.items.map(item=>item.category))].map(category=>[category,[]]))};}
