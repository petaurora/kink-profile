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
 {sourceIssue:256,itemId:"rope-bondage",decision:"approved",groups:{"style":["shibari-kinbaku"]}},
 {sourceIssue:256,itemId:"suspension-bondage",decision:"approved",groups:{"method":["rope"],"support":["partial","full"]}},
 {sourceIssue:256,itemId:"encasement",decision:"approved",groups:{"method":["mummification","body-bag"]}},
 {sourceIssue:256,itemId:"confinement",decision:"approved",groups:{"environment-method":["cage"],"space":["small-enclosed"]}},
 {sourceIssue:266,itemId:"primal-play",decision:"approved",groups:{"role":["hunter-predator","prey"]}},
 {sourceIssue:266,itemId:"struggle-play",decision:"approved",groups:{"method":["wrestling","pinning"]}},
 {sourceIssue:263,itemId:"pet-roleplay",decision:"approved",groups:{"species-role":["puppy","kitten","pony","bunny","fox"]}},
 {sourceIssue:263,itemId:"pet-training",decision:"approved",groups:{"method":["verbal-commands-cues","tricks","routines","clicker-training"]}},
 {sourceIssue:267,itemId:"exhibitionism",decision:"approved",groups:{"context-medium":["partner","consenting-audience","photography","video-recording","live-remote-camera"]}},
 {sourceIssue:267,itemId:"voyeurism",decision:"approved",groups:{"context-medium":["partner","consenting-audience","photography","video-recording","live-remote-camera"]}},
 {sourceIssue:269,itemId:"texture-play",decision:"approved",groups:{"material-method":["feather","soft-fur-faux-fur","silk-satin","abrasive-rough-texture"]}},
 {sourceIssue:269,itemId:"tickling",decision:"approved",groups:{"intensity-framing":["tickle-torture"]}},
 {sourceIssue:270,itemId:"scratching",decision:"approved",groups:{"method":["fingernails","claw-rake-tools"]}},
 {sourceIssue:270,itemId:"clamp-clip-play",decision:"approved",groups:{"tool-type":["clothespins","clamps","other-clips-clamps"]}},
 {sourceIssue:270,itemId:"suction-play",decision:"approved",groups:{"method":["cupping","other-suction-methods"]}},
 {sourceIssue:272,itemId:"chastity",decision:"approved",groups:{"material":["metal","plastic","silicone","other"]}},
 {sourceIssue:272,itemId:"forced-orgasm",decision:"approved",groups:{"role":["giving","receiving"]}},
 ...["edging","ruined-orgasm","multiple-repeated-orgasm","overstimulation","post-orgasm-stimulation"].map(itemId=>({sourceIssue:272,itemId,decision:"approved" as const,groups:{"role":["giving","receiving","self"]}})),
 ...["anal-penetration","vaginal-penetration","handjob","vaginal-fingering","anal-fingering","dildo-play","plug","vibrator","sex-machine","sybian-ride-on-vibrator"].map(itemId=>({sourceIssue:274,itemId,decision:"approved" as const,groups:{"role":["giving","receiving","self"]}})),
 ...["fellatio","cunnilingus","anilingus","deep-throating","vaginal-fisting","anal-fisting","pegging","strap-on-play","double-penetration","intercrural-thigh-sex"].map(itemId=>({sourceIssue:274,itemId,decision:"approved" as const,groups:{"role":["giving","receiving"]}})),
 {sourceIssue:274,itemId:"face-sitting",decision:"approved",groups:{"role":["sitting","being-sat-on"]}},
 ...["69","mutual-masturbation","tribadism-scissoring","frottage-grinding","cock-ring","cockwarming","hands-free-orgasm"].map(itemId=>({sourceIssue:274,itemId,decision:"approved" as const})),

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
 {sourceIssue:272,itemId:"orgasm-control",decision:"approved",groups:{"direction":["controlling","being-controlled"],"method":["permission-required","denial","countdown","release-cue"]}},
 {sourceIssue:257,itemId:"restraint-gear",decision:"approved",groups:{"type":["armbinder","bondage-mitts","under-bed-restraint-system","spreader-bar","yoke","head-harness"]}},
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
