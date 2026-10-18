import type { CatalogV2, CatalogV2Item, CatalogV2Group } from "./model";
import {modifierTemplate} from "./modifierTemplates";
/** Final approved selections from #257–#271, including #268's approval comment. */
const slug=(x:string)=>x.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const g=(name:string, values:string[]):CatalogV2Group=>({id:slug(name),name,values:values.map(name=>({id:slug(name),name}))});
const item=(name:string,themeId:string,groups:CatalogV2Group[]=[]):CatalogV2Item=>({id:slug(name),name,themeIds:[themeId],groups:groups.filter(group=>group.values.length>0),pendingGroupIds:groups.filter(group=>group.values.length===0).map(group=>group.id),collections:["kinks"]});
const collections: Record<string,CatalogV2Item[]>={
 equipment:[
 {...item("Collaring","equipment",[g("Format / Context",["Witnessed / Community"])]),description:"The consensual act, ritual or relationship meaning of giving or receiving a collar, distinct from liking collars as objects."},
 {...item("Gags","equipment",[
  // Preserve existing type/value IDs when clarifying approved display labels.
  {id:"type",name:"Form / Design",values:[
   {id:"ball",name:"Ball"},{id:"bit",name:"Bit"},{id:"ring",name:"Ring / Open-frame"},
   {id:"tape-style",name:"Tape / Mouth-covering Style"},{id:"medical-dental",name:"Medical / Dental"},
   {id:"funnel",name:"Funnel"},{id:"mouthguard-style",name:"Mouthguard-style"},
   {id:"muzzle",name:"Muzzle"},{id:"phallic",name:"Phallic",aliases:["Penis Gag"]}
  ]},
  g("Effect / Mouth State",["Speech Restriction / Muffling","Mouth Held Open","Mouth Occupied / Filled","Mouth Covered","Jaw / Mouth-position Control"]),
  g("Features / Mechanism",["Inflatable / Adjustable Pressure","Locking / Secured","Strap / Harness Configuration","Attachment Points"]),
  g("Material",["Silicone / Rubber","Leather","Metal","Fabric / Tape-like Materials"]),
  g("Context / Association",["Bondage / Restraint","Medical / Clinical","Pet / Muzzle Roleplay","Humiliation / Objectification","Aesthetic / Fantasy-only Presentation"])
 ]),description:"Mouth-restraint equipment and gagging methods, refined by design, effect, construction, material and explicitly chosen context."},
 item("Straitjackets","equipment"),item("Restraint Gear","equipment",[g("Material",["Leather","Metal"]),g("Type",["Armbinder","Bondage Mitts","Under-Bed Restraint System","Spreader Bar","Yoke","Head Harness"])]),item("Restraint Furniture / Structures","equipment",[g("Type",["A-frame","Berkley Horse","Bondage Bench","Bondage Frame","Bondage Stool","Bondage Table","Bondage Wheel","Bondage Rack","Sawhorse","Massage / Restraint Table"])]),
 item("Stocks / Pillory","equipment",[g("Style / Form",["Stocks","Pillory"])]),item("Saint Andrew's Cross","equipment",[g("Mounting",["Wall-mounted","Freestanding"])])
 ],
 impact:[
 item("Impact Play","impact",[g("Method / Practice",["Paddling","Flogging","Caning","Strapping","Crop Play","Slapper / Tawse Play","Whipping"]),g("Sensation",["Thuddy","Stingy"]),{...modifierTemplate("bodyArea"),id:"target-body-area",name:"Target / Body Area"},modifierTemplate("intensity")]),
 item("Spanking / Slapping","impact",[{...modifierTemplate("bodyArea"),id:"target-body-area",name:"Target / Body Area"},modifierTemplate("intensity")]),
 item("Paddles","impact",[g("Material",["Leather","Wood","Rubber / Silicone","Acrylic / Plastic","Metal"]),g("Construction",["Solid","Perforated / Holes","Padded"]),g("Surface / Inlay",["Smooth","Decorative Inlay / Pattern","Raised Texture","Spiked / Studded"])]),
 item("Floggers","impact",[g("Material",["Leather","Suede","Rubber / Silicone","Synthetic / Vegan Leather","Rope / Cord"]),g("Thickness",["Thin Falls","Medium Falls","Thick Falls"]),g("Tip Style",["Plain / Untied","Knotted","Weighted"])]),
 item("Canes","impact",[g("Material",["Rattan","Bamboo","Wood","Synthetic / Plastic"]),g("Thickness",["Thin","Medium","Thick"])]),
 item("Whips","impact",[g("Type",["Single-tail","Dragon-tail","Cat-o'-nine-tails","Sjambok"])]),
 item("Crops","impact",[g("Material",["Leather","Synthetic / Vegan Leather","Rubber / Silicone"]),g("Style",["Riding Crop","Jumping Bat","Dressage Whip","Lunge Whip"]),g("Tip Style",["Flat / Keeper","Looped","Popper / Lash"])]),
 item("Other Implements","impact",[g("Type",["Wooden Spoon","Hairbrush","Impact Jack / Thumper"])]),
 ...["Rhythmic Impact","Counting Impacts","Impact Warm-up","Impact Endurance","Bastinado","Florentine Flogging"].map(n=>item(n,"impact"))
 ],
 psychological:[
 item("Humiliation Play","psychological",[g("Modality",["Verbal","Task / Behavioral","Presentation / Exposure","Evaluative"]),g("Context",["Private","Witnessed / Consenting Audience","Public-style Fantasy"]),modifierTemplate("psychologicalTarget",{include:["body-appearance","genitals-sexual-anatomy","sexuality-sexual-behavior","intelligence-competence","skill-performance","behavior-conduct","role-status","neediness-desperation"]}),modifierTemplate("psychologicalTone"),modifierTemplate("intensity")]),
 item("Degradation","psychological",[g("Modality",["Verbal","Behavioral / Treatment","Symbolic / Status"]),modifierTemplate("psychologicalTarget",{include:["role-status","sexuality-sexual-behavior","intelligence-competence","behavior-conduct"]}),modifierTemplate("psychologicalTone",{include:["mocking-sarcastic","stern-critical","harsh-direct","cold-clinical","dismissive"]}),modifierTemplate("intensity")]),
 item("Objectification","psychological",[g("Framing",["Use-object Fantasy","Functional Use","Sexual Use","Decorative / Display","Property Framing","Personhood Reduction / Thing-language"]),g("Form / Role",["Dollification"])]),
 item("Embarrassment Play","psychological",[g("Context",["Private","Witnessed / Consenting Audience"]),g("Form",["Silly / Awkward Tasks","Attention / Focus","Performance / Social Awkwardness","Teasing"]),modifierTemplate("intensity")]),
 item("Name-calling","psychological",[g("Type",["Degrading","Sexual","Affectionate","Role-specific","Objectifying","Status-related"])]),
 item("Mockery","psychological",[modifierTemplate("psychologicalTone",{include:["playful-teasing","mocking-sarcastic","stern-critical","harsh-direct"]})]),
 item("Rating / Evaluation","psychological",[g("Target",["Performance / Task","Genitals","Body / Body Part","Appearance","Behavior","Sexual Performance","Skill / Ability"]),g("Style",["Praise","Critique","Teasing","Degradation","Neutral / Clinical"]),g("Format",["Numerical / Scored","Qualitative"])]),
 item("Small-penis Humiliation (SPH)","psychological"),
 item("Human Furniture","psychological",[g("Role / Function",["Stool","Footrest","Table","Display Stand"]),g("Framing",["Service","Objectification","Protocol","Humiliation","Aesthetic / Display"]),g("Duration",["Brief","Sustained","Extended"]),g("Visibility / Context",["Private","Witnessed / Consenting Audience"])]),
 item("Body Writing","psychological",[g("Medium / Tool",["Marker","Pen","Lipstick","Paint"]),g("Visibility",["Hidden","Partially Visible","Displayed"]),g("Content Type",["Ownership","Praise","Humiliation","Instructions","Decorative","Evaluative / Scoring"]),modifierTemplate("bodyArea")]),
 ],
 roleplay:[
 item("Roleplay","roleplay",[g("Scenario",["Teacher / Student","Boss / Employee","Doctor / Patient","Guard / Prisoner","Interrogation","Stranger / First Meeting","Royalty / Servant","Knight / Captive","Villain / Hero","Trainer / Trainee","Owner / Property","Historical","Photographer / Model","Delivery Person","Celebrity / Fan","Practical Sex-ed / Teaching","Cheating / Forbidden Attraction","Rescue","Adult Taboo-family-role Fantasy"]),g("Medium / Context",["VR / Virtual World"])]),
 item("Consensual Non-Consent","roleplay",[g("Scenario",["Kidnap / Abduction","Capture","Home Invasion","Threat / Coercion","Torture"])]),
 item("Creature / Nonhuman Fantasy","roleplay",[g("Type",["Monster","Vampire","Alien","Tentacles","Knotting","Oviposition"])]),
 item("Transformation Fantasy","roleplay",[g("Type",["Body Swap"])]),
 item("Mind Control / Conditioning Fantasy","roleplay",[g("Type",["Mind Control","Brainwashing / Conditioning","Psychological Control / Influence"])]),
 item("Consensual Blackmail / Leverage Play","roleplay",[g("Form",["Blackmail / Leverage","Controlled Disclosure"])]),
 item("Free Use","roleplay",[g("Context",["Public-style Simulation / Fake Public-use Fantasy"])]),
 ...["Ageplay","ABDL","Bimbofication","Inflation Fantasy","Abandonment Play Fantasy","Furry / Anthropomorphic Fantasy","Vore Fantasy","Omegaverse Fantasy","Corruption Kink","Isolation Fantasy","Sleep Play / Consensual Somnophilia"].map(n=>item(n,"roleplay"))
 ],
 power:[
 ...["Low Protocol","High Protocol"].map(n=>item(n,"power",[modifierTemplate("protocolPractice")])),
 item("Task Assignment","power",[g("Mode",["Assigning Tasks","Receiving Tasks"]),g("Structure",["Timed","Precision / Exactness"])]),
 item("Permission / Decision Control","power",[g("Domain",["Bathroom","Outings / Location","Social Plans","Spending","Appearance / Presentation","Devices / Apps","Schedule / Time","Online Presentation","Online Interaction","Communication","Interpersonal Behavior"])]),
 item("Service","power",[g("Type",["Domestic Service","Personal Assistant Service","Bootblacking","Foot Service","Food / Drink Service","Fetching","Chauffeur Service"])]),
 ...["Obedience","Command Play","D/s Contract Ritual","Honorifics / Titles","Inspection","Presentation","Automated Tasking","System Control","Verbal / Mental Restraint"].map(n=>item(n,"power")),
 item("Position Training","power",[g("Form",["Kneeling","Standing / Display","Hands Behind Back","Waiting Positions"])]),
 ],
 dynamics:[
 ...["Dominance","Submission","Switching"].map(n=>item(n,"dynamics")),
 ...["Protective Dominance","Gentle Dominance","Soft / Affectionate Submission","Disciplined / Accountability-Focused Submission","Devotional Submission"].map(n=>item(n,"dynamics",[g("Direction",["Giving / Embodying","Receiving / Experiencing"])])),
 item("Master / Slave Dynamic","dynamics",[g("Role",["Master","Slave"])]),
 item("Caregiver / Little-Middle Dynamic","dynamics",[g("Role",["Caregiver","Little","Middle"])]),
 item("Owner / Pet Dynamic","dynamics",[g("Role",["Owner / Handler","Pet"])]),
 item("Ownership","dynamics",[g("Direction",["Owning","Being Owned"]),g("Expression",["Ritual / Symbolic Expression"])]),
 item("Total Power Exchange (TPE)","dynamics",[g("Scope",["24/7","Temporary / Bounded"])]),
 item("Brat Tamer / Brat Dynamic","dynamics",[g("Role",["Tamer","Brat"])]),
 item("Findom Dynamic","dynamics",[g("Role",["Financial Dominant","Financial Submissive"])]),
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
 ...["Exhibitionism","Voyeurism"].map(n=>item(n,"exhibition",[modifierTemplate("observationMedium")])),
 item("Mirror Play","exhibition"),item("Public-Risk Fantasy","exhibition")
 ],
 marking:[
 {...item("Marking","marking",[g("Type",["Hickeys","Bruise Marking","Stamps / Temporary Tattoos","Other Temporary Marks"])]),description:"The bodily mark itself is part of the desired consensual experience; this is distinct from the practice of writing on the body."}
 ],
 sensory:[
 item("Sensory Deprivation","sensory",[g("Sense",["Sight","Hearing","Multi-sensory"]),g("Method",["Blindfold","Headphones","Earplugs"])]),
 item("Sensory Overload","sensory"),
 item("Texture Play","sensory",[g("Material / Method",["Feather","Soft Fur / Faux Fur","Silk / Satin","Abrasive / Rough Texture"]),modifierTemplate("bodyArea")]),
 item("Temperature Play","sensory",[g("Temperature",["Cold","Warm","Contrast"]),g("Method",["Water","Ice","Wax"])]),
 item("Tickling","sensory",[g("Intensity / Framing",["Tickle Torture"])]),item("ASMR","sensory")
 ],
 pain:[
 ...["Masochism","Sadism"].map(n=>item(n,"pain",[modifierTemplate("painExperience")])),
 item("Pinching","pain",[modifierTemplate("bodyArea")]),
 item("Scratching","pain",[g("Method",["Fingernails","Claw / Rake Tools"]),modifierTemplate("bodyArea")]),
 item("Biting","pain",[modifierTemplate("bodyArea")]),item("Hair Pulling","pain"),
 item("Clamp / Clip Play","pain",[g("Tool / Type",["Clothespins","Clamps","Other Clips / Clamps"]),modifierTemplate("bodyArea")]),
 item("Wartenberg Wheel","pain",[modifierTemplate("bodyArea")]),
 item("Suction Play","pain",[g("Method",["Cupping","Other Suction Methods"]),modifierTemplate("bodyArea")])
 ],
 electrical:[
 item("Electrical Play","electrical",[g("Device / Method",["TENS-style","Violet Wand","Contact Zapper","Electric Pinwheel"]),g("Sensation / Response",["Tickle / Twitch Response"]),modifierTemplate("bodyArea")])
 ]
};
const names:Record<string,string>={
dynamics:"Power Exchange & Roles",equipment:"Equipment & Objects",impact:"Impact Play",psychological:"Humiliation, Degradation & Expression",roleplay:"Fantasy & Roleplay",power:"Power Exchange & Protocol",pet:"Pet Roleplay",primal:"Primal Play",exhibition:"Exhibitionism & Voyeurism",marking:"Marking & Expression",sensory:"Sensory Play",pain:"Pain & Sensation",electrical:"Electrical Specialty"
};
export const additionalReviewedCatalog:CatalogV2={
 schemaVersion:2,
 items:Object.values(collections).flat(),
 themes:Object.entries(collections).map(([id,items])=>({id,name:names[id],description:"Approved V2 review theme",itemIds:items.map(i=>i.id)}))
};
