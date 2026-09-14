import {
  APP_VERSION,
  BUILD_IDENTIFIER,
  DATA_SCHEMA_VERSION,
} from "../../lib/buildMetadata";

export function BuildDiagnostics() {
  return (
    <section className="settings-section" aria-labelledby="settings-build-heading">
      <div className="settings-section-heading">
        <div>
          <p className="eyebrow">Diagnostics</p>
          <h2 id="settings-build-heading">Build information</h2>
        </div>
        <p>
          Version details for support, stale-preview checks, and local-data troubleshooting.
        </p>
      </div>

      <div className="settings-action-list panel" aria-label="Build diagnostics">
        <article className="settings-action-row">
          <div>
            <strong>
              App v{APP_VERSION} · data schema v{DATA_SCHEMA_VERSION}
            </strong>
            <p>
              Build <code>{BUILD_IDENTIFIER}</code>
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
