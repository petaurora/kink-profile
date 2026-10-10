import { useState } from "react";
import "./uiLab.css";

const swatches = [
  ["Midnight navy", "#101240"], ["Deep burgundy", "#520E25"], ["Soft pink", "#F0D3E7"],
  ["Canvas", "#0B0C25"], ["Raised surface", "#1A1A43"], ["Muted lavender", "#AFA7C9"],
];
const destinations = ["Hub", "Explore", "Profile", "Library"];
const icons = ["⌂", "◇", "♡", "▤"];
const descriptions: Record<string,string> = {
  Hub: "Your central place to explore, discover and create.",
  Explore: "Browse the catalog and discover what resonates.",
  Profile: "Your preferences, your identity, your story.",
  Library: "Your saved creations and shared inspiration.",
};

export function UiLabPage() {
  const [shellPage, setShellPage] = useState("Hub");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState("Love");
  const [notice, setNotice] = useState("");
  return <div className="ui-lab ui-lab-scroll-layout">
    <main className="ui-lab-main">
      <header className="ui-lab-top"><span>UI LAB <span className="ui-lab-dot">·</span> EXPERIMENTAL</span><span>♡ Taylor + Jackie</span></header>
      <div className="ui-lab-content">
        <p className="ui-lab-eyebrow">KINK PROFILE / FOUNDATION</p>
        <h1>A little more us.</h1>
        <p className="ui-lab-intro">A safe space to explore the next chapter of Kink Profile without changing existing product screens. Our original colors stay at the heart of it.</p>
        <section id="shell" className="ui-lab-panel">
          <div className="ui-lab-section-head"><div><h2>Application shell</h2><p>Try the navigation inside a real page layout, on mobile or desktop.</p></div><span className="ui-lab-tag">01 / SHELL</span></div>
          <div className="ui-lab-mock">
            <header className="ui-lab-mock-header"><strong>♡ Kink Profile</strong><span aria-label="Example header actions">⌕ &nbsp; ♡</span></header>
            <div className="ui-lab-mock-body">
              <nav className="ui-lab-mock-side" aria-label="Desktop shell navigation">
                {destinations.map((item,i)=><button type="button" key={item} className={shellPage===item?"active":""} onClick={()=>setShellPage(item)}><span aria-hidden="true">{icons[i]}</span> {item}</button>)}
              </nav>
              <div className="ui-lab-mock-page"><small>YOUR SPACE / {shellPage.toUpperCase()}</small><h3>{shellPage}</h3><p>{descriptions[shellPage]}</p><div className="ui-lab-mock-card">Example {shellPage.toLowerCase()} content</div></div>
            </div>
            <nav className="ui-lab-mock-bottom" aria-label="Mobile shell navigation">
              {destinations.map((item,i)=><button type="button" key={item} className={shellPage===item?"active":""} onClick={()=>setShellPage(item)}><span aria-hidden="true">{icons[i]}</span>{item}</button>)}
            </nav>
          </div>
          <p className="ui-lab-helper">This navigation belongs to the mock app only; it does not change your real application route.</p>
        </section>
        <section id="components">
          <div className="ui-lab-section-head"><h2>Component playground</h2><span className="ui-lab-tag">02 / COMPONENTS</span></div>
          <div className="ui-lab-panel"><div className="ui-lab-section-head"><div><h2>Actions</h2><p>Strong primary actions, gentle secondary actions.</p></div><span className="ui-lab-tag">BUTTONS</span></div><div className="ui-lab-actions"><button className="ui-lab-primary" onClick={()=>setNotice("Primary action pressed")}>Primary action</button><button className="ui-lab-secondary" onClick={()=>setNotice("Secondary action pressed")}>Secondary action</button><button className="ui-lab-quiet" onClick={()=>setNotice("Quiet action pressed")}>Quiet action →</button><button className="ui-lab-primary" disabled>Disabled</button></div>{notice&&<p role="status" className="ui-lab-helper">{notice}</p>}</div>
          <div className="ui-lab-panel"><div className="ui-lab-section-head"><div><h2>Inputs & selection</h2><p>Familiar controls, with room to breathe.</p></div><span className="ui-lab-tag">FORMS</span></div><label className="ui-lab-label" htmlFor="ui-lab-search">Search the catalog</label><input id="ui-lab-search" className="ui-lab-input" placeholder="Try searching for something..." value={query} onChange={e=>setQuery(e.target.value)}/><div className="ui-lab-pills">{["Love","Like","Curious","Not for me"].map(x=><button type="button" key={x} className={liked===x?"selected":""} onClick={()=>setLiked(x)}>{x}</button>)}</div><p className="ui-lab-helper">Selected preference: {liked}{query ? ` · Searching: ${query}` : ""}</p></div>
        </section>
        <section id="patterns" className="ui-lab-panel">
          <div className="ui-lab-section-head"><div><h2>Catalog patterns</h2><p>Overall item preferences and expandable modifier groups.</p></div><span className="ui-lab-tag">03 / PATTERNS</span></div>
          <button type="button" className="ui-lab-item" onClick={()=>setExpanded(!expanded)} aria-expanded={expanded}><span><strong>Collars</strong><small>Restraints · Accessories</small></span><span className="ui-lab-item-right"><span className="ui-lab-rating">{liked}</span><span>{expanded?"⌃":"⌄"}</span></span></button>
          {expanded&&<div className="ui-lab-details"><strong>Modifier groups</strong><p>Material: Leather · Metal · Fabric</p><p>Use / context: Everyday · Scene / play · Ceremonial</p><small>Prototype only — ratings here are not saved.</small></div>}
        </section>
        <section id="tokens" className="ui-lab-panel"><div className="ui-lab-section-head"><div><h2>Our color story</h2><p>Three original identity colors, supported by darker surfaces and readable secondary text.</p></div><span className="ui-lab-tag">04 / TOKENS</span></div><div className="ui-lab-swatches">{swatches.map(([name,hex]) => <div key={hex}><div className="ui-lab-swatch" style={{background:hex}}/><strong>{name}</strong><small>{hex}</small></div>)}</div></section>
        <nav className="ui-lab-jumps" aria-label="Jump between UI Lab experiments"><span>Jump to:</span>{[["Shell","shell"],["Components","components"],["Patterns","patterns"],["Tokens","tokens"]].map(([name,id])=><a key={id} href={`#${id}`} onClick={e=>{e.preventDefault();document.getElementById(id)?.scrollIntoView({behavior:"smooth"});}}>{name}</a>)}</nav>
        <footer className="ui-lab-footer">Made to evolve. Rooted in us. ♡ <a href="#/hub">Return to app</a></footer>
      </div>
    </main>
  </div>;
}
