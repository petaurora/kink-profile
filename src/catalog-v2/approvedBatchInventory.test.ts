import { describe, expect, it } from "vitest";
import { approvedBatchItemIds } from "./approvedBatchInventory";
import { labReferenceData } from "../features/ui-lab/services/fixtures";

describe("final approval standalone Item inventory",()=>{
 const available=new Set(labReferenceData.items.map(item=>item.id));
 for(const [batch,ids] of Object.entries(approvedBatchItemIds)){
  it(`Batch ${batch}: all approved standalone Items are present`,()=>{
   expect(new Set(ids).size,`Duplicate Item in Batch ${batch}`).toBe(ids.length);
   const missing=ids.filter(id=>!available.has(id));
   expect(missing,`Missing approved Batch ${batch} Items`).toEqual([]);
  });
 }
});
