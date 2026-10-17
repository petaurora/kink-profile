import {describe,expect,it} from "vitest";
import {createEmptyCatalogProfileState} from "../lib/catalogProfile";
import {buildLegacyCatalogProfileArchive} from "./legacyProfileArchive";
import {curatedCatalog} from "./curatedCatalog";
import {ratingKey} from "../services/contracts";

describe("complete original profile archive preparation",()=>{
 it("preserves directions, timestamps and ranking data without directional fallback",()=>{
  const original=createEmptyCatalogProfileState("2026-10-13T22:00:00Z");
  original.preferences={
   "hand-spanking":{overall:"love",giving:"hard_limit",receiving:"like",updatedAt:"2026-10-01T12:00:00Z"},
   "praise-kink":{overall:"unsure",updatedAt:"2026-09-01T12:00:00Z"},
   "collaring":{giving:"curious",updatedAt:"2026-10-01T12:00:00Z"},
  };
  original.comparisons=[{id:"original-comparison",leftKinkId:"hand-spanking",rightKinkId:"collaring",result:"left",scope:{type:"overall"},timestamp:"2026-10-01T12:00:00Z"}];
  const before=structuredClone(original);
  const result=buildLegacyCatalogProfileArchive(original,curatedCatalog);
  expect(result.archive.originalProfile).toEqual(before);expect(original).toEqual(before);
  expect(result.archive.schemaVersion).toBe(2);
  expect(result.migratedRatings[ratingKey({kind:"item",itemId:"spanking-slapping"})]).toBe("Love");
  expect(result.migratedRatings[ratingKey({kind:"item",itemId:"collaring"})]).toBeUndefined();
  expect(result.archive.retainedContexts["hand-spanking"].giving).toContain("directional");
  expect(result.archive.retainedContexts["hand-spanking"].receiving).toContain("directional");
  expect(result.archive.retainedContexts["praise-kink"].overall).toContain("deferred");
  expect(result.archive.originalProfile.rankingHistory).toEqual(before.rankingHistory);
  result.archive.originalProfile.preferences["hand-spanking"].giving="love";
  expect(original.preferences["hand-spanking"].giving).toBe("hard_limit");
 });
 it("keeps conflicting original overall records in full with correct reasons",()=>{
  const original=createEmptyCatalogProfileState();
  original.preferences={
   "serving-drinks":{overall:"love",updatedAt:"first"},
   "serving-meals":{overall:"hard_limit",updatedAt:"second"},
  };
  const result=buildLegacyCatalogProfileArchive(original,curatedCatalog);
  expect(result.migratedRatings).toEqual({});
  expect(result.archive.originalProfile.preferences).toEqual(original.preferences);
  for(const id of Object.keys(original.preferences))expect(result.archive.retainedContexts[id].overall).toContain("original V1");
 });
});
