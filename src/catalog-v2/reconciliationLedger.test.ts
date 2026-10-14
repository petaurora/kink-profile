import { describe, expect, it } from "vitest";
import { approvedV2Slice } from "./approvedSlice";
import { reviewedCatalogExpansion } from "./reviewedExpansion";
import { additionalReviewedCatalog } from "./additionalReviewed";
import { reconciliationExpectations } from "./reconciliationLedger";
const items=new Map([...approvedV2Slice.items,...reviewedCatalogExpansion.items,...additionalReviewedCatalog.items].map(item=>[item.id,item]));
describe("Catalog V2 final-decision parity",()=>{
 for(const entry of reconciliationExpectations){
  it(`#${entry.sourceIssue} ${entry.itemId} (${entry.decision})`,()=>{
   const item=items.get(entry.itemId);
   expect(item,`Missing Item ${entry.itemId} from #${entry.sourceIssue}`).toBeDefined();
   for(const [groupId,values] of Object.entries(entry.groups??{})){
    const group=item?.groups.find(g=>g.id===groupId);
    expect(group,`Missing ${entry.itemId}/${groupId} from #${entry.sourceIssue}`).toBeDefined();
    for(const valueId of values)expect(group?.values.some(v=>v.id===valueId),`Missing ${entry.itemId}/${groupId}/${valueId}`).toBe(true);
   }
  });
 }
});
