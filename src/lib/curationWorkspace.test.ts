import { describe, expect, it } from "vitest";
import {
  createEmptyCurationWorkspace,
  exportCurationWorkspace,
  findCurationChange,
  removeCurationChange,
  upsertCurationChange,
  type CurationWorkspace,
} from "./curationWorkspace";

describe("curation workspace", () => {
  it("upserts one proposal per entity", () => {
    const empty = createEmptyCurationWorkspace();
    const first = upsertCurationChange(empty, {
      entityType: "signal",
      entityId: "service",
      action: "keep",
      reviewedAt: "2026-09-09T00:00:00.000Z",
    });
    const second = upsertCurationChange(first, {
      entityType: "signal",
      entityId: "service",
      action: "modify",
      changes: { label: "Service", description: "Updated" },
      reviewedAt: "2026-09-09T00:01:00.000Z",
    });

    expect(second.changes).toHaveLength(1);
    expect(findCurationChange(second, "signal", "service")?.action).toBe(
      "modify",
    );
  });

  it("removes a single entity proposal without touching others", () => {
    let workspace = createEmptyCurationWorkspace();
    workspace = upsertCurationChange(workspace, {
      entityType: "signal",
      entityId: "service",
      action: "keep",
      reviewedAt: "2026-09-09T00:00:00.000Z",
    });
    workspace = upsertCurationChange(workspace, {
      entityType: "overall-facet",
      entityId: "service_devotion",
      action: "keep",
      reviewedAt: "2026-09-09T00:00:00.000Z",
    });

    const next = removeCurationChange(workspace, "signal", "service");

    expect(next.changes).toHaveLength(1);
    expect(next.changes[0]?.entityType).toBe("overall-facet");
  });

  it("exports identical validated workspace state identically", () => {
    const workspace: CurationWorkspace = {
      schemaVersion: 2,
      changes: [
        {
          entityType: "signal",
          entityId: "service",
          action: "keep",
          reviewedAt: "2026-09-09T00:01:00.000Z",
        },
        {
          entityType: "overall-facet",
          entityId: "service_devotion",
          action: "keep",
          reviewedAt: "2026-09-09T00:00:00.000Z",
        },
      ],
    };

    const first = exportCurationWorkspace(workspace);
    const second = exportCurationWorkspace(workspace);
    const parsed = JSON.parse(first) as {
      changes: Array<{ entityType: string; entityId: string }>;
      exportedAt?: string;
    };

    expect(first).toBe(second);
    expect(parsed.exportedAt).toBeUndefined();
    expect(
      parsed.changes.map(
        (change) => `${change.entityType}:${change.entityId}`,
      ),
    ).toEqual([
      "overall-facet:service_devotion",
      "signal:service",
    ]);
  });
});
