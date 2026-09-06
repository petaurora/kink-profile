import { useMemo } from "react";
import { ProfileShareSummary } from "./ProfileShareSummary";
import { loadCatalogProfile } from "./lib/catalogProfileStorage";
import { buildProfileShareSummary } from "./lib/profileShareSummary";
import type { ProfileSettings } from "./lib/profileSettings";
import { loadProfile } from "./lib/profileStorage";

export function ProfileSharePanel({
  settings,
}: {
  settings: ProfileSettings;
}) {
  const model = useMemo(
    () =>
      buildProfileShareSummary(
        settings.displayName,
        loadProfile(),
        loadCatalogProfile(),
      ),
    [settings.displayName],
  );

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

      <div className="settings-share-preview-frame">
        <ProfileShareSummary model={model} />
      </div>

      <p className="settings-share-note">
        Interest Areas are intentionally not included yet because M7.8 has not defined their
        stable category-selection semantics. M9.6 will export this same summary renderer as
        PNG, HTML, and PDF.
      </p>
    </section>
  );
}
