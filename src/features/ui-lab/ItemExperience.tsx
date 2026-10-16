import type { MouseEvent, ReactNode } from "react";
import { AppIcon } from "../../components/ui/AppIcon";
import { DisclosureSection } from "../../components/ui/DisclosureSection";
import { InlineSaveStatus } from "../../components/ui/PreferenceControl";
import { useToasts } from "../../components/ui/ToastProvider";
import type { Records } from "./LabRecords";

export const comfortOptions = [
  ["uncomfortable", "Uncomfortable"],
  ["somewhat_comfortable", "Somewhat Comfortable"],
  ["comfortable", "Comfortable"],
] as const;
export const comfortChoices = comfortOptions.map(([, label]) => label);
export const comfortLabel = (value: unknown) => comfortOptions.find(([key]) => key === value)?.[1];
export const comfortValue = (label: string | undefined) => comfortOptions.find(([, text]) => text === label)?.[0];

/** Independent item-level fields; opening either picker never records experience. */
export function ItemExperience({ itemId, name, preference, records, onComfortActivate, comfortExpanded, onRetry }: {
  itemId: string; name: string; preference: ReactNode; records: Records;
  onComfortActivate: (event: MouseEvent<HTMLButtonElement>) => void;
  comfortExpanded: boolean; onRetry: (target: string) => void;
}) {
  const { notify } = useToasts();
  const triedTarget = `experience:${itemId}:tried`;
  const comfortTarget = `experience:${itemId}:comfort`;
  const comfort = comfortLabel(records.values[comfortTarget]);
  return <div className="cc-refine-summary">
    <div className="cc-refine-field"><span className="cc-refine-field-label">Overall rating</span>{preference}</div>
    <div className="cc-refine-field"><span className="cc-refine-field-label">Comfort</span>
      <span data-field-id={comfortTarget} className="kp-rating-wrap">
        <button type="button" className="kp-rating cc-comfort-value" data-empty={!comfort || undefined} aria-haspopup="dialog" aria-expanded={comfortExpanded}
          aria-label={`${name} Comfort: ${comfort || "Not set"}. Change comfort`} onClick={onComfortActivate}>
          {comfort && <AppIcon name="comfort" size={17} />}<span>{comfort || "Not set"}</span>
        </button>
        <InlineSaveStatus state={records.saves[comfortTarget]} label={`${name} Comfort`} onRetry={() => onRetry(comfortTarget)}/>
      </span>
    </div>
    <div className="cc-tried" data-field-id={triedTarget}>
      <label><span className="cc-tried-checkbox"><input type="checkbox" checked={records.values[triedTarget] === true} onChange={event => {
        const previous = records.values[triedTarget];
        const checked = event.target.checked;
        const version = records.commit(triedTarget, checked ? true : undefined);
        notify({ message: checked ? "Tried recorded" : "Tried marker cleared", kind: "info", actionLabel: "Undo", duration: 5000, onAction: () => {
          if (!records.restore(triedTarget, version, previous)) notify({ message: "A newer edit was kept", kind: "info" });
        }});
      }}/><span className="cc-tried-box" aria-hidden="true"><AppIcon name="confirm" size={14}/></span></span>Tried</label>
      <InlineSaveStatus state={records.saves[triedTarget]} label={`${name} Tried`} onRetry={() => onRetry(triedTarget)}/>
    </div>
  </div>;
}

export function ItemExperienceDetails({ itemId, open, onToggle, records }: {
  itemId: string; open: boolean; onToggle: () => void; records: Records;
}) {
  const latestEdit = records.revisions.filter(event => event.target === `experience:${itemId}:tried` || event.target === `experience:${itemId}:comfort`).at(-1);
  return <DisclosureSection title="About experience" open={open} onToggle={onToggle}>
    <div className="cc-experience-details">
      <p>Tried is optional. Unchecked means no affirmative record.</p>
      <p>Comfort is self-assessed. Tried, Comfort and Preference are independent; changing one does not change the others.</p>
      <p>Recording time is the edit time, not the activity date.</p>
      {latestEdit && <p>Last recorded edit: <time dateTime={latestEdit.recordedAt}>{new Date(latestEdit.recordedAt).toLocaleString()}</time></p>}
    </div>
  </DisclosureSection>;
}
