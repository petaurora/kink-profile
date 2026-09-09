import { describe, expect, it } from "vitest";
import {
  createEmptyCurationWorkspace,
  findCurationChange,
  removeCurationChange,
  upsertCurationChange,
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
});
