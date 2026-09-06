import fs from "node:fs";
import path from "node:path";

const catalogPath = path.resolve("reference/catalog/kink-catalog.tsv");
const replacementPath = path.resolve("reference/catalog/catalog-id-replacements.tsv");
const outputPath = path.resolve("src/data/kinkCatalog.generated.ts");

const stableIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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

const rows = readRecords(catalogPath);
const itemIds = new Set();
const categoryLabelsById = new Map();
const categoryIdsByLabel = new Map();

const items = rows.map((row, index) => {
  const recordNumber = index + 2;
  const id = requireValue(row, "Catalog ID", recordNumber, "Catalog");
  const label = requireValue(row, "Kink", recordNumber, "Catalog");
  const categoryId = requireValue(row, "Category ID", recordNumber, "Catalog");
  const categoryLabel = requireValue(row, "Category", recordNumber, "Catalog");

  validateStableId(id, "Catalog ID", recordNumber, "Catalog");
  validateStableId(categoryId, "Category ID", recordNumber, "Catalog");

  if (itemIds.has(id)) {
    throw new Error(`Catalog record ${recordNumber}: duplicate Catalog ID "${id}".`);
  }
  itemIds.add(id);

  const existingCategoryLabel = categoryLabelsById.get(categoryId);
  if (existingCategoryLabel && existingCategoryLabel !== categoryLabel) {
    throw new Error(
      `Catalog record ${recordNumber}: Category ID "${categoryId}" maps to both "${existingCategoryLabel}" and "${categoryLabel}".`,
    );
  }
  categoryLabelsById.set(categoryId, categoryLabel);

  const existingCategoryId = categoryIdsByLabel.get(categoryLabel);
  if (existingCategoryId && existingCategoryId !== categoryId) {
    throw new Error(
      `Catalog record ${recordNumber}: Category "${categoryLabel}" maps to both "${existingCategoryId}" and "${categoryId}".`,
    );
  }
  categoryIdsByLabel.set(categoryLabel, categoryId);

  return {
    id,
    label,
    categoryId,
    categoryLabel,
    description: value(row, "Description"),
    typicalRole: value(row, "Typical Role"),
    primaryMode: value(row, "Primary Mode"),
    intensity: value(row, "Intensity"),
    riskLevel: value(row, "Risk Level"),
  };
});

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

const categoryCounts = new Map();
for (const item of items) {
  categoryCounts.set(item.categoryId, (categoryCounts.get(item.categoryId) ?? 0) + 1);
}

const categories = [...new Map(
  items.map((item) => [
    item.categoryId,
    {
      id: item.categoryId,
      label: item.categoryLabel,
      itemCount: categoryCounts.get(item.categoryId) ?? 0,
    },
  ]),
).values()].sort((a, b) => a.label.localeCompare(b.label));

const replacements = Object.fromEntries(replacementEntries);

const source = `// AUTO-GENERATED by scripts/generate-kink-catalog.mjs.
// Source of truth: reference/catalog/kink-catalog.tsv
// ID replacements: reference/catalog/catalog-id-replacements.tsv
// Do not edit this file by hand.

export type KinkCatalogItem = {
  id: string;
  label: string;
  categoryId: string;
  categoryLabel: string;
  description: string;
  typicalRole: string;
  primaryMode: string;
  intensity: string;
  riskLevel: string;
};

export type KinkCatalogCategory = {
  id: string;
  label: string;
  itemCount: number;
};

export const kinkCatalog = ${JSON.stringify(items, null, 2)} as const satisfies readonly KinkCatalogItem[];

export const kinkCategories = ${JSON.stringify(categories, null, 2)} as const satisfies readonly KinkCatalogCategory[];

export const kinkCatalogIdReplacements = ${JSON.stringify(replacements, null, 2)} as const satisfies Readonly<Record<string, string>>;
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, source);
console.log(
  `Generated ${items.length} kink items across ${categories.length} categories with ${replacementEntries.length} ID replacements.`,
);
