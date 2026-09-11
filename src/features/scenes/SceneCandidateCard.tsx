import { IconPlus } from "@tabler/icons-react";
import type { SceneCandidate } from "../../lib/sceneCandidates";
import { catalogPreferenceLabels } from "../../lib/catalogResults";
import type { SceneSessionChoice } from "../../lib/sceneSession";
import {
  sessionChoiceLabel,
  sessionChoices,
} from "./sceneBuilderOptions";

function candidateReasons(candidate: SceneCandidate) {
  const reasons: string[] = [];

  if (candidate.themeMatches.length > 0) {
    reasons.push(
      `Matches ${candidate.themeMatches
        .map((match) => match.label)
        .join(" + ")}`,
    );
  }

  if (candidate.sessionChoice) {
    reasons.push(sessionChoiceLabel(candidate.sessionChoice));
  } else if (candidate.explicitState) {
    reasons.push(
      `Marked ${catalogPreferenceLabels[candidate.explicitState]}`,
    );
  }

  if (candidate.overallRank) {
    reasons.push(`Overall This or That · #${candidate.overallRank.rank}`);
  } else if (candidate.categoryRank) {
    reasons.push(
      `${candidate.categoryLabel} · #${candidate.categoryRank.rank}`,
    );
  }

  if (candidate.sharedContext) {
    reasons.push(candidate.sharedContext.explanation);
  }

  if (candidate.provenance === "inference_only") {
    reasons.push("Suggested from profile signals");
  }

  return reasons.slice(0, 3);
}

export type SharedSceneSessionControls = {
  profileAName: string;
  profileBName: string;
  profileASessionChoice?: SceneSessionChoice;
  profileBSessionChoice?: SceneSessionChoice;
  onSetProfileAChoice: (
    catalogId: string,
    choice: SceneSessionChoice,
  ) => void;
  onSetProfileBChoice: (
    catalogId: string,
    choice: SceneSessionChoice,
  ) => void;
};

export function SceneCandidateCard({
  candidate,
  onSetSessionChoice,
  sharedSessionControls,
  onAddToScene,
  isInScene = false,
}: {
  candidate: SceneCandidate;
  onSetSessionChoice: (
    catalogId: string,
    choice: SceneSessionChoice,
  ) => void;
  sharedSessionControls?: SharedSceneSessionControls;
  onAddToScene?: (candidate: SceneCandidate) => void;
  isInScene?: boolean;
}) {
  return (
    <article
      className={
        "scene-candidate-card" +
        (candidate.provenance === "inference_only"
          ? " scene-candidate-suggested"
          : "")
      }
    >
      <div className="scene-candidate-top">
        <div>
          <span className="scene-candidate-category">
            {candidate.categoryLabel}
          </span>
          <h3>{candidate.label}</h3>
        </div>

        {candidate.bridge && (
          <span className="scene-bridge-chip">Bridge</span>
        )}
      </div>

      <div className="scene-candidate-theme-chips">
        {candidate.themeMatches.map((match) => (
          <span key={match.themeId}>{match.label}</span>
        ))}
      </div>

      <div className="scene-candidate-meta">
        <span>{candidate.intensity || "Variable"} intensity</span>
        <span>{candidate.direction}</span>
      </div>

      <div className="scene-candidate-reasons">
        {candidateReasons(candidate).map((reason) => (
          <span key={reason}>{reason}</span>
        ))}
      </div>

      {onAddToScene && (
        <button
          type="button"
          className="scene-add-button"
          disabled={isInScene}
          onClick={() => onAddToScene(candidate)}
        >
          <IconPlus size={15} stroke={2} aria-hidden="true" />
          {isInScene ? "In scene" : "Add to scene"}
        </button>
      )}

      {sharedSessionControls ? (
        <div className="scene-tonight-shared">
          {[
            {
              name: sharedSessionControls.profileAName,
              selected: sharedSessionControls.profileASessionChoice,
              onSet: sharedSessionControls.onSetProfileAChoice,
            },
            {
              name: sharedSessionControls.profileBName,
              selected: sharedSessionControls.profileBSessionChoice,
              onSet: sharedSessionControls.onSetProfileBChoice,
            },
          ].map((participant) => (
            <div
              className="scene-tonight-control"
              key={participant.name}
              aria-label={
                "Current-session preference for " +
                participant.name +
                " on " +
                candidate.label
              }
            >
              <span>{participant.name}</span>
              <div>
                {sessionChoices.map((choice) => (
                  <button
                    key={choice.id}
                    type="button"
                    className={
                      participant.selected === choice.id ? "selected" : ""
                    }
                    aria-pressed={participant.selected === choice.id}
                    onClick={() =>
                      participant.onSet(candidate.catalogId, choice.id)
                    }
                  >
                    {choice.shortLabel}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="scene-tonight-control"
          aria-label={`Current-session preference for ${candidate.label}`}
        >
          <span>Tonight</span>
          <div>
            {sessionChoices.map((choice) => (
              <button
                key={choice.id}
                type="button"
                className={
                  candidate.sessionChoice === choice.id ? "selected" : ""
                }
                aria-pressed={candidate.sessionChoice === choice.id}
                onClick={() =>
                  onSetSessionChoice(candidate.catalogId, choice.id)
                }
              >
                {choice.shortLabel}
              </button>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
