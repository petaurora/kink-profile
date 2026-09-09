import fs from "node:fs";
import path from "node:path";

const categoriesPath = path.resolve("reference/rewards-punishments/context-categories.tsv");
const actionsPath = path.resolve("reference/rewards-punishments/action-library.tsv");
const catalogMappingsPath = path.resolve("reference/rewards-punishments/catalog-category-mappings.tsv");
const contextSignalMappingsPath = path.resolve("reference/rewards-punishments/context-signal-mappings.tsv");
const catalogLinksPath = path.resolve("reference/rewards-punishments/catalog-source-links.tsv");
const rewardsPath = path.resolve("reference/rewards-punishments/rewards.tsv");
const punishmentsPath = path.resolve("reference/rewards-punishments/punishments.tsv");
const catalogPath = path.resolve("reference/catalog/kink-catalog.tsv");
const signalsPath = path.resolve("src/data/signals.ts");
const outputPath = path.resolve("src/data/rewardPunishmentLibrary.generated.ts");

const stableIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const allowedWeights = new Set([0.25, 0.5, 0.75, 1]);

function parseDelimited(text, delimiter = "\t") {
  const rows = []; let row = []; let field = ""; let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"') {
        if (text[index + 1] === '"') { field += '"'; index += 1; } else quoted = false;
      } else field += character;
      continue;
    }
    if (character === '"') quoted = true;
    else if (character === delimiter) { row.push(field); field = ""; }
    else if (character === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (character !== "\r") field += character;
  }
  if (quoted) throw new Error("Unterminated quoted field in TSV source.");
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows;
}
function rowsToRecords(rows) {
  const [headers, ...dataRows] = rows; if (!headers) return [];
  return dataRows.filter((row) => row.some((value) => value !== "")).map((row) =>
    Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])));
}
function readRecords(filePath) { return rowsToRecords(parseDelimited(fs.readFileSync(filePath, "utf8"))); }
function extractSignalIds() {
  const source = fs.readFileSync(signalsPath, "utf8");
  const match = source.match(/export type SignalId =([\s\S]*?);/);
  if (!match) throw new Error("Could not locate SignalId union in src/data/signals.ts.");
  return new Set([...match[1].matchAll(/"([^"]+)"/g)].map((entry) => entry[1]));
}
function value(row, field) { return String(row[field] ?? "").trim(); }
function required(row, field, n, source) { const v = value(row, field); if (!v) throw new Error(source + " record " + n + ": missing " + field + "."); return v; }
function stable(id, field, n, source) { if (!stableIdPattern.test(id)) throw new Error(source + " record " + n + ": invalid " + field + " " + id); }
function mappings(text, validIds, source, n) {
  const result = text.split(";").map((x) => x.trim()).filter(Boolean).map((entry) => {
    const i = entry.lastIndexOf(":"); if (i < 1) throw new Error(source + " record " + n + ": invalid mapping " + entry);
    const id = entry.slice(0, i); const weight = Number(entry.slice(i + 1));
    if (!validIds.has(id)) throw new Error(source + " record " + n + ": unknown category " + id);
    if (!allowedWeights.has(weight)) throw new Error(source + " record " + n + ": unsupported weight " + weight);
    return { id, weight };
  });
  if (!result.length) throw new Error(source + " record " + n + ": missing category mappings");
  if (new Set(result.map((x) => x.id)).size !== result.length) throw new Error(source + " record " + n + ": duplicate category mapping");
  return result.sort((a, b) => a.id.localeCompare(b.id));
}

const categoryIds = new Set(); const orders = new Set(); let taxonomyVersion = null;
const baseCategories = readRecords(categoriesPath).map((row, index) => {
  const n=index+2, id=required(row,"Category ID",n,"M11 categories"), label=required(row,"Category",n,"M11 categories");
  const displayOrder=Number(required(row,"Display Order",n,"M11 categories")), version=Number(required(row,"Taxonomy Version",n,"M11 categories"));
  stable(id,"Category ID",n,"M11 categories");
  if(!Number.isInteger(displayOrder)||displayOrder<1||orders.has(displayOrder))throw new Error("Invalid/duplicate M11 category order");
  if(!Number.isInteger(version)||version<1||(taxonomyVersion!==null&&taxonomyVersion!==version))throw new Error("M11 taxonomy version mismatch");
  if(categoryIds.has(id))throw new Error("Duplicate M11 category ID "+id);
  taxonomyVersion=version;categoryIds.add(id);orders.add(displayOrder);return{id,label,displayOrder};
}).sort((a,b)=>a.displayOrder-b.displayOrder);

const signalIds = extractSignalIds();
const contextSignalMappings = new Map();
const contextSignalKeys = new Set();
for (const [index,row] of readRecords(contextSignalMappingsPath).entries()) {
  const n=index+2,cid=required(row,"Context Category ID",n,"M11 context signal mappings"),sid=required(row,"Signal ID",n,"M11 context signal mappings"),weight=Number(required(row,"Weight",n,"M11 context signal mappings"));
  if(!categoryIds.has(cid))throw new Error("Unknown M11 context category "+cid+" at record "+n);
  if(!signalIds.has(sid))throw new Error("Unknown Signal ID "+sid+" at record "+n);
  if(!allowedWeights.has(weight))throw new Error("Unsupported M11 context signal weight "+weight+" at record "+n);
  const key=cid+"|"+sid;if(contextSignalKeys.has(key))throw new Error("Duplicate M11 context signal mapping "+key);
  contextSignalKeys.add(key);
  const current=contextSignalMappings.get(cid)??[];
  current.push({signalId:sid,weight,notes:value(row,"Notes")});
  contextSignalMappings.set(cid,current);
}
for(const values of contextSignalMappings.values())values.sort((a,b)=>a.signalId.localeCompare(b.signalId));

const categories = baseCategories.map((category)=>({
  ...category,
  signalMappings: contextSignalMappings.get(category.id) ?? [],
}));

const catalogItems=new Map(),catalogCategoryIds=new Set();
for(const [index,row] of readRecords(catalogPath).entries()){
 const n=index+2,id=required(row,"Catalog ID",n,"Catalog"),label=required(row,"Kink",n,"Catalog"),categoryId=required(row,"Category ID",n,"Catalog");
 catalogItems.set(id,{id,label,categoryId});catalogCategoryIds.add(categoryId);
}

const sourceRows=[
 ...readRecords(rewardsPath).map((row)=>({...row,sourceKind:"reward",label:value(row,"Reward")})),
 ...readRecords(punishmentsPath).map((row)=>({...row,sourceKind:"punishment",label:value(row,"Idea")})),
];
const sourceByKey=new Map();
for(const row of sourceRows){
 const sourceRow=Number(value(row,"Source Row")),sourceSheet=value(row,"Source Sheet"),key=row.sourceKind+"|"+sourceSheet+"|"+sourceRow;
 if(!Number.isInteger(sourceRow)||sourceByKey.has(key))throw new Error("Invalid/duplicate M11 source provenance "+key);
 sourceByKey.set(key,{sourceKind:row.sourceKind,sourceSheet,sourceFile:value(row,"Source File"),sourceRow,sourceCategory:value(row,"Category"),label:row.label});
}
const used=new Set();
function origins(text,source,n){
 const keys=text.split(";").map((x)=>x.trim()).filter(Boolean);if(!keys.length)throw new Error(source+" record "+n+": missing origins");
 return keys.map((key)=>{const o=sourceByKey.get(key);if(!o||used.has(key))throw new Error(source+" record "+n+": invalid/reused origin "+key);used.add(key);return{sourceKind:o.sourceKind,sourceSheet:o.sourceSheet,sourceFile:o.sourceFile,sourceRow:o.sourceRow,sourceCategory:o.sourceCategory};});
}

const actionIds=new Set(),actionLabels=new Set();
const actions=readRecords(actionsPath).map((row,index)=>{
 const n=index+2,id=required(row,"Action ID",n,"M11 action library"),label=required(row,"Label",n,"M11 action library"),normalized=label.toLocaleLowerCase();
 stable(id,"Action ID",n,"M11 action library");if(actionIds.has(id)||actionLabels.has(normalized))throw new Error("Duplicate M11 action identity "+id);
 const sourceOrigins=origins(required(row,"Source Origins",n,"M11 action library"),"M11 action library",n);
 for(const origin of sourceOrigins){const source=sourceByKey.get(origin.sourceKind+"|"+origin.sourceSheet+"|"+origin.sourceRow);if(source&&source.label.toLocaleLowerCase()!==normalized)throw new Error("M11 action/source label mismatch for "+id);}
 actionIds.add(id);actionLabels.add(normalized);return{id,label,description:value(row,"Description"),notes:value(row,"Notes"),contextCategories:mappings(required(row,"Context Categories",n,"M11 action library"),categoryIds,"M11 action library",n),sourceOrigins};
}).sort((a,b)=>a.label.localeCompare(b.label));

const catalogSourceOrigins={};
for(const [index,row] of readRecords(catalogLinksPath).entries()){
 const n=index+2,catalogId=required(row,"Catalog ID",n,"M11 catalog source links"),item=catalogItems.get(catalogId);if(!item||catalogSourceOrigins[catalogId])throw new Error("Invalid/duplicate M11 catalog source link "+catalogId);
 const os=origins(required(row,"Source Origins",n,"M11 catalog source links"),"M11 catalog source links",n);
 for(const origin of os){const source=sourceByKey.get(origin.sourceKind+"|"+origin.sourceSheet+"|"+origin.sourceRow);if(source&&source.label.toLocaleLowerCase()!==item.label.toLocaleLowerCase())throw new Error("M11 catalog/source label mismatch for "+catalogId);}
 catalogSourceOrigins[catalogId]=os;
}
if(used.size!==sourceByKey.size)throw new Error("M11 normalized library does not account for every raw source row.");

const catalogCategoryMappings={};
for(const [index,row] of readRecords(catalogMappingsPath).entries()){
 const n=index+2,cid=required(row,"Catalog Category ID",n,"M11 catalog mappings"),mid=required(row,"Context Category ID",n,"M11 catalog mappings"),weight=Number(required(row,"Weight",n,"M11 catalog mappings"));
 if(!catalogCategoryIds.has(cid)||!categoryIds.has(mid)||!allowedWeights.has(weight))throw new Error("Invalid M11 catalog category mapping at record "+n);
 const current=catalogCategoryMappings[cid]??[];if(current.some((x)=>x.id===mid))throw new Error("Duplicate M11 catalog/context mapping "+cid+" -> "+mid);current.push({id:mid,weight});catalogCategoryMappings[cid]=current;
}
for(const cid of catalogCategoryIds){if(!catalogCategoryMappings[cid]?.length)throw new Error("Catalog category "+cid+" has no M11 mapping");catalogCategoryMappings[cid].sort((a,b)=>a.id.localeCompare(b.id));}

const out=[
"// AUTO-GENERATED by scripts/generate-reward-punishment-library.mjs.",
"// Do not edit this file by hand.","",
"export const rewardPunishmentTaxonomyVersion = "+taxonomyVersion+" as const;","",
"export const rewardPunishmentCategories = "+JSON.stringify(categories,null,2)+" as const;","",
"export type RewardPunishmentCategoryId = (typeof rewardPunishmentCategories)[number][\"id\"];",
"export type RewardPunishmentSignalMapping = { signalId: import(\"./signals\").SignalId; weight: number; notes: string };",
"export type RewardPunishmentContextCategoryMapping = { id: RewardPunishmentCategoryId; weight: number };",
"export type RewardPunishmentSourceOrigin = { sourceKind: \"reward\" | \"punishment\"; sourceSheet: string; sourceFile: string; sourceRow: number; sourceCategory: string };",
"export type RewardPunishmentActionDefinition = { id: string; label: string; description: string; notes: string; contextCategories: readonly RewardPunishmentContextCategoryMapping[]; sourceOrigins: readonly RewardPunishmentSourceOrigin[] };","",
"export const rewardPunishmentActions = "+JSON.stringify(actions,null,2)+" as const satisfies readonly RewardPunishmentActionDefinition[];","",
"export const rewardPunishmentCatalogCategoryMappings = "+JSON.stringify(catalogCategoryMappings,null,2)+" as const;","",
"export const rewardPunishmentCatalogSourceOrigins = "+JSON.stringify(catalogSourceOrigins,null,2)+" as const;","",
"export const rewardPunishmentSourceIdeaCount = "+sourceByKey.size+" as const;",""
].join("\n");
fs.mkdirSync(path.dirname(outputPath),{recursive:true});fs.writeFileSync(outputPath,out);
console.log("Generated "+actions.length+" M11 actions across "+categories.length+" contextual categories; "+contextSignalKeys.size+" context→signal mappings; "+Object.keys(catalogCategoryMappings).length+" catalog categories mapped; "+used.size+" source rows accounted for.");
