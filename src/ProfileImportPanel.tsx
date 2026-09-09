import { type ChangeEvent, useState } from "react";
import {
  getProfileBackupSummary,
  hasRewardPunishmentBackupData,
  isProfileBackupV3,
  type ProfileBackup,
} from "./lib/profileBackup";
import {
  parseProfileBackupJson,
  restoreProfileBackup,
} from "./lib/profileImport";
import type { ProfileSettings } from "./lib/profileSettings";

type ProfileImportPanelProps = {
  onSettingsChange: (settings: ProfileSettings) => void;
  onClose: () => void;
  onDone: () => void;
};

type ImportCandidate = {
  fileName: string;
  backup: ProfileBackup;
};

export function ProfileImportPanel({
  onSettingsChange,
  onClose,
  onDone,
}: ProfileImportPanelProps) {
  const [candidate, setCandidate] = useState<ImportCandidate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [completedName, setCompletedName] = useState<string | null>(null);

  const chooseFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setCandidate(null);
    setError(null);
    setRestoreError(null);
    setCompletedName(null);

    let text: string;
    try {
      text = await file.text();
    } catch {
      setError("The selected file could not be read.");
      return;
    }

    const result = parseProfileBackupJson(text);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    setCandidate({
      fileName: file.name,
      backup: result.backup,
    });
  };

  const restore = () => {
    if (!candidate) return;

    setRestoreError(null);

    try {
      restoreProfileBackup(candidate.backup);
      onSettingsChange(candidate.backup.profile.settings);
      setCompletedName(candidate.backup.profile.settings.displayName);
    } catch (restoreFailure) {
      setRestoreError(
        restoreFailure instanceof Error
          ? restoreFailure.message
          : "The backup could not be restored.",
      );
    }
  };

  if (completedName) {
    return (
      <section className="settings-import-panel panel" aria-live="polite">
        <div className="settings-import-complete">
          <p className="eyebrow">Restore complete</p>
          <h3>{completedName}'s profile is restored.</h3>
          <p>
            The authoritative source data has been replaced. Loading the profile remounts the
            app and recomputes derived M7 and M11 views from the restored source evidence.
          </p>
          <button className="primary" onClick={onDone}>
            Load restored profile
          </button>
        </div>
      </section>
    );
  }

  const summary = candidate
    ? getProfileBackupSummary(candidate.backup)
    : null;

  return (
    <section className="settings-import-panel panel" aria-labelledby="import-profile-heading">
      <div className="settings-import-heading">
        <div>
          <p className="eyebrow">Restore backup</p>
          <h3 id="import-profile-heading">
            {candidate ? "Review this backup." : "Choose a profile backup."}
          </h3>
        </div>
        <button className="text-button" onClick={onClose}>
          Cancel
        </button>
      </div>

      {!candidate ? (
        <>
          <p className="settings-import-copy">
            Select a JSON file created by Full Profile Export. The file is parsed and validated
            locally before the current profile is changed.
          </p>

          <label className="settings-import-picker">
            <input
              type="file"
              accept=".json,application/json"
              onChange={chooseFile}
            />
            <span className="secondary">Choose backup file</span>
          </label>

          {error && (
            <p className="settings-import-error" role="alert">
              {error}
            </p>
          )}
        </>
      ) : (
        <>
          <div className="settings-import-file">
            <div>
              <span>Selected file</span>
              <strong>{candidate.fileName}</strong>
            </div>
            <button
              className="text-button"
              onClick={() => {
                setCandidate(null);
                setError(null);
                setRestoreError(null);
              }}
            >
              Choose another
            </button>
          </div>

          <div className="settings-import-identity">
            <span>Profile</span>
            <strong>{summary?.displayName}</strong>
            <small>
              Exported {new Date(candidate.backup.exportedAt).toLocaleString()}
            </small>
          </div>

          <div className="settings-import-summary" aria-label="Backup preview">
            <span>
              <strong>v{candidate.backup.version}</strong>
              backup format
            </span>
            <span>
              <strong>{summary?.quizSectionsWithData ?? 0}</strong>
              quiz sections
            </span>
            <span>
              <strong>{summary?.quizAnswerCount ?? 0}</strong>
              quiz answers
            </span>
            <span>
              <strong>{summary?.catalogPreferenceCount ?? 0}</strong>
              preferences
            </span>
            <span>
              <strong>{summary?.rankingComparisonCount ?? 0}</strong>
              kink comparisons
            </span>
            <span>
              <strong>{summary?.rewardPunishmentPreferenceCount ?? 0}</strong>
              R/P preferences
            </span>
            <span>
              <strong>{summary?.rewardPunishmentComparisonCount ?? 0}</strong>
              R/P comparisons
            </span>
            <span>
              <strong>{summary?.rewardPunishmentRecipeCount ?? 0}</strong>
              recipes
            </span>
            <span>
              <strong>{summary?.savedSceneCount ?? 0}</strong>
              saved scenes
            </span>
          </div>

          <p className="settings-import-versions">
            Settings store v{candidate.backup.profile.settings.schemaVersion}
            {" · "}Quiz store v{candidate.backup.profile.quizzes.schemaVersion}
            {" · "}Catalog store v{candidate.backup.profile.catalog.schemaVersion}
            {hasRewardPunishmentBackupData(candidate.backup)
              ? ` · R/P store v${candidate.backup.profile.rewardsPunishments.schemaVersion}`
              : " · Legacy backup: no Rewards & Punishments payload"}
            {isProfileBackupV3(candidate.backup)
              ? ` · Scenes store v${candidate.backup.profile.scenes.schemaVersion}`
              : " · Legacy backup: no saved Scenes payload"}
          </p>

          <div className="settings-import-warning">
            <strong>This replaces the current profile.</strong>
            <span>
              Import does not merge histories. Your current profile name, quiz data, catalog
              preferences/rankings, Rewards & Punishments data, and saved scenes will be replaced
              by this validated backup. Legacy backups restore stores they predate as empty.
            </span>
          </div>

          {restoreError && (
            <p className="settings-import-error" role="alert">
              {restoreError}
            </p>
          )}

          <div className="settings-import-actions">
            <button className="secondary" onClick={onClose}>
              Keep current profile
            </button>
            <button className="primary" onClick={restore}>
              Restore this backup
            </button>
          </div>
        </>
      )}
    </section>
  );
}
