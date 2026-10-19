import { describe, expect, it } from "vitest";
import { labReferenceData } from "../features/ui-lab/services/fixtures";

/** Final approved exclusions/deferrals; do not resurrect superseded working proposals. */
const forbidden: readonly [number,string,string][] = [
 [261,"praise","Core Praise pending Rewards/Punishments review"],
 [263,"training-dynamic","Excluded: activities remain distinct"],
 [263,"owner-property-dynamic","Split into Ownership and Objectification/property framing"],
 [263,"worship","Final Worship placement correction removes the generic parent and defers its distinct meanings"],
 [264,"protocol","Browse alias, not rateable Item"],
 [265,"kneeling-endurance","Explicitly excluded"],
 [270,"rough-body-handling","Explicitly removed"],
 [272,"self-touch-restriction","Rule Builder permission, not Catalog Item"],
 [272,"coming-on-command","Orgasm Control / Release Cue"],
 [272,"tease-and-denial","Composite, not independent Item"],
 [274,"partner-watched-masturbation","Explicitly removed"],
 [274,"magic-wand-stimulation","Explicitly removed"],
];
describe("final-decision negative parity",()=>{
 const ids = new Set(labReferenceData.items.map(item=>item.id));
 for(const [issue,id,reason] of forbidden){
  it(`#${issue}: does not resurrect ${id} (${reason})`,()=>{
   expect(ids.has(id),`Unapproved/superseded Item: ${id}`).toBe(false);
  });
 }
});
