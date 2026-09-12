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

function frameAt(curve: CubicCurve, t: number) {
  const point = cubicPoint(curve, t);
  const tangent = cubicDerivative(curve, t);
  const magnitude = Math.hypot(tangent.x, tangent.y) || 1;
  const tx = tangent.x / magnitude;
  const ty = tangent.y / magnitude;

  return {
    point,
    tx,
    ty,
    nx: -ty,
    ny: tx,
  };
}

function RopeConnector({ curve }: { curve: CubicCurve }) {
  const segments = useMemo(() => {
    const count = 16;
    const radius = 4.35;
    const skew = 2.1;
    const gapRatio = 0.25;
    const capDepth = 1.7;

    return Array.from({ length: count }, (_, index) => {
      const slotStart = index / count;
      const slotEnd = (index + 1) / count;
      const slotSize = slotEnd - slotStart;
      const t0 = slotStart + slotSize * (gapRatio / 2);
      const t1 = slotEnd - slotSize * (gapRatio / 2);
      const start = frameAt(curve, t0);
      const end = frameAt(curve, t1);

      const a = {
        x: start.point.x + start.nx * radius + start.tx * skew,
        y: start.point.y + start.ny * radius + start.ty * skew,
      };
      const b = {
        x: start.point.x - start.nx * radius - start.tx * skew,
        y: start.point.y - start.ny * radius - start.ty * skew,
      };
      const c = {
        x: end.point.x - end.nx * radius - end.tx * skew,
        y: end.point.y - end.ny * radius - end.ty * skew,
      };
      const d = {
        x: end.point.x + end.nx * radius + end.tx * skew,
        y: end.point.y + end.ny * radius + end.ty * skew,
      };
      const startCap = {
        x: start.point.x - start.tx * capDepth,
        y: start.point.y - start.ty * capDepth,
      };
      const endCap = {
        x: end.point.x + end.tx * capDepth,
        y: end.point.y + end.ty * capDepth,
      };

      return {
        key: index,
        d: `M ${a.x} ${a.y} L ${d.x} ${d.y} Q ${endCap.x} ${endCap.y} ${c.x} ${c.y} L ${b.x} ${b.y} Q ${startCap.x} ${startCap.y} ${a.x} ${a.y} Z`,
      };
    });
  }, [curve]);

  return (
    <g>
      {segments.map((segment) => (
        <path
          key={segment.key}
          className="mobile-nav-rope-segment mobile-nav-rope-segment-main"
          d={segment.d}
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
          <span className="mobile-nav-radial-option-label">{label}</span>
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
        <>
          <button
            type="button"
            className="mobile-nav-radial-dismiss"
            aria-label={`Close ${openLauncher === "catalog" ? "Catalog" : "Tools"} launcher`}
            onClick={() => setOpenLauncher(null)}
          />
          <RadialLauncher launcher={openLauncher} onSelect={go} />
        </>
      ) : null}

      <nav className="mobile-primary-nav" aria-label="Primary navigation">
        <button
          type="button"
          className={navItemClass("quiz", activeDestination)}
          aria-current={activeDestination === "quiz" ? "page" : undefined}
          onClick={() => go("/quizzes/bondage-discipline")}
        >
          <span className="mobile-primary-nav-icon-wrap">
            <IconQuestionMark size={23} stroke={2} aria-hidden="true" />
          </span>
          <span className="mobile-primary-nav-label">Quiz</span>
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
          onClick={(event) => {
            toggleLauncher("catalog");
            if (event.detail > 0) event.currentTarget.blur();
          }}
        >
          <span className="mobile-primary-nav-icon-wrap">
            <IconBook2 size={23} stroke={2} aria-hidden="true" />
          </span>
          <span className="mobile-primary-nav-label">Catalog</span>
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
          <span className="mobile-primary-nav-label">Hub</span>
        </button>

        <button
          type="button"
          className={navItemClass("profile", activeDestination)}
          aria-current={activeDestination === "profile" ? "page" : undefined}
          onClick={() => go("/profile")}
        >
          <span className="mobile-primary-nav-icon-wrap">
            <IconUser size={23} stroke={2} aria-hidden="true" />
          </span>
          <span className="mobile-primary-nav-label">Profile</span>
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
          onClick={(event) => {
            toggleLauncher("tools");
            if (event.detail > 0) event.currentTarget.blur();
          }}
        >
          <span className="mobile-primary-nav-icon-wrap">
            <IconTool size={23} stroke={2} aria-hidden="true" />
          </span>
          <span className="mobile-primary-nav-label">Tools</span>
        </button>
      </nav>
    </div>
  );
}
