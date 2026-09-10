import type { KeyboardEvent } from "react";
import type { OverallFacetId } from "./data/overallFacets";
import type { OverallRadarAxis } from "./lib/overallRadar";

type ProfileCoxcombChartProps = {
  axes: readonly OverallRadarAxis[];
  onSelectFacet: (facetId: OverallFacetId) => void;
};

const bandColors = [
  "#520E25",
  "#6b1740",
  "#81205c",
  "#9a2f7c",
  "#b9449f",
  "#d96fbc",
] as const;

export function ProfileCoxcombChart({
  axes,
  onSelectFacet,
}: ProfileCoxcombChartProps) {
  const size = 500;
  const center = size / 2;
  const maxRadius = 158;
  const labelRadius = 184;
  const sectorAngle = (Math.PI * 2) / Math.max(axes.length, 1);
  const bandCount = bandColors.length;

  const polar = (radius: number, angle: number) => [
    center + Math.cos(angle) * radius,
    center + Math.sin(angle) * radius,
  ];

  const annularWedgePath = (
    index: number,
    innerRadius: number,
    outerRadius: number,
  ) => {
    if (outerRadius <= 0 || outerRadius <= innerRadius) return "";

    const middle = -Math.PI / 2 + index * sectorAngle;
    const start = middle - sectorAngle / 2;
    const end = middle + sectorAngle / 2;
    const [outerStartX, outerStartY] = polar(outerRadius, start);
    const [outerEndX, outerEndY] = polar(outerRadius, end);
    const [innerEndX, innerEndY] = polar(innerRadius, end);
    const [innerStartX, innerStartY] = polar(innerRadius, start);
    const largeArc = end - start > Math.PI ? 1 : 0;

    return [
      `M ${outerStartX} ${outerStartY}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEndX} ${outerEndY}`,
      `L ${innerEndX} ${innerEndY}`,
      innerRadius > 0
        ? `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStartX} ${innerStartY}`
        : `L ${center} ${center}`,
      "Z",
    ].join(" ");
  };

  const fullWedgePath = (index: number, radius: number) =>
    annularWedgePath(index, 0, radius);

  const selectFromKeyboard = (
    event: KeyboardEvent<SVGGElement>,
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
        {Array.from({ length: bandCount }, (_, index) => {
          const level = (index + 1) / bandCount;
          return (
            <circle
              key={level}
              cx={center}
              cy={center}
              r={maxRadius * Math.sqrt(level)}
              fill="none"
              stroke="var(--border-subtle)"
              strokeWidth="1"
              opacity="0.22"
            />
          );
        })}

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

              {Array.from({ length: bandCount }, (_, bandIndex) => {
                const bandInner =
                  maxRadius * Math.sqrt(bandIndex / bandCount);
                const bandOuter =
                  maxRadius * Math.sqrt((bandIndex + 1) / bandCount);

                return (
                  <path
                    key={`ghost-${axis.facetId}-${bandIndex}`}
                    d={annularWedgePath(index, bandInner, bandOuter)}
                    fill={bandColors[bandIndex]}
                    opacity={unknown ? 0.06 : 0.035}
                  />
                );
              })}

              {!unknown &&
                Array.from({ length: bandCount }, (_, bandIndex) => {
                  const bandInner =
                    maxRadius * Math.sqrt(bandIndex / bandCount);
                  const bandOuter =
                    maxRadius * Math.sqrt((bandIndex + 1) / bandCount);

                  if (valueRadius <= bandInner) return null;

                  const visibleOuter = Math.min(valueRadius, bandOuter);
                  const bandOpacity = 0.34 + bandIndex * 0.055;

                  return (
                    <path
                      key={`fill-${axis.facetId}-${bandIndex}`}
                      d={annularWedgePath(index, bandInner, visibleOuter)}
                      fill={bandColors[bandIndex]}
                      opacity={bandOpacity}
                    />
                  );
                })}

              <path
                d={fullWedgePath(index, maxRadius)}
                fill="none"
                stroke="var(--border-subtle)"
                strokeWidth="1"
                strokeDasharray={unknown ? "4 5" : undefined}
                opacity={unknown ? 0.34 : 0.22}
              />

              {!unknown && (
                <path
                  d={fullWedgePath(index, valueRadius)}
                  fill="none"
                  stroke="var(--accent-primary)"
                  strokeWidth={axis.state === "limited" ? 1.5 : 1.8}
                  strokeDasharray={axis.state === "limited" ? "5 4" : undefined}
                  opacity={axis.state === "limited" ? 0.42 : 0.5}
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
                fontSize="11"
                fontWeight="800"
                opacity={unknown ? 0.68 : 0.94}
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
          opacity="0.94"
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
