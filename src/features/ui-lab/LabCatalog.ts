export type Item={id:string;name:string;category:string;description?:string;groups:{name:string;values:string[]}[]};
export const catalogSeeds:Record<string,string[]>={
 "Power Exchange":["Collars","Ownership","Protocol","Service","Permission Rituals","Authority Exchange","Roleplay","Obedience","Rules","Ceremonies","Training","Devotion"],
 "Restraint & Control":["Restraints","Cuffs","Rope Bondage","Blindfolds","Chastity","Positioning","Movement Restriction","Sensory Deprivation","Harnesses","Shibari","Suspension","Confinement"],
 "Sensation & Intensity":["Sensory Play","Wartenberg Wheel","Compression Clothing","Temperature Play","Impact Play","Texture Play","Cupping","Massage","Wax Play","Pressure Play","Tickling","Sound Play"],
 "Connection & Expression":["Praise","Privileges","Aftercare","Affection","Pet Play","Primal Play","Exhibitionism","Voyeurism","Role Reversal","Teasing","Anticipation","Body Worship"]
};
const specific:Record<string,Item["groups"]>={
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
export const items:Item[]=Object.entries(catalogSeeds).flatMap(([category,names])=>names.map((name,i)=>({id:category+":"+i,name,category,description:descriptions[name],groups:specific[name]||[{name:"Context",values:["Everyday","Scene / Play","Ceremonial"]},{name:"Role",values:["Giving","Receiving","Self-directed"]}]})));
// Shared inline search semantics for Kinks, Rewards & Punishments and Explore All.
// Search available Item metadata consistently, independent of collection filters.
export function normalizedSearch(value:string){
 return value.normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase().replace(/[^a-z0-9]+/g," ").trim();
}
export function matchesCatalogSearch(item:Item,query:string){
 const words=normalizedSearch(query).split(" ").filter(Boolean);
 if(!words.length)return true;
 const searchable=normalizedSearch([item.name,item.description||"",item.category,...item.groups.flatMap(g=>[g.name,...g.values])].join(" "));
 return words.every(word=>searchable.includes(word));
}
