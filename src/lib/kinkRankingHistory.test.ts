import { describe, expect, it } from "vitest";
import type { KinkCatalogItem } from "../data/kinkCatalog.generated";
import {
  getActiveKinkRankingComparisons,
  type CatalogProfileState,
} from "./catalogProfile";
import { startNewKinkRankingRun } from "./kinkRankingHistory";

function item(
  id: string,
  label: string,
  categoryId: string,
): KinkCatalogItem {
  return {
    id,
    label,
    categoryId,
    categoryLabel: categoryId,
    domain: "power-exchange",
    direction: "both",
    aliases: [],
    signalMappings: [],
    description: "",
    typicalRole: "",
    intensity: "",
    riskLevel: "",
  } as KinkCatalogItem;
}

function profile(): CatalogProfileState {
  return {
    schemaVersion: 1,
    preferences: {
      a: {
        overall: "love",
        updatedAt: "2026-09-01T00:00:00.000Z",
      },
    },
    comparisons: [
      {
        id: "cat-a-1",
        runId: "run-1",
        leftKinkId: "a",
        rightKinkId: "b",
        scope: { type: "category", categoryId: "cat-a" },
        result: "left",
        timestamp: "2026-09-01T00:01:00.000Z",
      },
      {
        id: "cat-b-1",
        runId: "run-1",
        leftKinkId: "c",
        rightKinkId: "d",
        scope: { type: "category", categoryId: "cat-b" },
        result: "right",
        timestamp: "2026-09-01T00:02:00.000Z",
      },
      {
        id: "overall-1",
        runId: "run-1",
        leftKinkId: "a",
        rightKinkId: "c",
        scope: { type: "overall" },
        result: "left",
        timestamp: "2026-09-01T00:03:00.000Z",
      },
    ],
    rankingHistory: {
      activeRunId: "run-1",
      runs: {
        "run-1": {
          id: "run-1",
          startedAt: "2026-09-01T00:00:00.000Z",
          status: "active",
          algorithmVersion: 1,
        },
      },
    },
  };
}

const catalog = [
  item("a", "A", "cat-a"),
  item("b", "B", "cat-a"),
  item("c", "C", "cat-b"),
  item("d", "D", "cat-b"),
];

describe("M12 ranking run lifecycle", () => {
  it("archives the current run with immutable category and Overall snapshots", () => {
    const current = profile();
    const next = startNewKinkRankingRun(
      current,
      catalog,
      "run-2",
      "2026-09-08T20:45:00.000Z",
    );

    const archived = next.rankingHistory?.runs["run-1"];
    expect(archived).toMatchObject({
      id: "run-1",
      status: "archived",
      archivedAt: "2026-09-08T20:45:00.000Z",
    });

    expect(archived?.snapshots?.categories["cat-a"]?.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ catalogId: "a", rank: 1, comparisons: 1 }),
        expect.objectContaining({ catalogId: "b", rank: 2, comparisons: 1 }),
      ]),
    );
    expect(archived?.snapshots?.categories["cat-b"]?.items).toHaveLength(2);
    expect(archived?.snapshots?.overall?.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ catalogId: "a", comparisons: 1 }),
        expect.objectContaining({ catalogId: "c", comparisons: 1 }),
      ]),
    );
  });

  it("starts the new active run with zero pairwise evidence while preserving old evidence", () => {
    const current = profile();
    const next = startNewKinkRankingRun(
      current,
      catalog,
      "run-2",
      "2026-09-08T20:45:00.000Z",
    );

    expect(next.rankingHistory?.activeRunId).toBe("run-2");
    expect(next.rankingHistory?.runs["run-2"]).toEqual({
      id: "run-2",
      startedAt: "2026-09-08T20:45:00.000Z",
      status: "active",
      algorithmVersion: 1,
    });

    expect(getActiveKinkRankingComparisons(next)).toEqual([]);
    expect(next.comparisons).toEqual(current.comparisons);
    expect(next.preferences).toEqual(current.preferences);
  });

  it("does not mutate the profile being archived", () => {
    const current = profile();
    const before = structuredClone(current);

    startNewKinkRankingRun(
      current,
      catalog,
      "run-2",
      "2026-09-08T20:45:00.000Z",
    );

    expect(current).toEqual(before);
  });

  it("rejects a duplicate run ID", () => {
    expect(() =>
      startNewKinkRankingRun(
        profile(),
        catalog,
        "run-1",
        "2026-09-08T20:45:00.000Z",
      ),
    ).toThrow("unique ID");
  });
});
