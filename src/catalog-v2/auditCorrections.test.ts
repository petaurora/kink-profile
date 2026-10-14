import {describe,expect,it} from "vitest";
import {curatedCatalog} from "./curatedCatalog";
import {labReferenceData} from "../features/ui-lab/services/fixtures";
import {createUiLabServices} from "../features/ui-lab/services/createUiLabServices";
import {searchReferenceData,getItemSearchMatch} from "../services/search";
import {toLabItems} from "../features/ui-lab/LabCatalog";
import {ratingKey} from "../services/contracts";
import {validateCatalogV2} from "./model";
import {modifierTemplate,modifierTemplates} from "./modifierTemplates";

describe("final approvals and composed Catalog reference (#293 audit)",()=>{
 it("exposes the approved consolidated Body Area vocabulary across each reviewed Item",()=>{
  const expected=["face","neck-shoulders","arms-hands","chest-breasts","nipples","abdomen","back","buttocks","thighs","legs-feet","vulva-clitoris-vagina","penis-testicles","anus-perineum"];
  for(const id of ["impact-play","spanking-slapping","body-writing","texture-play","pinching","scratching","biting","clamp-clip-play","wartenberg-wheel","suction-play","electrical-play"]){
   const item=curatedCatalog.items.find(i=>i.id===id)!;
   const group=item.groups.find(g=>g.id==="body-area" || g.id==="target-body-area");
   expect(group?.values.map(v=>v.id),id).toEqual(expected);
   expect(item.pendingGroupIds ?? [],id).not.toContain(group?.id);
  }
 });
 it("implements approved three-level Intensity independently on all five reviewed Items",()=>{
  for(const id of ["impact-play","spanking-slapping","humiliation-play","degradation","embarrassment-play"]){
   const item=curatedCatalog.items.find(i=>i.id===id)!;
   expect(item.groups.find(g=>g.id==="intensity")?.values.map(v=>v.id),id).toEqual(["light","moderate","intense"]);
   expect(item.pendingGroupIds ?? [],id).not.toContain("intensity");
  }
 });
 it("honors final Humiliation, Human Furniture, and Body Writing corrections",()=>{
  const humiliation=curatedCatalog.items.find(i=>i.id==="humiliation-play")!;
  expect(humiliation.groups.find(g=>g.id==="target-focus")?.values.map(v=>v.id)).toEqual([
   "body-appearance","genitals-sexual-anatomy","sexuality-sexual-behavior","intelligence-competence","skill-performance","behavior-conduct","role-status","neediness-desperation"]);
  expect(humiliation.groups.find(g=>g.id==="tone-style")?.values).toHaveLength(7);
  expect(humiliation.groups.flatMap(g=>g.values).some(v=>v.id==="specific-body-part")).toBe(false);
  const furniture=curatedCatalog.items.find(i=>i.id==="human-furniture")!;
  expect(furniture.groups.find(g=>g.id==="duration")?.values.map(v=>v.id)).toEqual(["brief","sustained","extended"]);
  expect(furniture.groups.find(g=>g.id==="visibility-context")?.values.map(v=>v.id)).toEqual(["private","witnessed-consenting-audience"]);
  expect([...furniture.groups.map(g=>g.id),...(furniture.pendingGroupIds ?? [])]).not.toContain("stillness-endurance");
  const writing=curatedCatalog.items.find(i=>i.id==="body-writing")!;
  expect([...writing.groups.map(g=>g.id),...(writing.pendingGroupIds ?? [])]).not.toContain("permanence");
  expect(writing.groups.find(g=>g.id==="body-area")?.values).toHaveLength(13);
 });
 it("scopes shared Body Area and Intensity ratings without auto-propagating to Items or siblings",async()=>{
  const {services}=createUiLabServices({latencyMs:0,saveLatencyMs:0});
  const first={kind:"modifier" as const,itemId:"pinching",groupId:"body-area",valueId:"nipples"};
  const second={kind:"modifier" as const,itemId:"suction-play",groupId:"body-area",valueId:"nipples"};
  const intensity={kind:"modifier" as const,itemId:"impact-play",groupId:"intensity",valueId:"moderate"};
  await services.preferences.setRating(first,"Love");
  await services.preferences.setRating(second,"Hard Limit");
  await services.preferences.setRating(intensity,"Like");
  const ratings=(await services.preferences.getSnapshot()).ratings;
  expect(ratings[ratingKey(first)]).toBe("Love");
  expect(ratings[ratingKey(second)]).toBe("Hard Limit");
  expect(ratings[ratingKey(intensity)]).toBe("Like");
  expect(ratings[ratingKey({kind:"item",itemId:"pinching"})]).toBeUndefined();
  expect(ratings[ratingKey({kind:"modifier",itemId:"impact-play",groupId:"intensity",valueId:"light"})]).toBeUndefined();
 });

 it("models the approved Marking comment while removing superseded Worship",()=>{
  expect(labReferenceData.items.find(i=>i.id==="marking")?.groups).toEqual([
   {id:"type",name:"Type",values:[
    {id:"hickeys",name:"Hickeys"},{id:"bruise-marking",name:"Bruise Marking"},
    {id:"stamps-temporary-tattoos",name:"Stamps / Temporary Tattoos"},{id:"other-temporary-marks",name:"Other Temporary Marks"},
   ]},
  ]);
  expect(labReferenceData.items.some(i=>i.id==="worship")).toBe(false);
  expect(labReferenceData.items.find(i=>i.id==="collaring")?.groups[0].values).toEqual([{id:"witnessed-community",name:"Witnessed / Community"}]);
 });
 it("preserves rated Gags identities and adds all approved dimensions",()=>{
  const groups=labReferenceData.items.find(i=>i.id==="gags")!.groups;
  expect(groups.map(g=>g.id)).toEqual(["type","effect-mouth-state","features-mechanism","material","context-association"]);
  expect(groups[0].values.map(v=>v.id)).toEqual(["ball","bit","ring","tape-style","medical-dental","funnel","mouthguard-style","muzzle","phallic"]);
  expect(groups.find(g=>g.id==="features-mechanism")?.values.map(v=>v.id)).toContain("inflatable-adjustable-pressure");
 });
 it("keeps Equipment membership and the inverse theme index consistent",()=>{
  expect(validateCatalogV2(curatedCatalog)).toEqual([]);
  const equipment=labReferenceData.subjects.find(s=>s.id==="equipment")!;
  for(const id of ["collars","cuffs","chastity","restraint-gear"])expect(equipment.itemIds).toContain(id);
  for(const item of curatedCatalog.items)for(const themeId of item.themeIds)
   expect(curatedCatalog.themes.find(t=>t.id===themeId)?.itemIds,item.id+" / "+themeId).toContain(item.id);
  for(const theme of curatedCatalog.themes)for(const id of theme.itemIds)
   expect(curatedCatalog.items.find(i=>i.id===id)?.themeIds).toContain(theme.id);
  expect(labReferenceData.items.find(i=>i.id==="restraint-gear")?.themeIds).toEqual(["bondage","equipment"]);
 });
 it("includes orientations and named dynamics in featured Power Exchange",()=>{
  const subject=labReferenceData.subjects.find(s=>s.id==="power-exchange")!;
  for(const id of ["dominance","submission","ownership","total-power-exchange-tpe","master-slave-dynamic","owner-pet-dynamic","low-protocol","collars"])
   expect(subject.itemIds,id).toContain(id);
 });
 it("resolves approved aliases to stable Item and exact modifier targets",()=>{
  expect(searchReferenceData(labReferenceData,{text:"bondage cross",type:"Items"}).map(r=>r.target)).toEqual([{itemId:"saint-andrew-s-cross"}]);
  expect(searchReferenceData(labReferenceData,{text:"St. Andrew's cross",type:"Items"}).some(r=>r.target && "itemId" in r.target && r.target.itemId==="saint-andrew-s-cross")).toBe(true);
  expect(searchReferenceData(labReferenceData,{text:"CNC",type:"Items"}).map(r=>r.target)).toEqual([{itemId:"consensual-non-consent"}]);
  expect(searchReferenceData(labReferenceData,{text:"penis gag",type:"Modifiers"}).map(r=>r.target)).toEqual([{itemId:"gags",groupId:"type",valueId:"phallic"}]);
  expect(getItemSearchMatch(toLabItems(labReferenceData).find(i=>i.id==="gags")!,"penis gag")?.score).toBe(1);
 });
 it("has no dangling concept or Item relationships after curated-only composition",()=>{
  const ids=new Set(labReferenceData.items.map(i=>i.id)),concepts=new Set(labReferenceData.concepts.map(c=>c.id));
  for(const concept of labReferenceData.concepts)for(const id of concept.relatedItemIds ?? [])expect(ids.has(id),concept.id+" -> "+id).toBe(true);
  for(const item of labReferenceData.items){
   for(const id of item.relatedItemIds ?? [])expect(ids.has(id),item.id+" -> "+id).toBe(true);
   for(const group of item.groups)for(const value of group.values)if(value.conceptId)expect(concepts.has(value.conceptId)).toBe(true);
  }
  expect(labReferenceData.items.find(i=>i.id==="biting")?.relatedItemIds).toContain("primal-play");
  expect(labReferenceData.items.find(i=>i.id==="body-writing")?.relatedItemIds).toContain("marking");
 });
 it("reuses definitions without sharing Item-scoped ratings",async()=>{
  const {services}=createUiLabServices({latencyMs:0,saveLatencyMs:0});
  const collar={kind:"modifier" as const,itemId:"collars",groupId:"material",valueId:"leather"};
  const gag={kind:"modifier" as const,itemId:"gags",groupId:"material",valueId:"leather"};
  for(const target of [collar,gag])expect(labReferenceData.items.find(i=>i.id===target.itemId)?.groups.find(g=>g.id===target.groupId)?.values.find(v=>v.id===target.valueId)?.conceptId).toBe("leather");
  await services.preferences.setRating(collar,"Love");await services.preferences.setRating(gag,"Hard Limit");
  await services.preferences.setRating({kind:"concept",conceptId:"leather"},"Unsure");
  const snapshot=await services.preferences.getSnapshot();
  expect(snapshot.ratings[ratingKey(collar)]).toBe("Love");expect(snapshot.ratings[ratingKey(gag)]).toBe("Hard Limit");
  expect(snapshot.ratings[ratingKey({kind:"item",itemId:"gags"})]).toBeUndefined();
  expect(snapshot.ratings[ratingKey({kind:"concept",conceptId:"leather"})]).toBe("Unsure");
 });
 it("template overrides preserve identity and do not alter sibling definitions",()=>{
  const complete=modifierTemplate("psychologicalTone");
  const subset=modifierTemplate("psychologicalTone",{include:["harsh-direct","playful-teasing"],name:"Presentation"});
  expect(subset.values.map(v=>v.id)).toEqual(["harsh-direct","playful-teasing"]);
  subset.values[0].name="Local explanation";
  expect(complete.values.find(v=>v.id==="harsh-direct")?.name).toBe("Harsh / Direct");
  expect(modifierTemplates.psychologicalTone.values.find(v=>v.id==="harsh-direct")?.name).toBe("Harsh / Direct");
  expect(()=>modifierTemplate("psychologicalTone",{include:["unknown"]})).toThrow("Unknown value");
 });
});
