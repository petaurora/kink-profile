import { describe, expect, it } from "vitest";
import { articleBody } from "./EducationMarkdown";
describe("Education article footers",()=>{
  it("replaces obsolete plain-text suggestions with one linked Continue Learning section",()=>{
    const draft="# Article title\n\n**Level:** Beginner\n\n---\n\n## What matters\n\nHelpful text.\n\n---\n\n### Continue Learning\n\n- **The article you are reading:** Unhelpful self suggestion.\n- **Next:** A related topic.\n\n### Further Reading\n\n- [Consent resource](https://example.org/consent)\n";
    const rendered=articleBody(draft);
    expect(rendered).toContain("Helpful text.");
    expect(rendered).not.toContain("### Continue Learning");
    expect(rendered).not.toContain("The article you are reading");
    expect(rendered).toContain("### Further Reading");
    expect(rendered).toContain("https://example.org/consent");
  });
  it("retains a full article without draft suggestions",()=>{
    expect(articleBody("# Hello\n\n---\n\n## Safety\n\nStay aware.")).toContain("## Safety");
  });
});
