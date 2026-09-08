import { describe, expect, it } from "vitest";
import type { ProfileShareSummaryModel } from "./profileShareSummary";
import {
  buildPdfFromJpegPages,
  buildStandaloneShareHtml,
  createShareExportFilename,
  planPdfSlices,
} from "./profileShareExport";

const model: ProfileShareSummaryModel = {
  version: 2,
  generatedAt: "2026-09-07T19:00:00.000Z",
  displayName: "Kitty / babygirl ♥",
  summary: "A compact share summary.",
  orientation: "Submissive",
  strongestThemes: ["Power Exchange"],
  radarAxes: [],
  headspaces: [],
  dynamicModes: [],
  topInterests: [],
  interestAreas: [],
  hardLimits: [],
};

describe("profile share export", () => {
  it("builds safe, human-readable filenames for each format", () => {
    expect(createShareExportFilename(model, "png")).toBe(
      "kitty-babygirl-kink-profile-summary-2026-09-07.png",
    );
    expect(createShareExportFilename(model, "html")).toBe(
      "kitty-babygirl-kink-profile-summary-2026-09-07.html",
    );
    expect(createShareExportFilename(model, "pdf")).toBe(
      "kitty-babygirl-kink-profile-summary-2026-09-07.pdf",
    );
  });

  it("builds self-contained HTML around only the provided share markup", () => {
    const html = buildStandaloneShareHtml(
      model,
      '<article class="share-summary"><h2>Kitty</h2></article>',
      ".share-summary{color:pink}",
    );

    expect(html).toContain("<!doctype html>");
    expect(html).toContain("Kitty / babygirl ♥ — Kink Profile");
    expect(html).toContain(".share-summary{color:pink}");
    expect(html).toContain('<article class="share-summary">');
    expect(html).not.toContain("<script");
    expect(html).not.toContain("localStorage");
  });

  it("prefers major section boundaries instead of slicing at the raw page edge", () => {
    expect(
      planPdfSlices(2500, 1000, [420, 880, 1320, 1780, 2200]),
    ).toEqual([
      { start: 0, end: 880 },
      { start: 880, end: 1780 },
      { start: 1780, end: 2500 },
    ]);
  });

  it("falls back to a page-height slice when no useful boundary exists", () => {
    expect(planPdfSlices(1700, 1000, [200, 300])).toEqual([
      { start: 0, end: 1000 },
      { start: 1000, end: 1700 },
    ]);
  });

  it("builds a multi-page PDF container from JPEG page bytes", () => {
    const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xd9]);
    const pdf = buildPdfFromJpegPages([
      { jpegBytes: jpeg, width: 1200, height: 1600 },
      { jpegBytes: jpeg, width: 1200, height: 900 },
    ]);
    const text = new TextDecoder("latin1").decode(pdf);

    expect(text.startsWith("%PDF-1.4")).toBe(true);
    expect(text).toContain("/Count 2");
    expect(text).toContain("/Subtype /Image");
    expect(text).toContain("%%EOF");
  });
});
