import { DisclosureSection } from "../../components/ui/DisclosureSection";
import { InlineSaveStatus } from "../../components/ui/PreferenceControl";
import type { Records } from "./LabRecords";

const comfortOptions = [
  ["uncomfortable", "Uncomfortable"],
  ["somewhat_comfortable", "Somewhat Comfortable"],
  ["comfortable", "Comfortable"],
] as const;

export function ItemExperience({ itemId, name, open, onToggle, records }: {
  itemId: string; name: string; open: boolean; onToggle: () => void; records: Records;
}) {
  const triedTarget = `experience:${itemId}:tried`;
  const comfortTarget = `experience:${itemId}:comfort`;
  const latestEdit = records.revisions.filter(event => event.target === triedTarget || event.target === comfortTarget).at(-1);
  return <DisclosureSection title="Experience" description="Optional · Independent of preference" open={open} onToggle={onToggle}>
    <div className="cc-experience">
      <label><input type="checkbox" checked={records.values[triedTarget] === true} onChange={event => {
        // The control itself confirms experience and can be toggled again.
        // Keep save/retry feedback, but do not cover the refine sheet with
        // a redundant Undo toast for this reversible state change.
        records.commit(triedTarget, event.target.checked ? true : undefined);
      }}/> Tried</label>
      <InlineSaveStatus state={records.saves[triedTarget]} label={`${name} Tried`}/>
      <p>Unchecked means no affirmative record. Recording time is the edit time, not the activity date.</p>
      <fieldset><legend>Comfort</legend>{comfortOptions.map(([value, label]) => <button key={value} type="button" aria-pressed={records.values[comfortTarget] === value} onClick={() => records.commit(comfortTarget, value)}>{label}</button>)}
        {records.values[comfortTarget] && <button type="button" onClick={() => records.commit(comfortTarget, undefined)}>Clear comfort</button>}
      </fieldset>
      <InlineSaveStatus state={records.saves[comfortTarget]} label={`${name} Comfort`}/>
      <p>Comfort is self-assessed. Neither field changes your preference or the other field.</p>
      {latestEdit && <p>Last recorded edit: <time dateTime={latestEdit.recordedAt}>{new Date(latestEdit.recordedAt).toLocaleString()}</time></p>}
    </div>
  </DisclosureSection>;
}
