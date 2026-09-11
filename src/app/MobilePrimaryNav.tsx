import { useEffect, useMemo, useState } from "react";
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
import { useLocation, useNavigate } from "react-router-dom";
import {
  primaryDestinationForLocation,
  shouldShowMobilePrimaryNavigation,
  type PrimaryNavigationDestination,
} from "./mobilePrimaryNavigation";
import "./MobilePrimaryNav.css";

type LauncherId = "catalog" | "tools";

type Point = { x: number; y: number };
type CubicCurve = {
  start: Point;
  control1: Point;
  control2: Point;
  end: Point;
};

type LauncherOption = {
  id: string;
  label: string;
  Icon: typeof IconHeart;
  left: string;
  top: string;
  target: string;
};

const catalogOptions: LauncherOption[] = [
  {
    id: "kinks",
    label: "Kinks",
    Icon: IconHeart,
    left: "18%",
    top: "18px",
    target: "/catalog",
  },
  {
    id: "rewards-punishments",
    label: "Rewards &\nPunishments",
    Icon: IconGift,
    left: "43%",
    top: "48px",
    target: "/rewards?workspace=catalog",
  },
];

const toolsOptions: LauncherOption[] = [
  {
    id: "scenes",
    label: "Scenes",
    Icon: IconSparkles,
    left: "54%",
    top: "60px",
    target: "/scene-builder",
  },
  {
    id: "rp-tools",
    label: "R/P Tools",
    Icon: IconGift,
    left: "73%",
    top: "20px",
    target: "/rewards?workspace=tools",
  },
  {
    id: "compare",
    label: "Compare",
    Icon: IconUsers,
    left: "88%",
    top: "72px",
    target: "/compare",
  },
];

const catalogCurves: CubicCurve[] = [
  {
    start: { x: 117, y: 207 },
    control1: { x: 110, y: 164 },
    control2: { x: 92, y: 111 },
    end: { x: 70, y: 61 },
  },
  {
    start: { x: 117, y: 207 },
    control1: { x: 132, y: 166 },
    control2: { x: 149, y: 129 },
    end: { x: 168, y: 86 },
  },
];

const toolsCurves: CubicCurve[] = [
  {
    start: { x: 351, y: 207 },
    control1: { x: 328, y: 170 },
    control2: { x: 282, y: 132 },
    end: { x: 226, y: 105 },
  },
  {
    start: { x: 351, y: 207 },
    control1: { x: 342, y: 153 },
    control2: { x: 319, y: 101 },
    end: { x: 292, y: 62 },
  },
  {
    start: { x: 351, y: 207 },
    control1: { x: 360, y: 171 },
    control2: { x: 359, y: 138 },
    end: { x: 345, y: 112 },
  },
];

function cubicPoint(curve: CubicCurve, t: number): Point {
  const mt = 1 - t;
  const mt2 = mt * mt;
  const t2 = t * t;

  return {
    x:
      mt2 * mt * curve.start.x +
      3 * mt2 * t * curve.control1.x +
      3 * mt * t2 * curve.control2.x +
      t2 * t * curve.end.x,
    y:
      mt2 * mt * curve.start.y +
      3 * mt2 * t * curve.control1.y +
      3 * mt * t2 * curve.control2.y +
      t2 * t * curve.end.y,
  };
}

function cubicDerivative(curve: CubicCurve, t: number): Point {
  const mt = 1 - t;

  return {
    x:
      3 * mt * mt * (curve.control1.x - curve.start.x) +
      6 * mt * t * (curve.control2.x - curve.control1.x) +
      3 * t * t * (curve.end.x - curve.control2.x),
    y:
      3 * mt * mt * (curve.control1.y - curve.start.y) +
      6 * mt * t * (curve.control2.y - curve.control1.y) +
      3 * t * t * (curve.end.y - curve.control2.y),
  };
}

function curvePath(curve: CubicCurve) {
  return `M ${curve.start.x} ${curve.start.y} C ${curve.control1.x} ${curve.control1.y}, ${curve.control2.x} ${curve.control2.y}, ${curve.end.x} ${curve.end.y}`;
}

function RopeConnector({ curve }: { curve: CubicCurve }) {
  const bands = useMemo(() => {
    return Array.from({ length: 15 }, (_, index) => {
      const t = 0.08 + index * 0.057;
      const point = cubicPoint(curve, t);
      const tangent = cubicDerivative(curve, t);
      const magnitude = Math.hypot(tangent.x, tangent.y) || 1;
      const tx = tangent.x / magnitude;
      const ty = tangent.y / magnitude;
      const nx = -ty;
      const ny = tx;
      const direction = index % 2 === 0 ? 1 : -1;
      const halfWidth = 4.2;
      const skew = 2.4 * direction;

      return {
        x1: point.x - nx * halfWidth - tx * skew,
        y1: point.y - ny * halfWidth - ty * skew,
        x2: point.x + nx * halfWidth + tx * skew,
        y2: point.y + ny * halfWidth + ty * skew,
        key: index,
      };
    });
  }, [curve]);

  const d = curvePath(curve);

  return (
    <g>
      <path className="mobile-nav-rope-outline" d={d} />
      <path className="mobile-nav-rope-core" d={d} />
      {bands.map((band) => (
        <line
          key={band.key}
          className="mobile-nav-rope-band"
          x1={band.x1}
          y1={band.y1}
          x2={band.x2}
          y2={band.y2}
        />
      ))}
    </g>
  );
}

function RadialLauncher({
  launcher,
  onSelect,
}: {
  launcher: LauncherId;
  onSelect: (target: string) => void;
}) {
  const isCatalog = launcher === "catalog";
  const options = isCatalog ? catalogOptions : toolsOptions;
  const curves = isCatalog ? catalogCurves : toolsCurves;

  return (
    <div
      id={`mobile-${launcher}-launcher`}
      className={`mobile-nav-radial mobile-nav-radial--${launcher}`}
      role="menu"
      aria-label={`${launcher === "catalog" ? "Catalog" : "Tools"} workspaces`}
    >
      <svg
        className="mobile-nav-rope-map"
        viewBox="0 0 390 220"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {curves.map((curve, index) => (
          <RopeConnector key={index} curve={curve} />
        ))}
      </svg>

      {options.map(({ id, label, Icon, left, top, target }) => (
        <button
          key={id}
          type="button"
          role="menuitem"
          className="mobile-nav-radial-option"
          style={{ left, top }}
          onClick={() => onSelect(target)}
        >
          <span className="mobile-nav-radial-option-icon">
            <Icon size={25} stroke={1.9} aria-hidden="true" />
          </span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

function navItemClass(
  destination: PrimaryNavigationDestination,
  activeDestination: PrimaryNavigationDestination | null,
  launcherOpen = false,
) {
  return [
    "mobile-primary-nav-item",
    activeDestination === destination ? "is-active" : "",
    launcherOpen ? "is-launcher-open" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function MobilePrimaryNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [openLauncher, setOpenLauncher] = useState<LauncherId | null>(null);
  const activeDestination = primaryDestinationForLocation(
    location.pathname,
    location.search,
  );

  useEffect(() => {
    setOpenLauncher(null);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!openLauncher) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenLauncher(null);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [openLauncher]);

  if (!shouldShowMobilePrimaryNavigation(location.pathname)) return null;

  const go = (target: string) => {
    setOpenLauncher(null);
    navigate(target);
  };

  const toggleLauncher = (launcher: LauncherId) => {
    setOpenLauncher((current) => (current === launcher ? null : launcher));
  };

  return (
    <div className="mobile-primary-nav-shell">
      {openLauncher ? (
        <RadialLauncher launcher={openLauncher} onSelect={go} />
      ) : null}

      <nav className="mobile-primary-nav" aria-label="Primary navigation">
        <button
          type="button"
          className={navItemClass("quiz", activeDestination)}
          aria-current={activeDestination === "quiz" ? "page" : undefined}
          onClick={() => go("/quizzes/bondage-discipline")}
        >
          <IconQuestionMark size={23} stroke={2} aria-hidden="true" />
          <span>Quiz</span>
        </button>

        <button
          type="button"
          className={navItemClass(
            "catalog",
            activeDestination,
            openLauncher === "catalog",
          )}
          aria-expanded={openLauncher === "catalog"}
          aria-controls="mobile-catalog-launcher"
          onClick={() => toggleLauncher("catalog")}
        >
          <span className="mobile-primary-nav-icon-wrap">
            <IconBook2 size={23} stroke={2} aria-hidden="true" />
          </span>
          <span>Catalog</span>
        </button>

        <button
          type="button"
          className={`${navItemClass("hub", activeDestination)} mobile-primary-nav-item--hub`}
          aria-current={activeDestination === "hub" ? "page" : undefined}
          onClick={() => go("/")}
        >
          <span className="mobile-primary-nav-hub-button">
            <IconHome size={27} stroke={2} aria-hidden="true" />
          </span>
          <span>Hub</span>
        </button>

        <button
          type="button"
          className={navItemClass("profile", activeDestination)}
          aria-current={activeDestination === "profile" ? "page" : undefined}
          onClick={() => go("/profile")}
        >
          <IconUser size={23} stroke={2} aria-hidden="true" />
          <span>Profile</span>
        </button>

        <button
          type="button"
          className={navItemClass(
            "tools",
            activeDestination,
            openLauncher === "tools",
          )}
          aria-expanded={openLauncher === "tools"}
          aria-controls="mobile-tools-launcher"
          onClick={() => toggleLauncher("tools")}
        >
          <span className="mobile-primary-nav-icon-wrap">
            <IconTool size={23} stroke={2} aria-hidden="true" />
          </span>
          <span>Tools</span>
        </button>
      </nav>
    </div>
  );
}
