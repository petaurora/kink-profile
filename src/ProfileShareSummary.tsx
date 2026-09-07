import type {
  ProfileShareSummaryModel,
  ShareRadarAxis,
} from "./lib/profileShareSummary";
import "./shareSummary.css";

function getShareKnownRadarRuns(
  axes: readonly ShareRadarAxis[],
): readonly (readonly number[])[] {
  if (axes.length === 0) return [];

  const known = axes.map((axis) => axis.state !== "unknown");
  if (known.every(Boolean)) return [axes.map((_, index) => index)];
  if (!known.some(Boolean)) return [];

  const firstUnknown = known.findIndex((value) => !value);
  const rotatedIndexes = Array.from({ length: axes.length }, (_, offset) => (
    (firstUnknown + 1 + offset) % axes.length
  ));

  const runs: number[][] = [];
  let current: number[] = [];

  for (const index of rotatedIndexes) {
    if (known[index]) {
      current.push(index);
      continue;
    }

    if (current.length > 0) {
      runs.push(current);
      current = [];
    }
  }

  if (current.length > 0) runs.push(current);
  return runs;
}

function ShareRadar({ axes }: { axes: readonly ShareRadarAxis[] }) {
  const size = 360;
  const center = size / 2;
  const radius = 112;

  const pointFor = (index: number, scale = 1) => {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / axes.length;
    return [
      center + Math.cos(angle) * radius * scale,
      center + Math.sin(angle) * radius * scale,
    ];
  };

  const ringPoints = (scale: number) =>
    axes.map((_, index) => pointFor(index, scale).join(",")).join(" ");

  const knownRuns = getShareKnownRadarRuns(axes);
  const complete = axes.length > 0 && axes.every((axis) => axis.state !== "unknown");

  return (
    <div className="share-radar-wrap">
      <svg
        className="share-radar"
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="Overall profile radar"
      >
        {[0.25, 0.5, 0.75, 1].map((ring) => (
          <polygon
            key={ring}
            points={ringPoints(ring)}
            className="share-radar-ring"
          />
        ))}

        {axes.map((axis, index) => {
          const [x, y] = pointFor(index, 1);
          const [labelX, labelY] = pointFor(index, 1.27);

          return (
            <g key={axis.id} className={`state-${axis.state}`}>
              <line
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                className="share-radar-axis"
              />
              <text
                x={labelX}
                y={labelY}
                textAnchor={
                  labelX < center - 8
                    ? "end"
                    : labelX > center + 8
                      ? "start"
                      : "middle"
                }
                dominantBaseline="middle"
                className="share-radar-label"
              >
                {axis.shortLabel}
              </text>
            </g>
          );
        })}

        {complete ? (
          <polygon
            points={axes
              .map((axis, index) =>
                pointFor(index, (axis.affinity ?? 0) / 100).join(","),
              )
              .join(" ")}
            className="share-radar-score"
          />
        ) : (
          knownRuns.map((run, runIndex) => (
            <polyline
              key={`run-${runIndex}`}
              points={run
                .map((axisIndex) =>
                  pointFor(
                    axisIndex,
                    (axes[axisIndex].affinity ?? 0) / 100,
                  ).join(","),
                )
                .join(" ")}
              className="share-radar-score-partial"
            />
          ))
        )}

        {axes.map((axis, index) => {
          if (axis.affinity === null) return null;
          const [x, y] = pointFor(index, axis.affinity / 100);

          return (
            <circle
              key={`point-${axis.id}`}
              cx={x}
              cy={y}
              r={axis.state === "limited" ? 5 : 4}
              className={`share-radar-point state-${axis.state}`}
            />
          );
        })}
      </svg>
    </div>
  );
}

function TraitList({
  items,
  emptyCopy,
}: {
  items: ProfileShareSummaryModel["headspaces"];
  emptyCopy: string;
}) {
  if (items.length === 0) {
    return <p className="share-empty">{emptyCopy}</p>;
  }

  return (
    <div className="share-trait-list">
      {items.map((item) => (
        <div className="share-trait-row" key={item.id}>
          <span>{item.label}</span>
          <strong>{Math.round(item.affinity)}%</strong>
        </div>
      ))}
    </div>
  );
}

export function ProfileShareSummary({
  model,
}: {
  model: ProfileShareSummaryModel;
}) {
  return (
    <article className="share-summary" data-share-summary-version={model.version}>
      <header className="share-summary-header" data-share-block>
        <div>
          <p className="share-kicker">Kink Profile</p>
          <h2>{model.displayName}</h2>
          <p className="share-summary-copy">{model.summary}</p>
        </div>
        <div className="share-orientation">
          <span>Orientation</span>
          <strong>{model.orientation}</strong>
        </div>
      </header>

      {model.strongestThemes.length > 0 && (
        <div
          className="share-theme-row"
          aria-label="Strongest themes"
          data-share-block
        >
          {model.strongestThemes.map((theme) => (
            <span key={theme}>{theme}</span>
          ))}
        </div>
      )}

      <section className="share-overall-section" data-share-block>
        <div className="share-section-heading">
          <span>Overall shape</span>
          <small>
            Unknown areas stay unscored until there is enough evidence.
          </small>
        </div>
        <ShareRadar axes={model.radarAxes} />
      </section>

      <div className="share-two-column" data-share-block>
        <section className="share-section">
          <div className="share-section-heading">
            <span>Headspaces</span>
            <small>Strongest known headspace results</small>
          </div>
          <TraitList
            items={model.headspaces}
            emptyCopy="Still emerging."
          />
        </section>

        <section className="share-section">
          <div className="share-section-heading">
            <span>Dynamic modes</span>
            <small>Strongest underlying dynamics</small>
          </div>
          <TraitList
            items={model.dynamicModes}
            emptyCopy="Still emerging."
          />
        </section>
      </div>

      <section className="share-section" data-share-block>
        <div className="share-section-heading">
          <span>Top Overall</span>
          <small>Directly evidenced interests</small>
        </div>

        {model.topInterests.length > 0 ? (
          <ol className="share-interest-list">
            {model.topInterests.map((interest, index) => (
              <li key={interest.catalogId}>
                <span className="share-interest-rank">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{interest.label}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="share-empty">
            No directly evidenced Top Overall interests yet.
          </p>
        )}
      </section>

      {model.interestAreas.length > 0 && (
        <section className="share-section" data-share-block>
          <div className="share-section-heading">
            <span>Interest Areas</span>
            <small>Strongest directly evidenced categories</small>
          </div>

          <div className="share-area-grid">
            {model.interestAreas.map((area) => (
              <article className="share-area-card" key={area.categoryId}>
                <strong>{area.label}</strong>
                <div className="share-area-items">
                  {area.items.map((item) => (
                    <span key={item.catalogId}>{item.label}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="share-section share-limits-section" data-share-block>
        <div className="share-section-heading">
          <span>Hard Limits</span>
          <small>Explicit boundaries only</small>
        </div>

        {model.hardLimits.length > 0 ? (
          <div className="share-limit-list">
            {model.hardLimits.map((limit) => (
              <span key={limit.catalogId}>{limit.label}</span>
            ))}
          </div>
        ) : (
          <p className="share-empty">No explicit Hard Limits listed.</p>
        )}
      </section>

      <footer className="share-summary-footer" data-share-block>
        Generated {new Date(model.generatedAt).toLocaleDateString()}
      </footer>
    </article>
  );
}
