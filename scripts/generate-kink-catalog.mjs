import fs from "node:fs";
import path from "node:path";

const catalogPath = path.resolve("reference/catalog/kink-catalog.tsv");
const categoryPath = path.resolve("reference/catalog/catalog-categories.tsv");
const aliasPath = path.resolve("reference/catalog/catalog-aliases.tsv");
const mappingPath = path.resolve("reference/catalog/catalog-signal-mappings.tsv");
const replacementPath = path.resolve("reference/catalog/catalog-id-replacements.tsv");
const signalsPath = path.resolve("src/data/signals.ts");
const outputPath = path.resolve("src/data/kinkCatalog.generated.ts");

const stableIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const allowedMappingWeights = new Set([0.25, 0.5, 0.75, 1]);
const allowedMappingScopes = new Set(["category", "item"]);
const allowedMappingDirections = new Set(["any", "receiving", "giving"]);
const roleDirections = new Map([
  ["Receiving", "receiving"],
  ["Giving", "giving"],
  ["Both", "both"],
]);

function parseDelimited(text, delimiter = "\t") {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (quoted) {
      if (character === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"') {
      quoted = true;
    } else if (character === delimiter) {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (character !== "\r") {
      field += character;
    }
  }

  if (quoted) {
    throw new Error("Unterminated quoted field in TSV source.");
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function rowsToRecords(rows) {
  const [headers, ...dataRows] = rows;
  if (!headers) return [];

  return dataRows
    .filter((row) => row.some((value) => value !== ""))
    .map((row) =>
      Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])),
    );
}

function readRecords(filePath) {
  return rowsToRecords(parseDelimited(fs.readFileSync(filePath, "utf8")));
}

function value(row, field) {
  return String(row[field] ?? "").trim();
}

function requireValue(row, field, recordNumber, sourceName) {
  const result = value(row, field);
  if (!result) {
    throw new Error(`${sourceName} record ${recordNumber}: missing ${field}.`);
  }
  return result;
}

function validateStableId(id, field, recordNumber, sourceName) {
  if (!stableIdPattern.test(id)) {
    throw new Error(
      `${sourceName} record ${recordNumber}: ${field} "${id}" must use lowercase kebab-case.`,
    );
  }
}

function extractSignalIds() {
  const source = fs.readFileSync(signalsPath, "utf8");
  const match = source.match(/export type SignalId =([\s\S]*?);/);

  if (!match) {
    throw new Error("Could not locate SignalId union in src/data/signals.ts.");
  }

  return new Set(
    [...match[1].matchAll(/"([^"]+)"/g)].map((entry) => entry[1]),
  );
}

function mappingApplies(appliesTo, direction) {
  if (appliesTo === "any") return true;
  if (direction === "both") return true;
  return appliesTo === direction;
}

const catalogRows = readRecords(catalogPath);
const itemIds = new Set();
const catalogCategoryLabelsById = new Map();
const catalogCategoryIdsByLabel = new Map();

const baseItems = catalogRows.map((row, index) => {
  const recordNumber = index + 2;
  const id = requireValue(row, "Catalog ID", recordNumber, "Catalog");
  const label = requireValue(row, "Kink", recordNumber, "Catalog");
  const categoryId = requireValue(row, "Category ID", recordNumber, "Catalog");
  const categoryLabel = requireValue(row, "Category", recordNumber, "Catalog");
  const typicalRole = requireValue(row, "Typical Role", recordNumber, "Catalog");
  const direction = roleDirections.get(typicalRole);

  validateStableId(id, "Catalog ID", recordNumber, "Catalog");
  validateStableId(categoryId, "Category ID", recordNumber, "Catalog");

  if (itemIds.has(id)) {
    throw new Error(`Catalog record ${recordNumber}: duplicate Catalog ID "${id}".`);
  }
  itemIds.add(id);

  if (!direction) {
    throw new Error(
      `Catalog record ${recordNumber}: unsupported Typical Role "${typicalRole}".`,
    );
  }

  const existingCategoryLabel = catalogCategoryLabelsById.get(categoryId);
  if (existingCategoryLabel && existingCategoryLabel !== categoryLabel) {
    throw new Error(
      `Catalog record ${recordNumber}: Category ID "${categoryId}" maps to both "${existingCategoryLabel}" and "${categoryLabel}".`,
    );
  }
  catalogCategoryLabelsById.set(categoryId, categoryLabel);

  const existingCategoryId = catalogCategoryIdsByLabel.get(categoryLabel);
  if (existingCategoryId && existingCategoryId !== categoryId) {
    throw new Error(
      `Catalog record ${recordNumber}: Category "${categoryLabel}" maps to both "${existingCategoryId}" and "${categoryId}".`,
    );
  }
  catalogCategoryIdsByLabel.set(categoryLabel, categoryId);

  return {
    id,
    label,
    categoryId,
    categoryLabel,
    direction,
    description: value(row, "Description"),
    typicalRole,
    intensity: value(row, "Intensity"),
    riskLevel: value(row, "Risk Level"),
  };
});

const categoryRows = readRecords(categoryPath);
const categoryMetadata = new Map();
const categoryOrders = new Set();

for (const [index, row] of categoryRows.entries()) {
  const recordNumber = index + 2;
  const id = requireValue(row, "Category ID", recordNumber, "Catalog categories");
  const label = requireValue(row, "Category", recordNumber, "Catalog categories");
  const domain = requireValue(row, "Domain", recordNumber, "Catalog categories");
  const displayOrderText = requireValue(
    row,
    "Display Order",
    recordNumber,
    "Catalog categories",
  );
  const displayOrder = Number(displayOrderText);

  validateStableId(id, "Category ID", recordNumber, "Catalog categories");
  validateStableId(domain, "Domain", recordNumber, "Catalog categories");

  if (!Number.isInteger(displayOrder) || displayOrder < 1) {
    throw new Error(
      `Catalog categories record ${recordNumber}: Display Order must be a positive integer.`,
    );
  }
  if (categoryMetadata.has(id)) {
    throw new Error(
      `Catalog categories record ${recordNumber}: duplicate Category ID "${id}".`,
    );
  }
  if (categoryOrders.has(displayOrder)) {
    throw new Error(
      `Catalog categories record ${recordNumber}: duplicate Display Order ${displayOrder}.`,
    );
  }

  const catalogLabel = catalogCategoryLabelsById.get(id);
  if (!catalogLabel) {
    throw new Error(
      `Catalog categories record ${recordNumber}: unknown Category ID "${id}".`,
    );
  }
  if (catalogLabel !== label) {
    throw new Error(
      `Catalog categories record ${recordNumber}: Category ID "${id}" is labeled "${label}" here but "${catalogLabel}" in the catalog.`,
    );
  }

  categoryOrders.add(displayOrder);
  categoryMetadata.set(id, { id, label, domain, displayOrder });
}

for (const categoryId of catalogCategoryLabelsById.keys()) {
  if (!categoryMetadata.has(categoryId)) {
    throw new Error(
      `Catalog category "${categoryId}" is missing from reference/catalog/catalog-categories.tsv.`,
    );
  }
}

const aliasesByItem = new Map();
const aliasRows = readRecords(aliasPath);

for (const [index, row] of aliasRows.entries()) {
  const recordNumber = index + 2;
  const catalogId = requireValue(row, "Catalog ID", recordNumber, "Catalog aliases");
  const alias = requireValue(row, "Alias", recordNumber, "Catalog aliases");

  if (!itemIds.has(catalogId)) {
    throw new Error(
      `Catalog aliases record ${recordNumber}: unknown Catalog ID "${catalogId}".`,
    );
  }

  const aliases = aliasesByItem.get(catalogId) ?? [];
  const normalizedAlias = alias.toLocaleLowerCase();

  if (aliases.some((existing) => existing.toLocaleLowerCase() === normalizedAlias)) {
    throw new Error(
      `Catalog aliases record ${recordNumber}: duplicate alias "${alias}" for "${catalogId}".`,
    );
  }

  aliases.push(alias);
  aliasesByItem.set(catalogId, aliases);
}

const signalIds = extractSignalIds();
const mappingRows = readRecords(mappingPath);
const categoryMappings = new Map();
const itemMappings = new Map();
const mappingKeys = new Set();

for (const [index, row] of mappingRows.entries()) {
  const recordNumber = index + 2;
  const scopeType = requireValue(
    row,
    "Scope Type",
    recordNumber,
    "Catalog signal mappings",
  );
  const scopeId = requireValue(
    row,
    "Scope ID",
    recordNumber,
    "Catalog signal mappings",
  );
  const appliesTo = requireValue(
    row,
    "Applies To",
    recordNumber,
    "Catalog signal mappings",
  );
  const signalId = requireValue(
    row,
    "Signal ID",
    recordNumber,
    "Catalog signal mappings",
  );
  const weightText = requireValue(
    row,
    "Weight",
    recordNumber,
    "Catalog signal mappings",
  );
  const weight = Number(weightText);
  const notes = value(row, "Notes");

  if (!allowedMappingScopes.has(scopeType)) {
    throw new Error(
      `Catalog signal mappings record ${recordNumber}: Scope Type must be "category" or "item".`,
    );
  }
  if (!allowedMappingDirections.has(appliesTo)) {
    throw new Error(
      `Catalog signal mappings record ${recordNumber}: Applies To must be "any", "receiving", or "giving".`,
    );
  }
  if (!signalIds.has(signalId)) {
    throw new Error(
      `Catalog signal mappings record ${recordNumber}: unknown Signal ID "${signalId}".`,
    );
  }
  if (!allowedMappingWeights.has(weight)) {
    throw new Error(
      `Catalog signal mappings record ${recordNumber}: Weight "${weightText}" must be 0.25, 0.50, 0.75, or 1.00.`,
    );
  }

  if (scopeType === "category" && !categoryMetadata.has(scopeId)) {
    throw new Error(
      `Catalog signal mappings record ${recordNumber}: unknown Category ID "${scopeId}".`,
    );
  }
  if (scopeType === "item" && !itemIds.has(scopeId)) {
    throw new Error(
      `Catalog signal mappings record ${recordNumber}: unknown Catalog ID "${scopeId}".`,
    );
  }

  const mappingKey = `${scopeType}:${scopeId}:${appliesTo}:${signalId}`;
  if (mappingKeys.has(mappingKey)) {
    throw new Error(
      `Catalog signal mappings record ${recordNumber}: duplicate mapping "${mappingKey}".`,
    );
  }
  mappingKeys.add(mappingKey);

  const mapping = { appliesTo, signalId, weight, notes };
  const target = scopeType === "category" ? categoryMappings : itemMappings;
  const current = target.get(scopeId) ?? [];
  current.push(mapping);
  target.set(scopeId, current);
}

const items = baseItems.map((item) => {
  const resolvedMappings = new Map();

  for (const mapping of categoryMappings.get(item.categoryId) ?? []) {
    if (mappingApplies(mapping.appliesTo, item.direction)) {
      resolvedMappings.set(mapping.signalId, {
        signalId: mapping.signalId,
        weight: mapping.weight,
      });
    }
  }

  for (const mapping of itemMappings.get(item.id) ?? []) {
    if (mappingApplies(mapping.appliesTo, item.direction)) {
      resolvedMappings.set(mapping.signalId, {
        signalId: mapping.signalId,
        weight: mapping.weight,
      });
    }
  }

  const metadata = categoryMetadata.get(item.categoryId);

  return {
    ...item,
    domain: metadata.domain,
    aliases: [...(aliasesByItem.get(item.id) ?? [])].sort((a, b) =>
      a.localeCompare(b),
    ),
    signalMappings: [...resolvedMappings.values()].sort((a, b) =>
      a.signalId.localeCompare(b.signalId),
    ),
  };
});

const categoryCounts = new Map();
for (const item of items) {
  categoryCounts.set(item.categoryId, (categoryCounts.get(item.categoryId) ?? 0) + 1);
}

const categories = [...categoryMetadata.values()]
  .map((category) => ({
    ...category,
    itemCount: categoryCounts.get(category.id) ?? 0,
  }))
  .sort(
    (a, b) =>
      a.displayOrder - b.displayOrder || a.label.localeCompare(b.label),
  );

const domains = [...new Set(categories.map((category) => category.domain))].sort();

const replacementRows = fs.existsSync(replacementPath)
  ? readRecords(replacementPath)
  : [];
const replacementEntries = [];
const replacedIds = new Set();

for (const [index, row] of replacementRows.entries()) {
  const recordNumber = index + 2;
  const oldId = requireValue(
    row,
    "Old Catalog ID",
    recordNumber,
    "Catalog ID replacements",
  );
  const newId = requireValue(
    row,
    "New Catalog ID",
    recordNumber,
    "Catalog ID replacements",
  );

  validateStableId(
    oldId,
    "Old Catalog ID",
    recordNumber,
    "Catalog ID replacements",
  );
  validateStableId(
    newId,
    "New Catalog ID",
    recordNumber,
    "Catalog ID replacements",
  );

  if (oldId === newId) {
    throw new Error(
      `Catalog ID replacements record ${recordNumber}: old and new IDs are both "${oldId}".`,
    );
  }
  if (replacedIds.has(oldId)) {
    throw new Error(
      `Catalog ID replacements record ${recordNumber}: duplicate old ID "${oldId}".`,
    );
  }
  if (itemIds.has(oldId)) {
    throw new Error(
      `Catalog ID replacements record ${recordNumber}: old ID "${oldId}" still exists in the active catalog.`,
    );
  }
  if (!itemIds.has(newId)) {
    throw new Error(
      `Catalog ID replacements record ${recordNumber}: replacement target "${newId}" does not exist in the active catalog.`,
    );
  }

  replacedIds.add(oldId);
  replacementEntries.push([oldId, newId]);
}

const replacements = Object.fromEntries(replacementEntries);
const mappedItemCount = items.filter((item) => item.signalMappings.length > 0).length;

const source = `// AUTO-GENERATED by scripts/generate-kink-catalog.mjs.
// Sources:
// - reference/catalog/kink-catalog.tsv
// - reference/catalog/catalog-categories.tsv
// - reference/catalog/catalog-aliases.tsv
// - reference/catalog/catalog-signal-mappings.tsv
// - reference/catalog/catalog-id-replacements.tsv
// Do not edit this file by hand.

import type { SignalId } from "./signals";

export const kinkCatalogDomains = ${JSON.stringify(domains, null, 2)} as const;

export type KinkCatalogDomain = (typeof kinkCatalogDomains)[number];

export type KinkCatalogDirection = "receiving" | "giving" | "both";

export type KinkCatalogSignalMapping = {
  signalId: SignalId;
  weight: number;
};

export type KinkCatalogItem = {
  id: string;
  label: string;
  categoryId: string;
  categoryLabel: string;
  domain: KinkCatalogDomain;
  direction: KinkCatalogDirection;
  aliases: readonly string[];
  signalMappings: readonly KinkCatalogSignalMapping[];
  description: string;
  typicalRole: string;
  intensity: string;
  riskLevel: string;
};

export type KinkCatalogCategory = {
  id: string;
  label: string;
  domain: KinkCatalogDomain;
  displayOrder: number;
  itemCount: number;
};

export const kinkCatalog = ${JSON.stringify(items, null, 2)} as const satisfies readonly KinkCatalogItem[];

export const kinkCategories = ${JSON.stringify(categories, null, 2)} as const satisfies readonly KinkCatalogCategory[];

export const kinkCatalogIdReplacements = ${JSON.stringify(replacements, null, 2)} as const satisfies Readonly<Record<string, string>>;
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, source);
console.log(
  `Generated ${items.length} kink items across ${categories.length} categories / ${domains.length} domains; ${mappedItemCount} items have signal mappings; ${replacementEntries.length} ID replacements.`,
);
