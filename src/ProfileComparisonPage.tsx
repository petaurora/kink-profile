import { type ChangeEvent, useState } from "react";
import {
  IconFileUpload,
  IconRefresh,
  IconShieldCheck,
  IconSparkles,
  IconUsers,
} from "@tabler/icons-react";
import { SharedProfileComparisonView } from "./SharedProfileComparisonView";
import { SceneBuilder } from "./SceneBuilder";
import { SharedParticipantIntentPanel } from "./SharedParticipantIntentPanel";
import {
  getProfileBackupSummary,
  type ProfileBackup,
} from "./lib/profileBackup";
import { parseProfileBackupJson } from "./lib/profileImport";
import {
  buildUploadedProfileComparison,
  type ComparisonProfileSource,
  type UploadedComparisonCandidate,
} from "./lib/profileComparisonUpload";
import {
  createEmptySharedParticipantIntent,
  type SharedParticipantIntent,
} from "./lib/sharedParticipantIntent";
import {
  getSceneThemeIdsForSharedParticipantIntents,
} from "./lib/sharedSceneCandidates";
import "./profileComparison.css";

type ProfileComparisonPageProps = {
  current: ComparisonProfileSource;
  onClose: () => void;
};

type UploadCandidate = {
  fileName: string;
  backup: ProfileBackup;
  built: UploadedComparisonCandidate;
};

export function ProfileComparisonPage({
  current,
  onClose,
}: ProfileComparisonPageProps) {
  const [candidate, setCandidate] = useState<UploadCandidate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profileAIntent, setProfileAIntent] =
    useState<SharedParticipantIntent>(() => createEmptySharedParticipantIntent());
  const [profileBIntent, setProfileBIntent] =
    useState<SharedParticipantIntent>(() => createEmptySharedParticipantIntent());
  const [sharedSceneOpen, setSharedSceneOpen] = useState(false);

  const chooseFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setCandidate(null);
    setError(null);
    setProfileAIntent(createEmptySharedParticipantIntent());
    setProfileBIntent(createEmptySharedParticipantIntent());
    setSharedSceneOpen(false);

    let text: string;

    try {
      text = await file.text();
    } catch {
      setError("The selected file could not be read.");
      return;
    }

    const parsed = parseProfileBackupJson(text);

    if (!parsed.ok) {
      setError(parsed.error);
      return;
    }

    setCandidate({
      fileName: file.name,
      backup: parsed.backup,
      built: buildUploadedProfileComparison(current, parsed.backup),
    });
  };

  const clearCandidate = () => {
    setCandidate(null);
    setError(null);
    setProfileAIntent(createEmptySharedParticipantIntent());
    setProfileBIntent(createEmptySharedParticipantIntent());
    setSharedSceneOpen(false);
  };

  if (candidate) {
    const summary = getProfileBackupSummary(candidate.backup);
    const intentThemeIds =
      getSceneThemeIdsForSharedParticipantIntents(
        profileAIntent,
        profileBIntent,
      );

    if (sharedSceneOpen) {
      return (
        <SceneBuilder
          catalogResultView={candidate.built.currentInput.catalogResults}
          initialThemeIds={intentThemeIds}
          sharedContext={{
            profileAName: current.displayName,
            profileBName: candidate.built.displayName,
            partnerCatalogResultView:
              candidate.built.uploadedInput.catalogResults,
            comparison: candidate.built.comparison,
            profileAIntent,
            profileBIntent,
          }}
          onClose={() => setSharedSceneOpen(false)}
        />
      );
    }

    return (
      <section className="profile-comparison-page">
        <div className="comparison-upload-bar panel">
          <div className="comparison-upload-selected">
            <span className="comparison-upload-icon" aria-hidden="true">
              <IconUsers size={19} stroke={1.8} />
            </span>
            <div>
              <span>Comparing with</span>
              <strong>{candidate.built.displayName}</strong>
              <small>
                {candidate.fileName} · exported{" "}
                {new Date(candidate.built.exportedAt).toLocaleDateString()}
              </small>
            </div>
          </div>

          <div className="comparison-upload-actions">
            <button
              type="button"
              className="secondary compact"
              onClick={clearCandidate}
            >
              <IconRefresh size={16} stroke={1.8} aria-hidden="true" />
              Choose another
            </button>
            <button
              type="button"
              className="text-button"
              onClick={onClose}
            >
              Close comparison
            </button>
          </div>
        </div>

        <div className="comparison-upload-meta panel">
          <span>
            <strong>{summary.quizSectionsWithData}</strong>
            quiz sections
          </span>
          <span>
            <strong>{summary.catalogPreferenceCount}</strong>
            direct preferences
          </span>
          <span>
            <strong>{summary.rankingComparisonCount}</strong>
            ranking comparisons
          </span>
          <span className="comparison-upload-safety">
            <IconShieldCheck size={16} stroke={1.8} aria-hidden="true" />
            Temporary comparison only
          </span>
        </div>

        <SharedParticipantIntentPanel
          profileAName={current.displayName}
          profileBName={candidate.built.displayName}
          profileAIntent={profileAIntent}
          profileBIntent={profileBIntent}
          onProfileAIntentChange={setProfileAIntent}
          onProfileBIntentChange={setProfileBIntent}
        />

        <article className="shared-scene-launch panel">
          <div>
            <span className="comparison-upload-icon" aria-hidden="true">
              <IconSparkles size={19} stroke={1.8} />
            </span>
            <div>
              <p className="eyebrow">Shared Scene Builder</p>
              <h2>Build from what fits both profiles.</h2>
              <p>
                Mutual and complementary interests can enter the automatic
                pool. Either person's boundaries or Not tonight choice remove
                an item. Current intent becomes a starting scene query.
              </p>
              {intentThemeIds.length > 0 && (
                <small>
                  {intentThemeIds.length} scene{" "}
                  {intentThemeIds.length === 1 ? "theme" : "themes"} suggested
                  from tonight's intent.
                </small>
              )}
            </div>
          </div>
          <button
            type="button"
            className="primary"
            onClick={() => setSharedSceneOpen(true)}
          >
            <IconSparkles size={17} stroke={2} aria-hidden="true" />
            Build shared scene
          </button>
        </article>

        <SharedProfileComparisonView
          model={candidate.built.comparison}
          profileAName={current.displayName}
          profileBName={candidate.built.displayName}
        />
      </section>
    );
  }

  return (
    <section className="comparison-upload-shell">
      <article className="comparison-upload-card panel">
        <div className="comparison-upload-heading">
          <span className="comparison-upload-icon" aria-hidden="true">
            <IconUsers size={22} stroke={1.8} />
          </span>

          <div>
            <p className="eyebrow">Shared profile</p>
            <h1>Compare profiles.</h1>
            <p>
              Upload someone else's Full Profile Export to compare it with{" "}
              <strong>{current.displayName}</strong>. The uploaded profile is
              validated locally and used only for this comparison.
            </p>
          </div>
        </div>

        <div className="comparison-upload-flow">
          <div className="comparison-profile-chip is-current">
            <span>Your profile</span>
            <strong>{current.displayName}</strong>
          </div>

          <span className="comparison-upload-plus" aria-hidden="true">
            +
          </span>

          <label className="comparison-upload-picker">
            <input
              type="file"
              accept=".json,application/json"
              onChange={chooseFile}
            />
            <span className="comparison-profile-chip is-upload">
              <IconFileUpload size={19} stroke={1.8} aria-hidden="true" />
              <span>Compare with</span>
              <strong>Upload profile JSON</strong>
            </span>
          </label>
        </div>

        <div className="comparison-upload-safety-note">
          <IconShieldCheck size={20} stroke={1.8} aria-hidden="true" />
          <div>
            <strong>Your profile will not be replaced or modified.</strong>
            <span>
              This is not an import. The uploaded file is not saved as another
              local profile and disappears when you leave this comparison.
            </span>
          </div>
        </div>

        {error && (
          <p className="comparison-upload-error" role="alert">
            {error}
          </p>
        )}

        <button type="button" className="text-button" onClick={onClose}>
          Back
        </button>
      </article>
    </section>
  );
}
