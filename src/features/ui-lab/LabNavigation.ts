export const primaryAreas = ["Home", "Catalog", "Profile", "Discover", "Tools"] as const;
export type PrimaryArea = typeof primaryAreas[number];
export type LabArea = PrimaryArea | "Creations" | "Learn" | "Relationships" | "Settings";
const destinations: Record<LabArea,string> = { Home:"home",Catalog:"catalog",Profile:"profile",Discover:"discover",Tools:"tools",Creations:"creations",Learn:"learn",Relationships:"relationships",Settings:"settings" };
const workspaces: Partial<Record<LabArea, Record<string,string>>> = {
  Catalog:{"Explore All":"all",Kinks:"kinks","Rewards & Punishments":"rewards-punishments","Concept Explorer":"concepts","Subject Overview":"subject"},
  Profile:{"My Profile":"records",Preferences:"preferences","Sharing & Permissions":"sharing","Identity & Expression":"identity"},
  Discover:{Learn:"learn",React:"react",Play:"play","Surprise Me":"surprise","Discovery Preview":"preview","Manage Suggestions":"suggestions","Saved Activities":"activities",Activity:"activity"},
  Learn:{Article:"article"},
  Tools:{"Scene Builder":"scenes","Agreements & Rituals":"agreements","Randomizers & Recipes":"randomizers-recipes","Compare Profiles":"compare"},
};
export function labPath(area: LabArea, workspace="", params?: Record<string,string>) {
  const suffix=workspace?workspaces[area]?.[workspace]:"";
  const query=new URLSearchParams(params);
  return `/ui-lab/${destinations[area]}${suffix?`/${suffix}`:""}${query.size?`?${query}`:""}`;
}
export function parseLabRoute(pathname: string, search="") {
  const [,areaSlug,workspaceSlug,...extra]=pathname.slice(1).split("/");
  const area=(Object.keys(destinations) as LabArea[]).find(area=>destinations[area]===areaSlug) || "Home";
  const workspace=Object.keys(workspaces[area]||{}).find(label=>workspaces[area]?.[label]===workspaceSlug)||"";
  const params=new URLSearchParams(search);
  const unknown=Boolean((areaSlug&&!Object.values(destinations).includes(areaSlug))||(workspaceSlug&&!workspace)||extra.length);
  return { area, workspace, params, unknown };
}
