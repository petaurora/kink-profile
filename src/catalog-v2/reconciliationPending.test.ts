import { describe, expect, it } from "vitest";
import { additionalReviewedCatalog } from "./additionalReviewed";
import { labReferenceData } from "../features/ui-lab/services/fixtures";
import { validateCatalogV2 } from "./model";

const pending: readonly [number,string,string][]=[
 [258,"impact-play","target-body-area"],[258,"impact-play","intensity"],
 [259,"humiliation-play","target-focus"],[259,"humiliation-play","tone-style"],[259,"humiliation-play","intensity"],
 [259,"embarrassment-play","intensity"],
 [269,"texture-play","body-part"],
 [270,"pinching","body-part"],[270,"scratching","body-part"],[270,"biting","body-part"],
 [270,"clamp-clip-play","body-part"],[270,"wartenberg-wheel","body-part"],[270,"suction-play","body-part"],
 [271,"electrical-play","body-part"],
];
describe("approved but pending value vocabularies",()=>{
 it("the reviewed catalog schema remains valid",()=>expect(validateCatalogV2(additionalReviewedCatalog)).toEqual([]));
 for(const [issue,itemId,groupId] of pending){
  it(`#${issue}: preserves ${itemId}/${groupId} as pending, not fake rateable values`,()=>{
   const model=additionalReviewedCatalog.items.find(i=>i.id===itemId);
   expect(model?.pendingGroupIds).toContain(groupId);
   expect(model?.groups.some(g=>g.id===groupId)).toBe(false);
   expect(labReferenceData.items.find(i=>i.id===itemId)?.groups.some(g=>g.id===groupId)).toBe(false);
   expect(labReferenceData.items.find(i=>i.id===itemId)?.pendingGroupIds).toContain(groupId);
  });
 }
});
