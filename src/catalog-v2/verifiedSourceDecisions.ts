import type { MigrationDecision } from "./migration";
/** Source IDs checked against reference/catalog/kink-catalog.tsv.
 * Approved destinations: #256, #257, #271. Other staged-only rows are NOT assumed to exist in V1.
 */
export const verifiedImpactDecisions: MigrationDecision[] = [
  {sourceId:"hand-spanking",outcome:"item",targetItemId:"spanking-slapping"},
  ...["paddling","flogging","caning","strapping","crop-play","slapper-tawse-play"].map(valueId=>({sourceId:valueId,outcome:"refinement" as const,targetItemId:"impact-play",groupId:"method-practice",valueId})),
  ...["thuddy-impact","stingy-impact"].map((sourceId)=>({sourceId,outcome:"refinement" as const,targetItemId:"impact-play",groupId:"sensation",valueId:sourceId.replace("-impact","")})),
  {sourceId:"rubber-paddle",outcome:"refinement",targetItemId:"paddles",groupId:"material",valueId:"rubber-silicone"},
  ...["rhythmic-impact","counting-impacts","impact-warm-up","impact-endurance"].map(sourceId=>({sourceId,outcome:"item" as const,targetItemId:sourceId})),
  {sourceId:"wooden-spoon-play",outcome:"refinement",targetItemId:"other-implements",groupId:"type",valueId:"wooden-spoon"},
  {sourceId:"hairbrush-spanking",outcome:"refinement",targetItemId:"other-implements",groupId:"type",valueId:"hairbrush"},
  {sourceId:"punishment-style-impact",outcome:"review",reason:"Deferred to Rewards & Punishments per #258"},
  {sourceId:"targeted-impact",outcome:"review",reason:"Broad legacy preference needs consented decomposition; approved target/body-area values not yet locked"},
];

export const verifiedSourceDecisions: MigrationDecision[] = [
 {sourceId:"posture-collar",outcome:"refinement",targetItemId:"collars",groupId:"form",valueId:"posture-restrictive"},
 {sourceId:"stocks-pillory",outcome:"item",targetItemId:"stocks-pillory"},
 {sourceId:"collaring",outcome:"item",targetItemId:"collaring"},
 {sourceId:"public-witnessed-collaring-ceremony",outcome:"refinement",targetItemId:"collaring",groupId:"format-context",valueId:"witnessed-community"},
 {sourceId:"spreader-bar",outcome:"refinement",targetItemId:"restraint-gear",groupId:"type",valueId:"spreader-bar"},
 {sourceId:"verbal-don-t-move-bondage",outcome:"item",targetItemId:"verbal-mental-restraint"},
 // #268's approved comment 5982685387 and #255's final Batch 13 outcome.
 {sourceId:"temporary-marking",outcome:"merge",targetItemId:"marking"},
 {sourceId:"hickeys-love-bites",outcome:"refinement",targetItemId:"marking",groupId:"type",valueId:"hickeys"},
 {sourceId:"bruise-marking",outcome:"refinement",targetItemId:"marking",groupId:"type",valueId:"bruise-marking"},
 {sourceId:"stamps-temporary-tattoos",outcome:"refinement",targetItemId:"marking",groupId:"type",valueId:"stamps-temporary-tattoos"},
 {sourceId:"writing-on-skin",outcome:"merge",targetItemId:"body-writing"},
 {sourceId:"day-collar",outcome:"refinement",targetItemId:"collars",groupId:"use",valueId:"day-everyday"},
 {sourceId:"play-collar",outcome:"refinement",targetItemId:"collars",groupId:"use",valueId:"play-scene"},
 {sourceId:"ball-gag",outcome:"refinement",targetItemId:"gags",groupId:"type",valueId:"ball"},
 {sourceId:"bit-gag",outcome:"refinement",targetItemId:"gags",groupId:"type",valueId:"bit"},
 {sourceId:"ring-gag",outcome:"refinement",targetItemId:"gags",groupId:"type",valueId:"ring"},
 {sourceId:"tape-gag-fantasy",outcome:"refinement",targetItemId:"gags",groupId:"type",valueId:"tape-style"},
 {sourceId:"medical-dental-gag",outcome:"refinement",targetItemId:"gags",groupId:"type",valueId:"medical-dental"},
 {sourceId:"straitjacket-restraint",outcome:"item",targetItemId:"straitjackets"},
 {sourceId:"electrical-stimulation",outcome:"item",targetItemId:"electrical-play"},
 {sourceId:"tens-style-sensation-play",outcome:"refinement",targetItemId:"electrical-play",groupId:"device-method",valueId:"tens-style"},
 {sourceId:"violet-wand-play",outcome:"refinement",targetItemId:"electrical-play",groupId:"device-method",valueId:"violet-wand"},
 {sourceId:"electro-tickle-sensation",outcome:"refinement",targetItemId:"electrical-play",groupId:"sensation-response",valueId:"tickle-twitch-response"},
];
