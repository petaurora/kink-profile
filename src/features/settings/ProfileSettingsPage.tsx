import { type FormEvent, useEffect, useMemo, useState } from "react";
import { ProfileResetPanel } from "../../ProfileResetPanel";
import { ProfileBackupPanel } from "../../ProfileBackupPanel";
import { ProfileImportPanel } from "../../ProfileImportPanel";
import { ProfileSharePanel } from "../../ProfileSharePanel";
import {
  MAX_PROFILE_DISPLAY_NAME_LENGTH,
  normalizeProfileDisplayName,
  type ProfileSettings,
} from "../../lib/profileSettings";

type ProfileSettingsPageProps = {
  settings: ProfileSettings;
  onChange: (settings: ProfileSettings) => void;
  onClose: () => void;
  initialSection?: "sharing";
  developerToolsEnabled: boolean;
  onDeveloperToolsChange: (enabled: boolean) => void;
  onOpenCuration: () => void;
};

export function ProfileSettingsPage({
  settings,
  onChange,
  onClose,
  initialSection,
  developerToolsEnabled,
  onDeveloperToolsChange,
  onOpenCuration,
}: ProfileSettingsPageProps) {
  const [draftName, setDraftName] = useState(settings.displayName);
  const [resetOpen, setResetOpen] = useState(false);
  const [backupOpen, setBackupOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [sharePreviewOpen, setSharePreviewOpen] = useState(
    initialSection === "sharing",
  );

  useEffect(() => {
    setDraftName(settings.displayName);
  }, [settings.displayName]);

  useEffect(() => {
    if (initialSection !== "sharing") return;
    document.getElementById("settings-sharing")?.scrollIntoView({
      block: "start",
    });
  }, [initialSection]);

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

  const closeOtherPanels = () => {
    setResetOpen(false);
    setBackupOpen(false);
    setImportOpen(false);
    setSharePreviewOpen(false);
  };

  return (
    <section className="settings-stack">
      <div className="settings-heading panel">
        <div>
          <p className="eyebrow">Profile settings</p>
          <h1>Make the profile yours.</h1>
          <p>
            Manage profile identity, local data, backup/restore, deliberate sharing,
            and advanced local tools here.
          </p>
        </div>
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
                Choose exactly which quiz, catalog, ranking, Rewards & Punishments, or
                profile-settings data to reset.
              </p>
            </div>
            <button
              className="secondary compact"
              onClick={() => {
                const next = !resetOpen;
                closeOtherPanels();
                setResetOpen(next);
              }}
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
              onClick={() => {
                const next = !backupOpen;
                closeOtherPanels();
                setBackupOpen(next);
              }}
            >
              {backupOpen ? "Close backup" : "Download backup"}
            </button>
          </article>
          <article className="settings-action-row">
            <div>
              <strong>Import profile backup</strong>
              <p>
                Validate and restore a complete profile backup as a full-profile replacement.
              </p>
            </div>
            <button
              className="secondary compact"
              onClick={() => {
                const next = !importOpen;
                closeOtherPanels();
                setImportOpen(next);
              }}
            >
              {importOpen ? "Close restore" : "Choose backup"}
            </button>
          </article>
        </div>

        {resetOpen && (
          <ProfileResetPanel
            onSettingsChange={onChange}
            onClose={() => setResetOpen(false)}
          />
        )}

        {backupOpen && <ProfileBackupPanel />}

        {importOpen && (
          <ProfileImportPanel
            onSettingsChange={onChange}
            onClose={() => setImportOpen(false)}
            onDone={onClose}
          />
        )}
      </section>

      <section
        id="settings-sharing"
        className="settings-section"
        aria-labelledby="settings-sharing-heading"
      >
        <div className="settings-section-heading">
          <div>
            <p className="eyebrow">Sharing</p>
            <h2 id="settings-sharing-heading">Share summary</h2>
          </div>
          <p>
            Human-readable sharing stays separate from the complete private profile backup.
          </p>
        </div>

        <div className="settings-action-list panel" aria-label="Profile sharing controls">
          <article className="settings-action-row">
            <div>
              <strong>Preview share summary</strong>
              <p>
                See the curated human-facing profile before exporting anything.
              </p>
            </div>
            <button
              className="secondary compact"
              onClick={() => {
                const next = !sharePreviewOpen;
                closeOtherPanels();
                setSharePreviewOpen(next);
              }}
            >
              {sharePreviewOpen ? "Close preview" : "Preview"}
            </button>
          </article>
          <article className="settings-action-row">
            <div>
              <strong>Export share summary</strong>
              <p>
                Download the curated summary as PNG, self-contained HTML, or PDF.
              </p>
            </div>
            <button
              className="secondary compact"
              onClick={() => {
                closeOtherPanels();
                setSharePreviewOpen(true);
              }}
            >
              Open exports
            </button>
          </article>
        </div>

        {sharePreviewOpen && <ProfileSharePanel settings={settings} />}
      </section>

      <section className="settings-section" aria-labelledby="settings-advanced-heading">
        <div className="settings-section-heading">
          <div>
            <p className="eyebrow">Advanced</p>
            <h2 id="settings-advanced-heading">Developer / Admin Tools</h2>
          </div>
          <p>
            Local discoverability for internal tooling. This is not authentication or a security boundary.
          </p>
        </div>

        <div className="settings-action-list panel" aria-label="Advanced settings">
          <article className="settings-action-row">
            <div>
              <strong>Developer tools</strong>
              <p>
                Reveal internal data and curation tools on this device. This preference is not part of profile backup/export.
              </p>
            </div>
            <button
              type="button"
              className={developerToolsEnabled ? "settings-switch is-on" : "settings-switch"}
              role="switch"
              aria-checked={developerToolsEnabled}
              onClick={() => onDeveloperToolsChange(!developerToolsEnabled)}
            >
              <span aria-hidden="true" />
              {developerToolsEnabled ? "On" : "Off"}
            </button>
          </article>

          {developerToolsEnabled && (
            <article className="settings-action-row">
              <div>
                <strong>Curation Workbench</strong>
                <p>
                  Inspect and refine catalog, signals, questions, rewards, punishments, and other internal product data.
                </p>
              </div>
              <button type="button" className="secondary compact" onClick={onOpenCuration}>
                Open workbench
              </button>
            </article>
          )}
        </div>
      </section>
    </section>
  );
}
