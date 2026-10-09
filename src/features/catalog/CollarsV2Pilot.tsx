import { useState } from "react";
import { catalogPreferenceStates, type CatalogPreferenceState } from "../../lib/catalogProfile";
import { catalogPreferenceLabels } from "../../lib/catalogResults";
import { COLLARS_V2_STORAGE_KEY, collarsModifierKey, collarsV2, parseCollarsV2Ratings, type CollarsV2Ratings } from "../../lib/catalogV2Collars";
import "./CollarsV2Pilot.css";

/** Opt-in V2 vertical slice. The existing V1 overall Collars rating remains authoritative. */
export function CollarsV2Pilot({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) {
  const [ratings, setRatings] = useState<CollarsV2Ratings>(() =>
    typeof localStorage === "undefined" ? {} : parseCollarsV2Ratings(localStorage.getItem(COLLARS_V2_STORAGE_KEY)));
  const update = (key: string, state: CatalogPreferenceState | "") => {
    const next = { ...ratings };
    if (state) next[key] = state;
    else delete next[key];
    setRatings(next);
    if (typeof localStorage !== "undefined") localStorage.setItem(COLLARS_V2_STORAGE_KEY, JSON.stringify(next));
  };
  return (
    <section className="collars-v2-pilot" aria-label="Collars refinements">
      {expanded && <div id="collars-v2-details" className="collars-v2-groups">
        {collarsV2.groups.map(group => <fieldset key={group.id} className="collars-v2-group">
          <legend>{group.label}</legend>
          {group.values.map(([id, label]) => {
            const key = collarsModifierKey(group.id, id);
            return <label className="collars-v2-option" key={key}>
              <span>{label}</span>
              <select aria-label={`${label} preference`} value={ratings[key] ?? ""} onChange={event => update(key, event.target.value as CatalogPreferenceState | "")}>
                <option value="">Not rated</option>
                {catalogPreferenceStates.map(state => <option value={state} key={state}>{catalogPreferenceLabels[state]}</option>)}
              </select>
            </label>;
          })}
        </fieldset>)}
        <p className="collars-v2-note">Collaring (the ritual/relationship act) is a separate Item. No ownership, pet-play, or protocol preference is inferred from these ratings.</p>
      </div>}
    </section>
  );
}
