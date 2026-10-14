import type {CatalogConcept} from "../services/contracts";
import type {CatalogV2} from "./model";

// Curated aliases from #257/#260. Aliases point at existing identities.
const aliases:Record<string,string[]> = {
 "saint-andrew-s-cross":["Bondage Cross","St. Andrew's Cross"],
 "consensual-non-consent":["CNC"],
};
// Final relationships from #257/#263/#265/#266/#268/#271. These are discovery
// references only; they neither own a concept nor imply a personal preference.
const pairs:readonly (readonly [string,string])[] = [
 ["collars","collaring"],["collars","leash-play"],["pet-roleplay","leash-play"],
 ["pet-roleplay","owner-pet-dynamic"],["pet-roleplay","pet-training"],
 ["pet-training","owner-pet-dynamic"],["pet-training","command-play"],
 ["pet-training","position-training"],["pet-training","task-assignment"],
 ["position-training","verbal-mental-restraint"],["biting","primal-play"],
 ["marking","body-writing"],["marking","impact-play"],["marking","biting"],
 ["electrical-play","wartenberg-wheel"],
];
/** Selective semantic reuse. Compound/local values retain their own meanings. */
const materialConceptIds:Record<string,string>={leather:"leather",metal:"metal"};
export function withReviewedReferenceMetadata(catalog:CatalogV2):CatalogV2 {
 return {...catalog,items:catalog.items.map(item=>({
  ...item,
  aliases:[...new Set([...(item.aliases ?? []),...(aliases[item.id] ?? [])])],
  relatedItemIds:[...new Set([...(item.relatedItemIds ?? []),...pairs.flatMap(([a,b])=>item.id===a?[b]:item.id===b?[a]:[])])],
  groups:item.groups.map(group=>({...group,values:group.values.map(value=>({
   ...value,...(group.id==="material" && materialConceptIds[value.id] ? {conceptId:materialConceptIds[value.id]} : {}),
  }))})),
 }))};
}
/** Retain stable concept IDs from the app foundation, with actual curated links. */
export function curatedConcepts(catalog:CatalogV2):CatalogConcept[] {
 const linked=(id:string)=>catalog.items.filter(item=>item.groups.some(group=>group.values.some(value=>value.conceptId===id))).map(item=>item.id);
 return [
  {id:"ownership",name:"Ownership",description:"Negotiated belonging or authority. A general concept preference remains separate from each Item or expression.",relatedItemIds:["ownership","collars","collaring"]},
  {id:"leather",name:"Leather",description:"A material and cultural concept. Leather preferences remain independently scoped to each Item.",relatedItemIds:linked("leather")},
  {id:"metal",name:"Metal",description:"A material referenced by several equipment Items. A general material rating never sets an equipment modifier rating.",relatedItemIds:linked("metal")},
  {id:"ceremonial",name:"Ceremonial",description:"Deliberate symbolic meaning through a ceremony.",relatedItemIds:["collars","collaring","d-s-contract-ritual"]},
  {id:"trust",name:"Trust",description:"Confidence developed through communication, reliability and respected boundaries.",relatedItemIds:[]},
 ];
}
