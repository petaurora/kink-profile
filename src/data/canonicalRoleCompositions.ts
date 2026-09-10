import {
  dynamicModes,
  roleHeadspaces,
  type ComposedDefinition,
} from "./headspacesQuiz";
import {
  legacySignalConceptTargets,
  signalSupportsChannel,
  type CanonicalSignalId,
  type SignalChannel,
} from "./canonicalSignals";
import type { SignalId as LegacySignalId } from "./signals";

export type CanonicalComposedSignalRef = {
  signalId: CanonicalSignalId;
  channel?: SignalChannel;
  weight: number;
};

export type CanonicalComposedDefinition = Omit<ComposedDefinition, "weights"> & {
  signals: readonly CanonicalComposedSignalRef[];
};

const channelOverrides: Readonly<
  Record<string, Partial<Record<LegacySignalId, SignalChannel>>>
> = {
  care_mode: {
    care_receiving: "overall",
    care_giving: "overall",
  },
  primal_mode: {
    pursuit_receiving: "overall",
    pursuit_giving: "overall",
  },
  authority_mode: {
    structure: "giving",
  },
  surrender_mode: {
    obedience: "giving",
  },
  intensity_mode: {
    receiving_intensity: "overall",
    giving_intensity: "overall",
    pain_receiving: "overall",
    pain_giving: "overall",
    receiving_endurance: "overall",
    giving_endurance: "overall",
  },

  pet: {
    ownership_symbolism: "receiving",
    praise_approval: "receiving",
  },
  slave: {
    obedience: "giving",
    service: "giving",
    ownership_symbolism: "receiving",
    structure: "receiving",
    devotion: "giving",
  },
  little: {
    praise_approval: "receiving",
  },
  middle: {
    playful_resistance: "giving",
  },
  brat: {
    playful_resistance: "giving",
    praise_approval: "receiving",
  },
  prey: {
    playful_resistance: "giving",
  },
  object: {
    objectification: "receiving",
  },
  owner_handler: {
    ownership_symbolism: "giving",
    guidance_shaping: "giving",
    structure: "giving",
  },
  caregiver: {
    guidance_shaping: "giving",
    structure: "giving",
  },
  brat_tamer: {
    playful_resistance: "receiving",
    guidance_shaping: "giving",
  },
  master_mistress: {
    ownership_symbolism: "giving",
    structure: "giving",
    guidance_shaping: "giving",
  },
};

function canonicalRef(
  definitionId: string,
  legacySignalId: LegacySignalId,
  weight: number,
): CanonicalComposedSignalRef {
  const target = legacySignalConceptTargets[legacySignalId];
  const requested =
    channelOverrides[definitionId]?.[legacySignalId] ??
    target.inherentChannel ??
    "overall";
  const channel =
    requested !== "overall" &&
    signalSupportsChannel(target.signalId, requested)
      ? requested
      : "overall";

  return {
    signalId: target.signalId,
    channel: channel === "overall" ? undefined : channel,
    weight,
  };
}

function normalizeDefinition(
  definition: ComposedDefinition,
): CanonicalComposedDefinition {
  const byKey = new Map<string, CanonicalComposedSignalRef>();

  for (const [legacySignalId, rawWeight] of Object.entries(
    definition.weights,
  )) {
    const weight = rawWeight ?? 0;
    if (!Number.isFinite(weight) || weight <= 0) continue;
    const ref = canonicalRef(
      definition.id,
      legacySignalId as LegacySignalId,
      weight,
    );
    const key = `${ref.signalId}::${ref.channel ?? "overall"}`;
    const existing = byKey.get(key);
    byKey.set(key, {
      ...ref,
      // A collapsed legacy pair should not count twice simply because two old
      // IDs described the same canonical concept/channel.
      weight: Math.max(existing?.weight ?? 0, ref.weight),
    });
  }

  return {
    id: definition.id,
    label: definition.label,
    shortLabel: definition.shortLabel,
    description: definition.description,
    signals: [...byKey.values()],
  };
}

export const canonicalDynamicModes: readonly CanonicalComposedDefinition[] =
  dynamicModes.map(normalizeDefinition);

export const canonicalRoleHeadspaces: readonly CanonicalComposedDefinition[] =
  roleHeadspaces.map(normalizeDefinition);