import {
  canonicalPairwiseSignalRef,
  canonicalQuizSignalRef,
  canonicalSignalDefinitions,
  getCanonicalSignalDefinition,
  legacySignalConceptTargets,
  signalSupportsChannel,
  type CanonicalSignalId,
  type SignalChannel,
} from "../data/canonicalSignals";
import type { SignalId as LegacySignalId } from "../data/signals";

export type CurationSignalOption = {
  value: CanonicalSignalId;
  label: string;
};

export type CurationSignalChannelOption = {
  value: SignalChannel;
  label: string;
};

export type CurationSignalRef = {
  signalId: CanonicalSignalId;
  channel: SignalChannel;
  weight: number;
};

export const curationSignalOptions: readonly CurationSignalOption[] =
  canonicalSignalDefinitions.map((signal) => ({
    value: signal.id,
    label: signal.label,
  }));

export function getCurationSignalChannelOptions(
  signalId: CanonicalSignalId,
): readonly CurationSignalChannelOption[] {
  const definition = getCanonicalSignalDefinition(signalId);
  if (!definition) return [];

  const options: CurationSignalChannelOption[] = [
    { value: "overall", label: "Overall" },
  ];

  if (definition.channels.receiving) {
    options.push({
      value: "receiving",
      label: definition.channels.receiving.label,
    });
  }

  if (definition.channels.giving) {
    options.push({
      value: "giving",
      label: definition.channels.giving.label,
    });
  }

  return options;
}

export function curationSignalRefKey(
  ref: Pick<CurationSignalRef, "signalId" | "channel">,
) {
  return `${ref.signalId}::${ref.channel}` as const;
}

export function isCanonicalSignalId(value: string): value is CanonicalSignalId {
  return canonicalSignalDefinitions.some((signal) => signal.id === value);
}

export function isLegacySignalId(value: string): value is LegacySignalId {
  return value in legacySignalConceptTargets;
}

export function isValidCurationSignalChannel(
  signalId: CanonicalSignalId,
  channel: SignalChannel,
) {
  return (
    channel === "overall" ||
    signalSupportsChannel(signalId, channel)
  );
}

export function canonicalizeCurationSignalRef(
  signalId: LegacySignalId | CanonicalSignalId,
  weight: number,
  options: {
    channel?: SignalChannel;
    quizQuestionId?: string;
  } = {},
): CurationSignalRef {
  if (isLegacySignalId(signalId)) {
    const ref = options.quizQuestionId
      ? canonicalQuizSignalRef(options.quizQuestionId, signalId)
      : canonicalPairwiseSignalRef(signalId);

    const requestedChannel = options.channel ?? ref.channel;
    return {
      signalId: ref.signalId,
      channel: isValidCurationSignalChannel(ref.signalId, requestedChannel)
        ? requestedChannel
        : "overall",
      weight,
    };
  }

  const requestedChannel = options.channel ?? "overall";
  return {
    signalId,
    channel: isValidCurationSignalChannel(signalId, requestedChannel)
      ? requestedChannel
      : "overall",
    weight,
  };
}

export function validateCurationSignalRef(ref: CurationSignalRef): string[] {
  const errors: string[] = [];

  if (!isCanonicalSignalId(ref.signalId)) {
    errors.push(`Unknown canonical Signal "${ref.signalId}".`);
  }

  if (!isValidCurationSignalChannel(ref.signalId, ref.channel)) {
    errors.push(
      `Signal "${ref.signalId}" does not support the "${ref.channel}" channel.`,
    );
  }

  if (!Number.isFinite(ref.weight) || ref.weight <= 0 || ref.weight > 1) {
    errors.push(
      `Signal "${ref.signalId}" weight must be greater than 0 and no more than 1.`,
    );
  }

  return errors;
}
