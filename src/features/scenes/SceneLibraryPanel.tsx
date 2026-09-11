import {
  IconAlertTriangle,
  IconCopy,
  IconTrash,
} from "@tabler/icons-react";
import { sceneThemeDefinitions } from "../../data/sceneThemes";
import type { SavedScene } from "../../lib/sceneLibrary";
import type { SavedSceneReview } from "../../lib/sceneLifecycle";

export function SceneLibraryPanel({
  scenes,
  reviews,
  activeSavedSceneId,
  pendingDeleteSceneId,
  onLoad,
  onDuplicate,
  onDelete,
}: {
  scenes: readonly SavedScene[];
  reviews: ReadonlyMap<string, SavedSceneReview>;
  activeSavedSceneId: string | null;
  pendingDeleteSceneId: string | null;
  onLoad: (sceneId: string) => void;
  onDuplicate: (sceneId: string) => void;
  onDelete: (sceneId: string) => void;
}) {
  return (
    <details className="scene-library panel">
      <summary>
        <div>
          <span>Saved scenes</span>
          <strong>
            {scenes.length} {scenes.length === 1 ? "template" : "templates"}
          </strong>
        </div>
        <small>Local + private</small>
      </summary>

      {scenes.length === 0 ? (
        <div className="scene-library-empty">
          Build a scene above, give it a name, and save it here for later.
        </div>
      ) : (
        <div className="scene-library-list">
          {scenes.map((scene) => {
            const review = reviews.get(scene.id);
            const needsReview = review?.status === "needs_review";
            const isActive = activeSavedSceneId === scene.id;

            return (
              <article
                className={
                  "scene-library-card" +
                  (isActive ? " active" : "") +
                  (needsReview ? " needs-review" : "")
                }
                key={scene.id}
              >
                <div className="scene-library-card-main">
                  <div className="scene-library-card-title">
                    <strong>{scene.name}</strong>
                    {needsReview ? (
                      <span className="scene-review-badge">
                        <IconAlertTriangle
                          size={13}
                          stroke={2}
                          aria-hidden="true"
                        />
                        Needs review
                      </span>
                    ) : (
                      <span className="scene-ready-badge">Ready</span>
                    )}
                  </div>
                  <span>
                    {scene.components.length}{" "}
                    {scene.components.length === 1 ? "part" : "parts"} ·{" "}
                    {scene.effort} ·{" "}
                    {scene.themeIds
                      .map(
                        (id) =>
                          sceneThemeDefinitions.find((theme) => theme.id === id)
                            ?.label ?? id,
                      )
                      .join(" + ")}
                  </span>
                  <small>
                    Updated {new Date(scene.updatedAt).toLocaleDateString()}
                  </small>
                </div>

                <div className="scene-library-card-actions">
                  <button
                    type="button"
                    className={isActive ? "primary compact" : "secondary compact"}
                    onClick={() => onLoad(scene.id)}
                  >
                    {isActive ? "Loaded" : "Load"}
                  </button>
                  <button
                    type="button"
                    className="icon-only"
                    aria-label={`Duplicate ${scene.name}`}
                    title="Duplicate"
                    onClick={() => onDuplicate(scene.id)}
                  >
                    <IconCopy size={16} stroke={2} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={
                      pendingDeleteSceneId === scene.id
                        ? "scene-delete-confirm"
                        : "icon-only"
                    }
                    aria-label={
                      pendingDeleteSceneId === scene.id
                        ? `Confirm delete ${scene.name}`
                        : `Delete ${scene.name}`
                    }
                    onClick={() => onDelete(scene.id)}
                  >
                    {pendingDeleteSceneId === scene.id ? (
                      "Confirm"
                    ) : (
                      <IconTrash size={16} stroke={2} aria-hidden="true" />
                    )}
                  </button>
                </div>

                {needsReview && review && (
                  <details className="scene-review-details">
                    <summary>
                      {review.issues.length}{" "}
                      {review.issues.length === 1 ? "issue" : "issues"}
                    </summary>
                    <ul>
                      {review.issues.map((issue) => (
                        <li key={`${issue.componentId}:${issue.code}`}>
                          {issue.message}
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </article>
            );
          })}
        </div>
      )}
    </details>
  );
}
