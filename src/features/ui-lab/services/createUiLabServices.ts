import { createLocalAppServices, type LocalOperation, type LocalAppAdapter } from "../../../services/local/createLocalAppServices";
import { labInitialPreferences, labReferenceData } from "./fixtures";
import { localEducationArticles } from "./educationFixtures";
export type LabOperation = LocalOperation;
export type UiLabAdapter = LocalAppAdapter;
/** Composition root for sample data; all operations live in replaceable application services. */
export function createUiLabServices(options: Partial<Parameters<typeof createLocalAppServices>[0]> = {}): UiLabAdapter {
  return createLocalAppServices({referenceData:labReferenceData,initialPreferences:labInitialPreferences,educationArticles:localEducationArticles,...options});
}
