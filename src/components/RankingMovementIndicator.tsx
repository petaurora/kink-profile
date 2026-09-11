import {
  IconArrowDown,
  IconArrowUp,
  IconMinus,
  IconSparkles,
} from "@tabler/icons-react";
import {
  rankingMovementLabel,
  type RankingMovement,
} from "../lib/kinkRankingMovement";

function formatRunDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function RankingMovementIndicator({
  movement,
  open,
  onToggle,
}: {
  movement: RankingMovement;
  open: boolean;
  onToggle: () => void;
}) {
  const label = rankingMovementLabel(movement);
  const Icon =
    movement.kind === "up"
      ? IconArrowUp
      : movement.kind === "down"
        ? IconArrowDown
        : movement.kind === "same"
          ? IconMinus
          : IconSparkles;

  const compact =
    movement.kind === "new"
      ? "NEW"
      : movement.kind === "same"
        ? "—"
        : String(movement.places);

  return (
    <span className={`ranking-movement-wrap ${open ? "open" : ""}`}>
      <button
        type="button"
        className={`ranking-movement ranking-movement-${movement.kind}`}
        aria-label={label}
        aria-expanded={open}
        onClick={onToggle}
      >
        <Icon size={15} stroke={2.2} aria-hidden="true" />
        <span>{compact}</span>
      </button>
      <span className="ranking-movement-popover" role="status">
        <strong>{label}</strong>
        <span>
          {movement.previousRank === null
            ? "Not ranked in the previous comparable run"
            : `Previously #${movement.previousRank}`}
        </span>
        <span>Previous run: {formatRunDate(movement.previousCapturedAt)}</span>
      </span>
    </span>
  );
}
