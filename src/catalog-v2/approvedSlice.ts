import type { CatalogV2 } from "./model";
import type { MigrationDecision } from "./migration";

/** Only explicitly modeled, reviewable examples. Not a claim of complete migration. */
export const approvedV2Slice: CatalogV2 = {
  schemaVersion: 2,
  themes: [
    { id: "power-exchange", name: "Power Exchange", description: "Negotiated authority and symbols", itemIds: ["collars"] },
    { id: "equipment", name: "Equipment & Objects", description: "Objects with independently meaningful preferences", itemIds: ["collars"] },
  ],
  items: [{
    id: "collars", name: "Collars",
    description: "Collars worn as meaningful objects for play, expression or ceremony.",
    themeIds: ["power-exchange", "equipment"], collections: ["kinks"],
    groups: [
      {id:"use",name:"Use / context",values:[
        {id:"play-scene",name:"Play / scene"},{id:"day-everyday",name:"Day / everyday"},{id:"ceremonial-formal",name:"Ceremonial / formal"}
      ]},
      {id:"form",name:"Function / form",values:[
        {id:"posture-restrictive",name:"Posture / restrictive"},{id:"choker-necklace",name:"Choker / necklace-style"}
      ]},
      {id:"material",name:"Material",values:[
        {id:"leather",name:"Leather",conceptId:"leather"},{id:"metal",name:"Metal"},
        {id:"fabric-textile",name:"Fabric / textile"},{id:"synthetic-silicone",name:"Synthetic / silicone"}
      ]},
      {id:"features",name:"Features",values:[
        {id:"locking",name:"Locking"},{id:"rigid-semirigid",name:"Rigid / semi-rigid"},
        {id:"attachment-point",name:"Leash / attachment point"},{id:"tag-plate",name:"Tag / plate"},
        {id:"discreet",name:"Discreet / public-wearable"}
      ]},
      {id:"meaning",name:"Meaning / symbolism",values:[
        {id:"ownership-belonging",name:"Ownership / belonging"},{id:"submission-service",name:"Submission / service"},
        {id:"protocol",name:"Protocol"},{id:"pet-symbolism",name:"Pet-role symbolism"},
        {id:"commitment-devotion",name:"Commitment / devotion"},{id:"ritual-ceremony",name:"Ritual / ceremony"},
        {id:"fashion-aesthetic",name:"Fashion / aesthetic"}
      ]}
    ],
  }],
};
/** Original V1 corpus has no `collars` row; do not invent a source identity. */
export const approvedV1ToV2Slice: MigrationDecision[] = [];
