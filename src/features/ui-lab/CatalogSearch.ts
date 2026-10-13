import type { CatalogReferenceData, SearchResult as ServiceSearchResult } from "../../services/contracts";
import { labReferenceData } from "./services/fixtures";
import { searchReferenceData } from "../../services/search";
import { toLabConcepts } from "./LabCatalog";
export const concepts=toLabConcepts(labReferenceData);
export type SearchResult={id:string;name:string;type:"Items"|"Modifiers"|"Concepts";path:string;itemName?:string;group?:string;value?:string;conceptId?:string;searchable:string;score?:number};
export function toLabResult(result:ServiceSearchResult,data:CatalogReferenceData):SearchResult{
 if("conceptId" in result.target)return {...result,conceptId:result.target.conceptId,searchable:result.name};
 const target=result.target;const item=data.items.find(item=>item.id===target.itemId);const group=item?.groups.find(group=>group.id===target.groupId);
 return {...result,itemName:item?.name,group:group?.name,value:group?.values.find(value=>value.id===target.valueId)?.name,searchable:result.name};
}
export function searchCatalog(query:string):SearchResult[]{return query.trim()?searchReferenceData(labReferenceData,{text:query}).map(result=>toLabResult(result,labReferenceData)):[];}
export function searchSections(results:SearchResult[],type:string,sort:"default"|"az"|"za"){
 const filtered=results.filter(result=>type==="All"||result.type===type);
 if(sort!=="default")filtered.sort((a,b)=>(sort==="az"?1:-1)*a.name.localeCompare(b.name)||a.path.localeCompare(b.path));
 const best=sort==="default"?filtered.slice(0,3):[];const ids=new Set(best.map(result=>result.id));
 return [{label:"Best matches",rows:best},...["Items","Modifiers","Concepts"].map(label=>({label,rows:filtered.filter(result=>result.type===label&&!ids.has(result.id))}))].filter(section=>section.rows.length);
}

export function findSearchResult(id:string,data:CatalogReferenceData=labReferenceData){
 const result=searchReferenceData(data,{text:""}).find(result=>result.id===id);
 return result?toLabResult(result,data):undefined;
}
