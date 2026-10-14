import { describe, expect, it } from "vitest";
import { labReferenceData } from "../features/ui-lab/services/fixtures";
describe("featured subject service memberships",()=>{
 it("all four featured subjects resolve actual curated Items",()=>{
  const featured=labReferenceData.subjects.filter(s=>s.featured);
  expect(featured).toHaveLength(4);
  for(const subject of featured){
   expect(subject.itemIds.length,subject.name).toBeGreaterThan(0);
   for(const id of subject.itemIds)expect(labReferenceData.items.some(item=>item.id===id),id).toBe(true);
  }
 });
 it("has unique subject IDs for consistent navigation",()=>{
  const ids=labReferenceData.subjects.map(s=>s.id);
  expect(new Set(ids).size).toBe(ids.length);
 });
});
