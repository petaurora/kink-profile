import type { CatalogReferenceData, CatalogItem } from "../services/contracts";
import type { CatalogV2 } from "./model";

/** Boundary adapter: canonical taxonomy -> stable app-facing service DTOs.
 * UI consumers must depend only on CatalogReferenceData, never on migration files.
 * This adapter can be replaced by an API implementation of AppServices.catalog.
 */
export function toAppCatalogItems(catalog: CatalogV2, existing: CatalogItem[] = []): CatalogItem[] {
 const byId = new Map<string,CatalogItem>(existing.map(item=>[item.id,item]));
 for(const v2 of catalog.items) {
   const previous=byId.get(v2.id);
   const category=catalog.themes.find(theme=>v2.themeIds.includes(theme.id))?.name ?? previous?.category ?? "Catalog V2";
   byId.set(v2.id,{
     id:v2.id,name:v2.name,description:v2.description ?? previous?.description,category,
     themeIds:[...new Set([...(previous?.themeIds ?? []),...v2.themeIds])],
     aliases:[...new Set([...(previous?.aliases ?? []),...(v2.aliases ?? [])])],
     relatedItemIds:[...new Set([...(previous?.relatedItemIds ?? []),...(v2.relatedItemIds ?? [])])],
     pendingGroupIds:[...new Set([...(previous?.pendingGroupIds ?? []),...(v2.pendingGroupIds ?? [])])].filter(id=>!v2.groups.some(group=>group.id===id)),
     groups:v2.groups.map(g=>({id:g.id,name:g.name,values:g.values.map(v=>({...v}))})),
     collections:v2.collections ?? previous?.collections ?? ["kinks"],
   });
 }
 return [...byId.values()];
}
export function replaceReferenceCatalog(base:CatalogReferenceData, catalog:CatalogV2):CatalogReferenceData {
 const items=toAppCatalogItems(catalog,base.items);
 const subjects=[...base.subjects];
 for(const theme of catalog.themes) {
  const subject={id:theme.id,name:theme.name,description:theme.description,itemIds:theme.itemIds};
  const index=subjects.findIndex(s=>s.id===theme.id);
  if(index>=0) subjects[index]={...subjects[index],...subject};
  else subjects.push(subject);
 }
 // Canonical Item membership owns the inverse subject index. This prevents a
 // later slice's Equipment definition from deleting earlier members.
 const composedSubjects=subjects.map(subject=>({...subject,itemIds:[...new Set([
   ...subject.itemIds.filter(id=>{
     const item=items.find(item=>item.id===id);
     return item && (!item.themeIds || item.themeIds.includes(subject.id));
   }),
   ...items.filter(item=>item.themeIds?.includes(subject.id)).map(item=>item.id),
 ])]}));
 return {...base,items,subjects:composedSubjects};
}
