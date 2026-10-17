import { useState } from "react";
import type { LabArea } from "./LabNavigation";
import { useLabCatalog } from "./LabCatalog";
import { useLabRecords } from "./LabRecords";
import { useDiscoverSession } from "./DiscoverSession";
import { ambientTopic, discoveryDismissalId, discoveryThemes, discoveryTopics, eligibleDiscoveryTopics, explainedConnections, nextDiscoveryTopic, type DiscoveryTheme } from "./Serendipity";
import "./serendipity.css";

type Go = (area: LabArea, workspace?: string, params?: Record<string, string>) => void;

function useDiscoveryPool() {
  const { data } = useLabCatalog();
  const records = useLabRecords();
  const session = useDiscoverSession();
  const topics = eligibleDiscoveryTopics(data, records.values, session.dismissed);
  return { data, records, session, topics };
}

export function SerendipityEntry({ go }: { go: Go }) {
  const { session, topics } = useDiscoveryPool();
  const start = () => {
    const next = nextDiscoveryTopic(topics, session.seenTopics, session.seenTopics.length, null);
    if (next) session.noteTopic(next.id);
    go("Discover", "Surprise Me", next ? { topic: next.id } : { topic: "finished" });
  };
  return <button className="lab-serendipity-entry" onClick={start} type="button">
    <span className="lab-serendipity-entry-mark" aria-hidden="true">✧</span>
    <span><strong>Surprise Me</strong><small>An unexpected idea, no profile required</small></span>
    <span className="lab-serendipity-arrow" aria-hidden="true">↗</span>
  </button>;
}

export function AmbientSerendipityCard({ go }: { go: Go }) {
  const { session, topics } = useDiscoveryPool();
  // One shared editorial time bucket per day. A refresh does not constitute a reroll.
  const day = Math.floor(Date.now() / 86400000);
  const topic = ambientTopic(topics, day);
  return <section className="lab-serendipity-ambient" aria-labelledby="lab-serendipity-heading">
    <div className="lab-serendipity-heading">
      <h2 id="lab-serendipity-heading">Something unexpected</h2>
      <span aria-hidden="true">✧</span>
    </div>
    {topic ? <div className="lab-serendipity-card">
      <button type="button" className="lab-serendipity-card-main"
        onClick={() => go("Discover", "Discovery Preview", { topic: topic.id })} aria-label={`Explore ${topic.prompt}`}>
        <span className="lab-serendipity-kicker">A CURIOUS QUESTION</span>
        <strong>{topic.prompt}</strong>
        <span>{topic.teaser}</span>
        <small>Editorial discovery · Not personalized</small>
        <span className="lab-serendipity-arrow" aria-hidden="true">↗</span>
      </button>
      <button type="button" className="lab-serendipity-hide" onClick={() => session.dismiss(discoveryDismissalId(topic.id))}>Hide this suggestion</button>
    </div> : <p className="lab-serendipity-empty">No eligible editorial surprises are available right now. You can still browse the Catalog or manage hidden suggestions.</p>}
  </section>;
}

export function SerendipityExperience({ view, topicId, stage, origin, go }: {
  view: string; topicId?: string; stage?: string; origin?: string; go: Go;
}) {
  const { data, records, session, topics } = useDiscoveryPool();
  const [showThemes, setShowThemes] = useState(false);
  const [showAllThemes, setShowAllThemes] = useState(false);
  const fromSurprise = view === "Surprise Me" || origin === "surprise";
  const detailed = view === "Discovery Preview" && stage === "details";
  const current = topics.find(topic => topic.id === topicId)
    ?? (!topicId && view === "Surprise Me" ? nextDiscoveryTopic(topics, session.seenTopics, 0, session.theme) : undefined);
  const concept = current && data.concepts.find(item => item.id === current.id);
  const relations = detailed && current ? explainedConnections(current.id, data, topics, records.values) : [];

  const another = () => {
    const seen = [...new Set([...session.seenTopics, ...(current ? [current.id] : [])])];
    if (current) session.noteTopic(current.id);
    const next = nextDiscoveryTopic(topics, seen, seen.length, session.theme);
    if (next) session.noteTopic(next.id);
    go("Discover", "Surprise Me", { topic: next?.id ?? "finished" });
  };
  const explore = () => {
    if (current) go("Discover", "Discovery Preview", {
      topic: current.id, stage: "details", origin: fromSurprise ? "surprise" : "ambient",
    });
  };
  const back = () => {
    if (detailed && current) go("Discover", fromSurprise ? "Surprise Me" : "Discovery Preview",
      { topic: current.id, ...(fromSurprise ? {} : { origin: "ambient" }) });
    else go("Discover");
  };
  const openTopic = (id: string) => go("Discover", "Discovery Preview", { topic: id, origin: "ambient" });
  const hide = () => {
    if (current) session.dismiss(discoveryDismissalId(current.id));
    go("Discover");
  };

  return <div className="lab-serendipity-experience">
    <button type="button" className="lab-serendipity-back" onClick={back}>
      {detailed ? (fromSurprise ? "← Back to surprise" : "← Back to preview") : "← Back to Discover"}
    </button>
    {!current || !concept ? <section className="lab-serendipity-empty-state" role="status">
      <h2>No new eligible topics right now</h2>
      <p>You've reached the end of this short exploration, or the remaining suggestions are hidden. There's nothing to complete.</p>
      <button type="button" onClick={() => go("Catalog", "Concept Explorer")}>Browse concepts instead ↗</button>
      <button type="button" onClick={() => go("Discover", "Manage Suggestions")}>Manage hidden suggestions</button>
      {session.theme && <button type="button" onClick={() => session.setTheme(null)}>Clear theme for future surprises</button>}
    </section> : !detailed ? <>
      <article className="lab-serendipity-preview lab-serendipity-preview--teaser" aria-labelledby="lab-serendipity-topic-title">
        <p className="lab-serendipity-kicker">✧ A LITTLE SOMETHING UNEXPECTED</p>
        <h2 id="lab-serendipity-topic-title">{current.prompt}</h2>
        <p className="lab-serendipity-teaser">{current.teaser}</p>
        <div className="lab-serendipity-preview-foot">
          <span>✧ {current.theme} & meaning</span>
          <small>Editorial · Not personalized</small>
        </div>
      </article>
      <div className="lab-serendipity-choices" aria-label="Choose what happens next">
        <button type="button" className="lab-serendipity-explore" onClick={explore}>
          <span aria-hidden="true">↗</span><strong>Explore this</strong>
        </button>
        <button type="button" className="lab-serendipity-next" onClick={another}>
          <span aria-hidden="true">✧</span><strong>Surprise me again</strong>
        </button>
      </div>
      <div className="lab-serendipity-secondary">
        <button type="button" onClick={() => setShowThemes(value => !value)} aria-expanded={showThemes}>
          {showThemes ? "Hide themes ↑" : "Choose a theme ↓"}
        </button>
        <button type="button" onClick={hide}>Hide this suggestion</button>
      </div>
      {showThemes && <section className="lab-serendipity-themes" aria-label="Optional exploration themes">
        <h3>Choose a direction <small>Only for this exploration</small></h3>
        <div className="lab-serendipity-chips">
          {(showAllThemes ? discoveryThemes : discoveryThemes.slice(0, 2)).map((theme: DiscoveryTheme) =>
            <button type="button" key={theme} aria-pressed={session.theme === theme} onClick={() => session.setTheme(theme)}>{theme}</button>)}
          {!showAllThemes && <button type="button" onClick={() => setShowAllThemes(true)}>Browse all themes ↓</button>}
          {session.theme && <button type="button" onClick={() => session.setTheme(null)}>Clear theme ×</button>}
        </div>
        <p>{session.theme ? `Your next surprise will explore ${session.theme}.` : "Any eligible theme can appear next."} This doesn't change your profile or the current topic.</p>
      </section>}
    </> : <>
      <article className="lab-serendipity-preview lab-serendipity-preview--detail" aria-labelledby="lab-serendipity-topic-title">
        <p className="lab-serendipity-kicker">A CLOSER LOOK</p>
        <h2 id="lab-serendipity-topic-title">{current.prompt}</h2>
        <p className="lab-serendipity-teaser">{current.teaser}</p>
        <p className="lab-serendipity-concept"><strong>{concept.name}</strong> · {concept.description}</p>
        <p className="lab-serendipity-provenance">Editorial example · Not personalized · Prototype content</p>
      </article>
      {relations.length > 0 && <section className="lab-serendipity-connections" aria-label="Explainable editorial connections">
        <h3>Another lens on this idea</h3>
        <p>These editorial examples use a real shared Catalog reference—not a prediction about you.</p>
        {relations.slice(0, 2).map(relation => <button type="button" key={relation.concept.id}
          className="lab-serendipity-connection" onClick={() => openTopic(relation.concept.id)}>
          <span><strong>{relation.concept.name}</strong><small>{relation.insight}</small>
            <small className="lab-serendipity-evidence">Example: {relation.sharedItem.name} · Curated perspective</small></span>
          <span aria-hidden="true">↗</span>
        </button>)}
      </section>}
      <section className="lab-serendipity-paths" aria-label="Choose how to explore">
        <h3>Where would you like to wander?</h3>
        <button type="button" onClick={() => go("Learn")}>↗ <span><strong>Learn about the subject</strong><small>Explore educational articles</small></span></button>
        <button type="button" onClick={() => go("Catalog", "Concept Explorer", { concept: concept.id })}>↗ <span><strong>Explore the concept</strong><small>Open its canonical Concept Explorer entry</small></span></button>
        <button type="button" onClick={() => go("Catalog", "Explore All")}>↗ <span><strong>Browse the Catalog</strong><small>View activities and details deliberately</small></span></button>
      </section>
      <p className="lab-serendipity-endnote">Exploring doesn't rate, save, or define anything about you.</p>
    </>}
  </div>;
}
