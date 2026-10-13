/** Catalog V2: independently rateable Items, non-exclusive themes and scoped refinements. */
export type CatalogV2Value = { id: string; name: string; conceptId?: string };
export type CatalogV2Group = { id: string; name: string; values: CatalogV2Value[] };
export type CatalogV2Item = {
  id: string; name: string; description?: string;
  themeIds: string[]; groups: CatalogV2Group[];
  aliases?: string[]; relatedItemIds?: string[];
  collections?: ("kinks" | "rewards")[];
};
export type CatalogV2Theme = { id: string; name: string; description: string; itemIds: string[] };
export type CatalogV2 = { schemaVersion: 2; items: CatalogV2Item[]; themes: CatalogV2Theme[] };
export type CatalogV2Target =
  | { kind: "item"; itemId: string }
  | { kind: "modifier"; itemId: string; groupId: string; valueId: string };
export const v2RatingKey = (target: CatalogV2Target): string =>
  JSON.stringify(target.kind === "item"
    ? ["item", target.itemId]
    : ["modifier", target.itemId, target.groupId, target.valueId]);

/** Validation is intentionally strict: invalid references must not silently migrate. */
export function validateCatalogV2(catalog: CatalogV2): string[] {
  const errors: string[] = [];
  const unique = (ids: string[], label: string) => {
    const seen = new Set<string>();
    for (const id of ids) {
      if (!id || seen.has(id)) errors.push(`Duplicate or empty ${label}: ${id}`);
      seen.add(id);
    }
  };
  if (catalog.schemaVersion !== 2) errors.push("Unsupported catalog schema");
  unique(catalog.items.map(i => i.id), "Item ID");
  unique(catalog.themes.map(t => t.id), "theme ID");
  const itemIds = new Set(catalog.items.map(i => i.id));
  const themeIds = new Set(catalog.themes.map(t => t.id));
  for (const item of catalog.items) {
    unique(item.groups.map(g => g.id), `${item.id} group ID`);
    for (const group of item.groups) unique(group.values.map(v => v.id), `${item.id}/${group.id} value ID`);
    for (const id of item.themeIds) if (!themeIds.has(id)) errors.push(`Unknown theme ${id} in ${item.id}`);
    for (const id of item.relatedItemIds ?? []) if (!itemIds.has(id)) errors.push(`Unknown related Item ${id} in ${item.id}`);
  }
  for (const theme of catalog.themes) for (const id of theme.itemIds)
    if (!itemIds.has(id)) errors.push(`Unknown Item ${id} in theme ${theme.id}`);
  return errors;
}
