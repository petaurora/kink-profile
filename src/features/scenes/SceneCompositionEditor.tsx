import {
  IconArrowDown,
  IconArrowUp,
  IconArrowsExchange,
  IconCopy,
  IconDeviceFloppy,
  IconNotes,
  IconPlus,
  IconSparkles,
  IconX,
} from "@tabler/icons-react";
import type {
  SceneCandidate,
  SceneCandidateView,
} from "../../lib/sceneCandidates";
import {
  replacementCandidatesForComponent,
  scenePhaseDefinitions,
  type SceneComposition,
  type ScenePhaseId,
} from "../../lib/sceneComposition";
import type { CatalogResultView } from "../../lib/catalogResults";
import {
  resolveSceneRewardPunishmentSource,
} from "../../lib/sceneRewardPunishment";
import type { RewardPunishmentRecipe } from "../../lib/rewardPunishmentRecipes";

export function SceneCompositionEditor({
  composition,
  candidateView,
  compositionCatalogIds,
  confirmedById,
  catalogResultView,
  rewardPunishmentRecipes,
  activeSavedSceneId,
  sceneName,
  sceneSaveMessage,
  onSceneNameChange,
  onSave,
  onStopEditing,
  onClear,
  onMakeStarter,
  onMove,
  onShuffleRewardPunishment,
  onRemoveRewardPunishment,
  onUpdateNote,
  onUpdatePhase,
  onReplace,
  onShuffle,
  onRemove,
  onAddNext,
}: {
  composition: SceneComposition | null;
  candidateView: SceneCandidateView;
  compositionCatalogIds: ReadonlySet<string>;
  confirmedById: ReadonlyMap<string, SceneCandidate>;
  catalogResultView: CatalogResultView;
  rewardPunishmentRecipes: readonly RewardPunishmentRecipe[];
  activeSavedSceneId: string | null;
  sceneName: string;
  sceneSaveMessage: string | null;
  onSceneNameChange: (value: string) => void;
  onSave: (asNew: boolean) => void;
  onStopEditing: () => void;
  onClear: () => void;
  onMakeStarter: () => void;
  onMove: (componentId: string, direction: "up" | "down") => void;
  onShuffleRewardPunishment: () => void;
  onRemoveRewardPunishment: () => void;
  onUpdateNote: (componentId: string, note: string) => void;
  onUpdatePhase: (componentId: string, phaseId: ScenePhaseId) => void;
  onReplace: (componentId: string) => void;
  onShuffle: (componentId: string) => void;
  onRemove: (componentId: string) => void;
  onAddNext: () => void;
}) {
  return (
    <article className="scene-composition panel" id="scene-composition">
      <div className="scene-section-heading">
        <div>
          <p className="eyebrow">05 · Build the scene</p>
          <h2>Turn the menu into an editable arc.</h2>
        </div>
        {composition && composition.components.length > 0 && (
          <button type="button" className="text-button" onClick={onClear}>
            Clear scene
          </button>
        )}
      </div>

      {composition && composition.components.length > 0 && (
        <div className="scene-save-bar">
          <label>
            <span>
              {activeSavedSceneId ? "Editing saved scene" : "Save this scene"}
            </span>
            <input
              type="text"
              value={sceneName}
              maxLength={80}
              placeholder="Give it a name…"
              onChange={(event) => onSceneNameChange(event.target.value)}
            />
          </label>

          <div className="scene-save-actions">
            <button
              type="button"
              className="primary compact"
              disabled={!sceneName.trim()}
              onClick={() => onSave(false)}
            >
              <IconDeviceFloppy size={15} stroke={2} aria-hidden="true" />
              {activeSavedSceneId ? "Save changes" : "Save scene"}
            </button>
            {activeSavedSceneId && (
              <>
                <button
                  type="button"
                  className="secondary compact"
                  disabled={!sceneName.trim()}
                  onClick={() => onSave(true)}
                >
                  <IconCopy size={15} stroke={2} aria-hidden="true" />
                  Save as new
                </button>
                <button
                  type="button"
                  className="text-button"
                  onClick={onStopEditing}
                >
                  Stop editing
                </button>
              </>
            )}
          </div>

          {sceneSaveMessage && (
            <small role="status" aria-live="polite" aria-atomic="true">
              {sceneSaveMessage}
            </small>
          )}
        </div>
      )}

      <div className="scene-arc-guide" aria-label="Scene arc">
        {scenePhaseDefinitions.map((phase) => (
          <span
            key={phase.id}
            className={
              phase.id === "reward_punishment"
                ? "scene-arc-phase m11"
                : "scene-arc-phase"
            }
            title={phase.description}
          >
            {phase.shortLabel}
            {phase.optional && <small>optional</small>}
          </span>
        ))}
      </div>

      {!composition || composition.components.length === 0 ? (
        <div className="scene-composition-empty">
          <div>
            <IconNotes size={23} stroke={1.7} aria-hidden="true" />
            <strong>Start with a sensible first draft.</strong>
            <span>
              This version is deterministic. Use Build something above when you want
              the app to choose the parts for you.
            </span>
          </div>
          <button
            type="button"
            className="primary compact"
            disabled={candidateView.confirmed.length === 0}
            onClick={onMakeStarter}
          >
            <IconPlus size={16} stroke={2} aria-hidden="true" />
            Make a starter scene
          </button>
        </div>
      ) : (
        <>
          <div className="scene-composition-list">
            {composition.components.map((component, index) => {
              if (component.source.kind === "reward_punishment") {
                const resolved = resolveSceneRewardPunishmentSource(
                  component.source,
                  rewardPunishmentRecipes,
                );
                const contextLabel =
                  component.source.context === "reward" ? "Reward" : "Punishment";
                const accessibleLabel = `${contextLabel}: ${resolved.label}`;

                return (
                  <article
                    className="scene-component scene-component-m11"
                    key={component.id}
                  >
                    <div className="scene-component-order">
                      <span>{index + 1}</span>
                      <div>
                        <button
                          type="button"
                          aria-label={`Move ${accessibleLabel} up`}
                          disabled={index === 0}
                          onClick={() => onMove(component.id, "up")}
                        >
                          <IconArrowUp size={15} stroke={2} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Move ${accessibleLabel} down`}
                          disabled={index === composition.components.length - 1}
                          onClick={() => onMove(component.id, "down")}
                        >
                          <IconArrowDown size={15} stroke={2} aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    <div className="scene-component-body">
                      <div className="scene-component-top">
                        <div>
                          <span className="scene-component-fixed-phase">
                            Reward / punishment
                          </span>
                          <h3>{resolved.label}</h3>
                          <span>
                            {contextLabel} · {resolved.kindLabel} · confirmed in M11
                          </span>
                        </div>

                        <div className="scene-component-actions">
                          <button type="button" onClick={onShuffleRewardPunishment}>
                            <IconSparkles size={15} stroke={2} aria-hidden="true" />
                            Shuffle
                          </button>
                          <button
                            type="button"
                            className="icon-only"
                            aria-label={`Remove ${accessibleLabel} from scene`}
                            onClick={onRemoveRewardPunishment}
                          >
                            <IconX size={16} stroke={2} aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <label className="scene-component-note">
                        <span>Scene-local note</span>
                        <textarea
                          rows={2}
                          value={component.note}
                          placeholder="Anything to remember for this add-on…"
                          onChange={(event) =>
                            onUpdateNote(component.id, event.target.value)
                          }
                        />
                      </label>
                    </div>
                  </article>
                );
              }

              const currentCatalogId = component.source.catalogId;
              const candidate = confirmedById.get(currentCatalogId);
              const catalogResult =
                catalogResultView.byCatalogId.get(currentCatalogId);
              const componentLabel =
                candidate?.label ?? catalogResult?.item.label ?? currentCatalogId;
              const componentCategoryLabel =
                candidate?.categoryLabel ??
                catalogResult?.item.categoryLabel ??
                "Unavailable catalog item";
              const componentUnavailable = !candidate;
              const replacements = replacementCandidatesForComponent(
                composition,
                component.id,
                candidateView.coverageOrder,
              ).filter(
                (replacement) => replacement.catalogId !== currentCatalogId,
              );

              return (
                <article className="scene-component" key={component.id}>
                  <div className="scene-component-order">
                    <span>{index + 1}</span>
                    <div>
                      <button
                        type="button"
                        aria-label={`Move ${componentLabel} up`}
                        disabled={index === 0}
                        onClick={() => onMove(component.id, "up")}
                      >
                        <IconArrowUp size={15} stroke={2} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Move ${componentLabel} down`}
                        disabled={index === composition.components.length - 1}
                        onClick={() => onMove(component.id, "down")}
                      >
                        <IconArrowDown size={15} stroke={2} aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <div className="scene-component-body">
                    <div className="scene-component-top">
                      <div>
                        <select
                          aria-label={`Scene phase for ${componentLabel}`}
                          value={component.phaseId}
                          onChange={(event) =>
                            onUpdatePhase(
                              component.id,
                              event.target.value as ScenePhaseId,
                            )
                          }
                        >
                          {scenePhaseDefinitions
                            .filter((phase) => phase.catalogEnabled)
                            .map((phase) => (
                              <option key={phase.id} value={phase.id}>
                                {phase.label}
                              </option>
                            ))}
                        </select>
                        <h3>{componentLabel}</h3>
                        <span>
                          {componentCategoryLabel}
                          {componentUnavailable && " · Needs review"}
                        </span>
                      </div>

                      <div className="scene-component-actions">
                        <button
                          type="button"
                          disabled={replacements.length === 0}
                          onClick={() => onReplace(component.id)}
                        >
                          <IconArrowsExchange size={15} stroke={2} aria-hidden="true" />
                          Replace
                        </button>
                        <button
                          type="button"
                          disabled={replacements.length === 0}
                          onClick={() => onShuffle(component.id)}
                        >
                          <IconSparkles size={15} stroke={2} aria-hidden="true" />
                          Shuffle
                        </button>
                        <button
                          type="button"
                          className="icon-only"
                          aria-label={`Remove ${componentLabel} from scene`}
                          onClick={() => onRemove(component.id)}
                        >
                          <IconX size={16} stroke={2} aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    <label className="scene-component-note">
                      <span>Scene-local note</span>
                      <textarea
                        rows={2}
                        value={component.note}
                        placeholder="Anything to remember for this part…"
                        onChange={(event) =>
                          onUpdateNote(component.id, event.target.value)
                        }
                      />
                    </label>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="scene-composition-footer">
            <button
              type="button"
              className="secondary compact"
              disabled={candidateView.coverageOrder.every((candidate) =>
                compositionCatalogIds.has(candidate.catalogId),
              )}
              onClick={onAddNext}
            >
              <IconPlus size={15} stroke={2} aria-hidden="true" />
              Add another
            </button>
            <button type="button" className="text-button" onClick={onMakeStarter}>
              Rebuild starter
            </button>
          </div>
        </>
      )}
    </article>
  );
}
