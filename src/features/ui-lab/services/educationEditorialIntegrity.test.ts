import { describe, expect, it } from "vitest";
import { localEducationArticles } from "./educationFixtures";

describe("Education editorial integrity", () => {
  it("registers unique stable IDs and slugs with resolvable related articles", () => {
    const ids = new Set(localEducationArticles.map(a => a.id));
    const slugs = new Set(localEducationArticles.map(a => a.slug));
    expect(ids.size).toBe(localEducationArticles.length);
    expect(slugs.size).toBe(localEducationArticles.length);
    for (const a of localEducationArticles) {
      expect(a.markdown).toMatch(/^# .+/);
      expect(a.markdown).toContain("**Content note:**");
      for (const link of a.links) {
        if (link.target.kind === "article") {
          expect(link.target.id).not.toBe(a.id);
          expect(ids.has(link.target.id)).toBe(true);
        }
      }
    }
  });

  it("keeps registry reading times aligned with actual source lengths", () => {
    for (const article of localEducationArticles) {
      const words = article.markdown.trim().split(/\s+/).length;
      const expectedMinutes = Math.ceil(words / 200);
      expect(article.readingMinutes, `${article.id}: ${words} words`).toBe(expectedMinutes);
    }
  });

  it("identifies the four known long fundamentals pending editorial restructuring", () => {
    const known = new Set(["edu-ds", "edu-sm", "edu-tpe", "edu-collars"]);
    const long = localEducationArticles
      .filter(a => a.markdown.trim().split(/\s+/).length > 3000)
      .map(a => a.id);
    expect(new Set(long)).toEqual(known);
  });
});
