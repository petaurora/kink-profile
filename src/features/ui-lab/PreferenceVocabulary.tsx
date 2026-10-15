import { preferenceRatings } from "../../services/contracts";
export const preferenceChoices = preferenceRatings;
const meanings = [
  "Strong enthusiasm, personal importance, or both; experience is not required.",
  "A positive personal preference; experience is not required.",
  "Potential personal interest in participating, distinct from wanting to learn.",
  "Considered, but no clear preference yet. Distinct from no answer.",
  "Not interested at present; distinct from a firm boundary.",
  "An explicit firm boundary, independent of experience.",
  "This target genuinely does not apply in the stated context; not disinterest or inexperience.",
];
export function PreferenceReference() {
  return <><dl>{preferenceChoices.map((label, index) => <div key={label}><dt>{label}</dt><dd>{meanings[index]}</dd></div>)}</dl><p>Preference, Tried and Comfort are independent. These records do not establish consent.</p></>;
}
