import { useMemo } from "react";
import {
  IconArrowsExchange,
  IconBolt,
  IconMasksTheater,
  IconRefresh,
  IconSparkles,
} from "@tabler/icons-react";
import type { SharedInteractionConceptKind } from "./data/sharedInteractionMappings";
import {
  buildSharedParticipantIntentPairings,
  clearSharedParticipantIntent,
  getSharedParticipantIntentOptions,
  hasSharedParticipantIntentConcept,
  toggleSharedParticipantIntentConcept,
  type SharedParticipantIntent,
} from "./lib/sharedParticipantIntent";

type SharedParticipantIntentPanelProps = {
  profileAName: string;
  profileBName: string;
  profileAIntent: SharedParticipantIntent;
  profileBIntent: SharedParticipantIntent;
  onProfileAIntentChange: (intent: SharedParticipantIntent) => void;
  onProfileBIntentChange: (intent: SharedParticipantIntent) => void;
};

const intentGroups: readonly {
  kind: SharedInteractionConceptKind;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    kind: "headspace",
    label: "Headspace / role",
    description: "What role or headspace do you want to lean into right now?",
    icon: <IconMasksTheater size={17} stroke={1.8} aria-hidden="true" />,
  },
  {
    kind: "dynamic_mode",
    label: "Dynamic mode",
    description: "What relational or psychological mode sounds good right now?",
    icon: <IconSparkles size={17} stroke={1.8} aria-hidden="true" />,
  },
  {
    kind: "signal",
    label: "Activity side",
    description: "What do you specifically want to give, receive, or bring?",
    icon: <IconBolt size={17} stroke={1.8} aria-hidden="true" />,
  },
];

function ParticipantIntentEditor({
  name,
  intent,
  onChange,
}: {
  name: string;
  intent: SharedParticipantIntent;
  onChange: (intent: SharedParticipantIntent) => void;
}) {
  const options = useMemo(() => getSharedParticipantIntentOptions(), []);

  return (
    <section className="participant-intent-person">
      <header>
        <div>
          <span>Tonight</span>
          <strong>{name}</strong>
        </div>
        {intent.selectedConcepts.length > 0 && (
          <button
            type="button"
            className="text-button"
            onClick={() => onChange(clearSharedParticipantIntent())}
          >
            Clear
          </button>
        )}
      </header>

      <div className="participant-intent-selected" aria-live="polite">
        {intent.selectedConcepts.length > 0 ? (
          intent.selectedConcepts.map((concept) => {
            const option = options.find(
              (candidate) =>
                candidate.kind === concept.kind &&
                candidate.concept.id === concept.id,
            );

            return option ? (
              <button
                type="button"
                key={option.key}
                className="participant-intent-selected-chip"
                onClick={() =>
                  onChange(toggleSharedParticipantIntentConcept(intent, concept))
                }
                aria-label={"Remove " + option.label + " from " + name + "'s current intent"}
              >
                {option.label} ×
              </button>
            ) : null;
          })
        ) : (
          <span className="participant-intent-empty">
            Nothing selected yet.
          </span>
        )}
      </div>

      <div className="participant-intent-groups">
        {intentGroups.map((group) => {
          const groupOptions = options.filter(
            (option) => option.kind === group.kind,
          );
          const selectedCount = groupOptions.filter((option) =>
            hasSharedParticipantIntentConcept(intent, option.concept),
          ).length;

          return (
            <details
              className="participant-intent-group"
              key={group.kind}
            >
              <summary>
                <span className="participant-intent-group-icon" aria-hidden="true">
                  {group.icon}
                </span>
                <span>
                  <strong>{group.label}</strong>
                  <small>{group.description}</small>
                </span>
                <span className="participant-intent-group-count">
                  {selectedCount > 0 ? selectedCount : ""}
                </span>
              </summary>

              <div className="participant-intent-options">
                {groupOptions.map((option) => {
                  const selected = hasSharedParticipantIntentConcept(
                    intent,
                    option.concept,
                  );

                  return (
                    <button
                      type="button"
                      key={option.key}
                      className={
                        "participant-intent-option" +
                        (selected ? " is-selected" : "")
                      }
                      aria-pressed={selected}
                      onClick={() =>
                        onChange(
                          toggleSharedParticipantIntentConcept(
                            intent,
                            option.concept,
                          ),
                        )
                      }
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}

export function SharedParticipantIntentPanel({
  profileAName,
  profileBName,
  profileAIntent,
  profileBIntent,
  onProfileAIntentChange,
  onProfileBIntentChange,
}: SharedParticipantIntentPanelProps) {
  const pairings = useMemo(
    () =>
      buildSharedParticipantIntentPairings(
        profileAIntent,
        profileBIntent,
      ),
    [profileAIntent, profileBIntent],
  );

  const hasAnyIntent =
    profileAIntent.selectedConcepts.length > 0 ||
    profileBIntent.selectedConcepts.length > 0;

  return (
    <section className="participant-intent panel">
      <header className="participant-intent-heading">
        <div>
          <p className="eyebrow">Right now</p>
          <h2>What do you each want to bring tonight?</h2>
          <p>
            These are temporary choices for this interaction only. They do not
            change either permanent profile, quiz result, or preference.
          </p>
        </div>

        {hasAnyIntent && (
          <button
            type="button"
            className="secondary compact participant-intent-reset"
            onClick={() => {
              onProfileAIntentChange(clearSharedParticipantIntent());
              onProfileBIntentChange(clearSharedParticipantIntent());
            }}
          >
            <IconRefresh size={16} stroke={1.8} aria-hidden="true" />
            Reset tonight
          </button>
        )}
      </header>

      <div className="participant-intent-grid">
        <ParticipantIntentEditor
          name={profileAName}
          intent={profileAIntent}
          onChange={onProfileAIntentChange}
        />
        <ParticipantIntentEditor
          name={profileBName}
          intent={profileBIntent}
          onChange={onProfileBIntentChange}
        />
      </div>

      <section className="participant-intent-pairings">
        <div className="participant-intent-pairings-heading">
          <IconArrowsExchange size={18} stroke={1.8} aria-hidden="true" />
          <div>
            <strong>Tonight's pairings</strong>
            <span>
              Validated relationships created by the current choices above.
            </span>
          </div>
        </div>

        {pairings.length > 0 ? (
          <div className="participant-intent-pairing-list">
            {pairings.map((pairing) => (
              <article
                className="participant-intent-pairing"
                key={
                  pairing.mapping.id +
                  ":" +
                  pairing.profileAConcept.id +
                  ":" +
                  pairing.profileBConcept.id
                }
              >
                <div>
                  <span>
                    <small>{profileAName}</small>
                    <strong>{pairing.profileALabel}</strong>
                  </span>
                  <IconArrowsExchange size={16} stroke={1.8} aria-hidden="true" />
                  <span>
                    <small>{profileBName}</small>
                    <strong>{pairing.profileBLabel}</strong>
                  </span>
                </div>
                <p>{pairing.mapping.explanation}</p>
              </article>
            ))}
          </div>
        ) : hasAnyIntent ? (
          <p className="participant-intent-pairing-empty">
            No mapped pairing between the current choices yet. That is not a
            mismatch — the choices can still coexist without being a predefined
            complement.
          </p>
        ) : (
          <p className="participant-intent-pairing-empty">
            Pick anything either of you wants to bring right now. Pairings will
            appear only when both selections form a validated relationship.
          </p>
        )}
      </section>
    </section>
  );
}
