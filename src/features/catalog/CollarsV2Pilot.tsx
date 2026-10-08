import { useState } from "react";
import { catalogPreferenceStates, type CatalogPreferenceState } from "../../lib/catalogProfile";
import { catalogPreferenceLabels } from "../../lib/catalogResults";
import { COLLARS_V2_STORAGE_KEY, collarsModifierKey, collarsV2, parseCollarsV2Ratings } from "../../lib/catalogV2Collars";
import "./CollarsV2Pilot.css";

/** Opt-in V2 vertical slice. The existing V1 overall Collars rating remains authoritative. */
export function CollarsV2Pilot() {
  const [ratings, setRatings] = useState(() =>
    typeof localStorage === "undefined" ? {} : parseCollarsV2Ratings(localStorage.getItem(COLLARS_V2_STORAGE_KEY)));
  const [expanded, setExpanded] = useState(false);
  const update = (key: string, state: CatalogPreferenceState | "") => {
    const next = { ...ratings };
    if (state) next[key] = state;
    else delete next[key];
    setRatings(next);
    if (typeof localStorage !== "undefined") localStorage.setItem(COLLARS_V2_STORAGE_KEY, JSON.stringify(next));
  };
  const rated = Object.keys(ratings).length;
  return (
    <section className="collars-v2-pilot panel" aria-label="Collars V2 preview">
      <div className="collars-v2-heading">
        <div>
          <p className="eyebrow">Catalog V2 · First interactive family</p>
          <h2>Collars <span className="collars-v2-beta">Preview</span></h2>
          <p>{collarsV2.description}</p>
          <p className="collars-v2-note">Your existing overall Collars rating stays in the current catalog. These {rated} detailed ratings are saved separately on this device while we validate V2.</p>
        </div>
        <button type="button" className="secondary" aria-expanded={expanded} aria-controls="collars-v2-details" onClick={() => setExpanded(!expanded)}>
          {expanded ? "Hide details" : "Explore collar preferences"}
        </button>
      </div>
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
