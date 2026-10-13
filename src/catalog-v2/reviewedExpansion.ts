import type { CatalogV2, CatalogV2Item, CatalogV2Group } from "./model";
import type { MigrationDecision } from "./migration";
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const group = (name: string, values: string[]): CatalogV2Group => ({id: slug(name), name, values: values.map(name=>({id:slug(name),name}))});
const role = ["Giving", "Receiving", "Self"];
const pair = ["Giving", "Receiving"];
const make = (name: string, themeIds: string[], groups: CatalogV2Group[]=[]):CatalogV2Item=>({
 id: slug(name), name, themeIds, groups, collections:["kinks"]
});
const sexual: Array<[string,string[]|null]> = [
 ["Anal Penetration",role],["Vaginal Penetration",role],["Fellatio",pair],["Cunnilingus",pair],["Anilingus",pair],
 ["Deep-Throating",pair],["Face-Sitting",null],["69",null],["Handjob",role],["Vaginal Fingering",role],
 ["Anal Fingering",role],["Vaginal Fisting",pair],["Anal Fisting",pair],["Pegging",pair],
 ["Strap-On Play",pair],["Mutual Masturbation",null],["Double Penetration",pair],
 ["Tribadism / Scissoring",null],["Intercrural / Thigh Sex",pair],["Frottage / Grinding",null],
 ["Dildo Play",role],["Plug",role],["Vibrator",role],["Sex Machine",role],
 ["Sybian / Ride-On Vibrator",role],["Cock Ring",null],["Cockwarming",null],["Hands-Free Orgasm",null]
];
const bondage = [
 make("Bondage",["bondage"],[group("Configuration",["Spread Eagle","Hogtie","Frogtie","Elbows","Collar-to-Wrist"]),group("Anchor / Context",["Chair","Bed"])]),
 make("Rope Bondage",["bondage"],[group("Style",["Shibari / Kinbaku"])]),
 make("Suspension Bondage",["bondage"],[group("Method",["Rope"]),group("Support",["Partial","Full"])]),
 make("Predicament Bondage",["bondage"]),
 make("Encasement",["bondage"],[group("Method",["Mummification","Body Bag"])]),
 make("Confinement",["bondage"],[group("Environment / Method",["Cage"]),group("Space",["Small / Enclosed"])]),
 make("Cuffs",["bondage","equipment"],[group("Type",["Thumb Cuffs"])]),
 make("Restraint Gear",["bondage","equipment"],[group("Material",["Leather","Metal"]),group("Type",["Under-Bed Restraint System","Bondage Mitts","Armbinder"])]),
];
const control = [
 make("Orgasm Control",["orgasm-control"],[group("Direction",["Controlling","Being Controlled"]),group("Method",["Permission Required","Denial","Countdown","Release Cue"])]),
 ...["Edging","Ruined Orgasm","Multiple / Repeated Orgasm","Overstimulation","Post-Orgasm Stimulation"].map(n=>make(n,["orgasm-control"],[group("Role",role)])),
 make("Forced Orgasm",["orgasm-control"],[group("Role",pair)]),
 make("Chastity",["orgasm-control","equipment"],[group("Material",["Metal","Plastic","Silicone","Other"])]),
];
const sexualItems = sexual.map(([name,roles])=> make(name,["sexual-activities"],name==="Face-Sitting"?[group("Role",["Sitting","Being Sat On"])]:roles?[group("Role",roles)]:[]));
export const reviewedCatalogExpansion: CatalogV2 = {
 schemaVersion:2,
 items:[...bondage,...control,...sexualItems],
 themes:[
 {id:"bondage",name:"Bondage & Restraint",description:"Physical restraint interests and associated equipment",itemIds:bondage.map(i=>i.id)},
 {id:"equipment",name:"Equipment & Objects",description:"Rateable equipment families",itemIds:[...bondage,...control].filter(i=>i.themeIds.includes("equipment")).map(i=>i.id)},
 {id:"orgasm-control",name:"Orgasm & Arousal Control",description:"Approved arousal and climax related interests",itemIds:control.map(i=>i.id)},
 {id:"sexual-activities",name:"Sexual Activities & Techniques",description:"Approved Batch 18 item list",itemIds:sexualItems.map(i=>i.id)},
 ],
};
/** Batch 1 IDs as explicitly written in #256. Unsupported composite rows remain unassigned. */
export const reviewedBatch1Decisions:MigrationDecision[] = [...([
 ["rope-bondage","rope-bondage"],["predicament-bondage","predicament-bondage"],["cuffs","cuffs"]
].map(([sourceId,targetItemId])=>({sourceId,targetItemId,outcome:"item" as const})) as MigrationDecision[]), ...([
 ["shibari-kinbaku","rope-bondage","style","shibari-kinbaku"],
 ["rope-suspension","suspension-bondage","method","rope"],
 ["partial-suspension","suspension-bondage","support","partial"],
 ["mummification","encasement","method","mummification"],
 ["leather-restraints","restraint-gear","material","leather"],
 ["metal-restraints","restraint-gear","material","metal"],
 ["spread-eagle-restraint","bondage","configuration","spread-eagle"],
 ["hogtie","bondage","configuration","hogtie"],
 ["frogtie","bondage","configuration","frogtie"],
 ["chair-bondage","bondage","anchor-context","chair"],
 ["bed-bondage","bondage","anchor-context","bed"],
 ["under-bed-restraint-system","restraint-gear","type","under-bed-restraint-system"],
 ["bondage-mitts","restraint-gear","type","bondage-mitts"],
 ["armbinder","restraint-gear","type","armbinder"],
 ["elbow-bondage","bondage","configuration","elbows"],
 ["thumb-cuffs","cuffs","type","thumb-cuffs"],
 ["collar-to-wrist-restraint","bondage","configuration","collar-to-wrist"],
 ["cage-confinement","confinement","environment-method","cage"],
 ["small-space-confinement","confinement","space","small-enclosed"],
 ["body-bag-bondage","encasement","method","body-bag"],
 ].map(([sourceId,targetItemId,groupId,valueId])=>({sourceId,targetItemId,groupId,valueId,outcome:"refinement" as const})))];
