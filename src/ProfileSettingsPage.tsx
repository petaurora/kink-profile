import { type FormEvent, useEffect, useMemo, useState } from "react";
import { ProfileResetPanel } from "./ProfileResetPanel";
import { ProfileBackupPanel } from "./ProfileBackupPanel";
import {
  MAX_PROFILE_DISPLAY_NAME_LENGTH,
  normalizeProfileDisplayName,
  type ProfileSettings,
} from "./lib/profileSettings";

type ProfileSettingsPageProps = {
  settings: ProfileSettings;
  onChange: (settings: ProfileSettings) => void;
  onClose: () => void;
};

function FutureAction({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <article className="settings-action-row">
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
      <span className="settings-coming">Coming next</span>
    </article>
  );
}

export function ProfileSettingsPage({
  settings,
  onChange,
  onClose,
}: ProfileSettingsPageProps) {
  const [draftName, setDraftName] = useState(settings.displayName);
  const [resetOpen, setResetOpen] = useState(false);
  const [backupOpen, setBackupOpen] = useState(false);

  useEffect(() => {
    setDraftName(settings.displayName);
  }, [settings.displayName]);

  const normalizedName = useMemo(
    () => normalizeProfileDisplayName(draftName),
    [draftName],
  );
  const nameIsValid = normalizedName.length > 0;
  const nameChanged = normalizedName !== settings.displayName;

  const saveName = (event: FormEvent) => {
    event.preventDefault();
    if (!nameIsValid || !nameChanged) return;

    onChange({
      ...settings,
      displayName: normalizedName,
    });
  };

  return (
    <section className="settings-stack">
      <div className="settings-heading panel">
        <div>
          <p className="eyebrow">Settings</p>
          <h1>Make the profile yours.</h1>
          <p>
            Manage profile identity and local data here. Backup/restore and sharing are
            reserved below for the next M9 slices.
          </p>
        </div>
        <button className="secondary" onClick={onClose}>
          Back to hub
        </button>
      </div>

      <section className="settings-section" aria-labelledby="settings-profile-heading">
        <div className="settings-section-heading">
          <div>
            <p className="eyebrow">Profile</p>
            <h2 id="settings-profile-heading">Identity</h2>
          </div>
          <p>
            This changes profile-owner labels only. The Pet role/headspace in the kink taxonomy
            stays exactly what it is.
          </p>
        </div>

        <form className="settings-profile-card panel" onSubmit={saveName}>
          <label className="settings-field">
            <span>Profile name</span>
            <input
              type="text"
              value={draftName}
              maxLength={MAX_PROFILE_DISPLAY_NAME_LENGTH}
              onChange={(event) => setDraftName(event.target.value)}
              aria-describedby="profile-name-help"
            />
          </label>
          <p id="profile-name-help" className="settings-help">
            Used in profile-facing headings. Up to {MAX_PROFILE_DISPLAY_NAME_LENGTH} characters.
          </p>

          <div className="settings-name-preview" aria-live="polite">
            <span>Preview</span>
            <strong>{nameIsValid ? normalizedName + "'s profile" : "Enter a profile name"}</strong>
          </div>

          {!nameIsValid && (
            <p className="settings-error" role="alert">
              Profile name cannot be blank.
            </p>
          )}

          <div className="settings-form-actions">
            <button
              type="submit"
              className="primary"
              disabled={!nameIsValid || !nameChanged}
            >
              Save name
            </button>
          </div>
        </form>
      </section>

      <section className="settings-section" aria-labelledby="settings-data-heading">
        <div className="settings-section-heading">
          <div>
            <p className="eyebrow">Data</p>
            <h2 id="settings-data-heading">Profile lifecycle</h2>
          </div>
          <p>
            Reset independent source data without wiping unrelated parts of the profile.
          </p>
        </div>

        <div className="settings-action-list panel" aria-label="Profile data controls">
          <article className="settings-action-row">
            <div>
              <strong>Reset profile data</strong>
              <p>
                Choose exactly which quiz, catalog, ranking, or profile-settings data to reset.
              </p>
            </div>
            <button
              className="secondary compact"
              onClick={() => setResetOpen((open) => !open)}
            >
              {resetOpen ? "Close reset" : "Choose data"}
            </button>
          </article>
          <article className="settings-action-row">
            <div>
              <strong>Export profile backup</strong>
              <p>
                Download the complete private profile as versioned machine-readable data.
              </p>
            </div>
            <button
              className="secondary compact"
              onClick={() => setBackupOpen((open) => !open)}
            >
              {backupOpen ? "Close backup" : "Download backup"}
            </button>
          </article>
          <FutureAction
            title="Import profile backup"
            description="Validate and restore a complete profile backup without partially overwriting current data."
          />
        </div>

        {resetOpen && (
          <ProfileResetPanel
            onSettingsChange={onChange}
            onClose={() => setResetOpen(false)}
          />
        )}

        {backupOpen && <ProfileBackupPanel />}
      </section>

      <section className="settings-section" aria-labelledby="settings-sharing-heading">
        <div className="settings-section-heading">
          <div>
            <p className="eyebrow">Sharing</p>
            <h2 id="settings-sharing-heading">Share summary</h2>
          </div>
          <p>
            Human-readable sharing stays separate from the complete private profile backup.
          </p>
        </div>

        <div className="settings-action-list panel" aria-label="Planned profile sharing controls">
          <FutureAction
            title="Preview share summary"
            description="See the curated profile another person would receive before exporting anything."
          />
          <FutureAction
            title="Export share summary"
            description="Generate the same polished summary as PNG, HTML, or PDF."
          />
        </div>
      </section>
    </section>
  );
}
