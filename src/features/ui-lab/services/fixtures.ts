import { additionalReviewedCatalog } from "../../../catalog-v2/additionalReviewed";
import { reviewedCatalogExpansion } from "../../../catalog-v2/reviewedExpansion";
import { approvedV2Slice } from "../../../catalog-v2/approvedSlice";
import { replaceReferenceCatalog } from "../../../catalog-v2/toAppReference";
import type { CatalogReferenceData, PreferenceSnapshot } from "../../../services/contracts";

// Illustrative Lab fixtures only. IDs are explicit and are not production taxonomy IDs.
const catalogSeeds:Record<string,string[]>={
 "Power Exchange":["Collars","Ownership","Protocol","Service","Permission Rituals","Authority Exchange","Roleplay","Obedience","Rules","Ceremonies","Training","Devotion"],
 "Restraint & Control":["Restraints","Cuffs","Rope Bondage","Blindfolds","Chastity","Positioning","Movement Restriction","Sensory Deprivation","Harnesses","Shibari","Suspension","Confinement"],
 "Sensation & Intensity":["Sensory Play","Wartenberg Wheel","Compression Clothing","Temperature Play","Impact Play","Texture Play","Cupping","Massage","Wax Play","Pressure Play","Tickling","Sound Play"],
 "Connection & Expression":["Praise","Privileges","Aftercare","Affection","Pet Play","Primal Play","Exhibitionism","Voyeurism","Role Reversal","Teasing","Anticipation","Body Worship"]
};
const specific:Record<string,{name:string;values:string[]}[]>={
 "Collars":[{name:"Material",values:["Leather","Metal","Fabric","Silicone"]},{name:"Use / Context",values:["Everyday","Scene / Play","Ceremonial"]}],
 "Restraints":[{name:"Material",values:["Rope","Cuffs","Fabric"]},{name:"Use / Context",values:["Decorative","Functional"]}],
 "Sensory Play":[{name:"Sensation",values:["Soft","Sharp / Prickly","Warm","Cold"]},{name:"Role",values:["Giving","Receiving"]}],
 "Praise":[{name:"Expression",values:["Verbal","Written","Public","Private"]}],
 "Privileges":[{name:"Context",values:["Everyday","Scene","Ceremonial"]}]
};
const descriptions:Record<string,string>={
 "Collars":"Collars worn for everyday expression, play or ceremony.",
 "Ownership":"Symbols, agreements and expressions of belonging.",
 "Protocol":"Agreed rituals, rules and structured interactions.",
 "Restraints":"Using cuffs, rope, fabric or other forms of restraint.",
 "Sensory Play":"Exploring sensations such as texture, pressure and temperature.",
 "Praise":"Verbal, written, public or private affirmation.",
 "Privileges":"Special permissions, opportunities or meaningful rewards.",
 "Aftercare":"Connection, comfort and care after an experience.",
 "Permission Rituals":"Ceremonial or practical ways to request and grant permission."
};

const ids: Record<string, string> = {
  "Collars": "collars",
  "Ownership": "ownership",
  "Protocol": "protocol",
  "Service": "service",
  "Permission Rituals": "permission-rituals",
  "Authority Exchange": "authority-exchange",
  "Roleplay": "roleplay",
  "Obedience": "obedience",
  "Rules": "rules",
  "Ceremonies": "ceremonies",
  "Training": "training",
  "Devotion": "devotion",
  "Restraints": "restraints",
  "Cuffs": "cuffs",
  "Rope Bondage": "rope-bondage",
  "Blindfolds": "blindfolds",
  "Chastity": "chastity",
  "Positioning": "positioning",
  "Movement Restriction": "movement-restriction",
  "Sensory Deprivation": "sensory-deprivation",
  "Harnesses": "harnesses",
  "Shibari": "shibari",
  "Suspension": "suspension",
  "Confinement": "confinement",
  "Sensory Play": "sensory-play",
  "Wartenberg Wheel": "wartenberg-wheel",
  "Compression Clothing": "compression-clothing",
  "Temperature Play": "temperature-play",
  "Impact Play": "impact-play",
  "Texture Play": "texture-play",
  "Cupping": "cupping",
  "Massage": "massage",
  "Wax Play": "wax-play",
  "Pressure Play": "pressure-play",
  "Tickling": "tickling",
  "Sound Play": "sound-play",
  "Praise": "praise",
  "Privileges": "privileges",
  "Aftercare": "aftercare",
  "Affection": "affection",
  "Pet Play": "pet-play",
  "Primal Play": "primal-play",
  "Exhibitionism": "exhibitionism",
  "Voyeurism": "voyeurism",
  "Role Reversal": "role-reversal",
  "Teasing": "teasing",
  "Anticipation": "anticipation",
  "Body Worship": "body-worship",
  "Material": "material",
  "Use / Context": "use-context",
  "Sensation": "sensation",
  "Role": "role",
  "Expression": "expression",
  "Context": "context",
  "Leather": "leather",
  "Metal": "metal",
  "Fabric": "fabric",
  "Silicone": "silicone",
  "Everyday": "everyday",
  "Scene / Play": "scene-play",
  "Ceremonial": "ceremonial",
  "Rope": "rope",
  "Decorative": "decorative",
  "Functional": "functional",
  "Soft": "soft",
  "Sharp / Prickly": "sharp-prickly",
  "Warm": "warm",
  "Cold": "cold",
  "Giving": "giving",
  "Receiving": "receiving",
  "Verbal": "verbal",
  "Written": "written",
  "Public": "public",
  "Private": "private",
  "Scene": "scene",
  "Self-directed": "self-directed"
};

const nativeRewards = new Set(["Praise", "Privileges", "Protocol", "Permission Rituals", "Rules", "Training", "Teasing", "Anticipation"]);
const catalogItems = Object.entries(catalogSeeds).flatMap(([category, names]) => names.map(name => ({
  id: ids[name], name, category, description: descriptions[name],
  collections: ["kinks" as const, ...(nativeRewards.has(name) ? ["rewards" as const] : [])],
  groups: (specific[name] || [{name:"Context",values:["Everyday","Scene / Play","Ceremonial"]},{name:"Role",values:["Giving","Receiving","Self-directed"]}]).map(group => ({
    id: ids[group.name], name: group.name,
    values: group.values.map(name => ({id: ids[name], name, ...(name === "Leather" ? {conceptId: "leather"} : {})})),
  })),
})));
const illustrativeReferenceData: CatalogReferenceData = {
  items: catalogItems,
  concepts: [
    {id:"ownership",name:"Ownership",description:"A negotiated concept of belonging or authority. Meaning depends on explicit agreements.",relatedItemIds:["collars","protocol"]},
    {id:"leather",name:"Leather",description:"A material and a broader cultural concept. An item’s Leather modifier has its own independent meaning and rating.",relatedItemIds:["collars"]},
    {id:"ceremonial",name:"Ceremonial",description:"Actions or objects given deliberate symbolic meaning through a ceremony.",relatedItemIds:["collars","ceremonies"]},
    {id:"trust",name:"Trust",description:"Confidence developed through communication, reliability and respected boundaries.",relatedItemIds:["aftercare","protocol"]},
  ],
  subjects: [
    {id:"power-exchange",name:"Power Exchange",description:"Explore authority, rituals and the ways people negotiate control.",featured:{symbol:"◇",tone:"power"}},
    {id:"sensation-intensity",name:"Sensation & Intensity",description:"Discover textures, pressure and different kinds of sensation.",featured:{symbol:"✧",tone:"sensation"}},
    {id:"restraint-control",name:"Restraint & Control",description:"Explore restriction, restraint and intentional boundaries.",featured:{symbol:"⌁",tone:"restraint"}},
    {id:"connection-expression",name:"Connection & Expression",description:"Explore affection, praise and ways of expressing connection.",featured:{symbol:"♡",tone:"connection"}},
    ...["Collars","Aftercare","Primal Play","Sensory Play","Service","Roleplay","Praise","Protocol","Temperature Play","Pet Play"].map(name => ({id:"subject-"+ids[name],name,description:"Explore related Catalog Items and refine your preferences."})),
  ].map(subject => ({...subject,itemIds:catalogItems.filter(item => item.category === subject.name || item.name === subject.name).map(item => item.id)})),
};
/** Default V2 reference data is curated-only. Illustrative fixtures are never merged into the real browse list. */
const curatedBase:CatalogReferenceData = {items:[],subjects:[],concepts:illustrativeReferenceData.concepts};
const curatedReferenceData: CatalogReferenceData = replaceReferenceCatalog(
  replaceReferenceCatalog(
    replaceReferenceCatalog(curatedBase, approvedV2Slice),
    reviewedCatalogExpansion,
  ),
  additionalReviewedCatalog,
);
// Featured discovery subjects are service-owned curated unions, not stale demo category matches.
const featuredSubjectGroups = [
  {id:"power-exchange",name:"Power Exchange",description:"Explore negotiated authority, devotion, and protocol.",featured:{symbol:"◇",tone:"power"},themeIds:["power-exchange","power"]},
  {id:"sensation-intensity",name:"Sensation & Intensity",description:"Explore impact, temperature, sensation and intensity.",featured:{symbol:"✧",tone:"sensation"},themeIds:["impact","sensory","pain","electrical"]},
  {id:"restraint-control",name:"Restraint & Control",description:"Explore physical restriction, equipment and negotiated control.",featured:{symbol:"⌁",tone:"restraint"},themeIds:["bondage","equipment"]},
  {id:"connection-expression",name:"Connection & Expression",description:"Explore pet, primal and expressive connections.",featured:{symbol:"♡",tone:"connection"},themeIds:["pet","primal","exhibition"]},
];
export const labReferenceData: CatalogReferenceData = {
  ...curatedReferenceData,
  subjects:[...curatedReferenceData.subjects, ...featuredSubjectGroups.map(({themeIds,...subject})=>({
    ...subject,
    itemIds:[...new Set(curatedReferenceData.subjects.filter(theme=>themeIds.includes(theme.id)).flatMap(theme=>theme.itemIds))].filter(id=>curatedReferenceData.items.some(item=>item.id===id)),
  }))],
};
/** For isolated component or search tests that expressly require the old demo dataset. */
export { illustrativeReferenceData };
// Stable, explicitly illustrative classifications; no inference from general ratings.
export const labInitialPreferences: PreferenceSnapshot = {
  ratings: {},
  classifications: {
    "collars": {reward:"yes",punishment:"unanswered"},
    "ownership": {reward:"no",punishment:"yes"},
    "protocol": {reward:"unanswered",punishment:"no"},
    "service": {reward:"no",punishment:"no"},
    "permission-rituals": {reward:"yes",punishment:"yes"},
    "authority-exchange": {reward:"no",punishment:"unanswered"},
    "roleplay": {reward:"unanswered",punishment:"yes"},
    "obedience": {reward:"no",punishment:"no"},
    "rules": {reward:"yes",punishment:"no"},
    "ceremonies": {reward:"no",punishment:"yes"},
    "training": {reward:"unanswered",punishment:"unanswered"},
    "devotion": {reward:"no",punishment:"yes"},
    "restraints": {reward:"yes",punishment:"no"},
    "cuffs": {reward:"no",punishment:"no"},
    "rope-bondage": {reward:"unanswered",punishment:"yes"},
    "blindfolds": {reward:"no",punishment:"unanswered"},
    "chastity": {reward:"yes",punishment:"yes"},
    "positioning": {reward:"no",punishment:"no"},
    "movement-restriction": {reward:"unanswered",punishment:"no"},
    "sensory-deprivation": {reward:"no",punishment:"yes"},
    "harnesses": {reward:"yes",punishment:"unanswered"},
    "shibari": {reward:"no",punishment:"yes"},
    "suspension": {reward:"unanswered",punishment:"no"},
    "confinement": {reward:"no",punishment:"no"},
    "sensory-play": {reward:"yes",punishment:"yes"},
    "wartenberg-wheel": {reward:"no",punishment:"unanswered"},
    "compression-clothing": {reward:"unanswered",punishment:"yes"},
    "temperature-play": {reward:"no",punishment:"no"},
    "impact-play": {reward:"yes",punishment:"no"},
    "texture-play": {reward:"no",punishment:"yes"},
    "cupping": {reward:"unanswered",punishment:"unanswered"},
    "massage": {reward:"no",punishment:"yes"},
    "wax-play": {reward:"yes",punishment:"no"},
    "pressure-play": {reward:"no",punishment:"no"},
    "tickling": {reward:"unanswered",punishment:"yes"},
    "sound-play": {reward:"no",punishment:"unanswered"},
    "praise": {reward:"yes",punishment:"yes"},
    "privileges": {reward:"no",punishment:"no"},
    "aftercare": {reward:"unanswered",punishment:"no"},
    "affection": {reward:"no",punishment:"yes"},
    "pet-play": {reward:"yes",punishment:"unanswered"},
    "primal-play": {reward:"no",punishment:"yes"},
    "exhibitionism": {reward:"unanswered",punishment:"no"},
    "voyeurism": {reward:"no",punishment:"no"},
    "role-reversal": {reward:"yes",punishment:"yes"},
    "teasing": {reward:"no",punishment:"unanswered"},
    "anticipation": {reward:"unanswered",punishment:"yes"},
    "body-worship": {reward:"no",punishment:"no"},
  },
};
