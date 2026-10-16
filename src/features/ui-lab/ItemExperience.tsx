import { AppIcon } from "../../components/ui/AppIcon";
import { DisclosureSection } from "../../components/ui/DisclosureSection";
import { InlineSaveStatus } from "../../components/ui/PreferenceControl";
import { useToasts } from "../../components/ui/ToastProvider";
import type { Records } from "./LabRecords";

/** Optional Tried marker; Comfort UI is deferred without deleting its records. */
export function ItemExperience({ itemId, name, records, onRetry }: {
  itemId: string; name: string; records: Records; onRetry: (target: string) => void;
}) {
  const { notify } = useToasts();
  const triedTarget = `experience:${itemId}:tried`;
  return <div className="cc-tried" data-field-id={triedTarget}>
      <label><span className="cc-tried-checkbox"><input type="checkbox" checked={records.values[triedTarget] === true} onChange={event => {
        const previous = records.values[triedTarget];
        const checked = event.target.checked;
        const version = records.commit(triedTarget, checked ? true : undefined);
        notify({ message: checked ? "Tried recorded" : "Tried marker cleared", kind: "info", actionLabel: "Undo", duration: 5000, onAction: () => {
          if (!records.restore(triedTarget, version, previous)) notify({ message: "A newer edit was kept", kind: "info" });
        }});
      }}/><span className="cc-tried-box" aria-hidden="true"><AppIcon name="confirm" size={14}/></span></span>Tried</label>
      <InlineSaveStatus state={records.saves[triedTarget]} label={`${name} Tried`} onRetry={() => onRetry(triedTarget)}/>
  </div>;
}

export function ItemExperienceDetails({ itemId, open, onToggle, records }: {
  itemId: string; open: boolean; onToggle: () => void; records: Records;
}) {
  const latestEdit = records.revisions.filter(event => event.target === `experience:${itemId}:tried`).at(-1);
  return <DisclosureSection title="About experience" open={open} onToggle={onToggle}>
    <div className="cc-experience-details">
      <p>Tried is optional. Unchecked means no affirmative record.</p>
      <p>Your rating is independent of whether you have tried this.</p>
      <p>Recording time is the edit time, not the activity date.</p>
      {latestEdit && <p>Last recorded edit: <time dateTime={latestEdit.recordedAt}>{new Date(latestEdit.recordedAt).toLocaleString()}</time></p>}
    </div>
  </DisclosureSection>;
}
