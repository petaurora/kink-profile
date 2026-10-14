import { describe, expect, it } from "vitest";
import { articleBody, EducationMarkdown } from "./EducationMarkdown";
import { renderToStaticMarkup } from "react-dom/server";
import { localEducationArticles } from "./services/educationFixtures";
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
  it("preserves paragraphs beginning with bold labels and bold phrases",()=>{
    const markdown="## Redness, Welts, Bruises, and Marking\n\n**Redness** can result from temporary skin irritation.\n\n**Welts** are raised areas.\n\n**Bruises** occur when damaged blood vessels leak blood.\n\nMarking can be meaningful or unwelcome. **A bruise is evidence of tissue injury, not proof of skill.**";
    const html=renderToStaticMarkup(EducationMarkdown({markdown}));
    expect(html).toContain("temporary skin irritation");
    expect(html).toContain("Welts</strong> are raised areas.");
    expect(html).toContain("damaged blood vessels leak blood");
    expect(html).toContain("Marking can be meaningful or unwelcome.");
    expect(html).toContain("not proof of skill.");
    expect((html.match(/<p>/g)??[])).toHaveLength(4);
  });
  it("preserves safety and mark descriptions in the shortened Impact overview and its recovery deep dive",()=>{
    const overview=localEducationArticles.find(article=>article.id==="edu-impact");
    const recovery=localEducationArticles.find(article=>article.id==="edu-impact-marks");
    if(!overview||!recovery)throw new Error("Impact Play series source is missing");
    const intro=renderToStaticMarkup(EducationMarkdown({markdown:articleBody(overview.markdown)}));
    const details=renderToStaticMarkup(EducationMarkdown({markdown:articleBody(recovery.markdown)}));
    for(const expected of ["Welts", "Bruises", "Stop and check in even without a safeword", "A bruise is evidence of injury"])
      expect(intro).toContain(expected);
    for(const expected of ["A welt is not an achievement badge", "Bruises may appear hours later", "No bruise means no injury", "A big bruise means an especially good scene"])
      expect(details).toContain(expected);
  });
  it("retains a full article without draft suggestions",()=>{
    expect(articleBody("# Hello\n\n---\n\n## Safety\n\nStay aware.")).toContain("## Safety");
  });
});
