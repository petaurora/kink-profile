import { useId, useState } from "react";
import { appearancePresets } from "../../lib/appearancePresets";
import { selectAppearance, useAppearance } from "../../lib/appearance";
import "./appearance.css";

export function AppearanceSettings() {
  const appearance = useAppearance();
  const id = useId();
  const [saveFailed, setSaveFailed] = useState(false);
  return <section className="appearance-settings" aria-labelledby={`${id}-heading`}>
    <div className="appearance-heading">
      <h2 id={`${id}-heading`}>Appearance</h2>
      <p>Choose the atmosphere that feels like you.</p>
    </div>
    <fieldset className="appearance-options" aria-describedby={`${id}-help`}>
      <legend className="kp-visually-hidden">Color theme</legend>
      {appearancePresets.map(preset => <label className="appearance-choice" key={preset.id}>
        <input type="radio" name={`${id}-theme`} value={preset.id} checked={appearance === preset.id}
          onChange={() => setSaveFailed(!selectAppearance(preset.id))} />
        <span className="appearance-choice-content">
          <span className="appearance-preview" data-theme={preset.id} aria-hidden="true">
            <span className="appearance-preview-top"><i/><i/><i/></span>
            <span className="appearance-preview-body"><span className="appearance-preview-rail"/><span className="appearance-preview-card"><i/><i/><b/></span></span>
          </span>
          <span className="appearance-choice-label"><strong>{preset.name}</strong><span>{preset.scheme === "light" ? "Light" : "Dark"}</span></span>
          <span className="appearance-choice-description">{preset.description}</span>
          <span className="appearance-choice-selected" aria-hidden="true">{appearance === preset.id ? "Selected" : "Choose theme"}</span>
        </span>
      </label>)}
    </fieldset>
    <p id={`${id}-help`} className="appearance-help">Applies across KP on this device.</p>
    {saveFailed && <p role="status" className="appearance-help">Theme applied for this visit. Your browser couldn’t save the choice.</p>}
  </section>;
}
