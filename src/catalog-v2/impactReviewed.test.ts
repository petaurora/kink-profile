import { describe, expect, it } from "vitest";
import { additionalReviewedCatalog } from "./additionalReviewed";
import { validateCatalogV2 } from "./model";

const find = (id:string) => additionalReviewedCatalog.items.find(item=>item.id===id);
describe("Batch 3 impact review parity (#258)",()=>{
 it("preserves independently rateable impact equipment",()=>{
  for(const id of ["paddles","floggers","canes","whips","crops","other-implements"])
   expect(find(id),id).toBeDefined();
 });
 it("exposes approved refinements instead of hiding every equipment Refine action",()=>{
  expect(find("paddles")?.groups.find(g=>g.id==="material")?.values.map(v=>v.id)).toContain("rubber-silicone");
  expect(find("whips")?.groups.find(g=>g.id==="type")?.values.map(v=>v.id)).toEqual(["single-tail","dragon-tail","cat-o-nine-tails","sjambok"]);
  expect(find("other-implements")?.groups.find(g=>g.id==="type")?.values.map(v=>v.id)).toEqual(["wooden-spoon","hairbrush","impact-jack-thumper"]);
  expect(find("impact-play")?.groups.find(g=>g.id==="method-practice")?.values.map(v=>v.id)).toContain("paddling");
  expect(find("impact-play")?.groups.find(g=>g.id==="sensation")?.values.map(v=>v.id)).toEqual(["thuddy","stingy"]);
 });
 it("contains no invalid references",()=>expect(validateCatalogV2(additionalReviewedCatalog)).toEqual([]));
});
