/** Explicit review-to-implementation acceptance criteria.
 * Provenance refers to the final approval sections of the linked review issues.
 * This list intentionally begins with high-confidence missing structures; it is
 * NOT yet a full extraction of every source row or approval.
 */
export type ReviewExpectation = {
 sourceIssue: number;
 itemId: string;
 groups?: Record<string, readonly string[]>;
 decision: "approved" | "inferred";
 note?: string;
};
export const reconciliationExpectations: readonly ReviewExpectation[] = [
 {sourceIssue:259,itemId:"humiliation-play",decision:"approved",groups:{"modality":["verbal","task-behavioral","presentation-exposure","evaluative"],"context":["private","witnessed-consenting-audience","public-style-fantasy"]}},
 {sourceIssue:259,itemId:"degradation",decision:"approved",groups:{"modality":["verbal","behavioral-treatment","symbolic-status"]}},
 {sourceIssue:259,itemId:"objectification",decision:"approved",groups:{"framing":["use-object-fantasy","functional-use","sexual-use","decorative-display","ownership-property","dollification"]}},
 {sourceIssue:259,itemId:"rating-evaluation",decision:"approved",groups:{"style":["praise","critique","teasing","degradation","neutral-clinical"],"format":["numerical-scored","qualitative"]}},
 {sourceIssue:259,itemId:"human-furniture",decision:"approved",groups:{"role-function":["stool","footrest","table","display-stand"]}},
 {sourceIssue:259,itemId:"body-writing",decision:"approved",groups:{"content-type":["ownership","praise","humiliation","instructions","decorative","evaluative-scoring"]}},
 {sourceIssue:263,itemId:"master-slave-dynamic",decision:"approved",groups:{"role":["master","slave"]}},
 {sourceIssue:263,itemId:"caregiver-little-middle-dynamic",decision:"approved",groups:{"role":["caregiver","little","middle"]}},
 {sourceIssue:263,itemId:"owner-pet-dynamic",decision:"approved",groups:{"role":["owner-handler","pet"]}},
 {sourceIssue:263,itemId:"ownership",decision:"approved",groups:{"direction":["owning","being-owned"]}},
 {sourceIssue:263,itemId:"total-power-exchange-tpe",decision:"approved",groups:{"scope":["24-7","temporary-bounded"]}},
 {sourceIssue:263,itemId:"worship",decision:"approved",groups:{"direction":["giving","receiving"]}},
 {sourceIssue:257,itemId:"restraint-gear",decision:"approved",groups:{"type":["armbinder","bondage-mitts","under-bed-system","spreader-bar","yoke","head-harness"]}},
 {sourceIssue:257,itemId:"saint-andrew-s-cross",decision:"approved",groups:{"mounting":["wall-mounted","freestanding"]}},

 {sourceIssue:264,itemId:"low-protocol",decision:"approved",groups:{"practice":["speech-communication","eye-contact","etiquette","check-ins-reporting","messaging","online-interaction","communication-restriction-silence"]}},
 {sourceIssue:264,itemId:"high-protocol",decision:"approved",groups:{"practice":["speech-communication","eye-contact","etiquette","check-ins-reporting","messaging","online-interaction","communication-restriction-silence"]}},
 {sourceIssue:264,itemId:"task-assignment",decision:"approved",groups:{"mode":["assigning-tasks","receiving-tasks"],"structure":["timed","precision-exactness"]}},
 {sourceIssue:264,itemId:"permission-decision-control",decision:"approved",groups:{"domain":["bathroom","outings-location","social-plans","spending","appearance-presentation","devices-apps","schedule-time","online-presentation","online-interaction","communication","interpersonal-behavior"]}},
 {sourceIssue:264,itemId:"service",decision:"approved",groups:{"type":["domestic-service","personal-assistant-service","bootblacking","foot-service","food-drink-service","fetching","chauffeur-service"]}},
 ...["obedience","command-play","d-s-contract-ritual","honorifics-titles","inspection","presentation","automated-tasking","system-control"].map(itemId=>({sourceIssue:264,itemId,decision:"approved" as const})),

 {sourceIssue:260,itemId:"roleplay",decision:"approved",groups:{"scenario":["teacher-student","boss-employee","doctor-patient","guard-prisoner","interrogation","stranger-first-meeting","royalty-servant","knight-captive","villain-hero","trainer-trainee","owner-property","historical","photographer-model","delivery-person","celebrity-fan","practical-sex-ed-teaching","cheating-forbidden-attraction","rescue","adult-taboo-family-role-fantasy"],"medium-context":["vr-virtual-world"]}},
 {sourceIssue:260,itemId:"consensual-non-consent",decision:"approved",groups:{"scenario":["kidnap-abduction","capture","home-invasion","threat-coercion","torture"]}},
 {sourceIssue:260,itemId:"creature-nonhuman-fantasy",decision:"approved",groups:{"type":["monster","vampire","alien","tentacles","knotting","oviposition"]}},
 {sourceIssue:260,itemId:"transformation-fantasy",decision:"approved",groups:{"type":["body-swap"]}},
 {sourceIssue:260,itemId:"mind-control-conditioning-fantasy",decision:"approved",groups:{"type":["mind-control","brainwashing-conditioning","psychological-control-influence"]}},
 {sourceIssue:260,itemId:"consensual-blackmail-leverage-play",decision:"approved",groups:{"form":["blackmail-leverage","controlled-disclosure"]}},
 {sourceIssue:260,itemId:"free-use",decision:"approved",groups:{"context":["public-style-simulation-fake-public-use-fantasy"]}},
 {sourceIssue:264,itemId:"position-training",decision:"approved",groups:{"form":["kneeling","standing-display","hands-behind-back","waiting-positions"]}},
 {sourceIssue:265,itemId:"verbal-mental-restraint",decision:"approved"},
 {sourceIssue:269,itemId:"sensory-deprivation",decision:"approved",groups:{"sense":["sight","hearing","multi-sensory"],"method":["blindfold","headphones","earplugs"]}},
 {sourceIssue:269,itemId:"temperature-play",decision:"approved",groups:{"temperature":["cold","warm","contrast"],"method":["water","ice","wax"]}},
 {sourceIssue:270,itemId:"masochism",decision:"approved",groups:{"experience":["endurance-sustained-pain","pain-processing-response"]}},
 {sourceIssue:270,itemId:"sadism",decision:"approved",groups:{"experience":["endurance-sustained-pain","pain-processing-response"]}},
 {sourceIssue:271,itemId:"electrical-play",decision:"approved",groups:{"device-method":["tens-style","violet-wand","contact-zapper","electric-pinwheel"],"sensation-response":["tickle-twitch-response"]}},
 {sourceIssue:258,itemId:"paddles",decision:"inferred",groups:{"construction":["solid","perforated-holes","padded"],"surface-inlay":["smooth","decorative-inlay-pattern","raised-texture","spiked-studded"]},note:"User-approved additional construction/surface vocabulary on Oct 13"},
 {sourceIssue:258,itemId:"floggers",decision:"inferred",groups:{"thickness":["thin-falls","medium-falls","thick-falls"],"tip-style":["plain-untied","knotted","weighted"]},note:"User-authorized inferred vocabulary on Oct 13"},
];
