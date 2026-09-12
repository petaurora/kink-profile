import {
  IconArrowRight,
  IconBolt,
  IconBook2,
  IconChartDots3,
  IconCheck,
  IconChevronRight,
  IconFlame,
  IconGift,
  IconHeart,
  IconHomeHeart,
  IconPlayerPlay,
  IconRosetteDiscountCheck,
  IconSparkles,
  IconTargetArrow,
  IconTrophy,
} from "@tabler/icons-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./HubPrototypes.css";

type HubPrototype = "a" | "b" | "c";

const progress = [
  { label: "Quizzes", detail: "3 of 4 complete", value: 75 },
  { label: "Kink Catalog", detail: "548 preferences set", value: 88 },
  { label: "Rewards & Punishments", detail: "Building context", value: 56 },
  { label: "Profile depth", detail: "Rich profile", value: 82 },
];

const nextActions = [
  {
    icon: IconBolt,
    eyebrow: "Finish a signal",
    title: "Complete S/M",
    body: "One guided quiz is still waiting for you.",
    route: "/quizzes",
  },
  {
    icon: IconHeart,
    eyebrow: "Refine",
    title: "Rank your strongest kinks",
    body: "You have enough catalog signal for comparisons to get interesting.",
    route: "/catalog/kinks/rank",
  },
  {
    icon: IconSparkles,
    eyebrow: "Play with it",
    title: "Build a scene",
    body: "Use what your profile already knows and make something useful now.",
    route: "/scene-builder",
  },
];

function PrototypeSwitcher({
  value,
  onChange,
}: {
  value: HubPrototype;
  onChange: (next: HubPrototype) => void;
}) {
  return (
    <div className="hub-prototype-switcher" aria-label="Hub prototype">
      <span>Prototype</span>
      {(["a", "b", "c"] as const).map((option) => (
        <button
          key={option}
          className={value === option ? "is-active" : ""}
          onClick={() => onChange(option)}
          aria-pressed={value === option}
        >
          {option.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function ContinueCard({ onOpen }: { onOpen: () => void }) {
  return (
    <article className="hub-continue-card">
      <div className="hub-card-icon hub-card-icon-large">
        <IconPlayerPlay size={28} stroke={1.9} />
      </div>
      <div className="hub-continue-copy">
        <p className="hub-mini-label">Continue where you left off</p>
        <h2>Kink ranking · Impact play</h2>
        <p>You were comparing the last few favorites in this category.</p>
        <div className="hub-inline-progress" aria-label="Impact play ranking progress">
          <span style={{ width: "72%" }} />
        </div>
        <small>9 of 12 comparisons · a few left</small>
      </div>
      <button className="hub-round-action" onClick={onOpen} aria-label="Continue ranking">
        <IconArrowRight size={22} />
      </button>
    </article>
  );
}

function ProgressRows() {
  return (
    <div className="hub-progress-list">
      {progress.map((item) => (
        <div className="hub-progress-row" key={item.label}>
          <div>
            <strong>{item.label}</strong>
            <span>{item.detail}</span>
          </div>
          <div className="hub-progress-track" aria-label={`${item.label} progress`}>
            <span style={{ width: `${item.value}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ProfileSnapshot({ onOpen }: { onOpen: () => void }) {
  return (
    <article className="hub-snapshot-card">
      <div className="hub-section-title-row">
        <div>
          <p className="hub-mini-label">Profile snapshot</p>
          <h2>Your shape is getting specific.</h2>
        </div>
        <button className="hub-icon-link" onClick={onOpen} aria-label="Open profile">
          <IconChevronRight size={22} />
        </button>
      </div>

      <div className="hub-snapshot-chips">
        <span>Power Exchange <strong>92</strong></span>
        <span>Ownership <strong>88</strong></span>
        <span>Service <strong>86</strong></span>
      </div>

      <div className="hub-role-strip">
        <div><span>Strongest headspace</span><strong>Pet · 94%</strong></div>
        <div><span>Also showing up</span><strong>Prey · 87%</strong></div>
      </div>
    </article>
  );
}

function SuggestedNext({ onNavigate }: { onNavigate: (route: string) => void }) {
  return (
    <div className="hub-next-list">
      {nextActions.map((item) => {
        const Icon = item.icon;
        return (
          <button className="hub-next-card" key={item.title} onClick={() => onNavigate(item.route)}>
            <span className="hub-card-icon"><Icon size={21} stroke={1.8} /></span>
            <span className="hub-next-copy">
              <small>{item.eyebrow}</small>
              <strong>{item.title}</strong>
              <span>{item.body}</span>
            </span>
            <IconChevronRight className="hub-next-chevron" size={20} />
          </button>
        );
      })}
    </div>
  );
}

function DelightRow() {
  return (
    <div className="hub-delight-row">
      <article>
        <span className="hub-card-icon"><IconTrophy size={20} /></span>
        <div><small>Recent unlock</small><strong>Curious creature</strong><span>100 catalog preferences set</span></div>
      </article>
      <article>
        <span className="hub-card-icon"><IconTargetArrow size={20} /></span>
        <div><small>Almost there</small><strong>Quiz explorer</strong><span>1 guided quiz remaining</span></div>
      </article>
    </div>
  );
}

function RecentActivity() {
  return (
    <div className="hub-activity-list">
      <div><span className="hub-activity-dot" /><p><strong>Updated 7 kink preferences</strong><small>Catalog · recently</small></p></div>
      <div><span className="hub-activity-dot" /><p><strong>Finished Roles & Headspaces</strong><small>Quiz · earlier</small></p></div>
      <div><span className="hub-activity-dot" /><p><strong>Saved a reward recipe</strong><small>R/P Tools · earlier</small></p></div>
    </div>
  );
}

function PrototypeA({ navigate }: { navigate: (route: string) => void }) {
  return (
    <section className="hub-dashboard hub-dashboard-a">
      <header className="hub-dashboard-heading">
        <p className="eyebrow">Welcome back</p>
        <h1>Pick up the thread.</h1>
        <p>Your profile is already taking shape. Keep going where it feels useful.</p>
      </header>

      <ContinueCard onOpen={() => navigate("/catalog/kinks/rank")} />

      <div className="hub-dashboard-grid hub-dashboard-grid-main">
        <section className="hub-module hub-progress-module">
          <div className="hub-section-title-row">
            <div><p className="hub-mini-label">Progress</p><h2>Where your profile stands</h2></div>
            <IconChartDots3 size={24} />
          </div>
          <ProgressRows />
        </section>

        <ProfileSnapshot onOpen={() => navigate("/profile")} />
      </div>

      <section className="hub-dashboard-section">
        <div className="hub-section-title-row"><div><p className="hub-mini-label">Suggested next</p><h2>Useful from here</h2></div></div>
        <SuggestedNext onNavigate={navigate} />
      </section>

      <DelightRow />

      <section className="hub-module hub-activity-module">
        <div className="hub-section-title-row"><div><p className="hub-mini-label">Recent activity</p><h2>Your latest changes</h2></div></div>
        <RecentActivity />
      </section>
    </section>
  );
}

function PrototypeB({ navigate }: { navigate: (route: string) => void }) {
  return (
    <section className="hub-dashboard hub-dashboard-b">
      <header className="hub-dashboard-heading hub-dashboard-heading-compact">
        <p className="eyebrow">Your space</p>
        <h1>What sounds good today?</h1>
      </header>

      <div className="hub-bento">
        <div className="hub-bento-continue"><ContinueCard onOpen={() => navigate("/catalog/kinks/rank")} /></div>

        <button className="hub-bento-profile" onClick={() => navigate("/profile")}>
          <span className="hub-card-icon"><IconHomeHeart size={23} /></span>
          <small>Profile snapshot</small>
          <strong>Power Exchange · 92</strong>
          <span>Pet 94% · Prey 87% · Devotional 81%</span>
          <span className="hub-bento-link">See your profile <IconArrowRight size={17} /></span>
        </button>

        <article className="hub-bento-progress hub-module">
          <div className="hub-section-title-row">
            <div><p className="hub-mini-label">Your map</p><h2>Four ways it’s growing</h2></div>
            <IconChartDots3 size={23} />
          </div>
          <ProgressRows />
        </article>

        <button className="hub-bento-next hub-bento-accent" onClick={() => navigate("/scene-builder")}>
          <IconSparkles size={28} />
          <small>Do something with it</small>
          <strong>Build a scene</strong>
          <span>Your profile already has enough signal to play with.</span>
        </button>

        <button className="hub-bento-next" onClick={() => navigate("/quizzes")}>
          <IconBolt size={27} />
          <small>One unfinished thread</small>
          <strong>Finish S/M</strong>
          <span>Complete your last guided quiz.</span>
        </button>

        <article className="hub-bento-achievement">
          <IconRosetteDiscountCheck size={26} />
          <div><small>Almost unlocked</small><strong>Quiz explorer</strong><span>1 quiz to go</span></div>
        </article>
      </div>

      <section className="hub-dashboard-section hub-bento-suggestions">
        <div className="hub-section-title-row"><div><p className="hub-mini-label">Or wander a little</p><h2>Other useful directions</h2></div></div>
        <SuggestedNext onNavigate={navigate} />
      </section>
    </section>
  );
}

function PrototypeC({ navigate }: { navigate: (route: string) => void }) {
  return (
    <section className="hub-dashboard hub-dashboard-c">
      <header className="hub-profile-hero">
        <div>
          <p className="eyebrow">Your evolving profile</p>
          <h1>Desire has dimensions.</h1>
          <p>You’re building a map of what pulls you in, what context changes, and what actually wins.</p>
        </div>
        <button onClick={() => navigate("/profile")} className="hub-profile-hero-action">
          View profile <IconArrowRight size={18} />
        </button>
      </header>

      <div className="hub-profile-signals">
        <div><span>01</span><small>Strongest theme</small><strong>Power Exchange</strong><em>92</em></div>
        <div><span>02</span><small>Strongest headspace</small><strong>Pet</strong><em>94%</em></div>
        <div><span>03</span><small>Close behind</small><strong>Ownership</strong><em>88</em></div>
      </div>

      <section className="hub-c-thread">
        <div className="hub-c-thread-line" />
        <div className="hub-c-thread-content">
          <p className="hub-mini-label">Keep the thread moving</p>
          <ContinueCard onOpen={() => navigate("/catalog/kinks/rank")} />
        </div>
      </section>

      <div className="hub-c-split">
        <section className="hub-module">
          <div className="hub-section-title-row"><div><p className="hub-mini-label">Coverage</p><h2>What you’ve explored</h2></div><IconBook2 size={23} /></div>
          <ProgressRows />
        </section>

        <section className="hub-module hub-c-next-module">
          <div className="hub-section-title-row"><div><p className="hub-mini-label">Next signal</p><h2>One useful nudge</h2></div><IconFlame size={23} /></div>
          <button className="hub-c-featured-next" onClick={() => navigate("/quizzes")}>
            <span className="hub-card-icon"><IconBolt size={22} /></span>
            <span><small>Guided exploration</small><strong>Finish S/M</strong><em>One quiz left before the full guided set is complete.</em></span>
            <IconArrowRight size={20} />
          </button>
          <button className="hub-c-secondary-next" onClick={() => navigate("/scene-builder")}><IconSparkles size={19} /> Build something from your profile</button>
        </section>
      </div>

      <div className="hub-c-footer-grid">
        <article className="hub-module">
          <div className="hub-section-title-row"><div><p className="hub-mini-label">Tiny victory</p><h2>Curious creature</h2></div><IconTrophy size={23} /></div>
          <p className="hub-muted-copy">You’ve explicitly set more than 100 catalog preferences.</p>
        </article>
        <article className="hub-module">
          <div className="hub-section-title-row"><div><p className="hub-mini-label">Recently</p><h2>Still evolving</h2></div><IconGift size={23} /></div>
          <RecentActivity />
        </article>
      </div>
    </section>
  );
}

export function HubPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get("hub");
  const prototype: HubPrototype = requested === "b" || requested === "c" ? requested : "a";

  const setPrototype = (next: HubPrototype) => {
    const updated = new URLSearchParams(searchParams);
    updated.set("hub", next);
    setSearchParams(updated, { replace: true });
  };

  return (
    <main className="app-shell hub-prototype-shell">
      <PrototypeSwitcher value={prototype} onChange={setPrototype} />
      {prototype === "a" ? <PrototypeA navigate={navigate} /> : null}
      {prototype === "b" ? <PrototypeB navigate={navigate} /> : null}
      {prototype === "c" ? <PrototypeC navigate={navigate} /> : null}
    </main>
  );
}
