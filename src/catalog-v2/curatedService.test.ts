import {describe,it,expect} from "vitest";
import { labReferenceData, illustrativeReferenceData } from "../features/ui-lab/services/fixtures";
import { additionalReviewedCatalog } from "./additionalReviewed";
import { reviewedCatalogExpansion } from "./reviewedExpansion";
import { approvedV2Slice } from "./approvedSlice";
import { validateCatalogV2 } from "./model";

describe("curated V2 service source",()=>{
 it("contains approved Items without illustrative-only leftovers",()=>{
  const canonical=[...approvedV2Slice.items,...reviewedCatalogExpansion.items,...additionalReviewedCatalog.items];
  const expected=new Set(canonical.map(x=>x.id));
  const actual=new Set(labReferenceData.items.map(x=>x.id));
  expect([...actual].sort()).toEqual([...expected].sort());
  expect(labReferenceData.items.some(x=>x.id==="authority-exchange")).toBe(false);
  expect(illustrativeReferenceData.items.some(x=>x.id==="authority-exchange")).toBe(true);
 });
 it("retains independent ratings and does not synthesize Context and Role modifiers",()=>{
  expect(labReferenceData.items.find(x=>x.id==="stocks-pillory")?.groups.map(g=>g.id)).toEqual(["style-form"]);
  expect(labReferenceData.items.find(x=>x.id==="chastity")?.groups.map(g=>g.name)).toEqual(["Material"]);
 });
 it("all separately sourced review files validate",()=>{
  expect(validateCatalogV2(additionalReviewedCatalog)).toEqual([]);
  expect(validateCatalogV2(reviewedCatalogExpansion)).toEqual([]);
 });
});
