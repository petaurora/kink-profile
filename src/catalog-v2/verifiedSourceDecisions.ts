import type { MigrationDecision } from "./migration";
/** Source IDs checked against reference/catalog/kink-catalog.tsv.
 * Approved destinations: #256, #257, #271. Other staged-only rows are NOT assumed to exist in V1.
 */
export const verifiedSourceDecisions: MigrationDecision[] = [
 {sourceId:"posture-collar",outcome:"refinement",targetItemId:"collars",groupId:"form",valueId:"posture-restrictive"},
 {sourceId:"stocks-pillory",outcome:"item",targetItemId:"stocks-pillory"},
 {sourceId:"collaring",outcome:"item",targetItemId:"collaring"},
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
