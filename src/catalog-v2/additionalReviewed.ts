import type { CatalogV2, CatalogV2Item, CatalogV2Group } from "./model";
/** Approved selections from #257–#271. This is NOT a comprehensive V1 migration ledger. */
const slug=(x:string)=>x.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const g=(name:string, values:string[]):CatalogV2Group=>({id:slug(name),name,values:values.map(name=>({id:slug(name),name}))});
const item=(name:string,themeId:string,groups:CatalogV2Group[]=[]):CatalogV2Item=>({id:slug(name),name,themeIds:[themeId],groups:groups.filter(group=>group.values.length>0),collections:["kinks"]});
const groupOf=(name:string,theme:string, groups:CatalogV2Group[]=[])=>(item(name,theme,groups));
const collections: Record<string,CatalogV2Item[]>={
 equipment:[
 item("Collaring","equipment"),item("Gags","equipment", [g("Type",["Ball","Bit","Ring","Tape-style","Medical / Dental","Muzzle"])]),
 item("Straitjackets","equipment"),item("Restraint Furniture / Structures","equipment"),
 item("Stocks / Pillory","equipment"),item("Saint Andrew's Cross","equipment")
 ],
 impact:[
 item("Impact Play","impact",[g("Method / Practice",["Paddling","Flogging","Caning","Strapping","Crop Play","Slapper / Tawse Play","Whipping"]),g("Sensation",["Thuddy","Stingy"])]),
 item("Spanking / Slapping","impact"),
 item("Paddles","impact",[g("Material",["Rubber / Silicone"])]),
 item("Floggers","impact"),
 item("Canes","impact"),
 item("Whips","impact",[g("Type",["Single-tail","Dragon-tail","Cat-o'-nine-tails","Sjambok"])]),
 item("Crops","impact"),
 item("Other Implements","impact",[g("Type",["Wooden Spoon","Hairbrush","Impact Jack / Thumper"])]),
 ...["Rhythmic Impact","Counting Impacts","Impact Warm-up","Impact Endurance","Bastinado","Florentine Flogging"].map(n=>item(n,"impact"))
 ],
 psychological:[
 ...["Humiliation","Degradation","Objectification","Embarrassment Play","Name-calling","Mockery","Rating / Evaluation","Small Penis Humiliation","Human Furniture","Body Writing"].map(n=>item(n,"psychological"))
 ],
 roleplay:[
 ...["Roleplay","Consensual Non-Consent","Ageplay","ABDL","Creature / Nonhuman Fantasy","Transformation Fantasy","Bimbofication","Inflation Fantasy","Abandonment Play Fantasy","Furry / Anthro Fantasy","Vore Fantasy","Omegaverse","Corruption Fantasy","Isolation Fantasy"].map(n=>item(n,"roleplay"))
 ],
 power:[
 ...["Low Protocol","High Protocol","Command Play","Permission / Decision Control","Service","Automated Tasking / System Control","Position Training","Verbal / Mental Restraint"].map(n=>item(n,"power")),
 ],
 pet:[
 item("Pet Roleplay","pet",[g("Species / Role",["Puppy","Kitten","Pony","Bunny","Fox"]),g("Expression",["Feeding Bowl","Crawling / All-fours","Pet Bed","Crate / Kennel","Tails / Ears"])]),
 item("Pet Training","pet",[g("Method",["Verbal Commands / Cues","Tricks","Routines","Clicker Training"])]),item("Leash Play","pet")
 ],
 primal:[
 item("Primal Play","primal",[g("Role",["Hunter / Predator","Prey"])]),
 item("Chase Play","primal"),item("Struggle Play","primal",[g("Method",["Wrestling","Pinning"])]),
 item("Growling / Animalistic Vocalization","primal"),item("Scenting","primal")
 ],
 exhibition:[
 ...["Exhibitionism","Voyeurism"].map(n=>item(n,"exhibition",[g("Context / Medium",["Partner","Consenting Audience","Photography","Video Recording","Live / Remote Camera"])])),
 item("Mirror Play","exhibition"),item("Public-Risk Fantasy","exhibition")
 ],
 sensory:[
 item("Sensory Deprivation","sensory",[g("Sense",["Sight","Hearing","Multi-sensory"]),g("Method",["Blindfold","Headphones","Earplugs"])]),
 item("Sensory Overload","sensory"),
 item("Texture Play","sensory",[g("Material / Method",["Feather","Soft Fur / Faux Fur","Silk / Satin","Abrasive / Rough Texture"]),g("Body Part",[])]),
 item("Temperature Play","sensory",[g("Temperature",["Cold","Warm","Contrast"]),g("Method",["Water","Ice","Wax"])]),
 item("Tickling","sensory",[g("Intensity / Framing",["Tickle Torture"])]),item("ASMR","sensory")
 ],
 pain:[
 ...["Masochism","Sadism"].map(n=>item(n,"pain",[g("Experience",["Endurance / Sustained Pain","Pain Processing / Response"])])),
 item("Pinching","pain",[g("Body Part",[])]),
 item("Scratching","pain",[g("Method",["Fingernails","Claw / Rake Tools"]),g("Body Part",[])]),
 item("Biting","pain",[g("Body Part",[])]),item("Hair Pulling","pain"),
 item("Clamp / Clip Play","pain",[g("Tool / Type",["Clothespins","Clamps","Other Clips / Clamps"]),g("Body Part",[])]),
 item("Wartenberg Wheel","pain",[g("Body Part",[])]),
 item("Suction Play","pain",[g("Method",["Cupping","Other Suction Methods"]),g("Body Part",[])])
 ],
 electrical:[
 item("Electrical Play","electrical",[g("Device / Method",["TENS-style","Violet Wand","Contact Zapper","Electric Pinwheel"]),g("Sensation / Response",["Tickle / Twitch Response"]),g("Body Part",[])])
 ]
};
const names:Record<string,string>={
equipment:"Equipment & Objects",impact:"Impact Play",psychological:"Humiliation, Degradation & Expression",roleplay:"Fantasy & Roleplay",power:"Power Exchange & Protocol",pet:"Pet Roleplay",primal:"Primal Play",exhibition:"Exhibitionism & Voyeurism",sensory:"Sensory Play",pain:"Pain & Sensation",electrical:"Electrical Specialty"
};
export const additionalReviewedCatalog:CatalogV2={
 schemaVersion:2,
 items:Object.values(collections).flat(),
 themes:Object.entries(collections).map(([id,items])=>({id,name:names[id],description:"Approved V2 review theme",itemIds:items.map(i=>i.id)}))
};
