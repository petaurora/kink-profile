import {
  sharedInteractionConceptKey,
  sharedInteractionMappings,
  sameSharedInteractionConcept,
  type SharedInteractionConceptKind,
  type SharedInteractionConceptRef,
  type SharedInteractionMapping,
} from "../data/sharedInteractionMappings";
import {
  dynamicModes,
  roleHeadspaces,
} from "../data/headspacesQuiz";
import { signalDefinitions } from "../data/signals";

export type SharedParticipantIntent = {
  selectedConcepts: readonly SharedInteractionConceptRef[];
};

export type SharedParticipantIntentPairing = {
  mapping: SharedInteractionMapping;
  profileAConcept: SharedInteractionConceptRef;
  profileBConcept: SharedInteractionConceptRef;
  profileALabel: string;
  profileBLabel: string;
};

export type SharedParticipantIntentOption = {
  concept: SharedInteractionConceptRef;
  key: string;
  label: string;
  kind: SharedInteractionConceptKind;
};

export function createEmptySharedParticipantIntent(): SharedParticipantIntent {
  return {
    selectedConcepts: [],
  };
}

export function sharedParticipantIntentConceptLabel(
  concept: SharedInteractionConceptRef,
) {
  switch (concept.kind) {
    case "signal":
      return (
        signalDefinitions.find((definition) => definition.id === concept.id)
          ?.label ?? concept.id
      );
    case "dynamic_mode":
      return (
        dynamicModes.find((definition) => definition.id === concept.id)?.label ??
        concept.id
      );
    case "headspace":
      return (
        roleHeadspaces.find((definition) => definition.id === concept.id)
          ?.label ?? concept.id
      );
  }
}

export function getSharedParticipantIntentOptions(): readonly SharedParticipantIntentOption[] {
  const byKey = new Map<string, SharedParticipantIntentOption>();

  // Dynamic modes are shared, direction-neutral context. They do not need a
  // complement mapping to be selectable for the current interaction.
  for (const mode of dynamicModes) {
    const concept: SharedInteractionConceptRef = {
      kind: "dynamic_mode",
      id: mode.id,
    };
    const key = sharedInteractionConceptKey(concept);
    byKey.set(key, {
      concept,
      key,
      label: mode.label,
      kind: "dynamic_mode",
    });
  }

  // Directional Signals and complementary roles are surfaced from explicit
  // interaction mappings because those pairings carry actual compatibility
  // semantics across two profiles.
  for (const mapping of sharedInteractionMappings) {
    for (const concept of [mapping.source, mapping.target]) {
      const key = sharedInteractionConceptKey(concept);
      if (byKey.has(key)) continue;

      byKey.set(key, {
        concept,
        key,
        label: sharedParticipantIntentConceptLabel(concept),
        kind: concept.kind,
      });
    }
  }

  const kindOrder: Record<SharedInteractionConceptKind, number> = {
    headspace: 0,
    dynamic_mode: 1,
    signal: 2,
  };

  return [...byKey.values()].sort((left, right) => {
    const kindCompare = kindOrder[left.kind] - kindOrder[right.kind];
    if (kindCompare !== 0) return kindCompare;
    return left.label.localeCompare(right.label);
  });
}

export function hasSharedParticipantIntentConcept(
  intent: SharedParticipantIntent,
  concept: SharedInteractionConceptRef,
) {
  return intent.selectedConcepts.some((selected) =>
    sameSharedInteractionConcept(selected, concept),
  );
}

export function toggleSharedParticipantIntentConcept(
  intent: SharedParticipantIntent,
  concept: SharedInteractionConceptRef,
): SharedParticipantIntent {
  if (hasSharedParticipantIntentConcept(intent, concept)) {
    return {
      selectedConcepts: intent.selectedConcepts.filter(
        (selected) => !sameSharedInteractionConcept(selected, concept),
      ),
    };
  }

  return {
    selectedConcepts: [...intent.selectedConcepts, concept],
  };
}

export function clearSharedParticipantIntent(): SharedParticipantIntent {
  return createEmptySharedParticipantIntent();
}

function pairingKey(
  mapping: SharedInteractionMapping,
  profileAConcept: SharedInteractionConceptRef,
  profileBConcept: SharedInteractionConceptRef,
) {
  return [
    mapping.id,
    sharedInteractionConceptKey(profileAConcept),
    sharedInteractionConceptKey(profileBConcept),
  ].join("|");
}

/**
 * Resolve only explicit complementary pairings selected by both people for the
 * current interaction. Neutral dynamic modes are intentionally not pairings;
 * they are shared context and are handled independently by scene queries.
 */
export function buildSharedParticipantIntentPairings(
  profileA: SharedParticipantIntent,
  profileB: SharedParticipantIntent,
): readonly SharedParticipantIntentPairing[] {
  const pairings = new Map<string, SharedParticipantIntentPairing>();

  for (const mapping of sharedInteractionMappings) {
    const aSource = hasSharedParticipantIntentConcept(profileA, mapping.source);
    const aTarget = hasSharedParticipantIntentConcept(profileA, mapping.target);
    const bSource = hasSharedParticipantIntentConcept(profileB, mapping.source);
    const bTarget = hasSharedParticipantIntentConcept(profileB, mapping.target);

    if (aSource && bTarget) {
      const pairing: SharedParticipantIntentPairing = {
        mapping,
        profileAConcept: mapping.source,
        profileBConcept: mapping.target,
        profileALabel: sharedParticipantIntentConceptLabel(mapping.source),
        profileBLabel: sharedParticipantIntentConceptLabel(mapping.target),
      };
      pairings.set(
        pairingKey(mapping, pairing.profileAConcept, pairing.profileBConcept),
        pairing,
      );
    }

    if (mapping.directionality === "bidirectional" && aTarget && bSource) {
      const pairing: SharedParticipantIntentPairing = {
        mapping,
        profileAConcept: mapping.target,
        profileBConcept: mapping.source,
        profileALabel: sharedParticipantIntentConceptLabel(mapping.target),
        profileBLabel: sharedParticipantIntentConceptLabel(mapping.source),
      };
      pairings.set(
        pairingKey(mapping, pairing.profileAConcept, pairing.profileBConcept),
        pairing,
      );
    }
  }

  return [...pairings.values()].sort((left, right) => {
    const kindCompare = left.mapping.relationshipKind.localeCompare(
      right.mapping.relationshipKind,
    );
    if (kindCompare !== 0) return kindCompare;

    const leftLabel = left.profileALabel + left.profileBLabel;
    const rightLabel = right.profileALabel + right.profileBLabel;
    return leftLabel.localeCompare(rightLabel);
  });
}
