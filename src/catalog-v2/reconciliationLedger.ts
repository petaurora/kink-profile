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
