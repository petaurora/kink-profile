import type { OverallFacetId } from "./data/overallFacets";
import type { OverallRadarAxis } from "./lib/overallRadar";

type ProfileCoxcombChartProps = {
  axes: readonly OverallRadarAxis[];
  onSelectFacet: (facetId: OverallFacetId) => void;
};

export function ProfileCoxcombChart({
  axes,
  onSelectFacet,
}: ProfileCoxcombChartProps) {
  const size = 500;
  const center = size / 2;
  const maxRadius = 158;
  const labelRadius = 196;
  const sectorAngle = (Math.PI * 2) / Math.max(axes.length, 1);
  const gapAngle = Math.min(0.055, sectorAngle * 0.08);

  const polar = (radius: number, angle: number) => [
    center + Math.cos(angle) * radius,
    center + Math.sin(angle) * radius,
  ];

  const wedgePath = (index: number, radius: number) => {
    if (radius <= 0) return "";
    const middle = -Math.PI / 2 + index * sectorAngle;
    const start = middle - sectorAngle / 2 + gapAngle;
    const end = middle + sectorAngle / 2 - gapAngle;
    const [startX, startY] = polar(radius, start);
    const [endX, endY] = polar(radius, end);
    const largeArc = end - start > Math.PI ? 1 : 0;

    return [
      `M ${center} ${center}`,
      `L ${startX} ${startY}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`,
      "Z",
    ].join(" ");
  };

  const selectFromKeyboard = (
    event: React.KeyboardEvent<SVGGElement>,
    facetId: OverallFacetId,
  ) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onSelectFacet(facetId);
  };

  return (
    <div className="overall-radar-wrap">
      <svg
        className="overall-radar"
        viewBox={`0 0 ${size} ${size}`}
        role="group"
        aria-label="Overall profile coxcomb. Each petal is one profile facet."
      >
        {[0.25, 0.5, 0.75, 1].map((level) => (
          <circle
            key={level}
            cx={center}
            cy={center}
            r={maxRadius * Math.sqrt(level)}
            fill="none"
            stroke="var(--border-subtle)"
            strokeWidth="1"
            opacity="0.65"
          />
        ))}

        {axes.map((axis, index) => {
          const middle = -Math.PI / 2 + index * sectorAngle;
          const [labelX, labelY] = polar(labelRadius, middle);
          const unknown = axis.state === "unknown";
          const valueRadius =
            axis.affinity === null
              ? 0
              : maxRadius * Math.sqrt(Math.max(0, axis.affinity) / 100);

          return (
            <g
              key={axis.facetId}
              role="button"
              tabIndex={0}
              aria-label={`${axis.label}: ${
                axis.affinity === null
                  ? "not explored yet"
                  : `${axis.affinity}% affinity, ${axis.coverage}% evidence`
              }. Open theme explanation.`}
              onClick={() => onSelectFacet(axis.facetId)}
              onKeyDown={(event) => selectFromKeyboard(event, axis.facetId)}
              style={{ cursor: "pointer" }}
            >
              <title>
                {axis.affinity === null
                  ? `${axis.label}: not explored yet`
                  : `${axis.label}: ${axis.affinity}% affinity · ${axis.coverage}% evidence`}
              </title>

              <path
                d={wedgePath(index, maxRadius)}
                fill="transparent"
                stroke="var(--border-subtle)"
                strokeWidth="1"
                strokeDasharray={unknown ? "4 5" : undefined}
                opacity={unknown ? 0.55 : 0.8}
              />

              {!unknown && (
                <path
                  d={wedgePath(index, valueRadius)}
                  fill="var(--bg-accent-soft)"
                  stroke="var(--accent-primary)"
                  strokeWidth={axis.state === "limited" ? 2 : 2.5}
                  strokeDasharray={axis.state === "limited" ? "5 4" : undefined}
                />
              )}

              <text
                x={labelX}
                y={labelY}
                textAnchor={
                  labelX < center - 10
                    ? "end"
                    : labelX > center + 10
                      ? "start"
                      : "middle"
                }
                dominantBaseline="middle"
                fill={unknown ? "var(--text-muted)" : "var(--text-secondary)"}
                fontSize="12"
                fontWeight="800"
                opacity={unknown ? 0.72 : 1}
              >
                {axis.shortLabel}
              </text>
            </g>
          );
        })}

        <circle
          cx={center}
          cy={center}
          r="25"
          fill="var(--bg-surface)"
          stroke="var(--border-subtle)"
          strokeWidth="1"
        />
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--text-muted)"
          fontSize="10"
          fontWeight="800"
        >
          PROFILE
        </text>
      </svg>
    </div>
  );
}
