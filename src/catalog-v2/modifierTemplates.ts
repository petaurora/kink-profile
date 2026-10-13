import type {CatalogV2Group} from "./model";

/** Shared approved definitions. Identity is explicit; display names may change.
 * A template creates a fresh Item-scoped group, never a shared preference record.
 */
export const modifierTemplates: Record<string,CatalogV2Group> = {
 protocolPractice:{id:"practice",name:"Practice",values:[
  {id:"speech-communication",name:"Speech / Communication"},{id:"eye-contact",name:"Eye Contact"},
  {id:"etiquette",name:"Etiquette"},{id:"check-ins-reporting",name:"Check-ins / Reporting"},
  {id:"messaging",name:"Messaging"},{id:"online-interaction",name:"Online Interaction"},
  {id:"communication-restriction-silence",name:"Communication Restriction / Silence"}
 ]},
 painExperience:{id:"experience",name:"Experience",values:[
  {id:"endurance-sustained-pain",name:"Endurance / Sustained Pain"},
  {id:"pain-processing-response",name:"Pain Processing / Response"}
 ]},
 observationMedium:{id:"context-medium",name:"Context / Medium",values:[
  {id:"partner",name:"Partner"},{id:"consenting-audience",name:"Consenting Audience"},
  {id:"photography",name:"Photography"},{id:"video-recording",name:"Video Recording"},
  {id:"live-remote-camera",name:"Live / Remote Camera"}
 ]},
 // #259 supplies these vocabularies; each Item's applicability is separate.
 psychologicalTarget:{id:"target-focus",name:"Target / Focus",values:[
  {id:"body-appearance",name:"Body / Appearance"},{id:"specific-body-part",name:"Specific Body Part"},
  {id:"genitals-sexual-anatomy",name:"Genitals / Sexual Anatomy"},
  {id:"sexuality-sexual-behavior",name:"Sexuality / Sexual Behavior"},
  {id:"intelligence-competence",name:"Intelligence / Competence"},
  {id:"skill-performance",name:"Skill / Performance"},{id:"behavior-conduct",name:"Behavior / Conduct"},
  {id:"role-status",name:"Role / Status"},{id:"neediness-desperation",name:"Neediness / Desperation"},
  {id:"presentation-appearance",name:"Presentation / Appearance"}
 ]},
 psychologicalTone:{id:"tone-style",name:"Tone / Style",values:[
  {id:"playful-teasing",name:"Playful / Teasing"},{id:"mocking-sarcastic",name:"Mocking / Sarcastic"},
  {id:"stern-critical",name:"Stern / Critical"},{id:"harsh-direct",name:"Harsh / Direct"},
  {id:"cold-clinical",name:"Cold / Clinical"},{id:"dismissive",name:"Dismissive"},
  {id:"neutral-matter-of-fact",name:"Neutral / Matter-of-fact"}
 ]},
};

/** Inclusion/relabeling is Item-local and preserves unchanged value IDs. */
export function modifierTemplate(key:string, overrides:{include?:string[];name?:string}={}):CatalogV2Group {
 const source=modifierTemplates[key];
 if(!source)throw new Error(`Unknown modifier template: ${key}`);
 if(overrides.include?.some(id=>!source.values.some(value=>value.id===id)))
  throw new Error(`Unknown value in modifier template: ${key}`);
 const values=overrides.include ? overrides.include.map(id=>source.values.find(value=>value.id===id)!) : source.values;
 return {
  id:source.id,name:overrides.name ?? source.name,
  values:values.map(value=>({...value})),
 };
}
