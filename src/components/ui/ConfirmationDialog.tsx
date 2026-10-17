import "./confirmation.css";
import { ModalLayer } from "./ModalLayer";
import { SheetHeader } from "./PreferenceControl";
export function ConfirmationDialog({open,title,description,confirmLabel,onConfirm,onCancel}:{open:boolean;title:string;description:string;confirmLabel:string;onConfirm:()=>void;onCancel:()=>void}){
  return <ModalLayer open={open} onClose={onCancel} label={title} closeLabel="Cancel confirmation"><SheetHeader title={title} onClose={onCancel} closeLabel="Cancel confirmation"/><p>{description}</p><div className="kp-confirmation-actions"><button type="button" onClick={onCancel}>Cancel</button><button type="button" onClick={onConfirm}>{confirmLabel}</button></div></ModalLayer>;
}
