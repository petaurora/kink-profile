import {
  canonicalSignalDefinitions,
  legacySignalConceptTargets,
  signalSupportsChannel,
  type CanonicalSignalId,
  type SignalChannel,
} from "../data/canonicalSignals";
import type { SignalId as LegacySignalId } from "../data/signals";
import type {
  CanonicalSignalContribution,
  CanonicalSignalResult,
  CanonicalSignalSource,
  CanonicalSignalSourceType,
  SignalChannelResult,
} from "./overallProfileSignals";
import { canonicalSignalSourceReliability } from "./overallProfileSignals";

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

type ResolvedFixture = Required<
  Pick<CanonicalSignalFixture, "affinity" | "coverage" | "sourceType" | "sourceId">
> & {
  signalId: CanonicalSignalId;
  channel: SignalChannel;
  sourceEvidenceIds: readonly string[];
  detail?: string;
};

function clamp01(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function round1(value: number) {
  return Math.round((value + 1e-9) * 10) / 10;
}

function isLegacySignalId(value: string): value is LegacySignalId {
  return value in legacySignalConceptTargets;
}

function resolveFixture(
  fixture: CanonicalSignalFixture,
  index: number,
): ResolvedFixture {
  let signalId: CanonicalSignalId;
  let channel: SignalChannel;

  if (isLegacySignalId(fixture.signalId)) {
    const target = legacySignalConceptTargets[fixture.signalId];
    signalId = target.signalId;
    const requested = fixture.channel ?? target.inherentChannel ?? "overall";
    channel =
      requested !== "overall" && !signalSupportsChannel(signalId, requested)
        ? "overall"
        : requested;
  } else {
    signalId = fixture.signalId;
    channel = fixture.channel ?? "overall";
  }

  const sourceType = fixture.sourceType ?? "quiz";
  const sourceId = fixture.sourceId ?? "fixture";

  return {
    signalId,
    channel,
    affinity: fixture.affinity ?? 78,
    coverage: fixture.coverage ?? 100,
    sourceType,
    sourceId,
    sourceEvidenceIds:
      fixture.sourceEvidenceIds ?? [
        `test:${sourceId}:${fixture.signalId}:${channel}:${index}`,
      ],
    detail: fixture.detail,
  };
}

function combineCoverage(rows: readonly ResolvedFixture[]) {
  let uncovered = 1;
  for (const row of rows) {
    uncovered *= 1 - clamp01(row.coverage / 100);
  }
  return round1((1 - uncovered) * 100);
}

function weightedAffinity(rows: readonly ResolvedFixture[]) {
  const weight = rows.reduce((sum, row) => sum + clamp01(row.coverage / 100), 0);
  if (weight <= 0) return null;
  return round1(
    rows.reduce(
      (sum, row) => sum + row.affinity * clamp01(row.coverage / 100),
      0,
    ) / weight,
  );
}

function sourceFromRows(
  sourceType: CanonicalSignalSourceType,
  rows: readonly ResolvedFixture[],
): CanonicalSignalSource | undefined {
  if (rows.length === 0) return undefined;
  const coverage = combineCoverage(rows);
  const affinity = weightedAffinity(rows);
  if (affinity === null) return undefined;
  const reliability = canonicalSignalSourceReliability[sourceType];
  const contributions: CanonicalSignalContribution[] = rows.map((row) => ({
    sourceType: row.sourceType,
    sourceId: row.sourceId,
    signalId: row.signalId,
    signalChannel: row.channel,
    affinity: row.affinity,
    coverage: row.coverage,
    sourceEvidenceIds: row.sourceEvidenceIds,
    detail: row.detail,
  }));

  return {
    sourceType,
    affinity,
    coverage,
    reliability,
    effectiveWeight: reliability * (coverage / 100),
    contributions,
  };
}

function buildChannelResult(rows: readonly ResolvedFixture[]): SignalChannelResult {
  const affinity = weightedAffinity(rows);
  const coverage = combineCoverage(rows);
  const sources = (["quiz", "catalog_explicit", "catalog_pairwise"] as const)
    .map((sourceType) =>
      sourceFromRows(
        sourceType,
        rows.filter((row) => row.sourceType === sourceType),
      ),
    )
    .filter((source): source is CanonicalSignalSource => source !== undefined);

  return {
    affinity,
    coverage,
    sources,
    sourceEvidenceIds: [
      ...new Set(rows.flatMap((row) => row.sourceEvidenceIds)),
    ].sort(),
  };
}

/**
 * Build normalized Signal + channel results for downstream consumer tests.
 *
 * This intentionally does NOT rerun the production reliability aggregation:
 * consumer tests need a requested 30% coverage fixture to remain 30%. The
 * production aggregation/reliability math is pinned separately in the Signal
 * migration tests.
 *
 * Directional fixtures also roll up to Overall, matching the runtime semantic
 * contract without reviving the forbidden flat legacy aggregate shape.
 */
export function buildCanonicalSignalFixtures(
  fixtures: readonly CanonicalSignalFixture[],
): CanonicalSignalResult[] {
  const resolved = fixtures.map(resolveFixture);

  return canonicalSignalDefinitions.flatMap(
    (definition): CanonicalSignalResult[] => {
      const signalRows = resolved.filter(
        (row) => row.signalId === definition.id,
      );
      if (signalRows.length === 0) return [];

      const receivingRows = signalRows.filter(
        (row) => row.channel === "receiving",
      );
      const givingRows = signalRows.filter((row) => row.channel === "giving");

      return [
        {
          signalId: definition.id,
          // All evidence for a semantic concept may inform its Overall roll-up.
          overall: buildChannelResult(signalRows),
          receiving: definition.channels.receiving
            ? buildChannelResult(receivingRows)
            : undefined,
          giving: definition.channels.giving
            ? buildChannelResult(givingRows)
            : undefined,
        },
      ];
    },
  );
}
