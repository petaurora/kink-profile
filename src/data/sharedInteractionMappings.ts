import {
  dynamicModes,
  roleHeadspaces,
} from "./headspacesQuiz";
import {
  signalDefinitions,
  type SignalId,
} from "./signals";

export const sharedInteractionMappingVersion = 1 as const;

export type SharedInteractionConceptKind =
  | "signal"
  | "dynamic_mode"
  | "headspace";

export type SharedInteractionRelationshipKind =
  | "activity_complement"
  | "dynamic_mode_complement"
  | "headspace_complement";

export type SharedInteractionDirectionality =
  | "bidirectional"
  | "source_to_target";

export type SharedInteractionAuthoritySemantics =
  | "activity_side_only"
  | "contextual_role"
  | "explicit_authority_pair";

export type SharedInteractionConceptRef =
  | {
      kind: "signal";
      id: SignalId;
    }
  | {
      kind: "dynamic_mode";
      id: string;
    }
  | {
      kind: "headspace";
      id: string;
    };

export type SharedInteractionMapping = {
  id: string;
  version: typeof sharedInteractionMappingVersion;
  source: SharedInteractionConceptRef;
  target: SharedInteractionConceptRef;
  relationshipKind: SharedInteractionRelationshipKind;
  strength: number;
  directionality: SharedInteractionDirectionality;
  authoritySemantics: SharedInteractionAuthoritySemantics;
  explanation: string;
};

/**
 * M14 interaction mappings describe concepts that can form a meaningful
 * interaction across two independent profiles.
 *
 * They are intentionally NOT evidence and must never write back into either
 * profile. In particular, activity-side complements such as giving pain ↔
 * receiving pain do not imply Dominant/submissive authority orientation.
 */
export const sharedInteractionMappings: readonly SharedInteractionMapping[] = [
  {
    id: "signal-control-give-receive",
    version: sharedInteractionMappingVersion,
    source: { kind: "signal", id: "giving_control" },
    target: { kind: "signal", id: "receiving_control" },
    relationshipKind: "activity_complement",
    strength: 1,
    directionality: "bidirectional",
    authoritySemantics: "activity_side_only",
    explanation:
      "One profile prefers giving negotiated control while the other prefers receiving it.",
  },
  {
    id: "signal-pain-give-receive",
    version: sharedInteractionMappingVersion,
    source: { kind: "signal", id: "pain_giving" },
    target: { kind: "signal", id: "pain_receiving" },
    relationshipKind: "activity_complement",
    strength: 1,
    directionality: "bidirectional",
    authoritySemantics: "activity_side_only",
    explanation:
      "One profile prefers giving pain while the other prefers receiving it.",
  },
  {
    id: "signal-restraint-give-receive",
    version: sharedInteractionMappingVersion,
    source: { kind: "signal", id: "giving_restraint" },
    target: { kind: "signal", id: "receiving_restraint" },
    relationshipKind: "activity_complement",
    strength: 1,
    directionality: "bidirectional",
    authoritySemantics: "activity_side_only",
    explanation:
      "One profile prefers applying restraint while the other prefers receiving restraint.",
  },
  {
    id: "signal-positioning-give-receive",
    version: sharedInteractionMappingVersion,
    source: { kind: "signal", id: "giving_positioning" },
    target: { kind: "signal", id: "receiving_positioning" },
    relationshipKind: "activity_complement",
    strength: 0.95,
    directionality: "bidirectional",
    authoritySemantics: "activity_side_only",
    explanation:
      "One profile prefers positioning a partner while the other prefers being positioned.",
  },
  {
    id: "signal-constraint-control-give-receive",
    version: sharedInteractionMappingVersion,
    source: { kind: "signal", id: "giving_constraint_control" },
    target: { kind: "signal", id: "receiving_constraint_control" },
    relationshipKind: "activity_complement",
    strength: 0.95,
    directionality: "bidirectional",
    authoritySemantics: "activity_side_only",
    explanation:
      "One profile likes expressing control through physical constraint while the other likes receiving that form of constraint.",
  },
  {
    id: "signal-discipline-give-receive",
    version: sharedInteractionMappingVersion,
    source: { kind: "signal", id: "giving_discipline" },
    target: { kind: "signal", id: "receiving_discipline" },
    relationshipKind: "activity_complement",
    strength: 0.95,
    directionality: "bidirectional",
    authoritySemantics: "activity_side_only",
    explanation:
      "One profile prefers administering agreed discipline while the other prefers receiving it.",
  },
  {
    id: "signal-care-give-receive",
    version: sharedInteractionMappingVersion,
    source: { kind: "signal", id: "care_giving" },
    target: { kind: "signal", id: "care_receiving" },
    relationshipKind: "activity_complement",
    strength: 0.9,
    directionality: "bidirectional",
    authoritySemantics: "activity_side_only",
    explanation:
      "One profile enjoys providing care while the other enjoys receiving care.",
  },
  {
    id: "signal-pursuit-give-receive",
    version: sharedInteractionMappingVersion,
    source: { kind: "signal", id: "pursuit_giving" },
    target: { kind: "signal", id: "pursuit_receiving" },
    relationshipKind: "activity_complement",
    strength: 1,
    directionality: "bidirectional",
    authoritySemantics: "activity_side_only",
    explanation:
      "One profile enjoys pursuing while the other enjoys being pursued.",
  },
  {
    id: "signal-intensity-give-receive",
    version: sharedInteractionMappingVersion,
    source: { kind: "signal", id: "giving_intensity" },
    target: { kind: "signal", id: "receiving_intensity" },
    relationshipKind: "activity_complement",
    strength: 0.9,
    directionality: "bidirectional",
    authoritySemantics: "activity_side_only",
    explanation:
      "One profile enjoys creating physical intensity while the other enjoys receiving it.",
  },
  {
    id: "signal-endurance-give-receive",
    version: sharedInteractionMappingVersion,
    source: { kind: "signal", id: "giving_endurance" },
    target: { kind: "signal", id: "receiving_endurance" },
    relationshipKind: "activity_complement",
    strength: 0.85,
    directionality: "bidirectional",
    authoritySemantics: "activity_side_only",
    explanation:
      "One profile enjoys sustaining intensity while the other enjoys enduring it.",
  },
  {
    id: "signal-challenge-give-receive",
    version: sharedInteractionMappingVersion,
    source: { kind: "signal", id: "giving_challenge" },
    target: { kind: "signal", id: "receiving_challenge" },
    relationshipKind: "activity_complement",
    strength: 0.85,
    directionality: "bidirectional",
    authoritySemantics: "activity_side_only",
    explanation:
      "One profile enjoys giving an agreed challenge while the other enjoys receiving one.",
  },
  {
    id: "mode-authority-surrender",
    version: sharedInteractionMappingVersion,
    source: { kind: "dynamic_mode", id: "authority_mode" },
    target: { kind: "dynamic_mode", id: "surrender_mode" },
    relationshipKind: "dynamic_mode_complement",
    strength: 1,
    directionality: "bidirectional",
    authoritySemantics: "explicit_authority_pair",
    explanation:
      "One profile resonates with Authority while the other resonates with chosen Surrender.",
  },
  {
    id: "mode-caretaking-nurtured-play",
    version: sharedInteractionMappingVersion,
    source: { kind: "dynamic_mode", id: "caretaking_mode" },
    target: { kind: "dynamic_mode", id: "nurtured_play" },
    relationshipKind: "dynamic_mode_complement",
    strength: 0.9,
    directionality: "bidirectional",
    authoritySemantics: "contextual_role",
    explanation:
      "One profile resonates with caretaking while the other resonates with being nurtured in play.",
  },
  {
    id: "headspace-predator-prey",
    version: sharedInteractionMappingVersion,
    source: { kind: "headspace", id: "predator" },
    target: { kind: "headspace", id: "prey" },
    relationshipKind: "headspace_complement",
    strength: 1,
    directionality: "bidirectional",
    authoritySemantics: "contextual_role",
    explanation:
      "Predator and Prey can form a complementary pursuit headspace without assigning D/s authority.",
  },
  {
    id: "headspace-owner-handler-pet",
    version: sharedInteractionMappingVersion,
    source: { kind: "headspace", id: "owner_handler" },
    target: { kind: "headspace", id: "pet" },
    relationshipKind: "headspace_complement",
    strength: 1,
    directionality: "bidirectional",
    authoritySemantics: "contextual_role",
    explanation:
      "Owner / Handler and Pet can form a complementary role pairing without making that pairing mandatory.",
  },
  {
    id: "headspace-caregiver-little",
    version: sharedInteractionMappingVersion,
    source: { kind: "headspace", id: "caregiver" },
    target: { kind: "headspace", id: "little" },
    relationshipKind: "headspace_complement",
    strength: 0.9,
    directionality: "bidirectional",
    authoritySemantics: "contextual_role",
    explanation:
      "Caregiver and Little can form a nurturing role fit without automatically assigning authority.",
  },
  {
    id: "headspace-brat-tamer-brat",
    version: sharedInteractionMappingVersion,
    source: { kind: "headspace", id: "brat_tamer" },
    target: { kind: "headspace", id: "brat" },
    relationshipKind: "headspace_complement",
    strength: 0.9,
    directionality: "bidirectional",
    authoritySemantics: "contextual_role",
    explanation:
      "Brat Tamer and Brat can form an interactive resistance-and-response pairing when both profiles support it.",
  },
  {
    id: "headspace-master-mistress-slave",
    version: sharedInteractionMappingVersion,
    source: { kind: "headspace", id: "master_mistress" },
    target: { kind: "headspace", id: "slave" },
    relationshipKind: "headspace_complement",
    strength: 1,
    directionality: "bidirectional",
    authoritySemantics: "explicit_authority_pair",
    explanation:
      "Master / Mistress and Slave are explicitly authority-coded role definitions that can form a complementary pairing.",
  },
];

export function sharedInteractionConceptKey(
  concept: SharedInteractionConceptRef,
) {
  return `${concept.kind}:${concept.id}`;
}

export function sameSharedInteractionConcept(
  left: SharedInteractionConceptRef,
  right: SharedInteractionConceptRef,
) {
  return sharedInteractionConceptKey(left) === sharedInteractionConceptKey(right);
}

export function getSharedInteractionMappingsForConcept(
  concept: SharedInteractionConceptRef,
) {
  return sharedInteractionMappings.filter((mapping) => {
    if (sameSharedInteractionConcept(mapping.source, concept)) return true;

    return (
      mapping.directionality === "bidirectional" &&
      sameSharedInteractionConcept(mapping.target, concept)
    );
  });
}

export function getSharedInteractionCounterparts(
  concept: SharedInteractionConceptRef,
) {
  return getSharedInteractionMappingsForConcept(concept).map((mapping) => ({
    mapping,
    counterpart: sameSharedInteractionConcept(mapping.source, concept)
      ? mapping.target
      : mapping.source,
  }));
}

export function validateSharedInteractionMappings(
  mappings: readonly SharedInteractionMapping[] = sharedInteractionMappings,
) {
  const errors: string[] = [];
  const ids = new Set<string>();
  const signalIds = new Set(signalDefinitions.map((definition) => definition.id));
  const dynamicModeIds = new Set(dynamicModes.map((definition) => definition.id));
  const headspaceIds = new Set(roleHeadspaces.map((definition) => definition.id));

  const conceptExists = (concept: SharedInteractionConceptRef) => {
    switch (concept.kind) {
      case "signal":
        return signalIds.has(concept.id);
      case "dynamic_mode":
        return dynamicModeIds.has(concept.id);
      case "headspace":
        return headspaceIds.has(concept.id);
    }
  };

  for (const mapping of mappings) {
    if (ids.has(mapping.id)) {
      errors.push(`Duplicate interaction mapping id: ${mapping.id}`);
    }
    ids.add(mapping.id);

    if (mapping.version !== sharedInteractionMappingVersion) {
      errors.push(
        `Unsupported interaction mapping version for ${mapping.id}: ${mapping.version}`,
      );
    }

    if (!Number.isFinite(mapping.strength) || mapping.strength <= 0 || mapping.strength > 1) {
      errors.push(
        `Interaction mapping ${mapping.id} has out-of-range strength ${mapping.strength}`,
      );
    }

    if (!conceptExists(mapping.source)) {
      errors.push(
        `Interaction mapping ${mapping.id} has unknown source ${sharedInteractionConceptKey(mapping.source)}`,
      );
    }

    if (!conceptExists(mapping.target)) {
      errors.push(
        `Interaction mapping ${mapping.id} has unknown target ${sharedInteractionConceptKey(mapping.target)}`,
      );
    }

    if (sameSharedInteractionConcept(mapping.source, mapping.target)) {
      errors.push(
        `Interaction mapping ${mapping.id} maps a concept to itself`,
      );
    }

    if (
      mapping.relationshipKind === "activity_complement" &&
      mapping.authoritySemantics !== "activity_side_only"
    ) {
      errors.push(
        `Activity mapping ${mapping.id} must remain activity-side-only`,
      );
    }
  }

  return errors;
}
