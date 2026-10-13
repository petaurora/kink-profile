import {describe,expect,it} from "vitest";
import {curatedCatalog} from "./curatedCatalog";
import {buildLegacyPreferenceArchive} from "./fullSourceDisposition";
import {ratingKey} from "../services/contracts";

const key=ratingKey({kind:"modifier",itemId:"service",groupId:"type",valueId:"food-drink-service"});
describe("conservative merged-source migration",()=>{
 it("archives all conflicting V1 sources without choosing a canonical winner",()=>{
  const forward=buildLegacyPreferenceArchive({"serving-drinks":"Love","serving-meals":"Hard Limit"},curatedCatalog);
  const reverse=buildLegacyPreferenceArchive({"serving-meals":"Hard Limit","serving-drinks":"Love"},curatedCatalog);
  expect(forward).toEqual(reverse);
  expect(forward.migratedRatings[key]).toBeUndefined();
  expect(forward.report.applied).toEqual([]);
  expect(forward.archive.ratings).toEqual({"serving-drinks":"Love","serving-meals":"Hard Limit"});
  expect(forward.report.conflicts).toHaveLength(2);
  for(const conflict of forward.report.conflicts){
   expect(conflict.reason).toBe("incoming-sources");
   expect(conflict.existing).toBeUndefined();
   expect(conflict.sourceIds).toEqual(["serving-drinks","serving-meals"]);
   expect(forward.archive.reasons[conflict.sourceId]).toContain("original V1");
  }
 });
 it("retains a real existing V2 preference and every competing original",()=>{
  const result=buildLegacyPreferenceArchive({"serving-drinks":"Love","serving-meals":"Hard Limit"},curatedCatalog,{[key]:"Unsure"});
  expect(result.migratedRatings[key]).toBe("Unsure");
  expect(result.report.applied).toEqual([]);
  expect(Object.keys(result.archive.ratings)).toHaveLength(2);
  expect(result.report.conflicts.every(c=>c.existing==="Unsure")).toBe(true);
 });
 it("coalesces equal incoming values but keeps distinct targets independent",()=>{
  const result=buildLegacyPreferenceArchive({"serving-drinks":"Love","serving-meals":"Love","collaring":"Hard Limit"},curatedCatalog);
  expect(result.migratedRatings[key]).toBe("Love");
  expect(result.migratedRatings[ratingKey({kind:"item",itemId:"collaring"})]).toBe("Hard Limit");
  expect(result.report.applied).toHaveLength(3);
  expect(result.report.conflicts).toEqual([]);
  expect(result.archive.ratings).toEqual({});
 });
 it("uses the existing-V2 reason only for an actual existing record conflict",()=>{
  const result=buildLegacyPreferenceArchive({"serving-drinks":"Love"},curatedCatalog,{[key]:"Hard Limit"});
  expect(result.report.conflicts[0].reason).toBe("existing-v2");
  expect(result.migratedRatings[key]).toBe("Hard Limit");
  expect(result.archive.reasons["serving-drinks"]).toBe("Conflicting existing V2 preference");
 });
});
