import { AppIcon } from "../../components/ui/AppIcon";
import { DisclosureSection } from "../../components/ui/DisclosureSection";
import { InlineSaveStatus } from "../../components/ui/PreferenceControl";
import { useToasts } from "../../components/ui/ToastProvider";
import type { Records } from "./LabRecords";

/** Experienced edits the existing Tried marker; Comfort UI remains deferred. */
export function ItemExperience({ itemId, name, records, onRetry }: {
  itemId: string; name: string; records: Records; onRetry: (target: string) => void;
}) {
  const { notify } = useToasts();
  const triedTarget = `experience:${itemId}:tried`;
  const experienced = records.values[triedTarget] === true;
  return <div className="cc-experienced" data-field-id={triedTarget}>
      <button type="button" className="cc-experienced-toggle" aria-label={`${name}: Experienced`} aria-pressed={experienced} onClick={() => {
        const previous = records.values[triedTarget];
        const checked = !experienced;
        const version = records.commit(triedTarget, checked ? true : undefined);
        notify({ message: checked ? "Marked as experienced" : "Experience mark cleared", kind: "info", actionLabel: "Undo", duration: 5000, onAction: () => {
          if (!records.restore(triedTarget, version, previous)) notify({ message: "A newer edit was kept", kind: "info" });
        }});
      }}>{experienced && <AppIcon name="confirm" size={16}/>}<span>Experienced</span></button>
      <InlineSaveStatus state={records.saves[triedTarget]} label={`${name} experience`} showSavedIcon={false} onRetry={() => onRetry(triedTarget)}/>
  </div>;
}

export function ItemExperienceDetails({ itemId, open, onToggle, records }: {
  itemId: string; open: boolean; onToggle: () => void; records: Records;
}) {
  const latestEdit = records.revisions.filter(event => event.target === `experience:${itemId}:tried`).at(-1);
  return <DisclosureSection title="About experience" open={open} onToggle={onToggle}>
    <div className="cc-experience-details">
      <p>Experienced is optional. Leaving it unmarked means no affirmative record.</p>
      <p>Your rating is independent of whether you have experienced this.</p>
      <p>Recording time is the edit time, not the activity date.</p>
      {latestEdit && <p>Last recorded edit: <time dateTime={latestEdit.recordedAt}>{new Date(latestEdit.recordedAt).toLocaleString()}</time></p>}
    </div>
  </DisclosureSection>;
}
