import { describe, expect, it } from "vitest";
import { articleBody, EducationMarkdown } from "./EducationMarkdown";
import { renderToStaticMarkup } from "react-dom/server";
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
  it("renders practice-guide Markdown pipe tables as accessible, escaped table cells",()=>{
    const rendered=renderToStaticMarkup(EducationMarkdown({markdown:"## Tools\n\n| Implement | Consideration |\n| --- | --- |\n| Padded tool | **Light pressure** |\n| Cane | <script>unsafe</script> |"}));
    expect(rendered).toContain('<table>');
    expect(rendered).toContain('<th scope="col">Implement</th>');
    expect(rendered).toContain("<strong>Light pressure</strong>");
    expect(rendered).not.toContain("<script>");
    expect(rendered).toContain("&lt;script&gt;");
  });
  it("suppresses Impact article's plain-text Related Learning list without losing its editorial notice",()=>{
    const body=articleBody("# Impact Play\n\n---\n\n## Safety\n\nStay safe.\n\n## Related Learning\n\n- **Safewords:** More to read.\n\n---\n\n*Editorial status: draft.*");
    expect(body).toContain("Stay safe.");
    expect(body).not.toContain("## Related Learning");
    expect(body).toContain("Editorial status: draft.");
  });
  it("retains a full article without draft suggestions",()=>{
    expect(articleBody("# Hello\n\n---\n\n## Safety\n\nStay aware.")).toContain("## Safety");
  });
});
