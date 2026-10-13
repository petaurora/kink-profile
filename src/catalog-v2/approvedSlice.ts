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
      { id: "material", name: "Material", values: [
        { id: "leather", name: "Leather", conceptId: "leather" },
        { id: "metal", name: "Metal" }, { id: "fabric", name: "Fabric" }, { id: "silicone", name: "Silicone" },
      ] },
      { id: "use-context", name: "Use / Context", values: [
        { id: "everyday", name: "Everyday" }, { id: "scene-play", name: "Scene / Play" },
        { id: "ceremonial", name: "Ceremonial" },
      ] },
    ],
  }],
};
/** Entries here are demonstrably direct; other V1 rows require curator review. */
export const approvedV1ToV2Slice: MigrationDecision[] = [
  { sourceId: "collars", outcome: "item", targetItemId: "collars" },
];
