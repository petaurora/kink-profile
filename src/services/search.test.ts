import { describe, expect, it } from "vitest";
import type { CatalogItem, CatalogReferenceData } from "./contracts";
import { getItemSearchMatch, searchMatchExplanation, searchReferenceData } from "./search";
const item = (id: string, name: string, description = ""): CatalogItem => ({id,name,description,category:"Reference",groups:[],collections:["kinks"]});
describe("broad search with name relevance", () => {
  it("orders exact, prefix and other name matches ahead of supporting-text matches", () => {
    const data: CatalogReferenceData = {items:[item("metadata","A ritual","Practical care"),item("substring","Aftercare"),item("prefix","Care rituals"),item("exact","Care")],subjects:[],concepts:[]};
    expect(searchReferenceData(data,{text:"ca",type:"Items"}).map(result=>result.id)).toEqual(["item:exact","item:prefix","item:substring","item:metadata"]);
    expect(searchReferenceData(data,{text:"care",type:"Items"}).map(result=>result.id)).toEqual(["item:exact","item:prefix","item:substring","item:metadata"]);
    expect(searchReferenceData(data,{text:"care",type:"Items",sort:"az"})[0].id).toBe("item:metadata");
  });
  it("matches short metadata substrings and explains description, category and modifier hits", () => {
    const record = {...item("ritual","Permission Rituals","Ceremonial or practical ways to request permission."),category:"Power Exchange",groups:[{id:"material",name:"Material",values:[{id:"leather",name:"Leather"}]}]};
    expect(searchMatchExplanation(getItemSearchMatch(record,"ca"),"ca")).toContain("Matched description: “Ceremonial or practical");
    expect(searchMatchExplanation(getItemSearchMatch(record,"exchange"),"exchange")).toBe("Matched category: “Power Exchange”");
    expect(searchMatchExplanation(getItemSearchMatch(record,"léather"),"léather")).toBe("Matched modifiers: “Material: Leather”");
    expect(searchMatchExplanation(getItemSearchMatch(record,"ritual"),"ritual")).toBeUndefined();
    expect(searchMatchExplanation(getItemSearchMatch(record,""),"")).toBeUndefined();
    expect(getItemSearchMatch(record,"ritual leather")?.score).toBe(1);
    expect(getItemSearchMatch(record,"missing leather")).toBeNull();
  });
  it("globally searches target descriptions and related text without indexing transport IDs", () => {
    const record = {...item("private-identifier","Collars","Ceremonial or practical use"),groups:[{id:"material",name:"Material",values:[{id:"leather",name:"Leather",conceptId:"leather"}]}]};
    const data: CatalogReferenceData = {items:[record],subjects:[],concepts:[{id:"leather",name:"Leather",description:"Soft textured material",relatedItemIds:[record.id]}]};
    expect(searchReferenceData(data,{text:"ca"}).map(result=>result.type)).toEqual(["Items","Modifiers"]);
    expect(searchReferenceData(data,{text:"textur"}).map(result=>result.type)).toEqual(["Modifiers","Concepts"]);
    expect(searchReferenceData(data,{text:"collars soft"}).map(result=>result.type)).toEqual(["Modifiers","Concepts"]);
    expect(searchReferenceData(data,{text:"private-identifier"})).toEqual([]);
  });
});
