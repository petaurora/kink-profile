import { describe, expect, it } from "vitest";
import {
  getSceneTheme,
  getSceneThemesByFamily,
  sceneThemeDefinitions,
  sceneThemeSemantics,
  validateSceneThemeDefinitions,
} from "./sceneThemes";

describe("M13 scene theme taxonomy", () => {
  it("keeps theme selection query-only", () => {
    expect(sceneThemeSemantics).toEqual({
      authority: "query-only",
      writesProfileEvidence: false,
    });
  });

  it("uses stable unique theme IDs", () => {
    const ids = sceneThemeDefinitions.map((theme) => theme.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every((id) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id))).toBe(true);
  });

  it("resolves every mapping against current source metadata", () => {
    expect(validateSceneThemeDefinitions()).toEqual([]);
  });

  it("keeps all mapping weights bounded", () => {
    for (const theme of sceneThemeDefinitions) {
      for (const mapping of theme.mappings) {
        expect(mapping.weight).toBeGreaterThan(0);
        expect(mapping.weight).toBeLessThanOrEqual(1);
      }
    }
  });

  it("covers every supported theme family", () => {
    expect(
      new Set(sceneThemeDefinitions.map((theme) => theme.family)),
    ).toEqual(
      new Set(["activity", "headspace", "dynamic_mode", "facet", "vibe"]),
    );
  });

  it("exposes stable lookup helpers for the candidate engine", () => {
    expect(getSceneTheme("pain")?.label).toBe("Pain");
    expect(getSceneTheme("devotional-submission")).toEqual(
      expect.objectContaining({ label: "Devotion", family: "dynamic_mode" }),
    );
    expect(getSceneThemesByFamily("headspace").map((theme) => theme.id)).toEqual(
      expect.arrayContaining(["pet", "prey"]),
    );
    expect(getSceneThemesByFamily("headspace").map((theme) => theme.id)).not.toContain(
      "devotional-submission",
    );
  });
});
