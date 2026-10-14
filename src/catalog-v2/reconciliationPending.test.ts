import { describe, expect, it } from "vitest";
import { additionalReviewedCatalog } from "./additionalReviewed";
import { labReferenceData } from "../features/ui-lab/services/fixtures";
import { validateCatalogV2 } from "./model";

/** Approved decisions now have values; only unreviewed dimensions remain pending. */
const activated: readonly [number,string,string][]=[
 [258,"impact-play","target-body-area"],[258,"impact-play","intensity"],
 [258,"spanking-slapping","target-body-area"],[258,"spanking-slapping","intensity"],
 [259,"humiliation-play","target-focus"],[259,"humiliation-play","tone-style"],[259,"humiliation-play","intensity"],
 [259,"degradation","intensity"],[259,"embarrassment-play","intensity"],
 [259,"human-furniture","duration"],[259,"human-furniture","visibility-context"],
 [259,"body-writing","body-area"],
 [269,"texture-play","body-area"],
 [270,"pinching","body-area"],[270,"scratching","body-area"],[270,"biting","body-area"],
 [270,"clamp-clip-play","body-area"],[270,"wartenberg-wheel","body-area"],[270,"suction-play","body-area"],
 [271,"electrical-play","body-area"],
];
describe("reviewed modifier approval and pending dimensions",()=>{
 it("the reviewed catalog schema remains valid",()=>expect(validateCatalogV2(additionalReviewedCatalog)).toEqual([]));
 for(const [issue,itemId,groupId] of activated){
  it(`#${issue}: activates ${itemId}/${groupId} with explicitly approved choices`,()=>{
   const model=additionalReviewedCatalog.items.find(i=>i.id===itemId);
   expect(model?.groups.some(g=>g.id===groupId && g.values.length>0)).toBe(true);
   expect(model?.pendingGroupIds ?? []).not.toContain(groupId);
   expect(labReferenceData.items.find(i=>i.id===itemId)?.groups.some(g=>g.id===groupId && g.values.length>0)).toBe(true);
   expect(labReferenceData.items.find(i=>i.id===itemId)?.pendingGroupIds ?? []).not.toContain(groupId);
  });
 }
 it("does not keep expressly rejected dimensions as pending or active",()=>{
  for(const [itemId,groupId] of [["human-furniture","stillness-endurance"],["body-writing","permanence"]]){
   const item=additionalReviewedCatalog.items.find(i=>i.id===itemId)!;
   expect(item.groups.some(g=>g.id===groupId)).toBe(false);
   expect(item.pendingGroupIds ?? []).not.toContain(groupId);
  }
 });
});
