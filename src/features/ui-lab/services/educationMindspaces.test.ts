import { describe, expect, it } from "vitest";
import { localEducationArticles, toEducationSummaries } from "./educationFixtures";

describe("Mindspaces education",()=>{
  it("has a stable, browsable, self-contained introduction",()=>{
    const article=localEducationArticles.find(a=>a.id==="edu-mindspaces");
    expect(article).toBeDefined();
    expect(article?.readingMinutes).toBe(11);
    expect(article?.section).toBe("Kinks, roles, and motivation");
    expect(article?.markdown).toContain("Mindspaces Can Blend");
    expect(article?.markdown).toContain("Mindspaces Can Change Over Time");
    expect(article?.markdown).toContain("A Mindspace Is Not Consent");
    expect(article?.links.some(link=>link.target.kind==="article"&&link.target.id==="edu-roles")).toBe(true);
    expect(article?.markdown.trim().split(/\s+/).length).toBeLessThanOrEqual(3000);
  });
  it("does not expose full editorial Markdown in library summaries",()=>{
    expect(toEducationSummaries(localEducationArticles).find(a=>a.id==="edu-mindspaces")).not.toHaveProperty("markdown");
  });
});
