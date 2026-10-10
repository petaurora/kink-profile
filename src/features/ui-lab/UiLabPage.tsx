import { useState } from "react";
import "./uiLab.css";

const swatches = [
  ["Midnight navy", "#101240"], ["Deep burgundy", "#520E25"], ["Soft pink", "#F0D3E7"],
  ["Canvas", "#0B0C25"], ["Raised surface", "#1A1A43"], ["Muted lavender", "#AFA7C9"],
];

export function UiLabPage() {
  const [tab, setTab] = useState("Components");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState("Love");
  return <div className="ui-lab">
    <aside className="ui-lab-sidebar">
      <div className="ui-lab-brand"><span className="ui-lab-mark">♡</span><div><strong>Kink Profile</strong><small>Design laboratory</small></div></div>
      <div className="ui-lab-sidebar-label">EXPERIMENTS</div>
      {["Components", "App shell", "Catalog patterns", "Tokens"].map(item => <button key={item} className={tab === item ? "ui-lab-nav active" : "ui-lab-nav"} onClick={() => setTab(item)}>{item}</button>)}
      <a className="ui-lab-back" href="#/hub">← Back to application</a>
    </aside>
    <main className="ui-lab-main">
      <header className="ui-lab-top"><span>UI LAB <span className="ui-lab-dot">·</span> EXPERIMENTAL</span><span>♡ Taylor + Jackie</span></header>
      <div className="ui-lab-content">
        <p className="ui-lab-eyebrow">KINK PROFILE / FOUNDATION</p>
        <h1>{tab === "Components" ? "A little more us." : tab}</h1>
        <p className="ui-lab-intro">A safe space to explore the next chapter of Kink Profile without changing existing product screens. Our original colors stay at the heart of it.</p>
        {tab === "Tokens" ? <section className="ui-lab-panel"><h2>Our color story</h2><p>Three original identity colors, supported by darker surfaces and readable secondary text.</p><div className="ui-lab-swatches">{swatches.map(([name,hex]) => <div key={hex}><div className="ui-lab-swatch" style={{background:hex}}/><strong>{name}</strong><small>{hex}</small></div>)}</div></section> : null}
        {tab === "Components" ? <>
          <section className="ui-lab-panel"><div className="ui-lab-section-head"><div><h2>Actions</h2><p>Strong primary actions, gentle secondary actions.</p></div><span className="ui-lab-tag">01 / BUTTONS</span></div><div className="ui-lab-actions"><button className="ui-lab-primary">Primary action</button><button className="ui-lab-secondary">Secondary action</button><button className="ui-lab-quiet">Quiet action →</button><button className="ui-lab-primary" disabled>Disabled</button></div></section>
          <section className="ui-lab-panel"><div className="ui-lab-section-head"><div><h2>Inputs & selection</h2><p>Familiar controls, with room to breathe.</p></div><span className="ui-lab-tag">02 / FORMS</span></div><label className="ui-lab-label" htmlFor="ui-lab-search">Search the catalog</label><input id="ui-lab-search" className="ui-lab-input" placeholder="Try searching for something..." value={query} onChange={e=>setQuery(e.target.value)}/><div className="ui-lab-pills">{["Love","Like","Curious","Not for me"].map(x=><button key={x} className={liked===x?"selected":""} onClick={()=>setLiked(x)}>{x}</button>)}</div><p className="ui-lab-helper">Selected preference: {liked}{query ? ` · Searching: ${query}` : ""}</p></section>
          <section className="ui-lab-panel"><div className="ui-lab-section-head"><div><h2>Expandable item</h2><p>A flexible starting point for Catalog V2.</p></div><span className="ui-lab-tag">03 / PATTERNS</span></div><button className="ui-lab-item" onClick={()=>setExpanded(!expanded)} aria-expanded={expanded}><span><strong>Collars</strong><small>Restraints · Accessories</small></span><span className="ui-lab-item-right"><span className="ui-lab-rating">{liked}</span><span>{expanded?"⌃":"⌄"}</span></span></button>{expanded&&<div className="ui-lab-details"><strong>Modifier groups</strong><p>Material: Leather · Metal · Fabric</p><p>Use / context: Everyday · Scene / play · Ceremonial</p><small>Prototype only — ratings here are not saved.</small></div>}</section>
        </> : null}
        {tab === "App shell" ? <section className="ui-lab-panel"><h2>Shell direction</h2><p>Quiet navigation, expressive content, and a clear hierarchy. This page itself is the first desktop shell experiment; resize your browser to see the compact mobile treatment.</p><div className="ui-lab-shell-preview"><span>♡ Hub</span><span>Explore</span><span>Profile</span><span>Library</span></div></section> : null}
        {tab === "Catalog patterns" ? <section className="ui-lab-panel"><h2>Expandable catalog row</h2><button className="ui-lab-item" onClick={()=>setExpanded(!expanded)} aria-expanded={expanded}><span><strong>Collars</strong><small>Overall item preference + independent modifiers</small></span><span>{expanded?"⌃":"⌄"}</span></button>{expanded&&<div className="ui-lab-details">Material · Use / context · More groups to come</div>}</section> : null}
        <footer className="ui-lab-footer">Made to evolve. Rooted in us. ♡</footer>
      </div>
    </main>
  </div>;
}
