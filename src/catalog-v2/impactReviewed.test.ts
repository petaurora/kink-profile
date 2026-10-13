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
  expect(find("paddles")?.groups.find(g=>g.id==="material")?.values.map(v=>v.id)).toEqual(["leather","wood","rubber-silicone","acrylic-plastic","metal"]);
  expect(find("floggers")?.groups.map(g=>g.id)).toEqual(["material","thickness","tip-style"]);
  expect(find("floggers")?.groups.find(g=>g.id==="tip-style")?.values.map(v=>v.id)).toEqual(["plain-untied","knotted","weighted"]);
  expect(find("canes")?.groups.map(g=>g.id)).toEqual(["material","thickness"]);
  expect(find("canes")?.groups.find(g=>g.id==="thickness")?.values.map(v=>v.id)).toEqual(["thin","medium","thick"]);
  expect(find("crops")?.groups.map(g=>g.id)).toEqual(["material","tip-style"]);
  expect(find("whips")?.groups.find(g=>g.id==="type")?.values.map(v=>v.id)).toEqual(["single-tail","dragon-tail","cat-o-nine-tails","sjambok"]);
  expect(find("other-implements")?.groups.find(g=>g.id==="type")?.values.map(v=>v.id)).toEqual(["wooden-spoon","hairbrush","impact-jack-thumper"]);
  expect(find("impact-play")?.groups.find(g=>g.id==="method-practice")?.values.map(v=>v.id)).toContain("paddling");
  expect(find("impact-play")?.groups.find(g=>g.id==="sensation")?.values.map(v=>v.id)).toEqual(["thuddy","stingy"]);
 });
 it("contains no invalid references",()=>expect(validateCatalogV2(additionalReviewedCatalog)).toEqual([]));
});
