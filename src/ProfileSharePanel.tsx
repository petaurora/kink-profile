import { useMemo, useRef, useState } from "react";
import { ProfileShareSummary } from "./ProfileShareSummary";
import { loadCatalogProfile } from "./lib/catalogProfileStorage";
import {
  exportShareSummaryHtml,
  exportShareSummaryPdf,
  exportShareSummaryPng,
  type ShareExportFormat,
} from "./lib/profileShareExport";
import { buildProfileShareSummary } from "./lib/profileShareSummary";
import type { ProfileSettings } from "./lib/profileSettings";
import { loadProfile } from "./lib/profileStorage";

export function ProfileSharePanel({
  settings,
}: {
  settings: ProfileSettings;
}) {
  const exportStageRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState<ShareExportFormat | null>(null);
  const [lastExport, setLastExport] = useState<ShareExportFormat | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const model = useMemo(
    () =>
      buildProfileShareSummary(
        settings.displayName,
        loadProfile(),
        loadCatalogProfile(),
      ),
    [settings.displayName],
  );

  const exportElement = () =>
    exportStageRef.current?.querySelector<HTMLElement>(".share-summary") ?? null;

  const runExport = async (format: ShareExportFormat) => {
    const element = exportElement();
    if (!element || exporting) return;

    setExporting(format);
    setExportError(null);

    try {
      if (format === "html") {
        exportShareSummaryHtml(model, element);
      } else if (format === "png") {
        await exportShareSummaryPng(model, element);
      } else {
        await exportShareSummaryPdf(model, element);
      }

      setLastExport(format);
    } catch (error) {
      setExportError(
        error instanceof Error
          ? error.message
          : "The share summary could not be exported.",
      );
    } finally {
      setExporting(null);
    }
  };

  return (
    <section className="settings-share-panel panel" aria-labelledby="share-preview-heading">
      <div className="settings-share-heading">
        <div>
          <p className="eyebrow">Share preview</p>
          <h3 id="share-preview-heading">Exactly what another person will see.</h3>
        </div>
        <span className="settings-share-version">Summary v{model.version}</span>
      </div>

      <p className="settings-share-copy">
        This is the curated human-facing profile, not your private backup. Raw answers,
        comparison history, evidence IDs, storage metadata, and internal provenance are not
        included.
      </p>

      <div className="settings-share-export">
        <div>
          <strong>Export this summary</strong>
          <span>
            PNG is a tall phone-friendly image. HTML stays responsive and self-contained.
            PDF uses the same rendered card with section-aware page breaks.
          </span>
        </div>

        <div className="settings-share-export-actions">
          {(["png", "html", "pdf"] as const).map((format) => (
            <button
              key={format}
              className={format === "png" ? "primary compact" : "secondary compact"}
              disabled={exporting !== null}
              onClick={() => void runExport(format)}
            >
              {exporting === format
                ? `Creating ${format.toUpperCase()}…`
                : `Export ${format.toUpperCase()}`}
            </button>
          ))}
        </div>

        {lastExport && !exportError && (
          <p className="settings-share-export-status" aria-live="polite">
            {lastExport.toUpperCase()} export created locally.
          </p>
        )}

        {exportError && (
          <p className="settings-share-export-error" role="alert">
            {exportError}
          </p>
        )}
      </div>

      <div className="settings-share-preview-frame">
        <ProfileShareSummary model={model} />
      </div>

      <p className="settings-share-note">
        Interest Areas now use the same stable M7.8 category selector as the main profile.
        All three export formats use this same v2 share-summary model and renderer.
      </p>

      <div className="share-export-stage" ref={exportStageRef} aria-hidden="true">
        <ProfileShareSummary model={model} />
      </div>
    </section>
  );
}
