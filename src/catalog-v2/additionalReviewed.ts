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
 item("Paddles","impact",[g("Material",["Leather","Wood","Rubber / Silicone","Acrylic / Plastic","Metal"]),g("Construction",["Solid","Perforated / Holes","Padded"]),g("Surface / Inlay",["Smooth","Decorative Inlay / Pattern","Raised Texture","Spiked / Studded"])]),
 item("Floggers","impact",[g("Material",["Leather","Suede","Rubber / Silicone","Synthetic / Vegan Leather","Rope / Cord"]),g("Thickness",["Thin Falls","Medium Falls","Thick Falls"]),g("Tip Style",["Plain / Untied","Knotted","Weighted"])]),
 item("Canes","impact",[g("Material",["Rattan","Bamboo","Wood","Synthetic / Plastic"]),g("Thickness",["Thin","Medium","Thick"])]),
 item("Whips","impact",[g("Type",["Single-tail","Dragon-tail","Cat-o'-nine-tails","Sjambok"])]),
 item("Crops","impact",[g("Material",["Leather","Synthetic / Vegan Leather","Rubber / Silicone"]),g("Style",["Riding Crop","Jumping Bat","Dressage Whip","Lunge Whip"]),g("Tip Style",["Flat / Keeper","Looped","Popper / Lash"])]),
 item("Other Implements","impact",[g("Type",["Wooden Spoon","Hairbrush","Impact Jack / Thumper"])]),
 ...["Rhythmic Impact","Counting Impacts","Impact Warm-up","Impact Endurance","Bastinado","Florentine Flogging"].map(n=>item(n,"impact"))
 ],
 psychological:[
 ...["Humiliation","Degradation","Objectification","Embarrassment Play","Name-calling","Mockery","Rating / Evaluation","Small Penis Humiliation","Human Furniture","Body Writing"].map(n=>item(n,"psychological"))
 ],
 roleplay:[
 item("Roleplay","roleplay",[g("Scenario",["Teacher / Student","Boss / Employee","Doctor / Patient","Guard / Prisoner","Interrogation","Stranger / First Meeting","Royalty / Servant","Knight / Captive","Villain / Hero","Trainer / Trainee","Owner / Property","Historical","Photographer / Model","Delivery Person","Celebrity / Fan","Practical Sex-ed / Teaching","Cheating / Forbidden Attraction","Rescue","Adult Taboo-family-role Fantasy"]),g("Medium / Context",["VR / Virtual World"])]),
 item("Consensual Non-Consent","roleplay",[g("Scenario",["Kidnap / Abduction","Capture","Home Invasion","Threat / Coercion","Torture"])]),
 item("Creature / Nonhuman Fantasy","roleplay",[g("Type",["Monster","Vampire","Alien","Tentacles","Knotting","Oviposition"])]),
 item("Transformation Fantasy","roleplay",[g("Type",["Body Swap"])]),
 item("Mind Control / Conditioning Fantasy","roleplay",[g("Type",["Mind Control","Brainwashing / Conditioning","Psychological Control / Influence"])]),
 item("Consensual Blackmail / Leverage Play","roleplay",[g("Form",["Blackmail / Leverage","Controlled Disclosure"])]),
 item("Free Use","roleplay",[g("Context",["Public-style Simulation / Fake Public-use Fantasy"])]),
 ...["Ageplay","ABDL","Bimbofication","Inflation Fantasy","Abandonment Play Fantasy","Furry / Anthro Fantasy","Vore Fantasy","Omegaverse Fantasy","Corruption Kink","Isolation Fantasy","Sleep Play / Consensual Somnophilia"].map(n=>item(n,"roleplay"))
 ],
 power:[
 ...["Low Protocol","High Protocol"].map(n=>item(n,"power",[g("Practice",["Speech / Communication","Eye Contact","Etiquette","Check-ins / Reporting","Messaging","Online Interaction","Communication Restriction / Silence"])])),
 item("Task Assignment","power",[g("Mode",["Assigning Tasks","Receiving Tasks"]),g("Structure",["Timed","Precision / Exactness"])]),
 item("Permission / Decision Control","power",[g("Domain",["Bathroom","Outings / Location","Social Plans","Spending","Appearance / Presentation","Devices / Apps","Schedule / Time","Online Presentation","Online Interaction","Communication","Interpersonal Behavior"])]),
 item("Service","power",[g("Type",["Domestic Service","Personal Assistant Service","Bootblacking","Foot Service","Food / Drink Service","Fetching","Chauffeur Service"])]),
 ...["Obedience","Command Play","D/s Contract Ritual","Honorifics / Titles","Inspection","Presentation","Automated Tasking","System Control","Verbal / Mental Restraint"].map(n=>item(n,"power")),
 item("Position Training","power",[g("Form",["Kneeling","Standing / Display","Hands Behind Back","Waiting Positions"])]),
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
