import { useMemo, useState } from "react";
import {
  IconBook2,
  IconGift,
  IconHeart,
  IconHome,
  IconQuestionMark,
  IconSparkles,
  IconTool,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";
import "./NavigationDesignLab.css";

type LauncherId = "catalog" | "tools";

type LauncherOption = {
  id: string;
  label: string;
  Icon: typeof IconHeart;
  left: string;
  top: string;
};

const catalogOptions: LauncherOption[] = [
  {
    id: "kinks",
    label: "Kinks",
    Icon: IconHeart,
    left: "18%",
    top: "30px",
  },
  {
    id: "rewards-punishments",
    label: "Rewards &\nPunishments",
    Icon: IconGift,
    left: "43%",
    top: "54px",
  },
];

const toolsOptions: LauncherOption[] = [
  {
    id: "scenes",
    label: "Scenes",
    Icon: IconSparkles,
    left: "51%",
    top: "68px",
  },
  {
    id: "rp-tools",
    label: "R/P Tools",
    Icon: IconGift,
    left: "71%",
    top: "26px",
  },
  {
    id: "compare",
    label: "Compare",
    Icon: IconUsers,
    left: "88%",
    top: "82px",
  },
];

function RopeConnector({ path }: { path: string }) {
  return (
    <>
      <path className="design-lab-rope-shadow" d={path} />
      <path className="design-lab-rope-main" d={path} />
      <path className="design-lab-rope-twist" d={path} />
    </>
  );
}

function RadialLauncher({
  launcher,
  onSelect,
}: {
  launcher: LauncherId;
  onSelect: (label: string) => void;
}) {
  const isCatalog = launcher === "catalog";
  const options = isCatalog ? catalogOptions : toolsOptions;

  return (
    <div
      className={`design-lab-radial-layer design-lab-radial-layer--${launcher}`}
      aria-label={`${launcher} launcher`}
    >
      <svg
        className="design-lab-rope-map"
        viewBox="0 0 390 230"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {isCatalog ? (
          <>
            <RopeConnector path="M117 221 C110 174 92 121 70 71" />
            <RopeConnector path="M117 221 C130 176 150 139 168 92" />
          </>
        ) : (
          <>
            <RopeConnector path="M351 221 C326 175 280 132 224 106" />
            <RopeConnector path="M351 221 C341 160 319 109 291 69" />
            <RopeConnector path="M351 221 C359 177 357 141 346 119" />
          </>
        )}
      </svg>

      {options.map(({ id, label, Icon, left, top }) => (
        <button
          key={id}
          type="button"
          className="design-lab-radial-option"
          style={{ left, top }}
          onClick={() => onSelect(label.replace("\n", " "))}
        >
          <span className="design-lab-radial-option-icon">
            <Icon size={25} stroke={1.9} aria-hidden="true" />
          </span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

export function NavigationDesignLab() {
  const [openLauncher, setOpenLauncher] = useState<LauncherId | null>(null);
  const [lastAction, setLastAction] = useState("Hub selected");

  const helperText = useMemo(() => {
    if (openLauncher === "catalog") {
      return "Catalog fans into its two sibling workspaces.";
    }
    if (openLauncher === "tools") {
      return "Tools proves the same pattern still works with three options.";
    }
    return "Tap Catalog or Tools to open a radial launcher.";
  }, [openLauncher]);

  const toggleLauncher = (launcher: LauncherId) => {
    setOpenLauncher((current) => {
      const next = current === launcher ? null : launcher;
      setLastAction(
        next
          ? `${launcher === "catalog" ? "Catalog" : "Tools"} launcher open`
          : "Launcher closed",
      );
      return next;
    });
  };

  const selectDestination = (label: string) => {
    setOpenLauncher(null);
    setLastAction(`${label} selected`);
  };

  const chooseOption = (label: string) => {
    selectDestination(label);
  };

  return (
    <main className="design-lab-page">
      <section className="design-lab-stage" aria-label="Mobile navigation design lab">
        <div className="design-lab-phone">
          <header className="design-lab-header">
            <div>
              <p className="design-lab-eyebrow">Navigation Design Lab</p>
              <h1>Radial launcher</h1>
            </div>
            <span className="design-lab-status-pill">LIVE</span>
          </header>

          <section className="design-lab-content">
            <article className="design-lab-preview-card">
              <span className="design-lab-preview-kicker">Prototype state</span>
              <strong>{lastAction}</strong>
              <p>{helperText}</p>
            </article>

            <article className="design-lab-placeholder-card" aria-hidden="true">
              <span />
              <span />
              <span />
            </article>

            <div className="design-lab-note">
              <p>Tap the actual nav item.</p>
              <span>Catalog = 2 options · Tools = 3 options</span>
            </div>
          </section>

          {openLauncher ? (
            <RadialLauncher launcher={openLauncher} onSelect={chooseOption} />
          ) : null}

          <nav className="design-lab-bottom-nav" aria-label="Prototype navigation">
            <button
              type="button"
              className="design-lab-nav-item"
              onClick={() => selectDestination("Quiz")}
            >
              <IconQuestionMark size={23} stroke={2} aria-hidden="true" />
              <span>Quiz</span>
            </button>

            <button
              type="button"
              className={`design-lab-nav-item ${openLauncher === "catalog" ? "is-active is-launcher-open" : ""}`}
              aria-expanded={openLauncher === "catalog"}
              onClick={() => toggleLauncher("catalog")}
            >
              <span className="design-lab-nav-icon-wrap">
                <IconBook2 size={23} stroke={2} aria-hidden="true" />
              </span>
              <span>Catalog</span>
            </button>

            <button
              type="button"
              className="design-lab-nav-item design-lab-nav-item--hub"
              onClick={() => selectDestination("Hub")}
            >
              <span className="design-lab-hub-button">
                <IconHome size={27} stroke={2} aria-hidden="true" />
              </span>
              <span>Hub</span>
            </button>

            <button
              type="button"
              className="design-lab-nav-item"
              onClick={() => selectDestination("Profile")}
            >
              <IconUser size={23} stroke={2} aria-hidden="true" />
              <span>Profile</span>
            </button>

            <button
              type="button"
              className={`design-lab-nav-item ${openLauncher === "tools" ? "is-active is-launcher-open" : ""}`}
              aria-expanded={openLauncher === "tools"}
              onClick={() => toggleLauncher("tools")}
            >
              <span className="design-lab-nav-icon-wrap">
                <IconTool size={23} stroke={2} aria-hidden="true" />
              </span>
              <span>Tools</span>
            </button>
          </nav>
        </div>
      </section>
    </main>
  );
}
