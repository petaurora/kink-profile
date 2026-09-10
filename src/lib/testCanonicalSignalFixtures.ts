import {
  legacySignalConceptTargets,
  signalSupportsChannel,
  type CanonicalSignalId,
  type SignalChannel,
} from "../data/canonicalSignals";
import type { SignalId as LegacySignalId } from "../data/signals";
import {
  aggregateCanonicalSignalChannels,
  type CanonicalSignalContribution,
  type CanonicalSignalResult,
  type CanonicalSignalSourceType,
} from "./overallProfileSignals";

export type CanonicalSignalFixture = {
  signalId: LegacySignalId | CanonicalSignalId;
  affinity?: number;
  coverage?: number;
  channel?: SignalChannel;
  sourceType?: CanonicalSignalSourceType;
  sourceId?: string;
  sourceEvidenceIds?: readonly string[];
  detail?: string;
};

function isLegacySignalId(value: string): value is LegacySignalId {
  return value in legacySignalConceptTargets;
}

function resolveFixtureSignal(fixture: CanonicalSignalFixture) {
  if (isLegacySignalId(fixture.signalId)) {
    const target = legacySignalConceptTargets[fixture.signalId];
    const requested = fixture.channel ?? target.inherentChannel ?? "overall";
    return {
      signalId: target.signalId,
      channel:
        requested !== "overall" &&
        !signalSupportsChannel(target.signalId, requested)
          ? ("overall" as const)
          : requested,
    };
  }

  return {
    signalId: fixture.signalId,
    channel: fixture.channel ?? ("overall" as const),
  };
}

/**
 * Build realistic normalized Signal results for downstream consumer tests.
 * Directional fixtures also roll up to Overall because real quiz/catalog
 * reprojection does the same. This keeps tests on the new contract instead of
 * reviving the forbidden flat legacy aggregate shape.
 */
export function buildCanonicalSignalFixtures(
  fixtures: readonly CanonicalSignalFixture[],
): CanonicalSignalResult[] {
  const contributions: CanonicalSignalContribution[] = [];

  for (const [index, fixture] of fixtures.entries()) {
    const resolved = resolveFixtureSignal(fixture);
    const sourceType = fixture.sourceType ?? "quiz";
    const sourceId = fixture.sourceId ?? "fixture";
    const affinity = fixture.affinity ?? 78;
    const coverage = fixture.coverage ?? 100;
    const evidenceIds =
      fixture.sourceEvidenceIds ?? [
        `test:${sourceId}:${fixture.signalId}:${resolved.channel}:${index}`,
      ];

    contributions.push({
      sourceType,
      sourceId,
      signalId: resolved.signalId,
      signalChannel: resolved.channel,
      affinity,
      coverage,
      sourceEvidenceIds: evidenceIds,
      detail: fixture.detail,
    });

    if (resolved.channel !== "overall") {
      contributions.push({
        sourceType,
        sourceId,
        signalId: resolved.signalId,
        signalChannel: "overall",
        affinity,
        coverage,
        sourceEvidenceIds: evidenceIds,
        detail: fixture.detail,
      });
    }
  }

  return aggregateCanonicalSignalChannels(contributions).filter(
    (signal) =>
      signal.overall.coverage > 0 ||
      (signal.receiving?.coverage ?? 0) > 0 ||
      (signal.giving?.coverage ?? 0) > 0,
  );
}
