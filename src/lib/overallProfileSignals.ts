export type CanonicalSignalSourceType =
  | "quiz"
  | "catalog_explicit"
  | "catalog_pairwise";

/**
 * Evidence-source reliability remains unchanged by the M16 Signal/channel
 * semantic migration. The migration changes what is being measured and where
 * evidence lands; it deliberately does not retune source trust.
 */
export const canonicalSignalSourceReliability: Readonly<
  Record<CanonicalSignalSourceType, number>
> = {
  quiz: 0.8,
  catalog_explicit: 0.65,
  catalog_pairwise: 0.5,
};

/**
 * Compatibility facade.
 *
 * Profile-facing consumers historically import the canonical signal builder
 * from this module. M16.4 keeps that import stable while routing the runtime
 * through the normalized Signal + channel engine. Raw quiz scoring and legacy
 * Signal IDs remain available in their original data modules for migration and
 * comparison work, but they no longer define the canonical profile shape.
 */
export {
  aggregateCanonicalSignalChannels,
  buildCanonicalExplicitContributions,
  buildCanonicalPairwiseContributions,
  buildCanonicalQuizContributions,
  buildCanonicalSignalProfile,
  resolveSignalChannel,
  signalResultById,
} from "./normalizedProfileSignals";

export type {
  CanonicalSignalContribution,
  CanonicalSignalResult,
  CanonicalSignalSource,
  SignalChannelResult,
} from "./normalizedProfileSignals";
