import { Fragment, type ReactNode } from "react";

/**
 * Minimal safe reader for the editorial Markdown subset in Education.
 * React escapes all source text; no HTML injection or interpreted scripts.
 * Expand/replace with a vetted parser when rich authoring is introduced.
 */
function inline(source:string):ReactNode[] {
  const parts=source.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\(https?:\/\/[^)]+\)|`[^`]+`)/g);
  return parts.filter(Boolean).map((part,index)=>{
    if(part.startsWith("**")&&part.endsWith("**"))return <strong key={index}>{part.slice(2,-2)}</strong>;
    if(part.startsWith("*")&&part.endsWith("*"))return <em key={index}>{part.slice(1,-1)}</em>;
    if(part.startsWith("`")&&part.endsWith("`"))return <code key={index}>{part.slice(1,-1)}</code>;
    const link=part.match(/^\[([^\]]+)\]\((https:\/\/[^)]+)\)$/);
    if(link)return <a key={index} href={link[2]} target="_blank" rel="noopener noreferrer">{link[1]}<span className="lab-education-external" aria-hidden="true"> ↗</span></a>;
    return <Fragment key={index}>{part}</Fragment>;
  });
}
function textLine(line:string){return line.replace(/^\s+/,"").trim();}

/** Metadata is presented separately; the first horizontal rule begins the article body. */
export function articleBody(markdown:string){
  const boundary=markdown.indexOf("\n---\n");
  const body=boundary>=0?markdown.slice(boundary+5).trim():markdown.replace(/^# [^\n]+\n/,"").trim();
  // The reader provides curated links, so do not render the draft's old suggestion list twice.
  // Keep Further Reading references and external sources.
  return body.replace(/\n---\s*\n\s*### Continue Learning\s*\n[\s\S]*?(?=\n### Further Reading|\s*$)/i,"\n").trim();
}
export function articleContentNote(markdown:string){
  return markdown.match(/^\*\*Content note:\*\*\s*(.+)$/m)?.[1] ?? null;
}
export function EducationMarkdown({markdown}:{markdown:string}){
  const lines=markdown.replace(/\r\n?/g,"\n").split("\n");
  const nodes:ReactNode[]=[];
  let i=0;
  while(i<lines.length){
    const line=lines[i].trim();
    if(!line){i++;continue;}
    if(/^---+$/.test(line)){nodes.push(<hr key={i}/>);i++;continue;}
    const heading=line.match(/^(#{1,4})\s+(.+)$/);
    if(heading){
      const level=Math.min(heading[1].length+1,4); // Document title is already an h2.
      const id="education-section-"+i;
      if(level===2)nodes.push(<h2 id={id} key={i}>{inline(heading[2])}</h2>);
      else if(level===3)nodes.push(<h3 id={id} key={i}>{inline(heading[2])}</h3>);
      else nodes.push(<h4 id={id} key={i}>{inline(heading[2])}</h4>);
      i++;continue;
    }
    const ul=/^[-*]\s+/.test(line),ol=/^\d+\.\s+/.test(line);
    if(ul||ol){
      const start=i,items:ReactNode[]=[];
      while(i<lines.length&& (ul?/^[-*]\s+/.test(lines[i].trim()):/^\d+\.\s+/.test(lines[i].trim()))){
        const body=lines[i].trim().replace(ul?/^[-*]\s+/:/^\d+\.\s+/,"");
        items.push(<li key={i}>{inline(body)}</li>);i++;
      }
      nodes.push(ul?<ul key={start}>{items}</ul>:<ol key={start}>{items}</ol>);continue;
    }
    if(line.startsWith(">")){
      const start=i,quotes:string[]=[];
      while(i<lines.length&&lines[i].trim().startsWith(">")){quotes.push(textLine(lines[i].trim().slice(1)));i++;}
      nodes.push(<blockquote key={start}>{inline(quotes.join(" "))}</blockquote>);continue;
    }
    const start=i,words:string[]=[];
    while(i<lines.length&&lines[i].trim()&&!/^(#{1,4})\s|---+$|[-*]\s+|\d+\.\s+|>/.test(lines[i].trim())){
      words.push(textLine(lines[i]));i++;
    }
    if(words.length)nodes.push(<p key={start}>{inline(words.join(" "))}</p>);
    else i++; // Unknown syntax cannot lock up the reader.
  }
  return <div className="lab-education-prose">{nodes}</div>;
}
