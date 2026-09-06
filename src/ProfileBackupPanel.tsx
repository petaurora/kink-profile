import { useMemo, useState } from "react";
import {
  createProfileBackup,
  createProfileBackupFilename,
  getProfileBackupSummary,
  serializeProfileBackup,
} from "./lib/profileBackup";

function downloadJsonFile(filename: string, contents: string) {
  const blob = new Blob([contents], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function ProfileBackupPanel() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastFilename, setLastFilename] = useState<string | null>(null);

  const backup = useMemo(
    () => createProfileBackup(),
    [refreshKey],
  );
  const summary = useMemo(
    () => getProfileBackupSummary(backup),
    [backup],
  );

  const exportBackup = () => {
    const freshBackup = createProfileBackup();
    const filename = createProfileBackupFilename(freshBackup);

    downloadJsonFile(filename, serializeProfileBackup(freshBackup));
    setLastFilename(filename);
    setRefreshKey((value) => value + 1);
  };

  return (
    <section className="settings-backup-panel panel" aria-labelledby="backup-profile-heading">
      <div className="settings-backup-heading">
        <div>
          <p className="eyebrow">Private backup</p>
          <h3 id="backup-profile-heading">Download the complete profile.</h3>
        </div>
        <span className="settings-backup-version">Format v{backup.version}</span>
      </div>

      <p className="settings-backup-copy">
        This JSON contains the authoritative local profile data needed for restore: profile
        settings, quiz answers/progress, explicit catalog preferences, limits, and raw
        This-or-That comparisons. Derived M7 profile views are intentionally recomputed instead
        of backed up as another source of truth.
      </p>

      <div className="settings-backup-summary" aria-label="Profile backup contents">
        <span>
          <strong>{summary.quizSectionsWithData}</strong>
          quiz sections
        </span>
        <span>
          <strong>{summary.quizAnswerCount}</strong>
          quiz answers
        </span>
        <span>
          <strong>{summary.catalogPreferenceCount}</strong>
          catalog preferences
        </span>
        <span>
          <strong>{summary.rankingComparisonCount}</strong>
          comparisons
        </span>
      </div>

      <div className="settings-backup-private-note">
        <strong>Keep this file private.</strong>
        <span>
          This is the full machine-readable backup, not the curated share summary coming later
          in M9.
        </span>
      </div>

      <div className="settings-backup-actions">
        <button className="primary" onClick={exportBackup}>
          Download backup
        </button>
        <button
          className="text-button"
          onClick={() => setRefreshKey((value) => value + 1)}
        >
          Refresh counts
        </button>
      </div>

      {lastFilename && (
        <p className="settings-backup-success" aria-live="polite">
          Created <code>{lastFilename}</code>
        </p>
      )}
    </section>
  );
}
