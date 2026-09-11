import { describe, expect, it } from "vitest";
import { canonicalSignalDefinitions } from "./canonicalSignals";
import {
  curationInventory,
  curationInventoryCounts,
} from "./curationInventory";
import { buildCanonicalSignalEntityModel } from "../lib/curationCanonicalSignalEntity";

describe("M16.2 canonical Workbench Signal inventory", () => {
  const signals = curationInventory.filter((entry) => entry.entityType === "signal");

  it("tracks canonical Signal concepts instead of legacy compatibility IDs", () => {
    expect(curationInventoryCounts.signal).toBe(canonicalSignalDefinitions.length);
    expect(signals).toHaveLength(37);
    expect(signals.some((entry) => entry.entityId === "control")).toBe(true);
    expect(signals.some((entry) => entry.entityId === "receiving_control")).toBe(
      false,
    );
    expect(signals.some((entry) => entry.entityId === "pain_receiving")).toBe(
      false,
    );
  });

  it("exposes canonical channel metadata on the Signal primitive", () => {
    const control = signals.find((entry) => entry.entityId === "control");
    expect(control?.fields.find((field) => field.key === "channels")?.value).toContain(
      "Being controlled",
    );
  });

  it("builds a structured editor for canonical-only Signal IDs", () => {
    const control = signals.find((entry) => entry.entityId === "control");
    if (!control) throw new Error("Missing canonical Control Signal");

    const model = buildCanonicalSignalEntityModel(control);
    expect(model).not.toBeNull();
    expect(model?.fields.map((field) => field.key)).toEqual([
      "label",
      "shortLabel",
      "description",
      "facetRelationships",
    ]);
  });
});
