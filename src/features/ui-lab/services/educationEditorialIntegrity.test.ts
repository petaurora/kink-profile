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
      const headingCount = (a.markdown.match(/^# /gm) ?? []).length;
      expect(headingCount, `${a.id}: one article title`).toBe(1);
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
      expect(words, `${article.id} below 5-minute standalone minimum`).toBeGreaterThanOrEqual(1000);
      expect(words, `${article.id} exceeds 15-minute ceiling`).toBeLessThanOrEqual(3000);
      expect(article.markdown).toContain(`**Estimated reading time:** ${expectedMinutes} minutes`);
    }
  });

  it("has no overlength articles remaining after restructuring", () => {
    expect(localEducationArticles.filter(a => a.markdown.trim().split(/\\s+/).length > 3000)).toEqual([]);
  });
});
