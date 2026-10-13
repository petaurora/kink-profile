import type {CatalogProfileState,CatalogPreferenceState} from "../lib/catalogProfile";
import type {PreferenceRating} from "../services/contracts";
import type {CatalogV2} from "./model";
import {buildLegacyPreferenceArchive} from "./fullSourceDisposition";
import type {MigrationReport} from "./migration";

const ratings:Record<CatalogPreferenceState,PreferenceRating>={
 love:"Love",like:"Like",curious:"Curious",unsure:"Unsure",
 not_interested:"Not Interested",hard_limit:"Hard Limit",not_applicable:"Not Applicable",
};
type Context="overall"|"giving"|"receiving";
export type LegacyCatalogProfileArchive={
 schemaVersion:2;
 source:"kink-catalog-v1";
 status:"awaiting-db-reconciliation";
 /** Complete original payload, including directions, timestamps and ranking history. */
 originalProfile:CatalogProfileState;
 retainedContexts:Record<string,Partial<Record<Context,string>>>;
};

/** Pure preparation for a reviewed import. Never uses V1's directional fallback.
 * Only explicit overall values enter the approved scalar migration. Giving and
 * receiving stay archived until their precise scoped destinations are reviewed.
 * No storage write, source deletion or automatic import occurs.
 */
export function buildLegacyCatalogProfileArchive(
 original:CatalogProfileState,catalog:CatalogV2,existing:Record<string,PreferenceRating>={},
):{migratedRatings:Record<string,PreferenceRating>;archive:LegacyCatalogProfileArchive;report:MigrationReport} {
 const originalProfile=structuredClone(original);
 const overall=Object.fromEntries(Object.entries(originalProfile.preferences)
  .filter(([,preference])=>preference.overall!==undefined)
  .map(([sourceId,preference])=>[sourceId,ratings[preference.overall!]]));
 const plan=buildLegacyPreferenceArchive(overall,catalog,existing);
 const retainedContexts:LegacyCatalogProfileArchive["retainedContexts"]={};
 for(const [sourceId,preference] of Object.entries(originalProfile.preferences)){
  const reasons:Partial<Record<Context,string>>={};
  if(plan.archive.reasons[sourceId])reasons.overall=plan.archive.reasons[sourceId];
  for(const context of ["giving","receiving"] as const)
   if(preference[context]!==undefined)reasons[context]="Original directional preference retained; exact scoped V2 destination awaits review";
  if(Object.keys(reasons).length)retainedContexts[sourceId]=reasons;
 }
 return {migratedRatings:plan.migratedRatings,report:plan.report,archive:{
  schemaVersion:2,source:"kink-catalog-v1",status:"awaiting-db-reconciliation",originalProfile,retainedContexts,
 }};
}
