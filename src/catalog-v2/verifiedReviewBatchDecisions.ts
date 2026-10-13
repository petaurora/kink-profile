import type { MigrationDecision } from "./migration";
/** Each source ID below was checked against reference/catalog/kink-catalog.tsv.
 * Target semantics are from final decisions in #259, #260, #263, #264, #266.
 * One-to-many or ambiguous transformations remain 'review' to avoid cloning ratings.
 */
const direct=(sourceId:string,targetItemId=sourceId):MigrationDecision=>({sourceId,outcome:"item",targetItemId});
const modifier=(sourceId:string,targetItemId:string,groupId:string,valueId:string):MigrationDecision=>({sourceId,outcome:"refinement",targetItemId,groupId,valueId});
const review=(sourceId:string,reason:string):MigrationDecision=>({sourceId,outcome:"review",reason});
export const verifiedReviewBatchDecisions: MigrationDecision[]=[
 // #259: psychological expressions
 ...["degradation","objectification","embarrassment-play","name-calling","mockery","human-furniture"].map(id=>direct(id)),
 modifier("verbal-humiliation","humiliation-play","modality","verbal"),
 modifier("use-object-fantasy","objectification","framing","use-object-fantasy"),
 modifier("private-humiliation","humiliation-play","context","private"),
 modifier("public-style-humiliation-fantasy","humiliation-play","context","public-style-fantasy"),
 modifier("performance-evaluation","rating-evaluation","target","performance-task"),
 review("small-task-humiliation","Approved under Embarrassment Play, but source wording combines multiple task forms"),
 ...["formal-correction","scolding","lecture-disciplinary-talk","corner-time","lines-writing-punishment"].map(id=>review(id,"Deferred to Rewards & Punishments review (#259/#262)")),
 // #263: roles, relationship dynamics and distinct orientation
 ...["dominance","submission","switching","protective-dominance","gentle-dominance"].map(id=>direct(id)),
 direct("master-slave-dynamic"),
 direct("total-power-exchange-fantasy","total-power-exchange-tpe"),
 modifier("24-7-power-exchange","total-power-exchange-tpe","scope","24-7"),
 modifier("weekend-temporary-tpe","total-power-exchange-tpe","scope","temporary-bounded"),
 modifier("bratting","brat-tamer-brat-dynamic","role","brat"),
 modifier("brat-taming","brat-tamer-brat-dynamic","role","tamer"),
 review("soft-submission","Approved directional style; original source does not distinguish embodying versus experiencing"),
 review("disciplined-submission","Approved directional style; original source does not distinguish embodying versus experiencing"),
 review("devotional-submission","Approved directional style; original source does not distinguish embodying versus experiencing"),
 review("worship-kink","Approved directional Worship Item; original source lacks giving/receiving orientation"),
 modifier("ownership-ritual","ownership","expression","ritual-symbolic-expression"),
 review("owner-property-dynamic","Split Ownership and Objectification/property framing; do not duplicate preference"),
 ...["daddy-babygirl-dynamic","mommy-little-dynamic","caretaker-little-dynamic"].map(id=>review(id,"Caregiver/Little-Middle dynamic: original role preference unspecified")),
 ...["pet-owner-dynamic","handler-pet-dynamic"].map(id=>review(id,"Owner/Pet dynamic: original role preference unspecified")),
 // #264: protocol and independent service concepts
 ...["high-protocol","low-protocol","obedience","command-play","honorifics-titles","inspection","presentation","task-assignment","d-s-contract-ritual"].map(id=>direct(id)),
 direct("service-submission","service"),
 review("speech-protocol","Applies to Low and High Protocol separately; original source lacks scope"),
 review("eye-contact-protocol","Applies to Low and High Protocol separately; original source lacks scope"),
 review("etiquette-training","Applies to Low and High Protocol separately; original source lacks scope"),
 ...["domestic-service","personal-assistant-service","bootblacking","foot-service","fetching"].map(id=>modifier(id,"service","type",id)),
 modifier("serving-drinks","service","type","food-drink-service"),
 modifier("serving-meals","service","type","food-drink-service"),
 modifier("timed-task-protocol","task-assignment","structure","timed"),
 modifier("precision-task-protocol","task-assignment","structure","precision-exactness"),
 modifier("bathroom-permission-protocol","permission-decision-control","domain","bathroom"),
 review("protocol","Browse alias only. Rating needs explicit Low/High Protocol destination"),
 review("permission-protocols","Multiple permission domains; source lacks target specificity"),
 review("position-protocols","Position Training form unspecified"),
 modifier("kneeling-protocol","position-training","form","kneeling"),
 direct("posture-training","position-training"),
 modifier("waiting-position","position-training","form","waiting-positions"),
 review("hand-feeding","Deferred cross-family mechanism review (#264)"),
 review("traffic-light-check-in-system","Safety/check-in system deferred (#264)"),
 review("scene-negotiation-kink","Deferred Miscellaneous & Meta-Kink (#264)"),
 // #266 primal
 ...["primal-play","chase-play","struggle-play","growling-animalistic-vocalization","scenting"].map(id=>direct(id)),
 modifier("primal-hunter","primal-play","role","hunter-predator"),
 modifier("primal-prey","primal-play","role","prey"),
 modifier("wrestling","struggle-play","method","wrestling"),
 modifier("pinning","struggle-play","method","pinning"),
 direct("biting-in-primal-play","biting"),
];
