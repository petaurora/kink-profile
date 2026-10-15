import { AppIcon } from "../../components/ui/AppIcon";
import { useState } from "react";
import { ModalLayer } from "../../components/ui/ModalLayer";
import { PreferenceControl, PreferenceSheet, SheetHeader } from "../../components/ui/PreferenceControl";
import { useToasts } from "../../components/ui/ToastProvider";
import { useLabCatalog } from "./LabCatalog";
import { useLabRecords } from "./LabRecords";
import { preferenceChoices, PreferenceReference } from "./PreferenceVocabulary";

export function ConceptDetail({ id, onClose }: { id: string; onClose: () => void }) {
  const {concepts}=useLabCatalog();
  const concept = concepts.find(record => record.id === id);
  const [editing, setEditing] = useState(false);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const records = useLabRecords();
  const { notify } = useToasts();
  if (!concept) return null;
  const target = `concept:${id}:preference`;
  return <ModalLayer open onClose={onClose} label={`Concept: ${concept.name}`} closeLabel="Back to search or concepts">
    <SheetHeader icon={<AppIcon name="catalogConcept" size={20} inline />} title={concept.name} context="CONCEPT EXPLORER" onClose={onClose} closeLabel="Back to search or concepts"/>
    <p>{concept.description}</p>
    {concept.related.length>0&&<p>Related Items: {concept.related.join(", ")}.</p>}
    <PreferenceControl label={`${concept.name} concept`} value={records.values[target] as string | undefined} saveState={records.saves[target]} onRetry={()=>records.retry(target)} expanded={editing} onActivate={event=>{setAnchor(event.currentTarget);setEditing(true)}}/>
    <p className="ui-lab-app-note">Concept preferences and item-specific modifier ratings remain independent.</p>
    <PreferenceSheet anchor={anchor} open={editing} onClose={()=>setEditing(false)} label={`${concept.name} concept`} context="GENERAL CONCEPT" value={records.values[target] as string | undefined} options={preferenceChoices} help={<PreferenceReference/>} helpOpen={records.helpOpen} onHelpOpenChange={records.setHelpOpen} onChange={value=>{
      const previous = records.values[target]; const version = records.commit(target,value);
      if(value===undefined&&previous!==undefined)notify({message:"Rating cleared",kind:"info",actionLabel:"Undo",duration:5000,onAction:()=>{if(!records.restore(target,version,previous))notify({message:"A newer edit was kept",kind:"info"})}});
    }}/>
  </ModalLayer>;
}
