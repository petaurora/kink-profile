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

  it("covers every active theme family", () => {
    expect(
      new Set(sceneThemeDefinitions.map((theme) => theme.family)),
    ).toEqual(
      new Set(["activity", "headspace", "dynamic_mode", "vibe"]),
    );
  });

  it("preserves stable theme IDs while using the revised mode taxonomy", () => {
    expect(getSceneTheme("pain")?.label).toBe("Pain");
    expect(getSceneTheme("devotional-submission")).toEqual(
      expect.objectContaining({ label: "Devotion", family: "dynamic_mode" }),
    );
    expect(getSceneTheme("playful-resistance")).toEqual(
      expect.objectContaining({ label: "Playful Challenge", family: "dynamic_mode" }),
    );
    expect(getSceneTheme("power-exchange")).toEqual(
      expect.objectContaining({ label: "Power Exchange", family: "dynamic_mode" }),
    );
    expect(getSceneTheme("power-exchange")?.mappings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "dynamic_mode", id: "power_exchange_mode" }),
      ]),
    );
    expect(getSceneTheme("surrender")?.family).toBe("vibe");
    expect(getSceneTheme("deep-submission")?.family).toBe("vibe");
    expect(getSceneTheme("care")?.mappings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "dynamic_mode", id: "care_mode" }),
      ]),
    );
    expect(getSceneTheme("structured")?.mappings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "dynamic_mode", id: "structure_mode" }),
      ]),
    );
    expect(getSceneTheme("intense")?.mappings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "dynamic_mode", id: "intensity_mode" }),
      ]),
    );

    expect(getSceneThemesByFamily("headspace").map((theme) => theme.id)).toEqual(
      expect.arrayContaining(["pet", "prey"]),
    );
    expect(getSceneThemesByFamily("headspace").map((theme) => theme.id)).not.toContain(
      "devotional-submission",
    );
  });
});