/** Catalog V2: independently rateable Items, non-exclusive themes and scoped refinements. */
export type CatalogV2Value = { id: string; name: string; aliases?: string[]; conceptId?: string };
export type CatalogV2Group = { id: string; name: string; values: CatalogV2Value[] };
export type CatalogV2Item = {
  id: string; name: string; description?: string;
  themeIds: string[]; groups: CatalogV2Group[];
  /** Approved dimensions lacking final value vocabulary. Never treat as completed modifiers. */
  pendingGroupIds?: string[];
  aliases?: string[]; relatedItemIds?: string[];
  collections?: ("kinks" | "rewards")[];
};
export type CatalogV2Theme = { id: string; name: string; description: string; itemIds: string[] };
export type CatalogV2 = { schemaVersion: 2; items: CatalogV2Item[]; themes: CatalogV2Theme[] };

/** Later slices replace an Item's reviewed refinements; memberships compose.
 * The inverse theme index is derived from that one membership authority.
 */
export function composeCatalogV2(...slices:CatalogV2[]):CatalogV2 {
  const items=new Map<string,CatalogV2Item>(), themes=new Map<string,CatalogV2Theme>();
  for(const slice of slices) {
    for(const theme of slice.themes)themes.set(theme.id,theme);
    for(const item of slice.items) {
      const previous=items.get(item.id);
      items.set(item.id,{
        ...item,
        themeIds:[...new Set([...(previous?.themeIds ?? []),...item.themeIds])],
        aliases:[...new Set([...(previous?.aliases ?? []),...(item.aliases ?? [])])],
        relatedItemIds:[...new Set([...(previous?.relatedItemIds ?? []),...(item.relatedItemIds ?? [])])],
        pendingGroupIds:[...new Set([...(previous?.pendingGroupIds ?? []),...(item.pendingGroupIds ?? [])])].filter(id=>!item.groups.some(group=>group.id===id)),
      });
    }
  }
  return {schemaVersion:2,items:[...items.values()],themes:[...themes.values()].map(theme=>({
    ...theme,itemIds:[...items.values()].filter(item=>item.themeIds.includes(theme.id)).map(item=>item.id),
  }))};
}
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
    unique(item.pendingGroupIds ?? [], `${item.id} pending group ID`);
    for(const id of item.pendingGroupIds ?? []) if(item.groups.some(g=>g.id===id)) errors.push(`Group ${id} both pending and active in ${item.id}`);
    for (const group of item.groups) unique(group.values.map(v => v.id), `${item.id}/${group.id} value ID`);
    for (const id of item.themeIds) if (!themeIds.has(id)) errors.push(`Unknown theme ${id} in ${item.id}`);
    for (const id of item.relatedItemIds ?? []) if (!itemIds.has(id)) errors.push(`Unknown related Item ${id} in ${item.id}`);
  }
  for (const theme of catalog.themes) for (const id of theme.itemIds)
    if (!itemIds.has(id)) errors.push(`Unknown Item ${id} in theme ${theme.id}`);
  return errors;
}
